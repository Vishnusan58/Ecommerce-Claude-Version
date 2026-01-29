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
import { Cart, CartItem } from '../../models/cart.model';
import { CreateOrderRequest, PaymentMethod } from '../../models/order.model';

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
  isLoading = true;
  isPlacingOrder = false;

  addressForm: FormGroup;
  paymentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.addressForm = this.fb.group({
      fullName: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      street: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      country: ['India', [Validators.required]]
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
    if (this.addressForm.invalid || this.paymentForm.invalid) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isPlacingOrder = true;

    const orderData: CreateOrderRequest = {
      shippingAddress: this.addressForm.value,
      paymentMethod: this.paymentForm.get('paymentMethod')?.value as PaymentMethod,
      couponCode: this.cart?.appliedCoupon
    };

    const paymentMethod = this.paymentForm.get('paymentMethod')?.value;
    if (paymentMethod === 'UPI') {
      orderData.paymentDetails = {
        upiId: this.paymentForm.get('upiId')?.value
      };
    } else if (paymentMethod === 'CARD') {
      orderData.paymentDetails = {
        cardNumber: this.paymentForm.get('cardNumber')?.value,
        cardExpiry: this.paymentForm.get('cardExpiry')?.value,
        cardCvv: this.paymentForm.get('cardCvv')?.value,
        cardHolder: this.paymentForm.get('cardHolder')?.value
      };
    }

    this.orderService.placeOrder(orderData).subscribe({
      next: (order) => {
        this.cartService.clearCart();
        this.snackBar.open('Order placed successfully!', 'View Order', { duration: 5000 })
          .onAction().subscribe(() => this.router.navigate(['/orders', order.id]));
        this.router.navigate(['/orders', order.id]);
      },
      error: (error) => {
        this.isPlacingOrder = false;
        const message = error.error?.message || 'Failed to place order';
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
