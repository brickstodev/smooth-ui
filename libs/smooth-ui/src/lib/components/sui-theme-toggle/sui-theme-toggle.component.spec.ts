import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuiThemeService } from '../../services/theme.service';
import { SuiThemeToggleComponent } from './sui-theme-toggle.component';

function buttons(fixture: ComponentFixture<SuiThemeToggleComponent>): HTMLButtonElement[] {
  return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
}

function iconText(fixture: ComponentFixture<SuiThemeToggleComponent>): string | undefined {
  return (fixture.nativeElement as HTMLElement).querySelector('button span[aria-hidden="true"]')?.textContent?.trim();
}

function buttonByName(fixture: ComponentFixture<SuiThemeToggleComponent>, name: string): HTMLButtonElement | undefined {
  return buttons(fixture).find((button: HTMLButtonElement) => button.getAttribute('aria-label') === name);
}

describe('SuiThemeToggleComponent', () => {
  let fixture: ComponentFixture<SuiThemeToggleComponent>;
  let service: SuiThemeService;

  beforeEach(async () => {
    // No matchMedia: the initial theme resolves to light.
    Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: undefined });
    service = TestBed.inject(SuiThemeService);
    fixture = TestBed.createComponent(SuiThemeToggleComponent);
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders a single native button of type button', () => {
    expect(buttons(fixture)).toHaveLength(1);
    expect(buttons(fixture)[0].type).toBe('button');
  });

  it('shows the moon icon hidden from assistive technology and the dark label in the light theme', () => {
    const button = buttonByName(fixture, 'Switch to dark theme');

    expect(button).toBeDefined();
    const icon = button?.querySelector('span');
    expect(icon?.textContent?.trim()).toBe('moon');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps the icon visually hidden and out of the accessible name', () => {
    const button = buttonByName(fixture, 'Switch to dark theme');
    const icon = button?.querySelector('span');

    expect(icon).not.toBeNull();
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(icon?.classList.contains('visually-hidden')).toBe(true);
    expect(button?.getAttribute('aria-label')).toBe('Switch to dark theme');
  });

  it('shows the sun icon and the light label in the dark theme', async () => {
    service.setTheme('dark');
    await fixture.whenStable();

    const button = buttonByName(fixture, 'Switch to light theme');

    expect(button).toBeDefined();
    expect(button?.querySelector('span[aria-hidden="true"]')?.textContent?.trim()).toBe('sun');
  });

  it('uses the custom labels', async () => {
    fixture.componentRef.setInput('switchToDarkLabel', 'Modo oscuro');
    fixture.componentRef.setInput('switchToLightLabel', 'Modo claro');
    await fixture.whenStable();
    expect(buttonByName(fixture, 'Modo oscuro')).toBeDefined();

    service.setTheme('dark');
    await fixture.whenStable();
    expect(buttonByName(fixture, 'Modo claro')).toBeDefined();
  });

  it.each(['', '   '])('falls back to the default labels when a custom label is %j', async (label: string) => {
    fixture.componentRef.setInput('switchToDarkLabel', label);
    fixture.componentRef.setInput('switchToLightLabel', label);
    await fixture.whenStable();
    expect(buttonByName(fixture, 'Switch to dark theme')).toBeDefined();

    service.setTheme('dark');
    await fixture.whenStable();
    expect(buttonByName(fixture, 'Switch to light theme')).toBeDefined();
  });

  it('toggles the service theme, the icon and the name on click', async () => {
    buttons(fixture)[0].click();
    await fixture.whenStable();

    expect(service.theme()).toBe('dark');
    expect(iconText(fixture)).toBe('sun');
    expect(buttonByName(fixture, 'Switch to light theme')).toBeDefined();

    buttons(fixture)[0].click();
    await fixture.whenStable();

    expect(service.theme()).toBe('light');
    expect(iconText(fixture)).toBe('moon');
    expect(buttonByName(fixture, 'Switch to dark theme')).toBeDefined();
  });

  it('keeps two instances in the same state', async () => {
    const other: ComponentFixture<SuiThemeToggleComponent> = TestBed.createComponent(SuiThemeToggleComponent);
    await other.whenStable();

    buttons(other)[0].click();
    await fixture.whenStable();
    await other.whenStable();

    for (const instance of [fixture, other]) {
      expect(iconText(instance)).toBe('sun');
      expect(buttonByName(instance, 'Switch to light theme')).toBeDefined();
    }
  });

  it('shows no icon until afterNextRender has run', async () => {
    const fresh: ComponentFixture<SuiThemeToggleComponent> = TestBed.createComponent(SuiThemeToggleComponent);
    // Refreshes only this view: afterNextRender hooks run on the application render, not here.
    fresh.componentRef.changeDetectorRef.detectChanges();

    expect(iconText(fresh)).toBeUndefined();
    expect(buttonByName(fresh, 'Switch to dark theme')).toBeDefined();

    await fresh.whenStable();

    expect(iconText(fresh)).toBe('moon');
  });
});

describe('SuiThemeToggleComponent with an unknown theme', () => {
  it('shows no icon and keeps the button name when theme() is null', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: SuiThemeService, useValue: { theme: signal(null), toggle: vi.fn(), setTheme: vi.fn() } }],
    });
    const fixture: ComponentFixture<SuiThemeToggleComponent> = TestBed.createComponent(SuiThemeToggleComponent);
    await fixture.whenStable();

    expect(iconText(fixture)).toBeUndefined();
    expect(buttonByName(fixture, 'Switch to dark theme')).toBeDefined();
  });
});
