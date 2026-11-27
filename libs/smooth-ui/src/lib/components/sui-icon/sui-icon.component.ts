import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { SUI_ICON_SIZES, SUI_ICONS } from '../../constants/sui-icons';
import { SUI_ICON_NAME, SUI_ICON_SHAPE, SUI_ICON_SIZE } from '../../types/sui-icon.type';

@Component({
  selector: 'sui-icon',
  templateUrl: './sui-icon.component.html',
  styleUrl: './sui-icon.component.scss',
  host: {
    '[attr.role]': 'accessibleName() ? "img" : null',
    '[attr.aria-label]': 'accessibleName() || null',
    '[attr.aria-hidden]': 'accessibleName() ? null : "true"',
    '[class]': 'classes()',
  },
})
export class SuiIconComponent {
  public readonly name: InputSignal<SUI_ICON_NAME | null> = input<SUI_ICON_NAME | null>(null);
  public readonly size: InputSignal<SUI_ICON_SIZE | null> = input<SUI_ICON_SIZE | null>(null);
  public readonly label: InputSignal<string> = input<string>('');
  // hasOwn: untyped names such as 'constructor' must not resolve to something on the prototype.
  protected readonly shapes: Signal<readonly SUI_ICON_SHAPE[] | null> = computed<readonly SUI_ICON_SHAPE[] | null>(() => {
    const name: SUI_ICON_NAME | null = this.name();
    return name !== null && Object.hasOwn(SUI_ICONS, name) ? SUI_ICONS[name] : null;
  });
  // An unknown icon draws nothing, so it stays decorative even with a label; the typeof guard covers untyped callers.
  protected readonly accessibleName: Signal<string> = computed<string>(() => {
    const label: unknown = this.label();
    return this.shapes() !== null && typeof label === 'string' ? label.trim() : '';
  });
  // An unknown size gets no class, so the icon falls back to 1em.
  protected readonly classes: Signal<string> = computed<string>(() => {
    const size: SUI_ICON_SIZE | null = this.size();
    return size !== null && SUI_ICON_SIZES.includes(size) ? `sui-icon--${size}` : '';
  });
}
