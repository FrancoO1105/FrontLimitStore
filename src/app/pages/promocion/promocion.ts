import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  PromocionService
} from '../../services/promocion';


interface Promocion {

  id: number;

  nombre: string;

  descripcion:
    string | null;

  tipo_promocion: string;

  valor_descuento:
    number | string;

  fecha_inicio: any;

  fecha_fin: any;

  estado: number;

  fecha_registro?: any;

  fecha_actualizacion?: any;

  total_productos?: number;

}


interface Producto {

  id: number;

  codigo?: string;

  codigo_barra?: string;

  nombre: string;

  precio_venta?: number | string;

  stock_actual?: number;

  estado?: number | boolean;

}


interface ProductoPromocion {

  id_producto: number;

  cantidad: number;

  codigo: string;

  nombre: string;

  precio_venta:
    number | string;

}


@Component({
  selector: 'app-promociones',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './promocion.html',

  styleUrl: './promocion.css'
})
export class Promociones
  implements OnInit {


  /* =====================================================
     LISTADO
  ===================================================== */

  promociones:
    Promocion[] = [];

  promocionesFiltradas:
    Promocion[] = [];


  cargando = false;

  mensajeError = '';

  mensajeExito = '';


  /* =====================================================
     BUSQUEDA
  ===================================================== */

  busqueda = '';


  /* =====================================================
     PAGINACION
  ===================================================== */

  paginaActual = 1;

  registrosPorPagina = 10;


  /* =====================================================
     MODAL
  ===================================================== */

  mostrarModal = false;

  esEdicion = false;

  cargandoPromocion = false;

  guardando = false;

  mensajeErrorModal = '';

  idPromocionEditando:
    number | null = null;


  /* =====================================================
     FORMULARIO
  ===================================================== */

  formulario = {

    nombre: '',

    descripcion: '',

    tipo_promocion:
      'PACK',

    valor_descuento:
      null as number | null,

    fecha_inicio: '',

    fecha_fin: '',

    estado: 1

  };


  /* =====================================================
     PRODUCTOS
  ===================================================== */

  productos:
    Producto[] = [];

  productosPromocion:
    ProductoPromocion[] = [];


  cargandoProductos = false;

  busquedaProducto = '';

  productoSeleccionadoId:
    number | null = null;

  cantidadProducto = 1;


  constructor(
    private promocionService:
      PromocionService
  ) {}


  ngOnInit(): void {

    this.listarPromociones();

    this.listarProductos();

  }


  /* =====================================================
     LISTAR PROMOCIONES
  ===================================================== */

  listarPromociones(): void {

    this.cargando = true;

    this.mensajeError = '';


    this.promocionService
      .listar()
      .subscribe({

        next: (respuesta: any) => {

          this.promociones =
            this.extraerLista(
              respuesta
            );

          this.promocionesFiltradas =
            [...this.promociones];

          this.paginaActual = 1;

          this.cargando = false;

        },


        error: (error: any) => {

          console.error(
            'Error al listar promociones:',
            error
          );

          this.cargando = false;

          this.mensajeError =
            error?.error?.mensaje ||
            'No fue posible obtener las promociones.';

        }

      });

  }


  /* =====================================================
     LISTAR PRODUCTOS
  ===================================================== */

  listarProductos(): void {

    this.cargandoProductos = true;


    this.promocionService
      .listarProductos()
      .subscribe({

        next: (respuesta: any) => {

          this.productos =
            this.extraerLista(
              respuesta
            );

          this.cargandoProductos =
            false;

        },


        error: (error: any) => {

          console.error(
            'Error al listar productos:',
            error
          );

          this.cargandoProductos =
            false;

        }

      });

  }


  /* =====================================================
     EXTRAER LISTA
  ===================================================== */

  private extraerLista(
    respuesta: any
  ): any[] {

    if (
      Array.isArray(
        respuesta
      )
    ) {

      return respuesta;

    }


    if (
      Array.isArray(
        respuesta?.data
      )
    ) {

      return respuesta.data;

    }


    return [];

  }


  /* =====================================================
     BUSCAR
  ===================================================== */

  buscar(): void {

    const texto =
      this.normalizarTexto(
        this.busqueda
      );


    if (!texto) {

      this.promocionesFiltradas =
        [...this.promociones];

      this.paginaActual = 1;

      return;

    }


    this.promocionesFiltradas =
      this.promociones.filter(
        promocion => {

          const contenido =
            this.normalizarTexto(
              [
                promocion.id,
                promocion.nombre,
                promocion.descripcion,
                promocion.tipo_promocion
              ].join(' ')
            );


          return contenido.includes(
            texto
          );

        }
      );


    this.paginaActual = 1;

  }


  limpiarBusqueda(): void {

    this.busqueda = '';

    this.buscar();

  }


  private normalizarTexto(
    valor: any
  ): string {

    return String(
      valor ?? ''
    )
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .toLowerCase()
      .trim();

  }


  /* =====================================================
     PAGINACION
  ===================================================== */

  get totalPaginas(): number {

    return Math.max(
      1,
      Math.ceil(
        this.promocionesFiltradas.length /
        this.registrosPorPagina
      )
    );

  }


  get promocionesPagina():
    Promocion[] {

    const inicio =
      (
        this.paginaActual - 1
      ) *
      this.registrosPorPagina;


    return this.promocionesFiltradas
      .slice(
        inicio,
        inicio +
        this.registrosPorPagina
      );

  }


  get registroInicial(): number {

    if (
      this.promocionesFiltradas.length === 0
    ) {

      return 0;

    }


    return (
      this.paginaActual - 1
    ) *
    this.registrosPorPagina + 1;

  }


  get registroFinal(): number {

    return Math.min(

      this.paginaActual *
      this.registrosPorPagina,

      this.promocionesFiltradas.length

    );

  }


  cambiarCantidadRegistros(): void {

    this.paginaActual = 1;

  }


  paginaAnterior(): void {

    if (
      this.paginaActual > 1
    ) {

      this.paginaActual--;

    }

  }


  paginaSiguiente(): void {

    if (
      this.paginaActual <
      this.totalPaginas
    ) {

      this.paginaActual++;

    }

  }


  irPagina(
    pagina: number
  ): void {

    if (
      pagina >= 1 &&
      pagina <= this.totalPaginas
    ) {

      this.paginaActual =
        pagina;

    }

  }


  obtenerPaginas(): number[] {

    const total =
      this.totalPaginas;

    const actual =
      this.paginaActual;

    const maximo = 5;


    let inicio =
      Math.max(
        1,
        actual - 2
      );


    let fin =
      Math.min(
        total,
        inicio + maximo - 1
      );


    inicio =
      Math.max(
        1,
        fin - maximo + 1
      );


    const paginas:
      number[] = [];


    for (
      let i = inicio;
      i <= fin;
      i++
    ) {

      paginas.push(i);

    }


    return paginas;

  }


  /* =====================================================
     NUEVA PROMOCION
  ===================================================== */

  nuevaPromocion(): void {

    this.esEdicion = false;

    this.idPromocionEditando =
      null;

    this.mensajeErrorModal = '';

    this.guardando = false;

    this.cargandoPromocion =
      false;


    this.formulario = {

      nombre: '',

      descripcion: '',

      tipo_promocion:
        'PACK',

      valor_descuento:
        null,

      fecha_inicio: '',

      fecha_fin: '',

      estado: 1

    };


    this.productosPromocion = [];

    this.productoSeleccionadoId =
      null;

    this.cantidadProducto = 1;

    this.busquedaProducto = '';

    this.mostrarModal = true;

  }


  /* =====================================================
     EDITAR
  ===================================================== */

  editarPromocion(
    promocion: Promocion
  ): void {

    this.esEdicion = true;

    this.idPromocionEditando =
      Number(
        promocion.id
      );

    this.mensajeErrorModal = '';

    this.productosPromocion = [];

    this.productoSeleccionadoId =
      null;

    this.cantidadProducto = 1;

    this.busquedaProducto = '';

    this.cargandoPromocion = true;

    this.mostrarModal = true;


    this.promocionService
      .obtenerPorId(
        promocion.id
      )
      .subscribe({

        next: (respuesta: any) => {

          const data =
            respuesta?.data ??
            respuesta;


          this.formulario = {

            nombre:
              String(
                data.nombre ??
                ''
              ),

            descripcion:
              String(
                data.descripcion ??
                ''
              ),

            tipo_promocion:
              String(
                data.tipo_promocion ??
                'PACK'
              ),

            valor_descuento:
              Number(
                data.valor_descuento ??
                0
              ),

            fecha_inicio:
              this.fechaParaInput(
                data.fecha_inicio
              ),

            fecha_fin:
              this.fechaParaInput(
                data.fecha_fin
              ),

            estado:
              Number(
                data.estado
              ) === 1
                ? 1
                : 0

          };


          this.productosPromocion =
            Array.isArray(
              data.productos
            )
              ? data.productos.map(
                  (producto: any) => ({

                    id_producto:
                      Number(
                        producto.id_producto
                      ),

                    cantidad:
                      Number(
                        producto.cantidad
                      ),

                    codigo:
                      String(
                        producto.codigo ??
                        ''
                      ),

                    nombre:
                      String(
                        producto.nombre ??
                        'Sin nombre'
                      ),

                    precio_venta:
                      producto.precio_venta ??
                      0

                  })
                )
              : [];


          this.cargandoPromocion =
            false;

        },


        error: (error: any) => {

          console.error(
            'Error al obtener promoción:',
            error
          );

          this.cargandoPromocion =
            false;

          this.mensajeErrorModal =
            error?.error?.mensaje ||
            'No fue posible cargar la promoción.';

        }

      });

  }


  /* =====================================================
     CERRAR MODAL
  ===================================================== */

  cerrarModal(): void {

    if (
      this.guardando
    ) {

      return;

    }


    this.mostrarModal = false;

    this.mensajeErrorModal = '';

  }


  /* =====================================================
     PRODUCTOS DISPONIBLES
  ===================================================== */

  get productosDisponibles():
    Producto[] {

    const texto =
      this.normalizarTexto(
        this.busquedaProducto
      );


    return this.productos
      .filter(
        producto => {

          const yaAgregado =
            this.productosPromocion
              .some(
                item =>
                  item.id_producto ===
                  Number(
                    producto.id
                  )
              );


          if (yaAgregado) {

            return false;

          }


          if (!texto) {

            return true;

          }


          const contenido =
            this.normalizarTexto(
              [
                producto.id,
                producto.codigo,
                producto.codigo_barra,
                producto.nombre
              ].join(' ')
            );


          return contenido.includes(
            texto
          );

        }
      );

  }


  /* =====================================================
     AGREGAR PRODUCTO
  ===================================================== */

  agregarProducto(): void {

    this.mensajeErrorModal = '';


    const idProducto =
      Number(
        this.productoSeleccionadoId
      );


    const cantidad =
      Number(
        this.cantidadProducto
      );


    if (
      !Number.isInteger(
        idProducto
      ) ||
      idProducto <= 0
    ) {

      this.mensajeErrorModal =
        'Debe seleccionar un producto.';

      return;

    }


    if (
      !Number.isInteger(
        cantidad
      ) ||
      cantidad <= 0
    ) {

      this.mensajeErrorModal =
        'La cantidad debe ser mayor a 0.';

      return;

    }


    const repetido =
      this.productosPromocion
        .some(
          item =>
            item.id_producto ===
            idProducto
        );


    if (repetido) {

      this.mensajeErrorModal =
        'El producto ya fue agregado a la promoción.';

      return;

    }


    const producto =
      this.productos.find(
        item =>
          Number(
            item.id
          ) ===
          idProducto
      );


    if (!producto) {

      this.mensajeErrorModal =
        'No fue posible encontrar el producto seleccionado.';

      return;

    }


    this.productosPromocion.push({

      id_producto:
        idProducto,

      cantidad,

      codigo:
        String(
          producto.codigo ??
          ''
        ),

      nombre:
        String(
          producto.nombre ??
          'Sin nombre'
        ),

      precio_venta:
        producto.precio_venta ??
        0

    });


    this.productoSeleccionadoId =
      null;

    this.cantidadProducto = 1;

    this.busquedaProducto = '';

  }


  /* =====================================================
     ELIMINAR PRODUCTO
  ===================================================== */

  quitarProducto(
    idProducto: number
  ): void {

    this.productosPromocion =
      this.productosPromocion
        .filter(
          item =>
            item.id_producto !==
            idProducto
        );

  }


  /* =====================================================
     GUARDAR
  ===================================================== */

  guardarPromocion(): void {

    this.mensajeErrorModal = '';


    const nombre =
      String(
        this.formulario.nombre ??
        ''
      ).trim();


    if (!nombre) {

      this.mensajeErrorModal =
        'Debe ingresar el nombre de la promoción.';

      return;

    }


    const valor =
      Number(
        this.formulario.valor_descuento
      );


    if (
      !Number.isFinite(valor) ||
      valor <= 0
    ) {

      this.mensajeErrorModal =
        'Debe ingresar un valor válido para la promoción.';

      return;

    }


    if (
      this.formulario.tipo_promocion ===
        'PORCENTAJE' &&
      valor > 100
    ) {

      this.mensajeErrorModal =
        'El porcentaje no puede superar el 100%.';

      return;

    }


    if (
      !this.formulario.fecha_inicio ||
      !this.formulario.fecha_fin
    ) {

      this.mensajeErrorModal =
        'Debe ingresar las fechas de inicio y término.';

      return;

    }


    if (
      new Date(
        this.formulario.fecha_fin
      ).getTime() <
      new Date(
        this.formulario.fecha_inicio
      ).getTime()
    ) {

      this.mensajeErrorModal =
        'La fecha de término no puede ser anterior a la fecha de inicio.';

      return;

    }


    if (
      this.productosPromocion.length === 0
    ) {

      this.mensajeErrorModal =
        'Debe agregar al menos un producto a la promoción.';

      return;

    }


    for (
      const producto of
      this.productosPromocion
    ) {

      const cantidad =
        Number(
          producto.cantidad
        );


      if (
        !Number.isInteger(
          cantidad
        ) ||
        cantidad <= 0
      ) {

        this.mensajeErrorModal =
          `La cantidad de ${producto.nombre} debe ser mayor a 0.`;

        return;

      }

    }


    const data = {

      nombre,

      descripcion:
        String(
          this.formulario.descripcion ??
          ''
        ).trim() || null,

      tipo_promocion:
        this.formulario.tipo_promocion,

      valor_descuento:
        valor,

      fecha_inicio:
        this.fechaInicioParaApi(
          this.formulario.fecha_inicio
        ),

      fecha_fin:
        this.fechaFinParaApi(
          this.formulario.fecha_fin
        ),

      estado:
        Number(
          this.formulario.estado
        ),

      productos:
        this.productosPromocion.map(
          producto => ({

            id_producto:
              producto.id_producto,

            cantidad:
              Number(
                producto.cantidad
              )

          })
        )

    };


    this.guardando = true;


    if (
      this.esEdicion &&
      this.idPromocionEditando
    ) {

      this.promocionService
        .actualizar(
          this.idPromocionEditando,
          data
        )
        .subscribe({

          next: () => {

            this.guardando = false;

            this.mostrarModal = false;

            this.mensajeExito =
              'Promoción actualizada correctamente.';

            this.listarPromociones();

          },


          error: (error: any) => {

            console.error(
              'Error al actualizar promoción:',
              error
            );

            this.guardando = false;

            this.mensajeErrorModal =
              error?.error?.mensaje ||
              'No fue posible actualizar la promoción.';

          }

        });


      return;

    }


    this.promocionService
      .crear(data)
      .subscribe({

        next: () => {

          this.guardando = false;

          this.mostrarModal = false;

          this.mensajeExito =
            'Promoción creada correctamente.';

          this.listarPromociones();

        },


        error: (error: any) => {

          console.error(
            'Error al crear promoción:',
            error
          );

          this.guardando = false;

          this.mensajeErrorModal =
            error?.error?.mensaje ||
            'No fue posible crear la promoción.';

        }

      });

  }


  /* =====================================================
     CAMBIAR ESTADO
  ===================================================== */

  cambiandoEstadoId:
    number | null = null;


  cambiarEstado(
    promocion: Promocion
  ): void {

    if (
      this.cambiandoEstadoId !== null
    ) {

      return;

    }


    const nuevoEstado =
      this.estaActiva(
        promocion
      )
        ? 0
        : 1;


    this.cambiandoEstadoId =
      promocion.id;


    this.promocionService
      .cambiarEstado(
        promocion.id,
        nuevoEstado
      )
      .subscribe({

        next: () => {

          promocion.estado =
            nuevoEstado;

          this.cambiandoEstadoId =
            null;

          this.mensajeExito =
            nuevoEstado === 1
              ? 'Promoción activada correctamente.'
              : 'Promoción desactivada correctamente.';

        },


        error: (error: any) => {

          console.error(
            'Error al cambiar estado:',
            error
          );

          this.cambiandoEstadoId =
            null;

          this.mensajeError =
            error?.error?.mensaje ||
            'No fue posible cambiar el estado.';

        }

      });

  }


  /* =====================================================
     UTILIDADES
  ===================================================== */

  estaActiva(
    promocion: Promocion
  ): boolean {

    return Number(
      promocion.estado
    ) === 1;

  }


  tipoTexto(
    tipo: string
  ): string {

    switch (
      String(tipo)
        .toUpperCase()
    ) {

      case 'PORCENTAJE':
        return 'Porcentaje';

      case 'MONTO':
        return 'Monto';

      case 'PRECIO_FIJO':
        return 'Precio fijo';

      case 'PACK':
        return 'Pack';

      default:
        return tipo || 'Sin tipo';

    }

  }


  valorTexto(
    promocion: Promocion
  ): string {

    const valor =
      Number(
        promocion.valor_descuento ??
        0
      );


    if (
      promocion.tipo_promocion ===
      'PORCENTAJE'
    ) {

      return `${valor}%`;

    }


    return this.formatearPrecio(
      valor
    );

  }


  get etiquetaValor(): string {

    switch (
      this.formulario.tipo_promocion
    ) {

      case 'PORCENTAJE':
        return 'Porcentaje de descuento';

      case 'MONTO':
        return 'Monto de descuento';

      case 'PRECIO_FIJO':
        return 'Precio especial';

      case 'PACK':
        return 'Precio del pack';

      default:
        return 'Valor';

    }

  }


  get ayudaValor(): string {

    switch (
      this.formulario.tipo_promocion
    ) {

      case 'PORCENTAJE':
        return 'Ej: 20 significa un 20% de descuento.';

      case 'MONTO':
        return 'Monto que se descontará del precio normal.';

      case 'PRECIO_FIJO':
        return 'Precio final que tendrá el producto.';

      case 'PACK':
        return 'Precio final por el conjunto completo de productos.';

      default:
        return '';

    }

  }


  formatearPrecio(
    valor: any
  ): string {

    const numero =
      Number(
        valor ?? 0
      );


    return new Intl.NumberFormat(
      'es-CL',
      {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
      }
    ).format(numero);

  }


  private fechaParaInput(
  valor: any
): string {

  if (!valor) {
    return '';
  }

  const texto = String(valor);

  /*
    Si viene:
    2026-08-28 00:00:00
    o
    2026-08-28T00:00:00
  */
  const coincidencia =
    texto.match(
      /^(\d{4}-\d{2}-\d{2})/
    );

  if (coincidencia) {
    return coincidencia[1];
  }

  const fecha =
    new Date(valor);

  if (
    Number.isNaN(
      fecha.getTime()
    )
  ) {
    return '';
  }

  const anio =
    fecha.getFullYear();

  const mes =
    String(
      fecha.getMonth() + 1
    ).padStart(2, '0');

  const dia =
    String(
      fecha.getDate()
    ).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
}


  private fechaInicioParaApi(
  valor: string
): string {

  if (!valor) {
    return '';
  }

  return `${valor} 00:00:00`;
}


private fechaFinParaApi(
  valor: string
): string {

  if (!valor) {
    return '';
  }

  return `${valor} 23:59:59`;
}

  trackByPromocion(
    index: number,
    promocion: Promocion
  ): number {

    return promocion.id;

  }


  trackByProducto(
    index: number,
    producto: ProductoPromocion
  ): number {

    return producto.id_producto;

  }

}