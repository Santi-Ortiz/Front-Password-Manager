import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [FormsModule, CommonModule], 
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.css']
})
export class AccountListComponent {
  accounts = [
    { sitio: 'Google', usuario: '9518', contrasena: '6369', url: '01:32:50', info: '01:32:50' },
    { sitio: 'Twitter', usuario: '7326', contrasena: '10437', url: '00:51:22', info: '01:32:50' },
  ];

  tempAccounts: any[] = [];

  addTempRow() {
    this.tempAccounts.push({ sitio: '', usuario: '', contrasena: '', url: '', info: '' });
  }

  saveRows() {
    this.accounts = [...this.accounts, ...this.tempAccounts];
    this.tempAccounts = [];
  }
}
