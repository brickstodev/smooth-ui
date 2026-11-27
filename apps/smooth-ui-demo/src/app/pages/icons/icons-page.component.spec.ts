import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SUI_ICON_NAMES } from '@brickstodev/smooth-ui';
import { IconsPageComponent } from './icons-page.component';

describe('IconsPageComponent', () => {
  let page: HTMLElement;

  beforeEach(async () => {
    const fixture: ComponentFixture<IconsPageComponent> = TestBed.createComponent(IconsPageComponent);
    await fixture.whenStable();
    page = fixture.nativeElement as HTMLElement;
  });

  it('has a main heading', () => {
    expect(page.querySelector('h1')?.textContent?.trim()).toBe('Icon');
  });

  it('lists the 79 icons, each with its visible name and its drawing', () => {
    const items: HTMLLIElement[] = Array.from(page.querySelectorAll('section[aria-labelledby="icons-set"] li'));

    expect(items).toHaveLength(79);
    expect(items.map((item: HTMLLIElement) => item.textContent?.trim())).toEqual([...SUI_ICON_NAMES]);
    expect(items.every((item: HTMLLIElement) => item.querySelector('sui-icon svg') !== null)).toBe(true);
  });

  it('shows the default 1em size and the four theme sizes', () => {
    const icons: HTMLElement[] = Array.from(page.querySelectorAll('section[aria-labelledby="icons-sizes"] sui-icon'));
    const sizeClasses: string[] = icons.map((icon: HTMLElement) => Array.from(icon.classList).find((name: string) => name.startsWith('sui-icon--')) ?? '1em');

    expect(sizeClasses).toEqual(['1em', 'sui-icon--xs', 'sui-icon--sm', 'sui-icon--md', 'sui-icon--lg']);
  });

  it('shows an icon exposed as an image with an accessible name', () => {
    const labelled: HTMLElement | null = page.querySelector('sui-icon[role="img"]');

    expect(labelled?.getAttribute('aria-label')).toBe('Search');
  });
});
