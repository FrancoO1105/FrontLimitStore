import { API_URL } from '../../../services/api.config';
import { AuthService } from '../../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [CommonModule, FormsModule]
})
export class Login implements OnInit {
  usuario = '';
  password = '';
  error = '';
  cargando = false;

  constructor(private http: HttpClient, private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    
    if (this.auth.isAuthenticated()) this.router.navigate(['/admin']);
  }

  ingresar(): void {
    this.error = '';

    if (!this.usuario.trim() || !this.password.trim()) {
      this.error = 'Debes ingresar usuario y contraseña';
      return;
    }

    this.cargando = true;

    this.http.post<any>((API_URL + '/login'), {
      usuario: this.usuario,
      password: this.password
    }).subscribe({
      next: (res) => {
        if (!res?.token || !res?.usuario) {
          this.error = 'Respuesta inesperada del servidor';
          this.cargando = false;
          return;
        }

        localStorage.setItem('token', res.token);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));
        this.cargando = false;
        this.router.navigate(['/admin']);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        this.error = err.error?.mensaje || 'Credenciales inválidas';
        console.error('Login error:', err);
      }
    });
  }
}