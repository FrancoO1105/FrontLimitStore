import { API_URL } from './api.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CargaMasivaProductoService {

  private readonly apiMasiva =
    (API_URL + '/productos/carga-masiva');

  private readonly apiCategorias =
    (API_URL + '/categorias');

  private readonly apiMarcas =
    (API_URL + '/marcas');

  private readonly apiModelos =
    (API_URL + '/modelo');

  private readonly apiTipos =
    (API_URL + '/tipos-producto');


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


  listarCategorias() {

    return this.http.get<any>(
      this.apiCategorias,
      {
        headers: this.obtenerHeaders()
      }
    );

  }


  listarMarcas() {

    return this.http.get<any>(
      this.apiMarcas,
      {
        headers: this.obtenerHeaders()
      }
    );

  }


  listarModelos() {

    return this.http.get<any>(
      this.apiModelos,
      {
        headers: this.obtenerHeaders()
      }
    );

  }


  listarTipos() {

    return this.http.get<any>(
      this.apiTipos,
      {
        headers: this.obtenerHeaders()
      }
    );

  }


  guardarMasivo(productos: any[]) {

    return this.http.post<any>(
      this.apiMasiva,
      {
        productos
      },
      {
        headers: this.obtenerHeaders()
      }
    );

  }

}