import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const authChildGuard: CanActivateChildFn = (route, state) => authGuard(route, state);

export const adminGuard: CanActivateFn = () =>
  inject(AuthService).isAdmin() || inject(Router).createUrlTree(['/admin/ventas']);
