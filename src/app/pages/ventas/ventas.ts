import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../services/ventas.services';
import { ControlCajaComponent } from '../control-caja/control-caja';

interface ProductoVenta {

  id: number;

  codigo: string | null;

  codigo_barra: string | null;

  nombre: string;

  descripcion: string | null;

  precio_venta: number | string;

  stock_actual: number;

  stock_minimo: number;

  estado: number | boolean;

}


interface ItemCarrito {

  id_producto: number;

  codigo: string | null;

  codigo_barra: string | null;

  nombre: string;

  precio_unitario: number;

  cantidad: number;

  stock_disponible: number;

}


@Component({

  selector:
    'app-ventas',

  standalone:
    true,

  imports: [
    CommonModule,
    FormsModule,
    ControlCajaComponent
  ],

  templateUrl:
    './ventas.html',

  styleUrl:
    './ventas.css'

})
export class Ventas
  implements OnInit {

    @ViewChild(ControlCajaComponent)
controlCaja?: ControlCajaComponent;

  /* =====================================================
     PRODUCTOS
  ===================================================== */

  productos:
    ProductoVenta[] = [];


  cargandoProductos =
    false;


  terminoBusqueda =
    '';


  private timerBusqueda:
    any = null;


  /* =====================================================
     CARRITO
  ===================================================== */

  carrito:
    ItemCarrito[] = [];


  /* =====================================================
     VENTA
  ===================================================== */

  clienteNombre =
    '';


  clienteRut =
    '';


  observacion =
    '';


  formaPago =
    'EFECTIVO';


  descuento:
    number | null = 0;


  formasPago = [

    {
      valor:
        'EFECTIVO',

      nombre:
        'Efectivo',

      icono:
        'bi-cash'
    },

    {
      valor:
        'TRANSFERENCIA',

      nombre:
        'Transferencia',

      icono:
        'bi-bank'
    },

    {
      valor:
        'DEBITO',

      nombre:
        'Débito',

      icono:
        'bi-credit-card'
    },

    {
      valor:
        'CREDITO',

      nombre:
        'Crédito',

      icono:
        'bi-credit-card-2-front'
    }

  ];


  /* =====================================================
     ESTADOS
  ===================================================== */

  guardando =
    false;


  mensajeError =
    '';


  mensajeExito =
    '';


  ultimaVenta:
    any = null;


  constructor(
    private ventaService:
      VentaService
  ) {}


  ngOnInit():
    void {

    this.buscarProductos();

  }


  /* =====================================================
     BUSCAR PRODUCTOS
  ===================================================== */

  buscarProductos():
    void {

    this.cargandoProductos =
      true;

    this.mensajeError =
      '';


    this.ventaService
      .buscarProductos(
        this.terminoBusqueda
      )
      .subscribe({

        next: (
          respuesta:
            any
        ) => {

          this.productos =
            Array.isArray(
              respuesta?.data
            )
              ? respuesta.data
              : [];


          this.cargandoProductos =
            false;

        },


        error: (
          error:
            any
        ) => {

          console.error(
            'Error buscar productos:',
            error
          );


          this.cargandoProductos =
            false;


          this.mensajeError =
            error?.error?.mensaje ||
            'No fue posible cargar los productos.';

        }

      });

  }


  /* =====================================================
     BUSQUEDA CON PEQUEÑO RETARDO
  ===================================================== */

  alBuscar():
    void {

    if (
      this.timerBusqueda
    ) {

      clearTimeout(
        this.timerBusqueda
      );

    }


    this.timerBusqueda =
      setTimeout(
        () => {

          this.buscarProductos();

        },
        250
      );

  }


  /* =====================================================
     ENTER / LECTOR DE CODIGO
  ===================================================== */

  enterBusqueda():
    void {

    const termino =
      this.terminoBusqueda
        .trim();


    if (!termino) {

      this.buscarProductos();

      return;

    }


    this.ventaService
      .buscarProductos(
        termino
      )
      .subscribe({

        next: (
          respuesta:
            any
        ) => {

          const resultados =
            Array.isArray(
              respuesta?.data
            )
              ? respuesta.data
              : [];


          const exacto =
            resultados.find(
              (
                producto:
                  ProductoVenta
              ) =>

                String(
                  producto.codigo_barra ??
                  ''
                ) === termino

                ||

                String(
                  producto.codigo ??
                  ''
                )
                  .toLowerCase() ===
                termino.toLowerCase()
            );


          if (exacto) {

            this.agregarProducto(
              exacto
            );


            this.terminoBusqueda =
              '';


            this.buscarProductos();

            return;

          }


          this.productos =
            resultados;

        },


        error: (
          error:
            any
        ) => {

          console.error(
            error
          );

        }

      });

  }


  limpiarBusqueda():
    void {

    this.terminoBusqueda =
      '';


    this.buscarProductos();

  }


  /* =====================================================
     AGREGAR PRODUCTO
  ===================================================== */

  agregarProducto(
    producto:
      ProductoVenta
  ):
    void {

    this.mensajeError =
      '';


    const stock =
      Number(
        producto.stock_actual
      );


    if (
      stock <= 0
    ) {

      this.mensajeError =
        `"${producto.nombre}" no tiene stock disponible.`;

      return;

    }


    const existente =
      this.carrito.find(
        item =>
          Number(
            item.id_producto
          ) ===
          Number(
            producto.id
          )
      );


    if (existente) {

      if (
        existente.cantidad >=
        existente.stock_disponible
      ) {

        this.mensajeError =
          `No hay más stock disponible para "${producto.nombre}".`;

        return;

      }


      existente.cantidad++;

      return;

    }


    this.carrito.push({

      id_producto:
        Number(
          producto.id
        ),

      codigo:
        producto.codigo,

      codigo_barra:
        producto.codigo_barra,

      nombre:
        producto.nombre,

      precio_unitario:
        Number(
          producto.precio_venta
        ),

      cantidad:
        1,

      stock_disponible:
        stock

    });

  }


  /* =====================================================
     AUMENTAR CANTIDAD
  ===================================================== */

  aumentarCantidad(
    item:
      ItemCarrito
  ):
    void {

    this.mensajeError =
      '';


    if (
      item.cantidad >=
      item.stock_disponible
    ) {

      this.mensajeError =
        `Stock máximo disponible para "${item.nombre}": ${item.stock_disponible}.`;

      return;

    }


    item.cantidad++;

  }


  /* =====================================================
     DISMINUIR
  ===================================================== */

  disminuirCantidad(
    item:
      ItemCarrito
  ):
    void {

    if (
      item.cantidad <= 1
    ) {

      this.eliminarItem(
        item
      );

      return;

    }


    item.cantidad--;

  }


  /* =====================================================
     CAMBIO DIRECTO DE CANTIDAD
  ===================================================== */

  validarCantidad(
    item:
      ItemCarrito
  ):
    void {

    let cantidad =
      Number(
        item.cantidad
      );


    if (
      !Number.isInteger(
        cantidad
      ) ||
      cantidad < 1
    ) {

      cantidad =
        1;

    }


    if (
      cantidad >
      item.stock_disponible
    ) {

      cantidad =
        item.stock_disponible;


      this.mensajeError =
        `El stock disponible de "${item.nombre}" es ${item.stock_disponible}.`;

    }


    item.cantidad =
      cantidad;

  }


  /* =====================================================
     ELIMINAR
  ===================================================== */

  eliminarItem(
    item:
      ItemCarrito
  ):
    void {

    this.carrito =
      this.carrito
        .filter(
          x =>
            x.id_producto !==
            item.id_producto
        );

  }


  vaciarCarrito():
    void {

    this.carrito =
      [];


    this.descuento =
      0;


    this.mensajeError =
      '';

  }


  /* =====================================================
     TOTALES
  ===================================================== */

  subtotalItem(
    item:
      ItemCarrito
  ):
    number {

    return (
      Number(
        item.precio_unitario
      )
      *
      Number(
        item.cantidad
      )
    );

  }


  get subtotal():
    number {

    return this.carrito
      .reduce(
        (
          total,
          item
        ) =>
          total +
          this.subtotalItem(
            item
          ),
        0
      );

  }


  get descuentoAplicado():
    number {

    const valor =
      Number(
        this.descuento ??
        0
      );


    if (
      !Number.isFinite(
        valor
      ) ||
      valor < 0
    ) {

      return 0;

    }


    return Math.min(
      valor,
      this.subtotal
    );

  }


  get total():
    number {

    return Math.max(
      0,
      this.subtotal -
      this.descuentoAplicado
    );

  }


  get totalUnidades():
    number {

    return this.carrito
      .reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.cantidad
          ),
        0
      );

  }


  /* =====================================================
     VALIDAR DESCUENTO
  ===================================================== */

  validarDescuento():
    void {

    let valor =
      Number(
        this.descuento ??
        0
      );


    if (
      !Number.isFinite(
        valor
      ) ||
      valor < 0
    ) {

      valor =
        0;

    }


    if (
      valor >
      this.subtotal
    ) {

      valor =
        this.subtotal;

    }


    this.descuento =
      valor;

  }


  /* =====================================================
     FORMATO PRECIO
  ===================================================== */

  formatearPrecio(
    valor:
      any
  ):
    string {

    return new Intl
      .NumberFormat(
        'es-CL',
        {
          style:
            'currency',

          currency:
            'CLP',

          maximumFractionDigits:
            0
        }
      )
      .format(
        Number(
          valor ?? 0
        )
      );

  }


  /* =====================================================
     STOCK BAJO
  ===================================================== */

  esStockBajo(
    producto:
      ProductoVenta
  ):
    boolean {

    return (
      Number(
        producto.stock_actual
      )
      <=
      Number(
        producto.stock_minimo
      )
    );

  }


  /* =====================================================
     FINALIZAR VENTA
  ===================================================== */

  finalizarVenta():
    void {

        if (this.guardando) return;

  if (!this.controlCaja?.puedeVender) {
    this.mensajeError =
      'Revisa el panel de caja: espera la actualización, abre una caja o termina la operación pendiente.';
    return;
  }

    this.mensajeError =
      '';


    this.mensajeExito =
      '';


    if (
      this.carrito.length === 0
    ) {

      this.mensajeError =
        'Debe agregar al menos un producto.';

      return;

    }


    this.validarDescuento();


    if (
      !this.formaPago
    ) {

      this.mensajeError =
        'Debe seleccionar una forma de pago.';

      return;

    }


    const payload = {

      cliente_nombre:
        this.clienteNombre
          .trim() ||
        'Consumidor final',

      cliente_rut:
        this.clienteRut
          .trim(),

      forma_pago:
        this.formaPago,

      descuento:
        Number(
          this.descuento ??
          0
        ),

      observacion:
        this.observacion
          .trim(),

      productos:
        this.carrito.map(
          item => ({

            id_producto:
              item.id_producto,

            cantidad:
              item.cantidad

          })
        )

    };


    this.guardando =
      true;


    this.ventaService
      .crear(
        payload
      )
      .subscribe({

        next: (
          respuesta:
            any
        ) => {

          this.guardando = false;

this.controlCaja?.actualizar();

this.ultimaVenta = respuesta?.data;


          this.mensajeExito =
            respuesta?.mensaje ||
            'Venta registrada correctamente.';


          this.limpiarVenta();


          /*
            Refrescamos productos
            para actualizar stocks.
          */

          this.buscarProductos();


          window.scrollTo({
            top:
              0,

            behavior:
              'smooth'
          });

        },


        error: (
          error:
            any
        ) => {

          console.error(
            'Error crear venta:',
            error
          );


          this.guardando =
            false;


          this.mensajeError =
            error?.error?.mensaje ||
            'No fue posible registrar la venta.';

        }

      });

  }


  /* =====================================================
     LIMPIAR DESPUES DE VENTA
  ===================================================== */

  limpiarVenta():
    void {

    this.carrito =
      [];


    this.clienteNombre =
      '';


    this.clienteRut =
      '';


    this.observacion =
      '';


    this.formaPago =
      'EFECTIVO';


    this.descuento =
      0;

  }


  /* =====================================================
     CERRAR MENSAJE DE VENTA
  ===================================================== */

  cerrarResultadoVenta():
    void {

    this.ultimaVenta =
      null;


    this.mensajeExito =
      '';

  }


  /* =====================================================
     TRACK BY
  ===================================================== */

  trackByProducto(
    index:
      number,

    producto:
      ProductoVenta
  ):
    number {

    return producto.id;

  }


  trackByCarrito(
    index:
      number,

    item:
      ItemCarrito
  ):
    number {

    return item.id_producto;

  }

}