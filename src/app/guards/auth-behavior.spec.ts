import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, provideRouter } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard, adminGuard } from './auth-guard';
import { routes } from '../app.routes';

describe('Acceso a la administración', () => {
  const state = { url: '/admin/ventas' } as RouterStateSnapshot;
  const route = {} as ActivatedRouteSnapshot;
  const setToken = (rol: number, exp: number) => {
    const payload = btoa(JSON.stringify({ rol, exp })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    localStorage.setItem('token', `header.${payload}.signature`);
  };
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });
  afterEach(() => localStorage.clear());

  it('protege la ruta principal y sus hijos', () => {
    const admin = routes.find(route => route.path === 'admin')!;
    expect(admin.canActivate).toContain(authGuard);
    expect(admin.canActivateChild?.length).toBeGreaterThan(0);
  });
  it('redirige al login sin sesión y elimina sesiones vencidas', () => {
    setToken(1, 1);
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(TestBed.inject(Router).serializeUrl(result as any)).toContain('/login');
    expect(localStorage.getItem('token')).toBeNull();
  });
  it('permite sesión vigente pero limita administración al rol 1', () => {
    setToken(2, Math.floor(Date.now() / 1000) + 60);
    expect(TestBed.runInInjectionContext(() => authGuard(route, state))).toBeTrue();
    expect(TestBed.inject(AuthService).isAdmin()).toBeFalse();
    expect(TestBed.runInInjectionContext(() => adminGuard(route, state))).not.toBeTrue();
    setToken(1, Math.floor(Date.now() / 1000) + 60);
    expect(TestBed.runInInjectionContext(() => adminGuard(route, state))).toBeTrue();
  });
});
