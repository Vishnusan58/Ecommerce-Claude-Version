import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, CreateOrderRequest, OrderStatus } from '../models/order.model';
import { PageResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_URL = '/api/user/orders';

  constructor(private http: HttpClient) {}

  placeOrder(orderData: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.API_URL, orderData);
  }

  getOrders(page: number = 0, size: number = 10, status?: OrderStatus): Observable<PageResponse<Order>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PageResponse<Order>>(this.API_URL, { params });
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.API_URL}/${id}`);
  }

  cancelOrder(id: number): Observable<Order> {
    return this.http.post<Order>(`${this.API_URL}/${id}/cancel`, {});
  }

  requestRefund(id: number, reason: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/${id}/refund`, { reason });
  }
}
