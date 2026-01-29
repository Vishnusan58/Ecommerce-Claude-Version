import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface SubscriptionResponse {
  message: string;
  premiumExpiry: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly API_URL = '/api/user/profile';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<User> {
    return this.http.get<User>(this.API_URL);
  }

  updateProfile(data: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(this.API_URL, data);
  }

  subscribePremium(): Observable<SubscriptionResponse> {
    return this.http.post<SubscriptionResponse>('/api/subscription', {});
  }

  cancelPremium(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>('/api/subscription');
  }
}
