import { Injectable } from '@angular/core';
import { environment } from "../environments/environment.development";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";
import {User} from "../models/user";

@Injectable({
  providedIn: 'root'
})
export class TwofaService {
  private apiUrl = environment.SERVER_URL + '/twofa';

  private httpOptions: { headers: HttpHeaders } = { headers: new HttpHeaders() };

  constructor(private http: HttpClient, private authService: AuthService) {
    this.setAuthHeaders(); // Establecemos encabezados al inicializar el servicio
  }

  private setAuthHeaders(): void {
    const token = this.authService.getToken();
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  // 1. Método para solicitar un nuevo token
  createToken(user: User | null): Observable<any> {
    console.log("En crear token servicio el usuario es:");
    console.log(user?.username);
    console.log("En crear token servicio el correo es:");
    console.log(user?.email);

    return this.http.post(`${this.apiUrl}/create`, user, this.httpOptions);
  }


  // 2. Método para validar un token
  validateToken(token: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/validate`, token, this.httpOptions);
  }

  // 3. Método para verificar si el token está en uso
  isTokenInUse(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/is-in-use`, this.httpOptions);
  }
}
