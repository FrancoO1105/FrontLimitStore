import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
})
export class Navbar {
  constructor(private router: Router) {}

  toggleSidebar(event: Event) {
    event.preventDefault();
    document.body.classList.toggle('toggle-sidebar'); // clase propia de NiceAdmin
  }

  toggleSearch(event: Event) {
    event.preventDefault();
    const searchBar = document.querySelector('.search-bar');
    searchBar?.classList.toggle('search-bar-show');
  }

  logout(event: Event) {
    event.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
  nombreUsuario = this.obtenerNombreUsuario();

private obtenerNombreUsuario(): string {
  try {
    const usuario = JSON.parse(
      localStorage.getItem('usuario') || 'null'
    );

    if (!usuario) return 'Usuario';

    const nombreCompleto = [
      usuario.nombres,
      usuario.apellido_pat,
      usuario.apellido_mat
    ]
      .filter(valor => typeof valor === 'string' && valor.trim())
      .map(valor => valor.trim())
      .join(' ');

    return nombreCompleto || usuario.usuario || 'Usuario';
  } catch {
    return 'Usuario';
  }
}
}
