import { AuthService } from '../../services/auth.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private open = new Set<string>();
  constructor(private router: Router, public auth: AuthService) {}

  toggle(event: Event, id: string): void {
    event.preventDefault();
    if (this.open.has(id)) this.open.delete(id);
    else { this.open.clear(); this.open.add(id); }
  }
  isOpen(id: string): boolean { return this.open.has(id); }

  logout(event: Event) {
    event.preventDefault();
    try {
      // limpia todo lo relacionado a auth
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      sessionStorage.clear();
    } finally {
      // navega al login y reemplaza la URL para que "Atrás" no vuelva al admin
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }
  cerrarAlNavegar(event: MouseEvent): void {
  const elemento = event.target;

  if (!(elemento instanceof Element)) return;

  const enlace = elemento.closest('a');
  const destino = enlace?.getAttribute('href');

  // Solo cierra al seleccionar una página.
  // Los botones que despliegan submenús usan href="#".
  if (!destino?.startsWith('/admin/')) return;

  const esEscritorio = window.matchMedia(
    '(min-width: 1200px)'
  ).matches;

  document.body.classList.toggle(
    'toggle-sidebar',
    esEscritorio
  );
}
}
