import { Injectable } from '@angular/core';
import {environment} from "../environments/environment.development";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "./auth.service";
import {User} from "../models/user";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = environment.SERVER_URL + '/account';

  private httpOptions: { headers: HttpHeaders } = { headers: new HttpHeaders() };

  constructor(private http: HttpClient, private authService: AuthService) {
    this.setAuthHeaders(); // Establecemos encabezados al inicializar el servicio
  }

  private setAuthHeaders(): void {
    const token = this.authService.getToken();
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Nota: template literal corregido
      }),
    };
  }

  // Método: Obtener todas las cuentas asociadas a un usuario
  getAccountsByUserId(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}/accounts`, this.httpOptions);
  }
}
