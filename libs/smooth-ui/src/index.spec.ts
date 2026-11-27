import * as publicApi from './index';
import type { SUI_ICON_NAME, SUI_ICON_SIZE, SUI_THEME } from './index';

describe('public API (src/index.ts)', () => {
  it('exports exactly SUI_ICON_NAMES, SuiIconComponent, SuiThemeService and SuiThemeToggleComponent at runtime', () => {
    expect(Object.keys(publicApi).sort()).toEqual(['SUI_ICON_NAMES', 'SuiIconComponent', 'SuiThemeService', 'SuiThemeToggleComponent']);
    expect(publicApi.SuiIconComponent).toBeTypeOf('function');
    expect(publicApi.SuiThemeToggleComponent).toBeTypeOf('function');
    expect(publicApi.SuiThemeService).toBeTypeOf('function');
    expect(publicApi.SUI_ICON_NAMES).toHaveLength(44);
  });

  it('exports the SUI_THEME type', () => {
    const theme: SUI_THEME = 'dark';
    expect(theme).toBe('dark');
  });

  it('exports the SUI_ICON_NAME and SUI_ICON_SIZE types', () => {
    const name: SUI_ICON_NAME = 'search';
    const size: SUI_ICON_SIZE = 'md';
    expect(publicApi.SUI_ICON_NAMES).toContain(name);
    expect(size).toBe('md');
  });
});
