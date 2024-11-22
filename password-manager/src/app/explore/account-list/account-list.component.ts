import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [
    NgIf,
    NgForOf
  ],
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.css']
})
export class AccountListComponent implements OnInit {
  username: string | null = null;
  isAdding: boolean = false; // Controla si se está agregando una nueva fila
  accounts: any[] = []; // Lista de cuentas (debe ser reemplazada con datos reales)

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Recuperar el nombre del usuario desde el servicio AuthService
    this.username = this.authService.getUsername();

    // Simula datos iniciales (deberían ser obtenidos de una API)
    this.accounts = [
      { site: 'Google', user: '9518', password: '6369', url: '01:32:50', info: '01:32:50' },
      { site: 'Twitter', user: '7326', password: '10437', url: '00:51:22', info: '01:32:50' },
      // Más registros...
    ];
  }

  /**
   * Alterna entre agregar una nueva fila o cancelar la operación.
   */
  toggleAdd(): void {
    this.isAdding = !this.isAdding;

    if (this.isAdding) {
      // Agrega una fila temporal al inicio
      this.accounts.unshift({ site: '', user: '', password: '', url: '', info: 'Temporal' });
    } else {
      // Elimina la fila temporal si no se completa
      this.accounts.shift();
    }
  }
}
