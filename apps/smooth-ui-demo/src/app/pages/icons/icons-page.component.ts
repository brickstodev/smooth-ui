import { Component } from '@angular/core';
import { SUI_ICON_NAME, SUI_ICON_NAMES, SUI_ICON_SIZE, SuiIconComponent } from '@brickstodev/smooth-ui';

@Component({
  selector: 'app-icons-page',
  imports: [SuiIconComponent],
  templateUrl: './icons-page.component.html',
  styleUrl: './icons-page.component.scss',
})
export class IconsPageComponent {
  protected readonly names: readonly SUI_ICON_NAME[] = SUI_ICON_NAMES;
  // null shows the default 1em size.
  protected readonly sizes: readonly (SUI_ICON_SIZE | null)[] = [null, 'xs', 'sm', 'md', 'lg'];
}
