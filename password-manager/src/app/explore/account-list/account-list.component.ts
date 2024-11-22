import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from "../../services/account.service";
import { TwofaService } from "../../services/twofa.service";
import { Account } from "../../models/account";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";

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
  isTokenValid: boolean = false; // Bloquea campo y botón si el token es válido
  timeRemaining: number = 300; // Tiempo restante en segundos (5 minutos)

  private countdownInterval: any;

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
          this.userActual = user;
          this.userActual.userId = this.userId!;
        },
        error: (err) => {
          console.error('Error al obtener el usuario:', err);
          this.userActual = null;
        }
      });

      this.accountService.getAccountsByUserId(this.userId).subscribe({
        next: (accounts) => {
          this.accounts = accounts;
          console.log(this.accounts);
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
        accountId: 0,
        app: { appId: 1, name: '', description: '', url: '' },
        user: { userId: this.userActual!.userId, username: this.userActual!.username, password: this.userActual!.password, email: this.userActual!.email, role: this.userActual!.role },
        usernameFromApp: '',
        password: ''
      };
      console.log(this.tempAccount);
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
          this.validationMessage = '';
          this.remainingAttempts = 3;
          this.accountLocked = false;
          alert('Token generado y enviado a tu correo.');
        },
        error: (err) => {
          console.error('Error al generar el token:', err);
          alert('No se pudo generar el token. Inténtalo de nuevo.');
        }
      });
    }
  }

  validateToken(): void {
    if (this.accountLocked) {
      this.validationMessage = 'Su cuenta está bloqueada por 5 minutos.';
      return;
    }

    this.twofaService.validateToken(this.tokenValue).subscribe({
      next: (isValid) => {
        if (isValid) {
          this.startCountdown();
          this.validationMessage = `El token es válido por ${this.formatTime(this.timeRemaining)}.`;
          this.isTokenValid = true;
        } else {
          this.remainingAttempts--;
          if (this.remainingAttempts > 0) {
            this.validationMessage = `Token inválido, tiene ${this.remainingAttempts} intento(s) más.`;
          } else {
            this.validationMessage = 'Su cuenta estará bloqueada durante 5 minutos por seguridad.';
            this.accountLocked = true;

            setTimeout(() => {
              this.accountLocked = false;
              this.remainingAttempts = 3;
              this.validationMessage = '';
            }, 5 * 60 * 1000);
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
      this.tempAccount.user!.userId = this.userId!;

      this.accountService.addAccount(this.tempAccount).subscribe({
        next: (newAccount) => {
          this.accounts.unshift(newAccount);
          this.tempAccount = null;
          this.isAdding = false;
        },
        error: (err) => {
          console.error("Error al agregar la cuenta: ", err);
        }
      });
    } else {
      alert("Por favor, completa todos los campos antes de agregar una cuenta.");
    }
  }

  deleteAccount(account: Account): void {
    const accountId = account.accountId;
    this.accountService.deleteAccount(accountId).subscribe({
      next: () => {
        this.accounts = this.accounts.filter(a => a.accountId !== accountId);
        console.log("Cuenta eliminada con éxito.");
      },
      error: (err) => {
        console.error("Error al eliminar la cuenta: ", err);
      }
    });
  }

  editAccount(account: Account): void {
    this.tempAccount = { ...account };
    this.isAdding = true;
    this.deleteAccount(account);
  }

  private startCountdown(): void {
    this.timeRemaining = 300;
    this.countdownInterval = setInterval(() => {
      this.timeRemaining--;
      this.validationMessage = `El token es válido por ${this.formatTime(this.timeRemaining)}.`;

      if (this.timeRemaining <= 0) {
        clearInterval(this.countdownInterval);
        this.isTokenValid = false; 
        this.validationMessage = ''; 
      }
    }, 1000);
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
}
