import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { GraficoComponent } from '../../components/grafico/grafico';
import { DashboardGraficos } from '../../services/dashboard.service';

import {
  DashboardService,
  DashboardResumen
} from '../../services/dashboard.service';

@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [CommonModule, RouterModule, GraficoComponent],
  templateUrl: './menu-principal.html',
  styleUrls: ['./menu-principal.css']
})
export class MenuPrincipalComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);

  resumen: DashboardResumen | null = null;

  cargando = false;
  mensajeError = '';
  mesActual = '';
  anioActual = '';
  graficoMes: object | null = null;
  graficoAnio: object | null = null;

  private readonly formatoMoneda = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  });

  private readonly formatoNumero = new Intl.NumberFormat('es-CL');

  ngOnInit(): void {
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    if (this.cargando) return;

    this.cargando = true;
    this.mensajeError = '';
    this.resumen = null;

    this.dashboardService.obtenerResumen()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: respuesta => {
          if (!respuesta.ok || !respuesta.data) {
            this.mensajeError = 'El servidor no devolvió el resumen.';
            return;
          }

          this.resumen = respuesta.data;

          this.prepararGraficos(respuesta.data.graficos);

          // Usa el período de MySQL para que el título coincida
          // con las fechas utilizadas en los cálculos.
          const [anio, mes] = respuesta.data.periodo.inicio_mes
            .split('-')
            .map(Number);

          this.mesActual = new Intl.DateTimeFormat('es-CL', {
            month: 'long',
            year: 'numeric'
          }).format(new Date(anio, mes - 1, 1));

          this.anioActual = String(anio);
        },

        error: error => {
          this.mensajeError =
            error?.error?.mensaje ||
            'No fue posible cargar el dashboard. Intenta nuevamente.';
        }
      });
  }

  moneda(valor: number): string {
    return this.formatoMoneda.format(valor);
  }

  numero(valor: number): string {
    return this.formatoNumero.format(valor);
  }
  private prepararGraficos(datos: DashboardGraficos): void {
  const meses = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  this.graficoMes = {
    type: 'line',

    data: {
      labels: datos.mes.serie.map(item => item.dia),

      datasets: [
        {
          label: 'Mes actual',
          data: datos.mes.serie.map(item => item.actual),
          borderColor: '#4659cf',
          backgroundColor: 'rgba(70, 89, 207, 0.08)',
          borderWidth: 3,
          pointRadius: 2,
          pointHoverRadius: 5,
          tension: 0,
          fill: true,
          spanGaps: false
        },
        {
          label: 'Mes anterior',
          data: datos.mes.serie.map(item => item.anterior),
          borderColor: '#8794ab',
          borderWidth: 2,
          borderDash: [6, 5],
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0,
          fill: false,
          spanGaps: false
        }
      ]
    },

    options: this.opcionesGrafico(true)
  };

  this.graficoAnio = {
    type: 'bar',

    data: {
      labels: datos.anio.serie.map(item =>
        meses[item.mes - 1] + (item.en_curso ? ' *' : '')
      ),

      datasets: [
        {
          label: 'Ventas del mes',
          data: datos.anio.serie.map(item => item.total),

          backgroundColor: datos.anio.serie.map(item =>
            item.en_curso ? '#168362' : '#b8dfce'
          ),

          borderRadius: 5,
          maxBarThickness: 32
        }
      ]
    },

    options: this.opcionesGrafico(false)
  };
}

private opcionesGrafico(mostrarLeyenda: boolean): object {
  return {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: 'index',
      intersect: false
    },

    plugins: {
      legend: {
        display: mostrarLeyenda,
        position: 'bottom'
      },

      tooltip: {
        callbacks: {
          label: (contexto: {
            dataset: { label?: string };
            parsed: { y: number | null };
          }) => {
            const valor = contexto.parsed.y;

            return valor === null
              ? ''
              : `${contexto.dataset.label}: ${this.moneda(valor)}`;
          }
        }
      }
    },

    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true
        }
      },

      y: {
        beginAtZero: true,
        grid: {
          color: '#eef1f6'
        },
        ticks: {
          maxTicksLimit: 5,
          callback: (valor: number | string) =>
            this.moneda(Number(valor))
        }
      }
    }
  };
}

textoVariacion(valor: number | null): string {
  if (valor === null) return 'Sin base de comparación';
  if (valor === 0) return 'Sin variación';

  const porcentaje = new Intl.NumberFormat('es-CL', {
    maximumFractionDigits: 1
  }).format(Math.abs(valor));

  return `${valor > 0 ? '↑' : '↓'} ${porcentaje} %`;
}

fechaCorta(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}
}