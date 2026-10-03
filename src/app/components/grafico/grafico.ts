import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild
} from '@angular/core';

interface InstanciaGrafico {
  destroy(): void;
}

// Chart.js se carga desde index.html.
declare const Chart: {
  new (
    canvas: HTMLCanvasElement,
    configuracion: object
  ): InstanciaGrafico;
};

@Component({
  selector: 'app-grafico',
  standalone: true,
  template: `
    <div class="chart-container">
      <canvas
        #canvas
        role="img"
        [attr.aria-label]="descripcion"
      >
        {{ descripcion }}
      </canvas>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-width: 0;
    }

    .chart-container {
      position: relative;
      height: 260px;
      width: 100%;
    }
  `]
})
export class GraficoComponent
  implements AfterViewInit, OnChanges, OnDestroy {

  @Input() configuracion: object | null = null;
  @Input() descripcion = 'Gráfico de ventas';

  @ViewChild('canvas')
  canvas?: ElementRef<HTMLCanvasElement>;

  private grafico?: InstanciaGrafico;

  ngAfterViewInit(): void {
    this.dibujar();
  }

  ngOnChanges(): void {
    this.dibujar();
  }

  private dibujar(): void {
    if (!this.canvas) return;

    this.grafico?.destroy();
    this.grafico = undefined;

    if (!this.configuracion) return;

    this.grafico = new Chart(
      this.canvas.nativeElement,
      this.configuracion
    );
  }

  ngOnDestroy(): void {
    this.grafico?.destroy();
  }
}