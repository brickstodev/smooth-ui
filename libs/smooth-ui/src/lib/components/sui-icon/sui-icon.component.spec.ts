import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SUI_ICON_NAME, SUI_ICON_SIZE } from '../../types/sui-icon.type';
import { SuiIconComponent } from './sui-icon.component';

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgOf(root: Element): SVGSVGElement | null {
  return root.querySelector('svg');
}

function shapeTags(svg: SVGSVGElement | null): string[] {
  return Array.from(svg?.children ?? []).map((child: Element) => child.tagName);
}

@Component({
  selector: 'sui-icon-test-host',
  imports: [SuiIconComponent],
  template: `<sui-icon name="check" /><sui-icon name="check" /><sui-icon name="check" /><sui-icon name="x" />`,
})
class IconListHostComponent {}

@Component({
  selector: 'sui-icon-flex-test-host',
  imports: [SuiIconComponent],
  template: `<div style="display: flex; inline-size: 40px"><sui-icon name="check" size="sm" /><span>A very long label that overflows the container</span></div>`,
})
class IconFlexHostComponent {}

describe('SuiIconComponent', () => {
  let fixture: ComponentFixture<SuiIconComponent>;
  let host: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(SuiIconComponent);
    host = fixture.nativeElement as HTMLElement;
  });

  async function setName(name: string | null): Promise<void> {
    fixture.componentRef.setInput('name', name as SUI_ICON_NAME | null);
    await fixture.whenStable();
  }

  it('draws search as an inline svg with the stroke presentation attributes', async () => {
    await setName('search');
    const svg: SVGSVGElement | null = svgOf(host);

    expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg?.getAttribute('fill')).toBe('none');
    expect(svg?.getAttribute('stroke')).toBe('currentColor');
    expect(svg?.getAttribute('stroke-width')).toBe('1.75');
    expect(svg?.getAttribute('stroke-linecap')).toBe('round');
    expect(svg?.getAttribute('stroke-linejoin')).toBe('round');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('focusable')).toBe('false');
  });

  it('creates the search shapes as svg elements with the reference attributes', async () => {
    await setName('search');
    const children: Element[] = Array.from(svgOf(host)?.children ?? []);

    expect(children.map((child: Element) => child.tagName)).toEqual(['circle', 'path']);
    expect(children.every((child: Element) => child.namespaceURI === SVG_NS)).toBe(true);
    expect(children[0].getAttribute('cx')).toBe('11');
    expect(children[0].getAttribute('cy')).toBe('11');
    expect(children[0].getAttribute('r')).toBe('7');
    expect(children[1].getAttribute('d')).toBe('m20 20-3.5-3.5');
  });

  it('draws a rect with all its attributes', async () => {
    await setName('calendar');
    const rect: Element | null = host.querySelector('svg rect');

    expect(rect?.namespaceURI).toBe(SVG_NS);
    expect(['x', 'y', 'width', 'height', 'rx'].map((attr: string) => rect?.getAttribute(attr))).toEqual(['3', '5', '18', '16', '2.5']);
  });

  it('has the drawing after a single detectChanges, without waiting for render hooks', () => {
    fixture.componentRef.setInput('name', 'search');
    fixture.componentRef.changeDetectorRef.detectChanges();

    expect(shapeTags(svgOf(host))).toEqual(['circle', 'path']);
  });

  it('replaces the shapes when the name changes', async () => {
    await setName('check');
    expect(svgOf(host)?.querySelector('path')?.getAttribute('d')).toBe('M20 6 9 17l-5-5');

    await setName('x');
    const paths: SVGPathElement[] = Array.from(svgOf(host)?.querySelectorAll('path') ?? []);
    expect(host.querySelectorAll('svg')).toHaveLength(1);
    expect(paths.map((path: SVGPathElement) => path.getAttribute('d'))).toEqual(['M18 6 6 18M6 6l12 12']);
  });

  it.each([null, '', 'not-an-icon', 'constructor'])('draws nothing and does not throw for the name %j', async (name: string | null) => {
    await expect(setName(name)).resolves.toBeUndefined();

    expect(svgOf(host)).toBeNull();
  });

  it('draws nothing without a name', async () => {
    await fixture.whenStable();

    expect(svgOf(host)).toBeNull();
  });

  it('removes the previous drawing when a valid name becomes unknown', async () => {
    await setName('check');
    expect(svgOf(host)).not.toBeNull();

    await expect(setName('not-an-icon')).resolves.toBeUndefined();
    expect(svgOf(host)).toBeNull();
  });

  describe('accessibility', () => {
    async function render(name: string, label?: string): Promise<void> {
      fixture.componentRef.setInput('name', name as SUI_ICON_NAME);
      if (label !== undefined) {
        fixture.componentRef.setInput('label', label);
      }
      await fixture.whenStable();
    }

    function expectDecorative(): void {
      expect(host.getAttribute('aria-hidden')).toBe('true');
      expect(host.hasAttribute('role')).toBe(false);
      expect(host.hasAttribute('aria-label')).toBe(false);
    }

    it('is decorative without a label', async () => {
      await render('search');

      expectDecorative();
    });

    it.each(['', '   ', '\t\n'])('is decorative with the blank label %j', async (label: string) => {
      await render('search', label);

      expectDecorative();
    });

    it('is an image named by the trimmed label', async () => {
      await render('search', '  Search  ');

      expect(host.getAttribute('role')).toBe('img');
      expect(host.getAttribute('aria-label')).toBe('Search');
      expect(host.hasAttribute('aria-hidden')).toBe(false);
    });

    it('is decorative with an unknown name even if it has a label', async () => {
      await render('not-an-icon', 'Search');

      expectDecorative();
    });

    it('switches between decorative and image when the label changes', async () => {
      await render('search', 'Search');
      expect(host.getAttribute('role')).toBe('img');

      await render('search', '');
      expectDecorative();

      await render('search', 'Find');
      expect(host.getAttribute('role')).toBe('img');
      expect(host.getAttribute('aria-label')).toBe('Find');
    });

    it('never takes focus', async () => {
      await render('search', 'Search');
      const svg: SVGSVGElement | null = svgOf(host);

      expect(host.hasAttribute('tabindex')).toBe(false);
      expect(svg?.hasAttribute('tabindex')).toBe(false);
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(svg?.getAttribute('focusable')).toBe('false');
    });
  });

  describe('size', () => {
    function sizeClasses(): string[] {
      return Array.from(host.classList).filter((name: string) => name.startsWith('sui-icon--'));
    }

    async function setSize(size: string | null): Promise<void> {
      fixture.componentRef.setInput('size', size as SUI_ICON_SIZE | null);
      await fixture.whenStable();
    }

    it('has no size class without a size', async () => {
      await setName('search');

      expect(sizeClasses()).toEqual([]);
    });

    it.each(['xs', 'sm', 'md', 'lg'])('has the sui-icon--%s class', async (size: string) => {
      await setName('search');
      await setSize(size);

      expect(sizeClasses()).toEqual([`sui-icon--${size}`]);
    });

    it.each(['xl', ''])('has no size class for the invalid size %j', async (size: string) => {
      await setName('search');
      await setSize(size);

      expect(sizeClasses()).toEqual([]);
    });

    it('updates the size class when the size changes', async () => {
      await setName('search');
      await setSize('sm');
      await setSize('lg');

      expect(sizeClasses()).toEqual(['sui-icon--lg']);
    });
  });

  it('draws each instance independently with only its own shapes', async () => {
    const listFixture: ComponentFixture<IconListHostComponent> = TestBed.createComponent(IconListHostComponent);
    await listFixture.whenStable();
    const root: HTMLElement = listFixture.nativeElement as HTMLElement;
    const icons: Element[] = Array.from(root.querySelectorAll('sui-icon'));

    expect(root.querySelectorAll('svg')).toHaveLength(4);
    expect(icons.map((icon: Element) => Array.from(icon.querySelectorAll('svg > *')).map((shape: Element) => shape.getAttribute('d')))).toEqual([
      ['M20 6 9 17l-5-5'],
      ['M20 6 9 17l-5-5'],
      ['M20 6 9 17l-5-5'],
      ['M18 6 6 18M6 6l12 12'],
    ]);
  });

  it('keeps its box from shrinking inside a narrow flex container', async () => {
    const flexFixture: ComponentFixture<IconFlexHostComponent> = TestBed.createComponent(IconFlexHostComponent);
    await flexFixture.whenStable();
    const icon: HTMLElement | undefined = flexFixture.debugElement.query((el) => el.name === 'sui-icon')?.nativeElement;
    const style: CSSStyleDeclaration = getComputedStyle(icon as HTMLElement);

    expect(style.flexShrink).toBe('0');
    expect(style.flexGrow).toBe('0');
  });
});
