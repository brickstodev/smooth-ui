import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('renders the theme toggle', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('sui-theme-toggle')).not.toBeNull();
  });
});
