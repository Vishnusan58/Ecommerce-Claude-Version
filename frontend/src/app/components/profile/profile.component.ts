import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { User } from '../../models/user.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isLoading = true;
  isSaving = false;
  isSubscribing = false;

  profileForm: FormGroup;
  passwordForm: FormGroup;
  recentlyViewed: Product[] = [];

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private productService: ProductService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/profile' } });
      return;
    }
    this.loadProfile();
    this.recentlyViewed = this.productService.getRecentlyViewed();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm.patchValue({
          name: user.name,
          email: user.email
        });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to load profile', 'Close', { duration: 3000 });
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;

    this.isSaving = true;
    this.profileService.updateProfile(this.profileForm.value).subscribe({
      next: (user) => {
        this.user = user;
        this.isSaving = false;
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.isSaving = false;
        const message = error.error?.message || 'Failed to update profile';
        this.snackBar.open(message, 'Close', { duration: 3000 });
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.snackBar.open('Passwords do not match', 'Close', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    this.profileService.updateProfile({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.isSaving = false;
        this.passwordForm.reset();
        this.snackBar.open('Password changed successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.isSaving = false;
        const message = error.error?.message || 'Failed to change password';
        this.snackBar.open(message, 'Close', { duration: 3000 });
      }
    });
  }

  subscribePremium(): void {
    this.isSubscribing = true;
    this.profileService.subscribePremium().subscribe({
      next: (response) => {
        this.isSubscribing = false;
        if (this.user) {
          this.user.premiumStatus = true;
          this.user.premiumExpiry = response.premiumExpiry;
        }
        this.snackBar.open('Welcome to Premium! Enjoy your benefits.', 'Close', { duration: 5000 });
      },
      error: (error) => {
        this.isSubscribing = false;
        const message = error.error?.message || 'Failed to subscribe';
        this.snackBar.open(message, 'Close', { duration: 3000 });
      }
    });
  }

  getProductId(product: Product): number | undefined {
    return product?.id ?? product?.productId;
  }

  viewProduct(productId: number | undefined): void {
    if (productId != null && productId > 0) {
      this.router.navigate(['/products', productId]);
    }
  }
}
