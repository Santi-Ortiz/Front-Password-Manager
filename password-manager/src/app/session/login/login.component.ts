import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private router: Router) {}

  onSubmit(): void {
    // Navega a la ruta "account-list" cuando el formulario sea enviado
    this.router.navigate(['/account-list']);
  }
}
