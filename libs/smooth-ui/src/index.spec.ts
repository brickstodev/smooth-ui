import * as publicApi from './index';
import type { SUI_THEME } from './index';

describe('public API (src/index.ts)', () => {
  it('exports exactly SuiThemeToggleComponent and SuiThemeService at runtime', () => {
    expect(Object.keys(publicApi).sort()).toEqual(['SuiThemeService', 'SuiThemeToggleComponent']);
    expect(publicApi.SuiThemeToggleComponent).toBeTypeOf('function');
    expect(publicApi.SuiThemeService).toBeTypeOf('function');
  });

  it('exports the SUI_THEME type', () => {
    const theme: SUI_THEME = 'dark';
    expect(theme).toBe('dark');
  });
});
