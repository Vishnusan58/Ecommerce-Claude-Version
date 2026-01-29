import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUserValue();

  if (user) {
    const headers: Record<string, string> = {
      'X-USER-ID': user.id.toString()
    };

    // Add role-specific headers
    const role = user.role?.toUpperCase();
    if (role === 'ADMIN') {
      headers['X-ADMIN-ID'] = user.id.toString();
    }
    if (role === 'SELLER') {
      headers['X-SELLER-ID'] = user.id.toString();
    }

    req = req.clone({ setHeaders: headers });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
