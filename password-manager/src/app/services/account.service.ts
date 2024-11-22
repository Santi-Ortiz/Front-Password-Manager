import { Injectable } from '@angular/core';
import {environment} from "../environments/environment.development";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "./auth.service";
import {User} from "../models/user";
import {Observable} from "rxjs";
import {Account} from "../models/account";

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = environment.SERVER_URL + '/account';

  private httpOptions: { headers: HttpHeaders } = { headers: new HttpHeaders() };

  constructor(private http: HttpClient, private authService: AuthService) {
    this.setAuthHeaders();
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

  getAccountsByUserId(id: number): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/user-accounts/${id}`, this.httpOptions);
  }

  addAccount(account: Account): Observable<Account> {
    return this.http.post<Account>(`${this.apiUrl}/add`, account);
  }

}
