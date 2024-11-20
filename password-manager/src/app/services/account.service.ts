import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Account } from '../models/account';
import { App } from '../models/app';

@Injectable({
    providedIn: 'root',
})
export class AccountService {
    private apiUrl = 'http://localhost:8090/api/account'

    constructor(private http: HttpClient) {}

    // Get account by id
    getAccountById(id: number): Observable<Account>{
        return this.http.get<Account>(`${this.apiUrl}/find/${id}`)
    }

    // Get app by an account
    getAppByAccountId(id: number): Observable<App>{
        return this.http.get<App>(`${this.apiUrl}/app/${id}`)
    }

    // Create an account
    createAccount(account: Account): Observable<Account>{
        return this.http.post<Account>(`${this.apiUrl}/add`, account)
    }

    // Update an account
    updateAccount(account: Account, id: number): Observable<Account>{
        return this.http.put<Account>(`${this.apiUrl}/update/${id}`, account)
    }

    // Delete an account
    deleteAccount(id: number): Observable<void>{
        return this.http.delete<void>(`${this.apiUrl}/delete/${id}`)
    }
    
}