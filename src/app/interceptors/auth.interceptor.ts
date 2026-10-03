import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { API_URL } from '../services/api.config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const api = new URL(API_URL, window.location.origin);
  const target = new URL(req.url, window.location.origin);
  const isApi = target.origin === api.origin &&
    (target.pathname === api.pathname || target.pathname.startsWith(api.pathname + '/'));
  const authReq = token && isApi ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  const router = inject(Router);
  return next(authReq).pipe(
    catchError((err: any) => {
      if (isApi && err instanceof HttpErrorResponse && err.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        router.navigate(['/login'], { replaceUrl: true });
      }
      return throwError(() => err);
    })
  );
};
