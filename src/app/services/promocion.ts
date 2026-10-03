import { API_URL } from './api.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PromocionService {

  private readonly api =
    (API_URL + '/promociones');

  private readonly apiProductos =
    (API_URL + '/productos');


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


  /* =====================================================
     PROMOCIONES
  ===================================================== */

  listar() {

    return this.http.get<any>(
      this.api,
      {
        headers: this.obtenerHeaders()
      }
    );
  }


  obtenerPorId(id: number) {

    return this.http.get<any>(
      `${this.api}/${id}`,
      {
        headers: this.obtenerHeaders()
      }
    );
  }


  crear(data: any) {

    return this.http.post<any>(
      this.api,
      data,
      {
        headers: this.obtenerHeaders()
      }
    );
  }


  actualizar(
    id: number,
    data: any
  ) {

    return this.http.put<any>(
      `${this.api}/${id}`,
      data,
      {
        headers: this.obtenerHeaders()
      }
    );
  }


  cambiarEstado(
    id: number,
    estado: number
  ) {

    return this.http.patch<any>(
      `${this.api}/${id}/estado`,
      {
        estado
      },
      {
        headers: this.obtenerHeaders()
      }
    );
  }


  /* =====================================================
     PRODUCTOS
  ===================================================== */

  listarProductos() {

    return this.http.get<any>(
      this.apiProductos,
      {
        headers: this.obtenerHeaders()
      }
    );
  }

}