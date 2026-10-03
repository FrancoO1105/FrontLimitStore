import { API_URL } from './api.config';
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categoria {
  id: number;
  nombre: string;
  estado: number;
  fecha_registro?: string;
}

export interface CategoriaRequest {
  nombre: string;
  estado: number;
}

export interface RespuestaCategorias {
  ok: boolean;
  mensaje?: string;
  data: Categoria[];
}

export interface RespuestaCategoria {
  ok: boolean;
  mensaje?: string;
  data: Categoria;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private readonly apiUrl =
    (API_URL + '/categorias');

  constructor(
    private http: HttpClient
  ) {}

  private obtenerHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('token') ?? '';

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  listar(): Observable<RespuestaCategorias> {
    return this.http.get<RespuestaCategorias>(
      this.apiUrl,
      {
        headers: this.obtenerHeaders()
      }
    );
  }

  obtenerPorId(
    id: number
  ): Observable<RespuestaCategoria> {
    return this.http.get<RespuestaCategoria>(
      `${this.apiUrl}/${id}`,
      {
        headers: this.obtenerHeaders()
      }
    );
  }

  crear(
    categoria: CategoriaRequest
  ): Observable<RespuestaCategoria> {
    return this.http.post<RespuestaCategoria>(
      this.apiUrl,
      categoria,
      {
        headers: this.obtenerHeaders()
      }
    );
  }

  actualizar(
    id: number,
    categoria: CategoriaRequest
  ): Observable<RespuestaCategoria> {
    return this.http.put<RespuestaCategoria>(
      `${this.apiUrl}/${id}`,
      categoria,
      {
        headers: this.obtenerHeaders()
      }
    );
  }

  cambiarEstado(
    id: number,
    estado: number
  ): Observable<RespuestaCategoria> {
    return this.http.patch<RespuestaCategoria>(
      `${this.apiUrl}/${id}/estado`,
      { estado },
      {
        headers: this.obtenerHeaders()
      }
    );
  }
}