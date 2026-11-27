import { SUI_ICON_NAME } from '../types/sui-icon.type';
import { SUI_ICON_NAMES, SUI_ICON_SIZES, SUI_ICONS } from './sui-icons';

// The 44 icons of docs/smoothui.html plus the extended set, grouped by meaning.
const REFERENCE_NAMES: readonly string[] = [
  'check',
  'x',
  'chevron-down',
  'chevron-up',
  'chevron-right',
  'chevron-left',
  'arrow-right',
  'arrow-left',
  'arrow-up',
  'arrow-down',
  'plus',
  'minus',
  'plus-circle',
  'minus-circle',
  'search',
  'info',
  'alert-triangle',
  'alert-circle',
  'check-circle',
  'x-circle',
  'star',
  'heart',
  'thumbs-up',
  'thumbs-down',
  'user',
  'settings',
  'bell',
  'calendar',
  'mail',
  'message-circle',
  'phone',
  'lock',
  'shield',
  'key',
  'eye',
  'eye-off',
  'trash',
  'edit',
  'save',
  'download',
  'upload',
  'undo',
  'redo',
  'refresh',
  'loader',
  'more-horizontal',
  'more-vertical',
  'filter',
  'external-link',
  'link',
  'share',
  'copy',
  'sun',
  'moon',
  'menu',
  'list',
  'home',
  'image',
  'camera',
  'play',
  'pause',
  'file',
  'folder',
  'bookmark',
  'tag',
  'credit-card',
  'shopping-cart',
  'gift',
  'map-pin',
  'globe',
  'grid',
  'circle',
  'square',
  'maximize',
  'minimize',
  'clock',
  'help',
  'log-out',
  'log-in',
];

describe('SUI_ICON_NAMES', () => {
  it('has 79 unique names', () => {
    expect(SUI_ICON_NAMES).toHaveLength(79);
    expect(new Set(SUI_ICON_NAMES).size).toBe(79);
  });

  it('lists the names in the reference order', () => {
    expect(SUI_ICON_NAMES).toEqual(REFERENCE_NAMES);
  });

  it('rejects a name outside the set at compile time', () => {
    // @ts-expect-error 'not-an-icon' is not part of SUI_ICON_NAME
    const name: SUI_ICON_NAME = 'not-an-icon';

    expect(SUI_ICON_NAMES).not.toContain(name);
  });
});

describe('SUI_ICON_SIZES', () => {
  it('lists xs, sm, md and lg', () => {
    expect(SUI_ICON_SIZES).toEqual(['xs', 'sm', 'md', 'lg']);
  });
});

describe('SUI_ICONS', () => {
  it('has exactly one entry per name in SUI_ICON_NAMES', () => {
    expect(Object.keys(SUI_ICONS).sort()).toEqual([...SUI_ICON_NAMES].sort());
  });

  it('draws every icon with at least one shape', () => {
    for (const name of SUI_ICON_NAMES) {
      expect(SUI_ICONS[name].length, name).toBeGreaterThan(0);
    }
  });

  it('draws search as a circle and a path from the design reference', () => {
    expect(SUI_ICONS.search).toEqual([
      { kind: 'circle', cx: 11, cy: 11, r: 7 },
      { kind: 'path', d: 'm20 20-3.5-3.5' },
    ]);
  });

  it('draws calendar with a rounded rect', () => {
    expect(SUI_ICONS.calendar).toContainEqual({ kind: 'rect', x: 3, y: 5, width: 18, height: 16, rx: 2.5 });
  });
});
