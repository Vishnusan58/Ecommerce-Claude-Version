import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order, OrderStatus, OrderItem } from '../../models/order.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatStepperModule
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css'
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  isLoading = true;
  isCancelling = false;

  statusSteps: { status: OrderStatus; label: string; icon: string }[] = [
    { status: 'PENDING', label: 'Order Placed', icon: 'receipt' },
    { status: 'CONFIRMED', label: 'Confirmed', icon: 'check_circle' },
    { status: 'PROCESSING', label: 'Processing', icon: 'inventory_2' },
    { status: 'SHIPPED', label: 'Shipped', icon: 'local_shipping' },
    { status: 'DELIVERED', label: 'Delivered', icon: 'done_all' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const orderId = this.route.snapshot.params['id'];
    if (orderId) {
      this.loadOrder(+orderId);
    }
  }

  loadOrder(id: number): void {
    this.isLoading = true;
    this.orderService.getOrderById(id).subscribe({
      next: (order) => {
        this.order = order;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Order not found', 'Close', { duration: 3000 });
        this.router.navigate(['/orders']);
      }
    });
  }

  getStatusIndex(): number {
    if (!this.order) return 0;
    const index = this.statusSteps.findIndex(s => s.status === this.order?.status);
    return index >= 0 ? index : 0;
  }

  get canCancel(): boolean {
    if (!this.order) return false;
    return ['PENDING', 'CONFIRMED'].includes(this.order.status);
  }

  get canRequestRefund(): boolean {
    if (!this.order) return false;
    return this.order.status === 'DELIVERED' && this.order.paymentStatus === 'COMPLETED';
  }

  getProductId(product: Product | undefined): number {
    if (!product) return 0;
    return product.id ?? product.productId ?? 0;
  }

  cancelOrder(): void {
    if (!this.order) return;

    this.isCancelling = true;
    this.orderService.cancelOrder(this.order.id).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
        this.isCancelling = false;
        this.snackBar.open('Order cancelled successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.isCancelling = false;
        const message = error.error?.message || 'Failed to cancel order';
        this.snackBar.open(message, 'Close', { duration: 3000 });
      }
    });
  }

  requestRefund(): void {
    if (!this.order) return;

    this.orderService.requestRefund(this.order.id, 'Customer requested refund').subscribe({
      next: () => {
        this.snackBar.open('Refund request submitted', 'Close', { duration: 3000 });
        if (this.order) {
          this.loadOrder(this.order.id);
        }
      },
      error: (error) => {
        const message = error.error?.message || 'Failed to request refund';
        this.snackBar.open(message, 'Close', { duration: 3000 });
      }
    });
  }

  viewProduct(productId: number | undefined): void {
    if (productId != null && productId > 0) {
      this.router.navigate(['/products', productId]);
    }
  }
}
