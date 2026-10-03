import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

interface JwtPayload { exp?: number; [k: string]: any; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private router: Router) {}

  get token(): string | null {
    return localStorage.getItem('token');
  }

  setSession(token: string, usuario?: any) {
    localStorage.setItem('token', token);
    if (usuario) localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.clear();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  isAuthenticated(): boolean {
    const t = this.token;
    if (!t) return false;
    const p = this.decode(t);
    if (!p) return false;
    return typeof p.exp === 'number' && p.exp > Math.floor(Date.now() / 1000);
  }

  isAdmin(): boolean {
    return this.isAuthenticated() && String(this.decode(this.token!)?.['rol']) === '1';
  }

  private decode(token: string): JwtPayload | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '==='.slice((base64.length + 3) % 4);
      const json = decodeURIComponent(atob(padded).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
      return JSON.parse(json);
    } catch { return null; }
  }
}
