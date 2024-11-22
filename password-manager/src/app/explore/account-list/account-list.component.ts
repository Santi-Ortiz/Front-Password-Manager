import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from "../../services/account.service";
import { TwofaService } from "../../services/twofa.service";
import { Account } from "../../models/account";
import {User} from "../../models/user";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    FormsModule
  ],
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.css']
})
export class AccountListComponent implements OnInit {
  username: string | null = null;
  userId: number | null = null;
  isAdding: boolean = false;
  isTokenRequested: boolean = false;
  tokenValue: string = '';
  accounts: Account[] = [];
  tempAccount: Account | null = null;
  validationMessage: string = ''; // Mensaje de validación del token
  remainingAttempts: number = 3; // Número de intentos restantes
  accountLocked: boolean = false; // Indica si la cuenta está bloqueada
  userActual: User | null = null;

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private twofaService: TwofaService, // Servicio de TwoFA
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.userId = this.authService.getUserId();

    if (this.userId !== null) {
      // Suscribirse al observable para obtener el usuario actual
      this.userService.getUserById(this.userId).subscribe({
        next: (user) => {
          this.userActual = user; // Asigna el usuario obtenido
        },
        error: (err) => {
          console.error('Error al obtener el usuario:', err);
          this.userActual = null; // Manejo en caso de error
        }
      });

      this.accountService.getAccountsByUserId(this.userId).subscribe({
        next: (accounts) => {
          this.accounts = accounts;
        },
        error: (err) => {
          console.error("Error al cargar las cuentas: ", err);
        }
      });
    }
  }


  toggleAdd(): void {
    this.isAdding = !this.isAdding;
    if (this.isAdding) {
      this.tempAccount = {
        app: { name: '', description: '', url: '' },
        user: { id: 0, username: '', password: '', email: '', role: '' },
        usernameFromApp: '',
        password: ''
      };
    } else {
      this.tempAccount = null;
    }
  }

  // Llama al endpoint para generar un nuevo token
  requestToken(): void {
    if (this.userId) {
      this.twofaService.createToken(this.userActual).subscribe({
        next: () => {
          this.isTokenRequested = true;
          this.validationMessage = ''; // Limpiar mensaje previo
          this.remainingAttempts = 3; // Reiniciar intentos
          this.accountLocked = false; // Desbloquear cuenta si estaba bloqueada
          alert('Token generado y enviado a tu correo.');
        },
        error: (err) => {
          console.error('Error al generar el token:', err);
          alert('No se pudo generar el token. Inténtalo de nuevo.');
        }
      });
    }
  }

  // Valida el token ingresado
  validateToken(): void {
    if (this.accountLocked) {
      this.validationMessage = 'Su cuenta está bloqueada por 5 minutos.';
      return;
    }

    this.twofaService.validateToken(this.tokenValue).subscribe({
      next: (isValid) => {
        if (isValid) {
          this.validationMessage = 'Token válido por 5 minutos.';
        } else {
          this.remainingAttempts--;
          if (this.remainingAttempts > 0) {
            this.validationMessage = `Token inválido, tiene ${this.remainingAttempts} intento(s) más.`;
          } else {
            this.validationMessage = 'Su cuenta estará bloqueada durante 5 minutos por seguridad.';
            this.accountLocked = true;

            // Desbloquear la cuenta después de 5 minutos
            setTimeout(() => {
              this.accountLocked = false;
              this.remainingAttempts = 3; // Reiniciar intentos
              this.validationMessage = ''; // Limpiar mensaje
            }, 5 * 60 * 1000); // 5 minutos
          }
        }
      },
      error: (err) => {
        console.error('Error al validar el token:', err);
        alert('Error al validar el token.');
      }
    });
  }

  confirmAdd(): void {
    if (
      this.tempAccount?.app.name &&
      this.tempAccount.app.description &&
      this.tempAccount.app.url &&
      this.tempAccount.usernameFromApp &&
      this.tempAccount.password
    ) {
      this.accounts.unshift(this.tempAccount);
      this.tempAccount = null;
      this.isAdding = false;
    } else {
      alert("Por favor, completa todos los campos antes de agregar una cuenta.");
    }
  }
}
