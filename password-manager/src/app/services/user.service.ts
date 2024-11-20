import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { User } from '../models/user';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private apiUrl = 'http://localhost:8090/api/user'

    constructor(private http: HttpClient) {}

    // Get user by id
    getUserById(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/find/${id}`)
    }

    // Get all accounts for a user
    getAccountsByUserId(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}/accounts`)
    }

    // Create user 
    createUser(user: User): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/create`, user)
    }

    // Update user
    updateUser(user: User, id: number): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/update/${id}`, user)
    }

    // Delete user
    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/delete/${id}`)
    }

}