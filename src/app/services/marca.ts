import { API_URL } from './api.config';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Marca {
  id: number;
  nombre: string;
  estado: number;
  fecha_registro: string;
}

export interface MarcaRequest {
  nombre: string;
  estado: number;
}

export interface RespuestaMarcas {
  ok: boolean;
  data: Marca[];
  mensaje?: string;
}

export interface RespuestaMarca {
  ok: boolean;
  data: Marca;
  mensaje?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MarcaService {

  private readonly apiUrl =
    (API_URL + '/marcas');

  constructor(
    private http: HttpClient
  ) {}

  private obtenerHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  listar(): Observable<RespuestaMarcas> {
    return this.http.get<RespuestaMarcas>(
      this.apiUrl,
      {
        headers: this.obtenerHeaders()
      }
    );
  }

  obtenerPorId(
    id: number
  ): Observable<RespuestaMarca> {
    return this.http.get<RespuestaMarca>(
      `${this.apiUrl}/${id}`,
      {
        headers: this.obtenerHeaders()
      }
    );
  }

  crear(
    marca: MarcaRequest
  ): Observable<RespuestaMarca> {
    return this.http.post<RespuestaMarca>(
      this.apiUrl,
      marca,
      {
        headers: this.obtenerHeaders()
      }
    );
  }

  actualizar(
    id: number,
    marca: MarcaRequest
  ): Observable<RespuestaMarca> {
    return this.http.put<RespuestaMarca>(
      `${this.apiUrl}/${id}`,
      marca,
      {
        headers: this.obtenerHeaders()
      }
    );
  }

  cambiarEstado(
    id: number,
    estado: number
  ): Observable<RespuestaMarca> {
    return this.http.patch<RespuestaMarca>(
      `${this.apiUrl}/${id}/estado`,
      { estado },
      {
        headers: this.obtenerHeaders()
      }
    );
  }
}