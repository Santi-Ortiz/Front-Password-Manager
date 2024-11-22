import { Injectable } from '@angular/core';
import { environment } from '../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { App } from '../models/app';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private apiUrl = environment.SERVER_URL + '/app';

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

  getAppById(id: number): Observable<App> {
    return this.http.get<App>(`${this.apiUrl}/find/${id}`, this.httpOptions);
  }

  addApp(app: App): Observable<App> {
    return this.http.post<App>(`${this.apiUrl}/add`, app);
  }

  deleteApp(appId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${appId}`);
  }

  updateApp(app: App, appId: number): Observable<App> {
    return this.http.put<App>(`${this.apiUrl}/update/${appId}`, app);
  }
}
