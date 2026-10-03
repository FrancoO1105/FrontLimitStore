import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  Input,
  OnInit,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Observable,
  finalize,
  map,
  of,
  switchMap,
  tap
} from 'rxjs';

import { AuthService } from '../../services/auth.service';
import {
  CajaService,
  CajaActual,
  ResumenCaja,
  RespuestaCaja,
  ResultadoCierre
} from '../../services/caja.service';

interface EstadoPanel {
  habilitado: boolean;
  caja: CajaActual | null;
  resumen: ResumenCaja | null;
}

type FormularioCaja =
  | 'ninguno'
  | 'apertura'
  | 'movimiento'
  | 'cierre';

@Component({
  selector: 'app-control-caja',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './control-caja.html',
  styleUrl: './control-caja.css'
})
export class ControlCajaComponent implements OnInit {
  @Input() ventaEnCurso = false;

  readonly auth = inject(AuthService);

  private readonly api = inject(CajaService);
  private readonly destroyRef = inject(DestroyRef);

  habilitado = false;
  estadoConocido = false;
  ocupado = false;

  caja: CajaActual | null = null;
  resumen: ResumenCaja | null = null;
  ultimoCierre: ResultadoCierre | null = null;

  error = '';
  mensaje = '';

  formulario: FormularioCaja = 'ninguno';
  monto: number | null = null;
  observacion = '';
  tipoMovimiento: 'INGRESO' | 'RETIRO' = 'INGRESO';
  esperadoCierre: number | null = null;

  private actualizacionPendiente = false;
  private destruido = false;

  private readonly formatoMoneda = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destruido = true;
    });
  }

  ngOnInit(): void {
    this.actualizar();
  }

  get puedeVender(): boolean {
    return this.estadoConocido &&
      !this.ocupado &&
      this.formulario === 'ninguno' &&
      (!this.habilitado || this.caja !== null);
  }

  get diferencia(): number | null {
    if (this.monto === null || this.esperadoCierre === null) {
      return null;
    }

    return Math.round(
      (this.monto - this.esperadoCierre) * 100
    ) / 100;
  }

  moneda(valor: number): string {
    return this.formatoMoneda.format(valor);
  }

  private consultarEstado(): Observable<EstadoPanel> {
    return this.api.obtenerConfiguracion().pipe(
      switchMap(respuesta => {
        const habilitado =
          respuesta.data.control_caja_habilitado;

        if (!habilitado) {
          return of({
            habilitado: false,
            caja: null,
            resumen: null
          });
        }

        return this.api.obtenerActual().pipe(
          switchMap(respuestaCaja => {
            const caja = respuestaCaja.data;

            if (!caja) {
              return of({
                habilitado: true,
                caja: null,
                resumen: null
              });
            }

            return this.api.obtenerResumen(caja.id).pipe(
              map(respuestaResumen => ({
                habilitado: true,
                caja,
                resumen: respuestaResumen.data
              }))
            );
          })
        );
      })
    );
  }

  actualizar(): void {
    if (this.ocupado) {
      this.actualizacionPendiente = true;
      return;
    }

    this.ejecutar(this.consultarEstado());
  }

  private ejecutar(solicitud: Observable<EstadoPanel>): void {
    this.ocupado = true;
    this.estadoConocido = false;
    this.error = '';

    solicitud.pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.ocupado = false;

        if (
          this.actualizacionPendiente &&
          !this.destruido
        ) {
          this.actualizacionPendiente = false;
          this.actualizar();
        }
      })
    ).subscribe({
      next: estado => {
        if (this.caja?.id !== estado.caja?.id) {
          this.formulario = 'ninguno';
        }

        this.habilitado = estado.habilitado;
        this.caja = estado.caja;
        this.resumen = estado.resumen;
        this.estadoConocido = true;
      },

      error: error => {
        this.formulario = 'ninguno';
        this.error = error?.error?.mensaje ||
          'No fue posible consultar el estado. Actualiza antes de repetir una operación.';
      }
    });
  }

  private operar<T>(
    solicitud: Observable<RespuestaCaja<T>>,
    mensaje: string,
    alCompletar?: (datos: T) => void
  ): void {
    if (
      this.ocupado ||
      this.ventaEnCurso ||
      !this.estadoConocido ||
      !this.auth.isAdmin()
    ) return;

    this.mensaje = '';

    this.ejecutar(solicitud.pipe(
      tap(respuesta => {
        alCompletar?.(respuesta.data);
        this.mensaje = mensaje;
        this.formulario = 'ninguno';
      }),
      switchMap(() => this.consultarEstado())
    ));
  }

  cambiarControl(): void {
    this.operar(
      this.api.actualizarConfiguracion(!this.habilitado),
      'Configuración actualizada.'
    );
  }

  mostrarFormulario(tipo: FormularioCaja): void {
    if (
      this.ocupado ||
      this.ventaEnCurso ||
      !this.estadoConocido ||
      !this.auth.isAdmin()
    ) return;

    if (!this.habilitado) return;
    if (tipo === 'apertura' && this.caja) return;

    if (
      (tipo === 'movimiento' || tipo === 'cierre') &&
      (!this.caja || !this.resumen)
    ) return;

    this.error = '';
    this.mensaje = '';
    this.monto = null;
    this.observacion = '';
    this.tipoMovimiento = 'INGRESO';
    this.esperadoCierre =
      this.resumen?.efectivo_esperado ?? null;

    this.formulario = tipo;
  }

  cancelar(): void {
    if (this.ocupado) return;

    this.formulario = 'ninguno';
    this.error = '';
  }

  guardar(): void {
    if (this.ocupado || this.ventaEnCurso) return;

    const monto = this.monto;
    const observacion = this.observacion.trim();

    if (
      monto === null ||
      !Number.isSafeInteger(monto) ||
      monto < 0 ||
      monto > 9999999999
    ) {
      this.error =
        'Indica un monto entero entre 0 y 9.999.999.999 pesos.';
      return;
    }

    if (observacion.length > 500) {
      this.error =
        'La observación no puede superar 500 caracteres.';
      return;
    }

    if (this.formulario === 'apertura') {
      this.operar(
        this.api.abrir({
          monto_inicial: monto,
          observacion
        }),
        'Caja abierta correctamente.',
        () => {
          this.ultimoCierre = null;
        }
      );
      return;
    }

    if (!this.caja) return;

    if (this.formulario === 'movimiento') {
      if (monto === 0 || !observacion) {
        this.error =
          'Indica un monto mayor a cero y un motivo.';
        return;
      }

      this.operar(
        this.api.registrarMovimiento(this.caja.id, {
          tipo: this.tipoMovimiento,
          monto,
          motivo: observacion
        }),
        'Movimiento registrado.'
      );
      return;
    }

    if (
      this.formulario === 'cierre' &&
      this.esperadoCierre !== null
    ) {
      if (this.diferencia !== 0 && !observacion) {
        this.error =
          'Explica la diferencia en la observación.';
        return;
      }

      this.operar(
        this.api.cerrar(this.caja.id, {
          efectivo_contado: monto,
          efectivo_esperado_confirmado: this.esperadoCierre,
          observacion
        }),
        'Caja cerrada correctamente.',
        cierre => {
          this.ultimoCierre = cierre;
        }
      );
    }
  }
}
