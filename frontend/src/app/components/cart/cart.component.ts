import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Cart, CartItem } from '../../models/cart.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  isLoading = true;
  couponCode = '';
  isApplyingCoupon = false;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } });
      return;
    }
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to load cart', 'Close', { duration: 3000 });
      }
    });
  }

  getProductStock(item: CartItem): number {
    if (item.product) {
      return item.product.stock ?? item.product.stockQuantity ?? 999;
    }
    return 999; // Default when no product info
  }

  getProductId(item: CartItem): number | undefined {
    return item.product?.id ?? item.product?.productId ?? item.productId;
  }

  getItemId(item: CartItem): number {
    return item.id ?? item.cartItemId ?? 0;
  }

  getItemName(item: CartItem): string {
    return item.product?.name ?? item.productName ?? 'Unknown';
  }

  getItemImage(item: CartItem): string {
    return item.product?.imageUrl ?? item.imageUrl ?? '';
  }

  getItemBrand(item: CartItem): string {
    return item.product?.brand ?? item.brand ?? '';
  }

  getItemPrice(item: CartItem): number {
    return item.product?.price ?? item.price ?? 0;
  }

  getCartSubtotal(): number {
    return this.cart?.subtotal ?? this.cart?.totalAmount ?? 0;
  }

  getCartTax(): number {
    return this.cart?.tax ?? 0;
  }

  getCartDeliveryFee(): number {
    return this.cart?.deliveryFee ?? 0;
  }

  getCartDiscount(): number {
    return this.cart?.discount ?? this.cart?.discountAmount ?? 0;
  }

  getCartTotal(): number {
    return this.cart?.total ?? this.cart?.finalAmount ?? 0;
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) return;
    const stock = this.getProductStock(item);
    if (newQuantity > stock) {
      this.snackBar.open(`Only ${stock} items available`, 'Close', { duration: 2000 });
      return;
    }

    const itemId = this.getItemId(item);
    this.cartService.updateQuantity(itemId, newQuantity).subscribe({
      next: (cart) => {
        this.cart = cart;
      },
      error: () => {
        this.snackBar.open('Failed to update quantity', 'Close', { duration: 3000 });
      }
    });
  }

  removeItem(item: CartItem): void {
    const itemId = this.getItemId(item);
    this.cartService.removeFromCart(itemId).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.snackBar.open('Item removed from cart', 'Close', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Failed to remove item', 'Close', { duration: 3000 });
      }
    });
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) return;

    this.isApplyingCoupon = true;
    this.cartService.applyCoupon(this.couponCode).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.isApplyingCoupon = false;
        this.snackBar.open('Coupon applied successfully!', 'Close', { duration: 2000 });
      },
      error: (error) => {
        this.isApplyingCoupon = false;
        const message = error.error?.message || 'Invalid coupon code';
        this.snackBar.open(message, 'Close', { duration: 3000 });
      }
    });
  }

  removeCoupon(): void {
    this.cartService.removeCoupon().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.couponCode = '';
        this.snackBar.open('Coupon removed', 'Close', { duration: 2000 });
      }
    });
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  viewProduct(productId: number | undefined): void {
    if (productId != null) {
      this.router.navigate(['/products', productId]);
    }
  }

  get isPremium(): boolean {
    return this.authService.isPremium();
  }
}
