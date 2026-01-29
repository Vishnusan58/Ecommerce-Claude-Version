
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';
import { Product, Category, ProductFilter } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatSliderModule
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  isLoading = false;

  // Pagination
  totalElements = 0;
  pageSize = 12;
  pageIndex = 0;

  // Filters
  searchTerm = '';
  selectedCategoryId: number | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedBrand = '';
  sortBy = 'createdAt,desc';

  // Compare
  compareList: Product[] = [];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    if (this.authService.isLoggedIn()) {
      this.wishlistService.getWishlist().subscribe();
    }
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  loadProducts(): void {
    this.isLoading = true;

    const filter: ProductFilter = {};
    if (this.selectedCategoryId) filter.categoryId = this.selectedCategoryId;
    if (this.minPrice) filter.minPrice = this.minPrice;
    if (this.maxPrice) filter.maxPrice = this.maxPrice;
    if (this.selectedBrand) filter.brand = this.selectedBrand;
    if (this.searchTerm) filter.search = this.searchTerm;

    this.productService.getProducts(this.pageIndex, this.pageSize, this.sortBy, filter).subscribe({
      next: (response) => {
        this.products = response.content;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to load products', 'Close', { duration: 3000 });
      }
    });
  }

  onSearch(): void {
    this.pageIndex = 0;
    this.loadProducts();
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.loadProducts();
  }

  onSortChange(): void {
    this.loadProducts();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryId = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedBrand = '';
    this.sortBy = 'createdAt,desc';
    this.pageIndex = 0;
    this.loadProducts();
  }

  viewProduct(product: Product): void {
    this.router.navigate(['/products', this.getProductId(product)]);
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();

    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Please login to add items to cart', 'Login', { duration: 3000 })
        .onAction().subscribe(() => this.router.navigate(['/login']));
      return;
    }

    this.cartService.addToCart(this.getProductId(product)).subscribe({
      next: () => {
        this.snackBar.open('Added to cart!', 'Close', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Failed to add to cart', 'Close', { duration: 3000 });
      }
    });
  }

  toggleWishlist(product: Product, event: Event): void {
    event.stopPropagation();

    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Please login to add items to wishlist', 'Login', { duration: 3000 })
        .onAction().subscribe(() => this.router.navigate(['/login']));
      return;
    }

    const productId = this.getProductId(product);
    if (this.isInWishlist(productId)) {
      this.wishlistService.removeFromWishlist(productId).subscribe({
        next: () => this.snackBar.open('Removed from wishlist', 'Close', { duration: 2000 })
      });
    } else {
      this.wishlistService.addToWishlist(productId).subscribe({
        next: () => this.snackBar.open('Added to wishlist!', 'Close', { duration: 2000 })
      });
    }
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  toggleCompare(product: Product, event?: Event | any): void {
    if (event?.stopPropagation) {
      event.stopPropagation();
    }

    const productId = this.getProductId(product);
    const index = this.compareList.findIndex(p => this.getProductId(p) === productId);
    if (index > -1) {
      this.compareList.splice(index, 1);
    } else if (this.compareList.length < 2) {
      this.compareList.push(product);
    } else {
      this.snackBar.open('You can only compare 2 products', 'Close', { duration: 2000 });
    }
  }

  removeFromCompare(product: Product): void {
    const productId = this.getProductId(product);
    const index = this.compareList.findIndex(p => this.getProductId(p) === productId);
    if (index > -1) {
      this.compareList.splice(index, 1);
    }
  }

  isInCompare(productId: number): boolean {
    return this.compareList.some(p => this.getProductId(p) === productId);
  }

  goToCompare(): void {
    if (this.compareList.length === 2) {
      this.router.navigate(['/compare'], {
        queryParams: {
          id1: this.getProductId(this.compareList[0]),
          id2: this.getProductId(this.compareList[1])
        }
      });
    }
  }

  getDiscountPercent(product: Product): number {
    if (product.discountPercent) {
      return Math.round(product.discountPercent);
    }
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round((1 - product.price / product.originalPrice) * 100);
    }
    return 0;
  }

  // Helper methods to handle backend field name variations
  getProductId(product: Product): number {
    return product.id || product.productId || 0;
  }

  getProductStock(product: Product): number {
    return product.stock ?? product.stockQuantity ?? 0;
  }

  getProductRating(product: Product): number {
    return product.rating ?? product.averageRating ?? 0;
  }

  getProductCategory(product: Product): string {
    return product.category?.name || 'Uncategorized';
  }

  getReviewCount(product: Product): number {
    return product.reviewCount ?? 0;
  }
}
