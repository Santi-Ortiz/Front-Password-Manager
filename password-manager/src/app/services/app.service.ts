import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { App } from '../models/app';

@Injectable({
    providedIn: 'root',
})
export class AppService {
    private apiUrl = 'http://localhost:8090/api/app'

    constructor(private http: HttpClient) {}





}