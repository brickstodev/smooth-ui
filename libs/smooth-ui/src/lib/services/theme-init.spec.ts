/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { SUI_THEME_STORAGE_KEY } from '../constants/sui-theme';
import { SUI_THEME } from '../types/sui-theme.type';

type SystemScheme = 'dark' | 'light' | 'none';

interface ResolutionCase {
  stored: string | null;
  system: SystemScheme;
  expected: SUI_THEME;
}

// Same table as theme.service.spec.ts: the script and the service must resolve the same theme.
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

const SCRIPT_SOURCE: string = readFileSync(`${process.cwd()}/libs/smooth-ui/theme/theme-init.js`, 'utf8');

function runScript(): void {
  new Function(SCRIPT_SOURCE)();
}

function mockSystemScheme(system: SystemScheme): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: system === 'none' ? undefined : vi.fn(() => ({ matches: system === 'dark' })),
  });
}

describe('theme-init.js', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.restoreAllMocks();
  });

  it.each(RESOLUTION_CASES)('applies $expected when stored is $stored and system is $system', ({ stored, system, expected }) => {
    if (stored !== null) localStorage.setItem(SUI_THEME_STORAGE_KEY, stored);
    mockSystemScheme(system);

    runScript();

    expect(document.documentElement.getAttribute('data-theme')).toBe(expected);
  });

  it('falls back to the system theme without errors when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });
    mockSystemScheme('dark');

    expect(runScript).not.toThrow();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('overwrites a previous data-theme on the root element', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    mockSystemScheme('light');

    runScript();

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('never writes to storage', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    mockSystemScheme('dark');

    runScript();
    localStorage.setItem(SUI_THEME_STORAGE_KEY, 'light');
    setItem.mockClear();
    runScript();

    expect(setItem).not.toHaveBeenCalled();
  });
});
