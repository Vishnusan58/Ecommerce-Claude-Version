import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Cart, AddToCartRequest } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly API_URL = '/api/user/cart';

  private cartItemCountSubject = new BehaviorSubject<number>(0);
  public cartItemCount$ = this.cartItemCountSubject.asObservable();

  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.API_URL).pipe(
      tap(cart => {
        this.cartSubject.next(cart);
        this.updateCartCount(cart);
      })
    );
  }

  addToCart(productId: number, quantity: number = 1): Observable<Cart> {
    const request: AddToCartRequest = { productId, quantity };
    return this.http.post<Cart>(`${this.API_URL}/add`, request).pipe(
      tap(cart => {
        this.cartSubject.next(cart);
        this.updateCartCount(cart);
      })
    );
  }

  updateQuantity(itemId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.API_URL}/${itemId}`, { quantity }).pipe(
      tap(cart => {
        this.cartSubject.next(cart);
        this.updateCartCount(cart);
      })
    );
  }

  removeFromCart(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.API_URL}/${itemId}`).pipe(
      tap(cart => {
        this.cartSubject.next(cart);
        this.updateCartCount(cart);
      })
    );
  }

  applyCoupon(couponCode: string): Observable<Cart> {
    return this.http.post<Cart>(`${this.API_URL}/coupon`, { couponCode }).pipe(
      tap(cart => {
        this.cartSubject.next(cart);
      })
    );
  }

  removeCoupon(): Observable<Cart> {
    return this.http.delete<Cart>(`${this.API_URL}/coupon`).pipe(
      tap(cart => {
        this.cartSubject.next(cart);
      })
    );
  }

  clearCart(): void {
    this.cartSubject.next(null);
    this.cartItemCountSubject.next(0);
  }

  private updateCartCount(cart: Cart): void {
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    this.cartItemCountSubject.next(count);
  }
}
