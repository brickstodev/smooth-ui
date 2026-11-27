import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'docs/icons' },
  { path: 'docs/icons', loadComponent: () => import('./pages/icons/icons-page.component').then((m) => m.IconsPageComponent) },
];
