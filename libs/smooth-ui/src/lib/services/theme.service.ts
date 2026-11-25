import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, Service, Signal, signal, WritableSignal } from '@angular/core';
import { SUI_THEME_STORAGE_KEY, SUI_THEMES } from '../constants/sui-theme';
import { SUI_THEME } from '../types/sui-theme.type';

@Service()
export class SuiThemeService {
  private readonly _document: Document = inject(DOCUMENT);
  private readonly _isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _theme: WritableSignal<SUI_THEME | null> = signal<SUI_THEME | null>(null);

  public readonly theme: Signal<SUI_THEME | null> = this._theme.asReadonly();

  constructor() {
    if (this._isBrowser) this._apply(this._resolveInitialTheme());
  }

  // The system theme is read once per page load and is not saved, so it never becomes a preference.
  private _resolveInitialTheme(): SUI_THEME {
    return this._readStoredTheme() ?? (this._prefersDark() ? 'dark' : 'light');
  }

  private _readStoredTheme(): SUI_THEME | null {
    try {
      const stored: string | null | undefined = this._document.defaultView?.localStorage.getItem(SUI_THEME_STORAGE_KEY);
      return SUI_THEMES.find((theme: SUI_THEME) => theme === stored) ?? null;
    } catch {
      return null;
    }
  }

  private _prefersDark(): boolean {
    return this._document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }

  private _apply(theme: SUI_THEME): void {
    this._document.documentElement.setAttribute('data-theme', theme);
    this._theme.set(theme);
  }

  // A storage failure (quota, privacy mode) must not stop the theme from changing.
  private _save(theme: SUI_THEME): void {
    try {
      this._document.defaultView?.localStorage.setItem(SUI_THEME_STORAGE_KEY, theme);
    } catch {
      // Ignored on purpose.
    }
  }

  // No-op on the server: there is no DOM or storage to update and theme() stays null.
  public setTheme(theme: SUI_THEME): void {
    if (!this._isBrowser) return;
    this._apply(theme);
    this._save(theme);
  }

  public toggle(): void {
    this.setTheme(this._theme() === 'dark' ? 'light' : 'dark');
  }
}
