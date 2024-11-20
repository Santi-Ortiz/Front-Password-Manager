import { Routes } from '@angular/router';
import {LoginComponent} from "./session/login/login.component";
import {AccountListComponent} from "./explore/account-list/account-list.component";
import {RegisterComponent} from "./session/register/register.component";
import {ProfileComponent} from "./session/profile/profile.component";

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'account-list', component: AccountListComponent },
  { path: 'my-profile', component: ProfileComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
