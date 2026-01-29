import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {
  wishlist: Product[] = [];
  isLoading = true;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/wishlist' } });
      return;
    }
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.isLoading = true;
    this.wishlistService.getWishlist().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to load wishlist', 'Close', { duration: 3000 });
      }
    });

    this.wishlistService.wishlist$.subscribe(products => {
      this.wishlist = products;
    });
  }

  getProductId(product: Product): number {
    return product.id ?? product.productId ?? 0;
  }

  getProductStock(product: Product): number {
    return product.stock ?? product.stockQuantity ?? 0;
  }

  getProductRating(product: Product): number {
    return product.rating ?? product.averageRating ?? 0;
  }

  getProductCategory(product: Product): string {
    return product.category?.name ?? 'Uncategorized';
  }

  moveToCart(product: Product): void {
    const productId = this.getProductId(product);
    if (!productId) return;

    this.cartService.addToCart(productId).subscribe({
      next: () => {
        this.wishlistService.removeFromWishlist(productId).subscribe();
        this.snackBar.open('Moved to cart!', 'View Cart', { duration: 3000 })
          .onAction().subscribe(() => this.router.navigate(['/cart']));
      },
      error: () => {
        this.snackBar.open('Failed to add to cart', 'Close', { duration: 3000 });
      }
    });
  }

  removeFromWishlist(product: Product): void {
    const productId = this.getProductId(product);
    if (!productId) return;

    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => {
        this.snackBar.open('Removed from wishlist', 'Close', { duration: 2000 });
      }
    });
  }

  viewProduct(productId: number | undefined): void {
    if (productId != null && productId > 0) {
      this.router.navigate(['/products', productId]);
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
}
