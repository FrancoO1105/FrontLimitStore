import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './api.config';

export interface ProductoRanking {
  id: number;
  codigo: string;
  nombre: string;
  unidades_vendidas: number;
}

export interface ProductoStock {
  id: number;
  codigo: string;
  nombre: string;
  stock_actual: number;
  stock_minimo: number;
}

export interface DashboardResumen {
graficos: DashboardGraficos;
  periodo: {
    inicio_mes: string;
    fin_mes: string;
    inicio_anio: string;
    fin_anio: string;
  };

  ventas_mes: number;
  cantidad_ventas_mes: number;

  ventas_anio: number;
  cantidad_ventas_anio: number;

  producto_mas_vendido: ProductoRanking | null;
  productos_menos_vendidos: ProductoRanking[];
  productos_poco_stock: ProductoStock[];
}
export interface DashboardGraficos {
  fecha_corte: string;

  mes: {
    inicio_actual: string;
    inicio_anterior: string;
    hasta_actual: string;
    hasta_anterior: string;
    total_actual: number;
    total_anterior_comparable: number;
    variacion_porcentaje: number | null;

    serie: {
      dia: number;
      actual: number | null;
      anterior: number | null;
    }[];
  };

  anio: {
    actual: number;
    anterior: number;
    hasta_actual: string;
    hasta_anterior: string;
    total_actual: number;
    total_anterior_comparable: number;
    variacion_porcentaje: number | null;

    serie: {
      mes: number;
      total: number | null;
      en_curso: boolean;
    }[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  obtenerResumen() {
    return this.http.get<{
      ok: boolean;
      data: DashboardResumen;
    }>(`${API_URL}/dashboard`);
  }
}