import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SUI_THEME_STORAGE_KEY } from '../constants/sui-theme';
import { SUI_THEME } from '../types/sui-theme.type';
import { SuiThemeService } from './theme.service';

type SystemScheme = 'dark' | 'light' | 'none';

interface ResolutionCase {
  stored: string | null;
  system: SystemScheme;
  expected: SUI_THEME;
}

const RESOLUTION_CASES: ResolutionCase[] = [
  { stored: 'dark', system: 'light', expected: 'dark' },
  { stored: 'light', system: 'dark', expected: 'light' },
  { stored: null, system: 'dark', expected: 'dark' },
  { stored: null, system: 'light', expected: 'light' },
  { stored: null, system: 'none', expected: 'light' },
  { stored: 'Dark', system: 'dark', expected: 'dark' },
  { stored: ' light ', system: 'dark', expected: 'dark' },
  { stored: 'blue', system: 'dark', expected: 'dark' },
];

interface MediaQueryListMock {
  matches: boolean;
  addEventListener: ReturnType<typeof vi.fn>;
  addListener: ReturnType<typeof vi.fn>;
}

function mockSystemScheme(system: SystemScheme): MediaQueryListMock {
  const mediaQueryList: MediaQueryListMock = { matches: system === 'dark', addEventListener: vi.fn(), addListener: vi.fn() };
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: system === 'none' ? undefined : vi.fn(() => mediaQueryList),
  });
  return mediaQueryList;
}

describe('SuiThemeService initial resolution', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.restoreAllMocks();
  });

  it.each(RESOLUTION_CASES)('resolves $expected when stored is $stored and system is $system', ({ stored, system, expected }) => {
    if (stored !== null) localStorage.setItem(SUI_THEME_STORAGE_KEY, stored);
    mockSystemScheme(system);

    const service = TestBed.inject(SuiThemeService);

    expect(service.theme()).toBe(expected);
    expect(document.documentElement.getAttribute('data-theme')).toBe(expected);
  });

  it('falls back to the system theme without errors when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });
    mockSystemScheme('dark');

    expect(TestBed.inject(SuiThemeService).theme()).toBe('dark');
  });

  it('overwrites a previous data-theme on the root element', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    mockSystemScheme('light');

    TestBed.inject(SuiThemeService);

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('does not save the resolved theme', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    mockSystemScheme('dark');

    TestBed.inject(SuiThemeService);

    expect(setItem).not.toHaveBeenCalled();
  });

  it('reads the system theme once and ignores later changes', () => {
    const mediaQueryList = mockSystemScheme('dark');
    const service = TestBed.inject(SuiThemeService);

    mediaQueryList.matches = false;

    expect(service.theme()).toBe('dark');
    expect(window.matchMedia).toHaveBeenCalledTimes(1);
    expect(mediaQueryList.addEventListener).not.toHaveBeenCalled();
    expect(mediaQueryList.addListener).not.toHaveBeenCalled();
  });

  it('keeps theme null and touches neither DOM nor storage on the server', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    mockSystemScheme('dark');
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });

    const service = TestBed.inject(SuiThemeService);

    expect(service.theme()).toBeNull();
    expect(getItem).not.toHaveBeenCalled();
    expect(window.matchMedia).not.toHaveBeenCalled();
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});

describe('SuiThemeService theme changes', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.restoreAllMocks();
  });

  it('setTheme applies the theme, updates theme() and saves it', () => {
    mockSystemScheme('light');
    const service = TestBed.inject(SuiThemeService);

    service.setTheme('dark');

    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(SUI_THEME_STORAGE_KEY)).toBe('dark');
  });

  it('toggle switches to the other theme, applies it and saves it', () => {
    mockSystemScheme('dark');
    const service = TestBed.inject(SuiThemeService);

    service.toggle();

    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem(SUI_THEME_STORAGE_KEY)).toBe('light');

    service.toggle();

    expect(service.theme()).toBe('dark');
    expect(localStorage.getItem(SUI_THEME_STORAGE_KEY)).toBe('dark');
  });

  it('saves the last theme after several consecutive calls', () => {
    mockSystemScheme('light');
    const service = TestBed.inject(SuiThemeService);

    service.setTheme('dark');
    service.toggle();
    service.toggle();
    service.setTheme('light');
    service.toggle();

    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(SUI_THEME_STORAGE_KEY)).toBe('dark');
  });

  it('still changes the theme without throwing when setItem fails', () => {
    mockSystemScheme('light');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    const service = TestBed.inject(SuiThemeService);

    expect(() => service.setTheme('dark')).not.toThrow();
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    expect(() => service.toggle()).not.toThrow();
    expect(service.theme()).toBe('light');
  });

  it('does nothing on the server', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    mockSystemScheme('dark');
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const service = TestBed.inject(SuiThemeService);

    service.setTheme('dark');
    service.toggle();

    expect(service.theme()).toBeNull();
    expect(setItem).not.toHaveBeenCalled();
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});
