import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserAddress {
  id: number;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private readonly API_URL = '/api/user/addresses';

  constructor(private http: HttpClient) {}

  getAddresses(): Observable<UserAddress[]> {
    return this.http.get<UserAddress[]>(this.API_URL);
  }

  addAddress(address: Omit<UserAddress, 'id'>): Observable<UserAddress> {
    return this.http.post<UserAddress>(this.API_URL, address);
  }

  updateAddress(id: number, address: Partial<UserAddress>): Observable<UserAddress> {
    return this.http.put<UserAddress>(`${this.API_URL}/${id}`, address);
  }

  deleteAddress(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  setDefaultAddress(id: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}/default`, {});
  }
}
