import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {AuthService} from "../../services/auth.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    NgIf
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  error: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.error = null;
    console.log('Iniciando sesión con:', this.username, this.password);
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        console.log('Inicio de sesión exitoso');
        this.router.navigate(['/account-list']);
      },
      error: (err) => {
        console.error('Error en inicio de sesión:', err);
        this.error = 'Credenciales incorrectas.\n\n Por favor, intenta nuevamente.';
      }
    });
  }
}
