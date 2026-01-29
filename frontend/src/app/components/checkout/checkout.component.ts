import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { AddressService } from '../../services/address.service';
import { Cart, CartItem } from '../../models/cart.model';
import { CreateOrderRequest, PaymentMethod, Address } from '../../models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  cart: Cart | null = null;
  addresses: any[] = [];
  isLoading = true;
  isPlacingOrder = false;

  addressForm: FormGroup;
  paymentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private addressService: AddressService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.addressForm = this.fb.group({
      addressId: ['', [Validators.required]]
    });

    this.paymentForm = this.fb.group({
      paymentMethod: ['COD', [Validators.required]],
      upiId: [''],
      cardNumber: [''],
      cardExpiry: [''],
      cardCvv: [''],
      cardHolder: ['']
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    this.loadCart();
    this.loadAddresses();
  }

  loadCart(): void {
    this.isLoading = true;
    this.cartService.getCart().subscribe({
      next: (cart) => {
        if (!cart || cart.items.length === 0) {
          this.snackBar.open('Your cart is empty', 'Close', { duration: 3000 });
          this.router.navigate(['/cart']);
          return;
        }
        this.cart = cart;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to load cart', 'Close', { duration: 3000 });
        this.router.navigate(['/cart']);
      }
    });
  }

  loadAddresses(): void {
    this.addressService.getAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        if (addresses.length > 0) {
          this.addressForm.patchValue({ addressId: addresses[0].id });
        }
      },
      error: () => {
        this.snackBar.open('Failed to load addresses', 'Close', { duration: 3000 });
      }
    });
  }

  onPaymentMethodChange(): void {
    const method = this.paymentForm.get('paymentMethod')?.value;

    // Reset all payment fields
    this.paymentForm.get('upiId')?.clearValidators();
    this.paymentForm.get('cardNumber')?.clearValidators();
    this.paymentForm.get('cardExpiry')?.clearValidators();
    this.paymentForm.get('cardCvv')?.clearValidators();
    this.paymentForm.get('cardHolder')?.clearValidators();

    if (method === 'UPI') {
      this.paymentForm.get('upiId')?.setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9.\\-_]+@[a-zA-Z]+$')]);
    } else if (method === 'CARD') {
      this.paymentForm.get('cardNumber')?.setValidators([Validators.required, Validators.pattern('^[0-9]{16}$')]);
      this.paymentForm.get('cardExpiry')?.setValidators([Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\\/[0-9]{2}$')]);
      this.paymentForm.get('cardCvv')?.setValidators([Validators.required, Validators.pattern('^[0-9]{3}$')]);
      this.paymentForm.get('cardHolder')?.setValidators([Validators.required]);
    }

    this.paymentForm.get('upiId')?.updateValueAndValidity();
    this.paymentForm.get('cardNumber')?.updateValueAndValidity();
    this.paymentForm.get('cardExpiry')?.updateValueAndValidity();
    this.paymentForm.get('cardCvv')?.updateValueAndValidity();
    this.paymentForm.get('cardHolder')?.updateValueAndValidity();
  }

  placeOrder(): void {
    if (this.addressForm.invalid) {
      this.snackBar.open('Please select a delivery address', 'Close', { duration: 3000 });
      return;
    }

    if (this.addresses.length === 0) {
      this.snackBar.open('Please add a delivery address first', 'Go to Profile', { duration: 5000 })
        .onAction().subscribe(() => this.router.navigate(['/profile']));
      return;
    }

    this.isPlacingOrder = true;

    const orderData: CreateOrderRequest = {
      addressId: this.addressForm.get('addressId')?.value,
      couponCode: this.cart?.appliedCoupon
    };

    this.orderService.placeOrder(orderData).subscribe({
      next: (order) => {
        this.isPlacingOrder = false;
        this.cartService.clearCart().subscribe();
        this.snackBar.open('Order placed successfully!', 'View Order', { duration: 5000 })
          .onAction().subscribe(() => this.router.navigate(['/orders', order.orderId]));
        this.router.navigate(['/orders', order.orderId]);
      },
      error: (error) => {
        this.isPlacingOrder = false;
        const message = error.error?.message || 'Failed to place order. Please try again.';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      }
    });
  }

  get isPremium(): boolean {
    return this.authService.isPremium();
  }

  // Helper methods for cart item field access
  getItemId(item: CartItem): number {
    return item.id ?? item.cartItemId ?? 0;
  }

  getItemName(item: CartItem): string {
    return item.product?.name ?? item.productName ?? 'Unknown';
  }

  getItemImage(item: CartItem): string {
    return item.product?.imageUrl ?? item.imageUrl ?? '';
  }

  // Helper methods for cart totals
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
}
