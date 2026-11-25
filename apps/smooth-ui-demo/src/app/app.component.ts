import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SuiThemeToggleComponent } from '@brickstodev/smooth-ui';

@Component({
  imports: [RouterOutlet, SuiThemeToggleComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
