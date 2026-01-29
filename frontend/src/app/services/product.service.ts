import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Category, PageResponse, ProductFilter } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = '/api/products';
  private readonly CATEGORIES_URL = '/api/categories';

  constructor(private http: HttpClient) {}

  getProducts(
    page: number = 0,
    size: number = 12,
    sort: string = 'createdAt,desc',
    filter?: ProductFilter
  ): Observable<PageResponse<Product>> {
    const [sortBy, direction] = sort.split(',');

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy || 'createdAt')
      .set('direction', direction || 'desc');

    if (filter) {
      if (filter.categoryId) params = params.set('categoryId', filter.categoryId.toString());
      if (filter.minPrice) params = params.set('minPrice', filter.minPrice.toString());
      if (filter.maxPrice) params = params.set('maxPrice', filter.maxPrice.toString());
      if (filter.search) params = params.set('keyword', filter.search);
    }

    return this.http.get<PageResponse<Product>>(this.API_URL, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${id}`);
  }

  searchProducts(searchTerm: string, page: number = 0, size: number = 12): Observable<PageResponse<Product>> {
    const params = new HttpParams()
      .set('q', searchTerm)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<Product>>(`${this.API_URL}/search`, { params });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.CATEGORIES_URL);
  }

  compareProducts(id1: number, id2: number): Observable<{ product1: Product; product2: Product }> {
    const params = new HttpParams()
      .set('id1', id1.toString())
      .set('id2', id2.toString());

    return this.http.get<{ product1: Product; product2: Product }>(`${this.API_URL}/compare`, { params });
  }

  getRecentlyViewed(): Product[] {
    const stored = localStorage.getItem('recently_viewed');
    return stored ? JSON.parse(stored) : [];
  }

  addToRecentlyViewed(product: Product): void {
    let recentlyViewed = this.getRecentlyViewed();
    recentlyViewed = recentlyViewed.filter(p => p.id !== product.id);
    recentlyViewed.unshift(product);
    recentlyViewed = recentlyViewed.slice(0, 10);
    localStorage.setItem('recently_viewed', JSON.stringify(recentlyViewed));
  }
}
