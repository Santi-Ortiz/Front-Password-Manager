import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { TwofaService } from '../../services/twofa.service';
import { Account } from '../../models/account';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { AppService } from '../../services/app.service';
import { App } from '../../models/app';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [NgIf, NgForOf, FormsModule],
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.css'],
})
export class AccountListComponent implements OnInit {
  username: string | null = null;
  userId: number | null = null;
  isAdding: boolean = false;
  isTokenRequested: boolean = false;
  tokenValue: string = '';
  accounts: Account[] = [];
  tempAccount: Account | null = null;
  validationMessage: string = '';
  remainingAttempts: number = 3;
  accountLocked: boolean = false;
  userActual: User | null = null;
  isTokenValid: boolean = false;
  timeRemaining: number = 300;
  editingIndex: number | null = null;
  showPassword: boolean[] = [];
  message: string = '';

  app: App = {
    appId: 0,
    name: '',
    description: '',
    url: '',
  };

  private countdownInterval: any;

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private twofaService: TwofaService,
    private userService: UserService,
    private appService: AppService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.userId = this.authService.getUserId();

    if (this.userId !== null) {
      this.userService.getUserById(this.userId).subscribe({
        next: (user) => {
          this.userActual = user;
        },
        error: (err) => console.error(err),
      });

      this.accountService.getAccountsByUserId(this.userId).subscribe({
        next: (accounts) => (this.accounts = accounts),
        error: (err) => console.error(err),
      });
    }
  }

  togglePasswordVisibility(index: number): void {
    this.showPassword[index] = !this.showPassword[index];
  }

  toggleAdd(): void {
    this.isAdding = !this.isAdding;
    this.tempAccount = this.isAdding
      ? {
        accountId: 0,
        app: { appId: 0, name: '', description: '', url: '' },
        user: this.userActual!,
        usernameFromApp: '',
        password: '',
      }
      : null;
  }

  requestToken(): void {
    this.twofaService.createToken(this.userActual).subscribe({
      next: () => {
        this.isTokenRequested = true;
        this.validationMessage = '';
        this.remainingAttempts = 3;
        this.accountLocked = false;
        alert('Token generado y enviado a tu correo.');
      },
      error: (err) => console.error(err),
    });
  }

  validateToken(): void {
    if (this.accountLocked) {
      this.validationMessage = 'Su cuenta está bloqueada.';
      return;
    }

    this.twofaService.validateToken(this.tokenValue).subscribe({
      next: (isValid) => {
        if (isValid) {
          this.startCountdown();
          this.isTokenValid = true;
        } else {
          this.remainingAttempts--;
          this.validationMessage =
            this.remainingAttempts > 0
              ? `Token inválido. ${this.remainingAttempts} intento(s) restante(s).`
              : 'Cuenta bloqueada por seguridad.';
          if (!this.remainingAttempts) this.lockAccount();
        }
      },
      error: (err) => console.error(err),
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
      // Llamar directamente a addAccount con la estructura completa
      this.accountService.addAccount(this.tempAccount!).subscribe({
        next: (response) => {
          console.log(response); // Manejar la respuesta
          this.accounts.unshift(this.tempAccount!); // Agregar al inicio de la lista
          this.tempAccount = null; // Limpiar los datos temporales
          this.isAdding = false; // Cerrar el modo de agregar
          alert('Cuenta creada exitosamente.');
        },
        error: (err) => console.error('Error al agregar la cuenta:', err),
      });
    } else {
      alert('Por favor completa todos los campos.');
    }
  }


  deleteAccount(account: Account): void {
    this.accountService.deleteAccount(account.accountId).subscribe({
      next: () => (this.accounts = this.accounts.filter((a) => a !== account)),
      error: (err) => console.error(err),
    });
  }

  editAccount(index: number): void {
    this.editingIndex = index;
  }

  saveAccount(account: Account): void {
    this.accountService.updateAccount(account, account.accountId).subscribe({
      next: () => (this.editingIndex = null),
      error: (err) => console.error(err),
    });
  }

  private startCountdown(): void {
    this.timeRemaining = 300;
    this.countdownInterval = setInterval(() => {
      this.timeRemaining--;
      if (!this.timeRemaining) {
        clearInterval(this.countdownInterval);
        this.isTokenValid = false;
      }
    }, 1000);
  }

  private lockAccount(): void {
    this.accountLocked = true;
    setTimeout(() => {
      this.accountLocked = false;
      this.remainingAttempts = 3;
      this.validationMessage = '';
    }, 5 * 60 * 1000);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
