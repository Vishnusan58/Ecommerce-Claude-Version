import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, PageResponse } from '../models/product.model';
import { Order, OrderStatus } from '../models/order.model';

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  images?: string[];
  categoryId: number;
  brand: string;
  stock: number;
  premiumEarlyAccess: boolean;
  earlyAccessDate?: Date;
}

export interface SellerStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
}

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private readonly API_URL = '/api/seller';

  constructor(private http: HttpClient) {}

  getSellerStats(): Observable<SellerStats> {
    return this.http.get<SellerStats>(`${this.API_URL}/dashboard`);
  }

  getSellerProducts(page: number = 0, size: number = 10): Observable<PageResponse<Product>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<Product>>(`${this.API_URL}/products`, { params });
  }

  addProduct(productData: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(`${this.API_URL}/products`, productData);
  }

  updateProduct(id: number, productData: Partial<CreateProductRequest>): Observable<Product> {
    return this.http.put<Product>(`${this.API_URL}/products/${id}`, productData);
  }

  deleteProduct(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/products/${id}`);
  }

  getSellerOrders(page: number = 0, size: number = 10, status?: OrderStatus): Observable<PageResponse<Order>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PageResponse<Order>>(`${this.API_URL}/orders`, { params });
  }

  updateOrderStatus(orderId: number, status: OrderStatus): Observable<Order> {
    return this.http.put<Order>(`${this.API_URL}/orders/${orderId}/status`, { status });
  }
}
