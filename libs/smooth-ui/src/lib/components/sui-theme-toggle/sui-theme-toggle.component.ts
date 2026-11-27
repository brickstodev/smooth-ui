import { afterNextRender, Component, computed, inject, input, InputSignal, Signal, signal, WritableSignal } from '@angular/core';
import { SuiThemeService } from '../../services/theme.service';
import { SUI_ICON_NAME } from '../../types/sui-icon.type';
import { SUI_THEME } from '../../types/sui-theme.type';
import { SuiIconComponent } from '../sui-icon/sui-icon.component';

@Component({
  selector: 'sui-theme-toggle',
  imports: [SuiIconComponent],
  templateUrl: './sui-theme-toggle.component.html',
  styleUrl: './sui-theme-toggle.component.scss',
})
export class SuiThemeToggleComponent {
  private readonly _themeService: SuiThemeService = inject(SuiThemeService);
  private readonly _targetTheme: Signal<SUI_THEME | null> = computed<SUI_THEME | null>(() => {
    const theme: SUI_THEME | null = this._themeService.theme();
    return theme === null ? null : theme === 'dark' ? 'light' : 'dark';
  });
  // Stays false on the server and in the first client render, so hydration matches the server markup.
  private readonly _isRendered: WritableSignal<boolean> = signal<boolean>(false);
  public readonly switchToLightLabel: InputSignal<string> = input<string>('');
  public readonly switchToDarkLabel: InputSignal<string> = input<string>('');
  protected readonly icon: Signal<SUI_ICON_NAME | null> = computed<SUI_ICON_NAME | null>(() => {
    const target: SUI_THEME | null = this._targetTheme();
    return target === null || !this._isRendered() ? null : target === 'dark' ? 'moon' : 'sun';
  });
  // With an unknown theme (server) the button still needs a name, so it uses the "dark" label.
  protected readonly ariaLabel: Signal<string> = computed<string>(() =>
    this._targetTheme() === 'light' ? this.switchToLightLabel().trim() || 'Switch to light theme' : this.switchToDarkLabel().trim() || 'Switch to dark theme',
  );

  constructor() {
    afterNextRender(() => this._isRendered.set(true));
  }

  protected onToggle(): void {
    this._themeService.toggle();
  }
}
