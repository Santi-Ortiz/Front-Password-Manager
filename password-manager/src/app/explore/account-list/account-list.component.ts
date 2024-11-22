import {Component, OnDestroy, OnInit} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import {NgClass, NgForOf, NgIf} from '@angular/common';
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
  imports: [NgIf, NgForOf, FormsModule, NgClass],
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.css'],
})
export class AccountListComponent implements OnInit, OnDestroy {
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

  lockTimeout: any;
  lockTimeRemaining: number = 300;

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

    // Restaurar el estado de bloqueo al cargar
    this.restoreLockState();

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
    if (!this.isTokenValid) {
      this.showTokenPopup();
      return;
    }
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
    if (!this.isTokenValid) {
      this.showTokenPopup();
      return;
    }
    this.accountService.deleteAccount(account.accountId).subscribe({
      next: () => {
        this.accounts = this.accounts.filter((a) => a !== account);
      },
      error: (err) => console.error(err),
    });
  }

  editAccount(index: number): void {
    if (!this.isTokenValid) {
      this.showTokenPopup();
      return;
    }
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
    this.updateValidationMessage();

    this.countdownInterval = setInterval(() => {
      this.timeRemaining--;

      if (this.timeRemaining > 0) {
        this.updateValidationMessage();
      } else {
        clearInterval(this.countdownInterval);
        this.isTokenValid = false;
        this.validationMessage = '';
      }
    }, 1000);
  }

  private updateValidationMessage(): void {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    this.validationMessage = `Tu token es válido por ${minutes}m ${seconds}s`;
  }

  // Modificar lógica para manejar el bloqueo
  private lockAccount(): void {
    this.accountLocked = true;
    this.lockTimeRemaining = 300;
    this.updateLockMessage();

    // Guardar estado de bloqueo en localStorage
    this.saveLockState();

    this.lockTimeout = setInterval(() => {
      this.lockTimeRemaining--;

      if (this.lockTimeRemaining > 0) {
        this.updateLockMessage();
        this.saveLockState(); // Actualizar el tiempo restante en localStorage
      } else {
        clearInterval(this.lockTimeout);
        this.accountLocked = false;
        this.validationMessage = '';
        localStorage.removeItem('lockState'); // Eliminar el bloqueo cuando termine
      }
    }, 1000);
  }

  private updateLockMessage(): void {
    const minutes = Math.floor(this.lockTimeRemaining / 60);
    const seconds = this.lockTimeRemaining % 60;
    this.validationMessage = `Su cuenta estará bloqueada por ${minutes}m ${seconds}s.`;
  }

  private restoreLockState(): void {
    const lockStateString = localStorage.getItem('lockState');
    if (lockStateString) {
      const lockState = JSON.parse(lockStateString);
      const timeElapsed = Math.floor((Date.now() - lockState.lockTimestamp) / 1000);

      // Calcular tiempo restante del bloqueo
      const timeRemaining = lockState.lockTimeRemaining - timeElapsed;

      if (timeRemaining > 0) {
        this.accountLocked = lockState.accountLocked;
        this.lockTimeRemaining = timeRemaining;
        this.updateLockMessage();

        this.lockTimeout = setInterval(() => {
          this.lockTimeRemaining--;

          if (this.lockTimeRemaining > 0) {
            this.updateLockMessage();
            this.saveLockState();
          } else {
            clearInterval(this.lockTimeout);
            this.accountLocked = false;
            this.validationMessage = '';
            localStorage.removeItem('lockState');
          }
        }, 1000);
      } else {
        localStorage.removeItem('lockState'); // Si ya pasó el bloqueo, eliminar el estado
      }
    }
  }

  showTokenPopup(): void {
    alert('Debes pedir un token y activarlo para realizar esta acción.');
  }

  private saveLockState(): void {
    const lockState = {
      accountLocked: this.accountLocked,
      lockTimeRemaining: this.lockTimeRemaining,
      lockTimestamp: Date.now(), // Guardar el timestamp actual
    };
    localStorage.setItem('lockState', JSON.stringify(lockState));
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.lockTimeout) {
      clearInterval(this.lockTimeout);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
