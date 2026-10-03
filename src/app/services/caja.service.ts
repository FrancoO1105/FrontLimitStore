import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './api.config';

export interface RespuestaCaja<T> {
  ok: boolean;
  mensaje?: string;
  data: T;
}

export interface ConfiguracionCaja {
  control_caja_habilitado: boolean;
}

export interface CajaActual {
  id: number;
  estado: 'ABIERTA';
  fecha_apertura: string;

  id_usuario_apertura: number;
  monto_inicial: number;
  observacion_apertura: string | null;

  responsable_nombres: string;
  responsable_apellido: string;
}

export interface ResumenCaja {
  id_caja: number;
  monto_inicial: number;

  ventas_efectivo: number;
  ventas_debito: number;
  ventas_credito: number;
  ventas_transferencia: number;

  total_ventas: number;
  cantidad_ventas: number;

  ingresos: number;
  retiros: number;
  efectivo_esperado: number;
}

export interface DatosApertura {
  monto_inicial: number;
  observacion: string;
}

export interface DatosMovimiento {
  tipo: 'INGRESO' | 'RETIRO';
  monto: number;
  motivo: string;
}

export interface ResultadoMovimiento {
  id_movimiento: number;
  resumen: ResumenCaja;
}

export interface DatosCierre {
  efectivo_contado: number;
  efectivo_esperado_confirmado: number;
  observacion: string;
}

export interface CajaCerrada {
  id: number;
  estado: 'CERRADA';

  fecha_apertura: string;
  fecha_cierre: string;

  id_usuario_apertura: number;
  id_usuario_cierre: number;

  monto_inicial: number;
  efectivo_esperado: number;
  efectivo_contado: number;
  diferencia: number;

  observacion_apertura: string | null;
  observacion_cierre: string | null;
}

export interface ResultadoCierre {
  caja: CajaCerrada;
  resumen: ResumenCaja;
  resultado: 'CUADRADA' | 'FALTANTE' | 'SOBRANTE';
}

@Injectable({
  providedIn: 'root'
})
export class CajaService {
  private readonly api = `${API_URL}/cajas`;
  private readonly apiConfiguracion = `${API_URL}/configuracion`;

  constructor(private http: HttpClient) {}

  obtenerConfiguracion() {
    return this.http.get<RespuestaCaja<ConfiguracionCaja>>(
      this.apiConfiguracion
    );
  }

  actualizarConfiguracion(habilitado: boolean) {
    return this.http.patch<RespuestaCaja<ConfiguracionCaja>>(
      this.apiConfiguracion,
      {
        control_caja_habilitado: habilitado
      }
    );
  }

  obtenerActual() {
    return this.http.get<RespuestaCaja<CajaActual | null>>(
      `${this.api}/actual`
    );
  }

  abrir(datos: DatosApertura) {
    return this.http.post<RespuestaCaja<CajaActual>>(
      `${this.api}/abrir`,
      datos
    );
  }

  obtenerResumen(idCaja: number) {
    return this.http.get<RespuestaCaja<ResumenCaja>>(
      `${this.api}/${idCaja}/resumen`
    );
  }

  registrarMovimiento(
    idCaja: number,
    datos: DatosMovimiento
  ) {
    return this.http.post<RespuestaCaja<ResultadoMovimiento>>(
      `${this.api}/${idCaja}/movimientos`,
      datos
    );
  }

  cerrar(idCaja: number, datos: DatosCierre) {
    return this.http.post<RespuestaCaja<ResultadoCierre>>(
      `${this.api}/${idCaja}/cerrar`,
      datos
    );
  }
}