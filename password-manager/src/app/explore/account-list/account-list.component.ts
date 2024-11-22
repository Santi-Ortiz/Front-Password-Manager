import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from "../../services/account.service";
import { Account } from "../../models/account";

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
  twofa: boolean = false;

  constructor(private authService: AuthService, private accountService: AccountService) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.userId = this.authService.getUserId();

    if (this.userId !== null) {
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

  requestToken(): void {
    this.isTokenRequested = true;
  }

  validateToken(): void {
    if (this.tokenValue === 'expectedTokenValue') {
      alert('Token válido');
    } else {
      alert('Token inválido');
    }
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
