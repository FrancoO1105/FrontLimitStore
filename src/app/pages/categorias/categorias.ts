import {
  CommonModule
} from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Categoria,
  CategoriaRequest,
  CategoriaService
} from '../../services/categoria';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css'
})
export class Categorias implements OnInit {

  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  categoriasPagina: Categoria[] = [];

  cargando = false;
  guardando = false;

  cambiandoEstadoId: number | null = null;

  mensajeError = '';
  mensajeExito = '';

  busqueda = '';

  paginaActual = 1;
  registrosPorPagina = 10;
  totalPaginas = 1;

  modalFormularioVisible = false;
  modoEdicion = false;

  categoriaSeleccionada: Categoria | null = null;

  formulario: CategoriaRequest = {
    nombre: '',
    estado: 1
  };

  constructor(
    private categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.categoriaService
      .listar()
      .subscribe({
        next: (respuesta) => {
          this.categorias =
            respuesta.data ?? [];

          this.aplicarFiltros();
          this.cargando = false;
        },
        error: (error) => {
          console.error(
            'Error al cargar categorías:',
            error
          );

          this.mensajeError =
            error?.error?.mensaje ??
            'No fue posible cargar las categorías';

          this.cargando = false;
        }
      });
  }

  aplicarFiltros(): void {
    const texto =
      this.busqueda
        .trim()
        .toLowerCase();

    this.categoriasFiltradas =
      this.categorias.filter(
        categoria => {
          const nombre =
            categoria.nombre
              ?.toLowerCase() ?? '';

          const id =
            String(categoria.id);

          return (
            nombre.includes(texto) ||
            id.includes(texto)
          );
        }
      );

    this.totalPaginas = Math.max(
      1,
      Math.ceil(
        this.categoriasFiltradas.length /
        this.registrosPorPagina
      )
    );

    if (
      this.paginaActual >
      this.totalPaginas
    ) {
      this.paginaActual =
        this.totalPaginas;
    }

    this.actualizarPagina();
  }

  actualizarPagina(): void {
    const inicio =
      (this.paginaActual - 1) *
      this.registrosPorPagina;

    const fin =
      inicio +
      this.registrosPorPagina;

    this.categoriasPagina =
      this.categoriasFiltradas.slice(
        inicio,
        fin
      );
  }

  buscar(): void {
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  limpiarBusqueda(): void {
    this.busqueda = '';
    this.buscar();
  }

  cambiarRegistrosPorPagina(): void {
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  irPagina(pagina: number): void {
    if (
      pagina < 1 ||
      pagina > this.totalPaginas
    ) {
      return;
    }

    this.paginaActual = pagina;
    this.actualizarPagina();
  }

  paginaAnterior(): void {
    this.irPagina(
      this.paginaActual - 1
    );
  }

  paginaSiguiente(): void {
    this.irPagina(
      this.paginaActual + 1
    );
  }

  obtenerPaginas(): number[] {
    const paginas: number[] = [];

    let inicio = Math.max(
      1,
      this.paginaActual - 2
    );

    let fin = Math.min(
      this.totalPaginas,
      inicio + 4
    );

    if (fin - inicio < 4) {
      inicio = Math.max(
        1,
        fin - 4
      );
    }

    for (
      let pagina = inicio;
      pagina <= fin;
      pagina++
    ) {
      paginas.push(pagina);
    }

    return paginas;
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.categoriaSeleccionada = null;

    this.formulario = {
      nombre: '',
      estado: 1
    };

    this.mensajeError = '';
    this.modalFormularioVisible = true;
  }

  abrirModalEditar(
    categoria: Categoria
  ): void {
    this.modoEdicion = true;
    this.categoriaSeleccionada = categoria;

    this.formulario = {
      nombre: categoria.nombre,
      estado: Number(
        categoria.estado
      )
    };

    this.mensajeError = '';
    this.modalFormularioVisible = true;
  }

  cerrarModalFormulario(): void {
    if (this.guardando) {
      return;
    }

    this.modalFormularioVisible = false;
    this.categoriaSeleccionada = null;
    this.mensajeError = '';
  }

  guardarCategoria(): void {
    const nombre =
      this.formulario.nombre.trim();

    if (!nombre) {
      this.mensajeError =
        'Debes ingresar el nombre de la categoría';

      return;
    }

    if (nombre.length > 100) {
      this.mensajeError =
        'El nombre no puede superar los 100 caracteres';

      return;
    }

    const datos: CategoriaRequest = {
      nombre,
      estado: Number(
        this.formulario.estado
      )
    };

    this.guardando = true;
    this.mensajeError = '';

    if (
      this.modoEdicion &&
      this.categoriaSeleccionada
    ) {
      this.actualizarCategoria(
        this.categoriaSeleccionada.id,
        datos
      );

      return;
    }

    this.crearCategoria(datos);
  }

  private crearCategoria(
    datos: CategoriaRequest
  ): void {
    this.categoriaService
      .crear(datos)
      .subscribe({
        next: (respuesta) => {
          this.guardando = false;
          this.modalFormularioVisible = false;

          this.mostrarExito(
            respuesta.mensaje ??
            'Categoría creada correctamente'
          );

          this.cargarCategorias();
        },
        error: (error) => {
          console.error(
            'Error al crear categoría:',
            error
          );

          this.mensajeError =
            error?.error?.mensaje ??
            'No fue posible crear la categoría';

          this.guardando = false;
        }
      });
  }

  private actualizarCategoria(
    id: number,
    datos: CategoriaRequest
  ): void {
    this.categoriaService
      .actualizar(id, datos)
      .subscribe({
        next: (respuesta) => {
          this.guardando = false;
          this.modalFormularioVisible = false;
          this.categoriaSeleccionada = null;

          this.mostrarExito(
            respuesta.mensaje ??
            'Categoría actualizada correctamente'
          );

          this.cargarCategorias();
        },
        error: (error) => {
          console.error(
            'Error al actualizar categoría:',
            error
          );

          this.mensajeError =
            error?.error?.mensaje ??
            'No fue posible actualizar la categoría';

          this.guardando = false;
        }
      });
  }

  cambiarEstado(
    categoria: Categoria
  ): void {
    if (
      this.cambiandoEstadoId !== null
    ) {
      return;
    }

    const nuevoEstado =
      Number(categoria.estado) === 1
        ? 0
        : 1;

    this.cambiandoEstadoId =
      categoria.id;

    this.mensajeError = '';

    this.categoriaService
      .cambiarEstado(
        categoria.id,
        nuevoEstado
      )
      .subscribe({
        next: (respuesta) => {
          categoria.estado =
            nuevoEstado;

          this.cambiandoEstadoId =
            null;

          this.aplicarFiltros();

          this.mostrarExito(
            respuesta.mensaje ??
            (
              nuevoEstado === 1
                ? 'Categoría activada correctamente'
                : 'Categoría desactivada correctamente'
            )
          );
        },
        error: (error) => {
          console.error(
            'Error al cambiar estado:',
            error
          );

          this.mensajeError =
            error?.error?.mensaje ??
            'No fue posible cambiar el estado de la categoría';

          this.cambiandoEstadoId =
            null;
        }
      });
  }

  get totalCategorias(): number {
    return this.categorias.length;
  }

  get totalActivas(): number {
    return this.categorias.filter(
      categoria =>
        Number(categoria.estado) === 1
    ).length;
  }

  get totalInactivas(): number {
    return this.categorias.filter(
      categoria =>
        Number(categoria.estado) === 0
    ).length;
  }

  get registroInicial(): number {
    if (
      this.categoriasFiltradas.length === 0
    ) {
      return 0;
    }

    return (
      (this.paginaActual - 1) *
      this.registrosPorPagina
    ) + 1;
  }

  get registroFinal(): number {
    return Math.min(
      this.paginaActual *
      this.registrosPorPagina,
      this.categoriasFiltradas.length
    );
  }

  formatearFecha(
    fecha?: string
  ): string {
    if (!fecha) {
      return 'Sin fecha';
    }

    const fechaObjeto =
      new Date(fecha);

    if (
      Number.isNaN(
        fechaObjeto.getTime()
      )
    ) {
      return fecha;
    }

    return fechaObjeto
      .toLocaleDateString(
        'es-CL',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }
      );
  }

  trackByCategoria(
    index: number,
    categoria: Categoria
  ): number {
    return categoria.id;
  }

  private mostrarExito(
    mensaje: string
  ): void {
    this.mensajeExito = mensaje;

    window.setTimeout(() => {
      this.mensajeExito = '';
    }, 3500);
  }
}