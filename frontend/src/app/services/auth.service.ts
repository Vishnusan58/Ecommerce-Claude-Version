import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = '/api/auth';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      map(response => this.mapAuthResponseToUser(response, credentials.email)),
      tap(user => {
        this.storeUser(user);
        this.currentUserSubject.next(user);
      })
    );
  }

  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData).pipe(
      map(response => this.mapAuthResponseToUser(response, userData.email)),
      tap(user => {
        this.storeUser(user);
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.getStoredUser();
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUserValue();
    return user?.role?.toUpperCase() === role.toUpperCase();
  }

  isPremium(): boolean {
    const user = this.getCurrentUserValue();
    return user?.premiumStatus ?? false;
  }

  private mapAuthResponseToUser(response: AuthResponse, email: string): User {
    return {
      id: response.userId,
      email: email,
      name: response.name,
      role: response.role as User['role'],
      premiumStatus: response.premium
    };
  }

  private storeUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  private clearStorage(): void {
    localStorage.removeItem(this.USER_KEY);
  }
}
