import {Component, Renderer2} from '@angular/core';
import {NavigationEnd, RouterOutlet, Router} from '@angular/router';
import {LoginComponent} from "./session/login/login.component";
import {RegisterComponent} from "./session/register/register.component";
import {AccountListComponent} from "./explore/account-list/account-list.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginComponent, RegisterComponent, AccountListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'password-manager';

  constructor(private router: Router, private renderer: Renderer2) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.urlAfterRedirects.includes('login')) {
          this.renderer.addClass(document.body, 'login-background');
          this.renderer.removeClass(document.body, 'account-list-background');
        } else if (event.urlAfterRedirects.includes('account-list')) {
          this.renderer.addClass(document.body, 'account-list-background');
          this.renderer.removeClass(document.body, 'login-background');
        } else {
          this.renderer.removeClass(document.body, 'login-background');
          this.renderer.removeClass(document.body, 'account-list-background');
        }
      }
    });
  }
}
