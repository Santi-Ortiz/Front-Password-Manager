import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgForOf, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';
import {AccountService} from "../../services/account.service";

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
  accounts: any[] = [];
  tempAccount: any | null = null;

  constructor(private authService: AuthService, private accountService: AccountService) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.userId = this.authService.getUserId();
    this.accounts = this.accountService.getAccountsByUserId(this.userId);
  }

  toggleAdd(): void {
    this.isAdding = !this.isAdding;
    if (this.isAdding) {
      this.tempAccount = { site: '', user: '', password: '', url: '', info: '' };
    } else {
      this.tempAccount = null;
    }
  }

  confirmAdd(): void {
    if (this.tempAccount) {
      this.accounts.unshift(this.tempAccount);
      this.tempAccount = null;
      this.isAdding = false;
    }
  }
}
