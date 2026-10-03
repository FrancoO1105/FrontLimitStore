import { API_URL } from './api.config';
import {
  HttpClient,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';

import {
  Injectable
} from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class VentaService {

  private readonly api =
    (API_URL + '/ventas');


  constructor(
    private http: HttpClient
  ) {}


  private obtenerHeaders():
    HttpHeaders {

    const token =
      localStorage.getItem(
        'token'
      );


    return new HttpHeaders({
      Authorization:
        `Bearer ${token}`
    });

  }


  /* =====================================================
     BUSCAR PRODUCTOS
  ===================================================== */

  buscarProductos(
    termino: string = ''
  ) {

    let params =
      new HttpParams();


    if (
      termino.trim()
    ) {

      params =
        params.set(
          'q',
          termino.trim()
        );

    }


    return this.http.get<any>(
      `${this.api}/productos/buscar`,
      {
        headers:
          this.obtenerHeaders(),

        params
      }
    );

  }


  /* =====================================================
     CREAR VENTA
  ===================================================== */

  crear(
    datos: any
  ) {

    return this.http.post<any>(
      this.api,
      datos,
      {
        headers:
          this.obtenerHeaders()
      }
    );

  }


  /* =====================================================
     LISTAR
  ===================================================== */

  listar() {

    return this.http.get<any>(
      this.api,
      {
        headers:
          this.obtenerHeaders()
      }
    );

  }


  /* =====================================================
     OBTENER
  ===================================================== */

  obtenerPorId(
    id: number
  ) {

    return this.http.get<any>(
      `${this.api}/${id}`,
      {
        headers:
          this.obtenerHeaders()
      }
    );

  }

}