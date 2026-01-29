import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly API_URL = '/api/user/wishlist';

  private wishlistSubject = new BehaviorSubject<Product[]>([]);
  public wishlist$ = this.wishlistSubject.asObservable();

  constructor(private http: HttpClient) {}

  getWishlist(): Observable<Product[]> {
    return this.http.get<any>(this.API_URL).pipe(
      tap(response => {
        const products = response.items.map((item: any) => ({
          id: item.productId,
          productId: item.productId,
          name: item.productName,
          description: item.description,
          price: item.price,
          originalPrice: item.originalPrice,
          averageRating: item.rating,
          rating: item.rating,
          imageUrl: item.imageUrl,
          stockQuantity: item.stockQuantity,
          stock: item.stockQuantity,
          category: item.categoryName ? { name: item.categoryName } : null,
          discountPercent: item.discountPercent,
          premiumEarlyAccess: item.premiumEarlyAccess
        }));
        this.wishlistSubject.next(products);
      })
    );
  }

  addToWishlist(productId: number): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${productId}`, {}).pipe(
      tap(() => this.getWishlist().subscribe())
    );
  }

  removeFromWishlist(productId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${productId}`).pipe(
      tap(() => {
        const currentList = this.wishlistSubject.value;
        this.wishlistSubject.next(currentList.filter(p => p.id !== productId));
      })
    );
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistSubject.value.some(p => p.id === productId);
  }
}
