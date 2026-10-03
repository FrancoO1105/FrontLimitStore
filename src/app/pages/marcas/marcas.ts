import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  Marca,
  MarcaRequest,
  MarcaService
} from '../../services/marca';

@Component({
  selector: 'app-marcas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './marcas.html',
  styleUrl: './marcas.css'
})
export class Marcas implements OnInit {

  marcas: Marca[] = [];
  marcasFiltradas: Marca[] = [];
  marcasPaginadas: Marca[] = [];

  totalActivas = 0;
  totalInactivas = 0;

  cargando = false;
  guardando = false;

  mostrarModal = false;
  editando = false;

  mensajeExito = '';
  mensajeError = '';

  terminoBusqueda = '';

  paginaActual = 1;
  registrosPorPagina = 10;
  totalPaginas = 1;

  marcaEditandoId = 0;

  marca: MarcaRequest = {
    nombre: '',
    estado: 1
  };

  constructor(
    private marcaService: MarcaService
  ) {}

  ngOnInit(): void {
    this.cargarMarcas();
  }

  cargarMarcas(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.marcaService.listar().subscribe({
      next: (respuesta) => {
        this.marcas = respuesta.data ?? [];

        this.calcularTotales();
        this.filtrar();

        this.cargando = false;
      },
      error: (error) => {
        console.error(
          'Error al cargar marcas:',
          error
        );

        this.mensajeError =
          error?.error?.mensaje ??
          'No fue posible cargar las marcas.';

        this.cargando = false;
      }
    });
  }

  calcularTotales(): void {
    this.totalActivas =
      this.marcas.filter(
        item => Number(item.estado) === 1
      ).length;

    this.totalInactivas =
      this.marcas.filter(
        item => Number(item.estado) === 0
      ).length;
  }

  filtrar(): void {
    const texto =
      this.terminoBusqueda
        .trim()
        .toLowerCase();

    if (!texto) {
      this.marcasFiltradas = [
        ...this.marcas
      ];
    } else {
      this.marcasFiltradas =
        this.marcas.filter(item =>
          item.nombre
            .toLowerCase()
            .includes(texto)
        );
    }

    this.paginaActual = 1;
    this.calcularPaginacion();
  }

  calcularPaginacion(): void {
    this.totalPaginas = Math.max(
      1,
      Math.ceil(
        this.marcasFiltradas.length /
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

    this.marcasPaginadas =
      this.marcasFiltradas.slice(
        inicio,
        fin
      );
  }

  cambiarPagina(
    pagina: number
  ): void {
    if (
      pagina < 1 ||
      pagina > this.totalPaginas
    ) {
      return;
    }

    this.paginaActual = pagina;
    this.actualizarPagina();
  }

  cambiarCantidad(): void {
    this.paginaActual = 1;
    this.calcularPaginacion();
  }

  abrirNueva(): void {
    this.limpiarMensajes();

    this.editando = false;
    this.marcaEditandoId = 0;

    this.marca = {
      nombre: '',
      estado: 1
    };

    this.mostrarModal = true;
  }

  editar(
    item: Marca
  ): void {
    this.limpiarMensajes();

    this.editando = true;
    this.marcaEditandoId = item.id;

    this.marca = {
      nombre: item.nombre,
      estado: Number(item.estado)
    };

    this.mostrarModal = true;
  }

  cerrarModal(): void {
    if (this.guardando) {
      return;
    }

    this.mostrarModal = false;
  }

  guardar(): void {
    this.limpiarMensajes();

    const nombre =
      this.marca.nombre.trim();

    if (!nombre) {
      this.mensajeError =
        'Debe ingresar el nombre de la marca.';
      return;
    }

    if (nombre.length > 100) {
      this.mensajeError =
        'El nombre no puede superar los 100 caracteres.';
      return;
    }

    this.guardando = true;

    const datos: MarcaRequest = {
      nombre,
      estado: Number(
        this.marca.estado
      )
    };

    if (this.editando) {
      this.actualizarMarca(datos);
    } else {
      this.crearMarca(datos);
    }
  }

  crearMarca(
    datos: MarcaRequest
  ): void {
    this.marcaService
      .crear(datos)
      .subscribe({
        next: (respuesta) => {
          this.mensajeExito =
            respuesta.mensaje ??
            'Marca creada correctamente.';

          this.guardando = false;
          this.mostrarModal = false;

          this.cargarMarcas();
        },
        error: (error) => {
          console.error(
            'Error al crear marca:',
            error
          );

          this.mensajeError =
            error?.error?.mensaje ??
            'No fue posible crear la marca.';

          this.guardando = false;
        }
      });
  }

  actualizarMarca(
    datos: MarcaRequest
  ): void {
    this.marcaService
      .actualizar(
        this.marcaEditandoId,
        datos
      )
      .subscribe({
        next: (respuesta) => {
          this.mensajeExito =
            respuesta.mensaje ??
            'Marca actualizada correctamente.';

          this.guardando = false;
          this.mostrarModal = false;

          this.cargarMarcas();
        },
        error: (error) => {
          console.error(
            'Error al actualizar marca:',
            error
          );

          this.mensajeError =
            error?.error?.mensaje ??
            'No fue posible actualizar la marca.';

          this.guardando = false;
        }
      });
  }

  cambiarEstado(
    item: Marca
  ): void {
    this.limpiarMensajes();

    const nuevoEstado =
      Number(item.estado) === 1
        ? 0
        : 1;

    this.marcaService
      .cambiarEstado(
        item.id,
        nuevoEstado
      )
      .subscribe({
        next: (respuesta) => {
          this.mensajeExito =
            respuesta.mensaje ??
            'Estado actualizado correctamente.';

          this.cargarMarcas();
        },
        error: (error) => {
          console.error(
            'Error al cambiar estado:',
            error
          );

          this.mensajeError =
            error?.error?.mensaje ??
            'No fue posible cambiar el estado.';
        }
      });
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.filtrar();
  }

  limpiarMensajes(): void {
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  trackById(
    index: number,
    item: Marca
  ): number {
    return item.id;
  }
}