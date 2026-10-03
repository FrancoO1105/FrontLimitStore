import { API_URL } from './api.config';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  Injectable
} from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class ModeloService {

  private readonly api =
    (API_URL + '/modelo');

  private readonly apiMarcas =
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


  listar() {

    return this.http.get<any>(
      this.api,
      {
        headers: this.obtenerHeaders()
      }
    );

  }


  obtenerPorId(
    id: number
  ) {

    return this.http.get<any>(
      `${this.api}/${id}`,
      {
        headers: this.obtenerHeaders()
      }
    );

  }


  listarPorMarca(
    idMarca: number
  ) {

    return this.http.get<any>(
      `${this.api}/marca/${idMarca}`,
      {
        headers: this.obtenerHeaders()
      }
    );

  }


  crear(
    data: any
  ) {

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


  eliminar(
    id: number
  ) {

    return this.http.delete<any>(
      `${this.api}/${id}`,
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
  crearMarca(
  data: any
) {

  return this.http.post<any>(
    this.apiMarcas,
    data,
    {
      headers: this.obtenerHeaders()
    }
  );

}

}