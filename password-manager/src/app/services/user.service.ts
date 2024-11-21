import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { AuthService } from './auth.service';
import {environment} from "../environments/environment.development";

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.SERVER_URL + '/user';

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

  // Método: Obtener un usuario por ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/find/${id}`, this.httpOptions);
  }

  // Método: Obtener todas las cuentas asociadas a un usuario
  getAccountsByUserId(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}/accounts`, this.httpOptions);
  }

  // Método: Actualizar un usuario
  updateUser(user: User, id: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/update/${id}`, user, this.httpOptions);
  }

  // Método: Eliminar un usuario
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, this.httpOptions);
  }
}
