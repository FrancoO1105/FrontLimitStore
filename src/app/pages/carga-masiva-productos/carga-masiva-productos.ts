import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import {  CargaMasivaProductoService } from '../../services/carga-masiva-producto';


interface ProductoMasivo {

  uid: number;

  codigo_barra: string;

  nombre: string;

  descripcion: string;

  id_categoria: number | null;

  id_marca: number | null;

  id_modelo: number | null;

  id_tipo_producto: number | null;

  precio_compra: number | null;

  precio_venta: number | null;

  stock_actual: number;

  stock_minimo: number;

  estado: number;

}


@Component({
  selector: 'app-carga-masiva-productos',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],

  templateUrl:
    './carga-masiva-productos.html',

  styleUrl:
    './carga-masiva-productos.css'
})
export class CargaMasivaProductos
  implements OnInit {


  /* =====================================================
     CATALOGOS
  ===================================================== */

  categorias: any[] = [];

  marcas: any[] = [];

  modelos: any[] = [];

  tiposProductos: any[] = [];


  cargandoCatalogos = false;


  /* =====================================================
     PRODUCTOS
  ===================================================== */

  productos:
    ProductoMasivo[] = [];


  private siguienteUid = 1;


  /* =====================================================
     GUARDADO
  ===================================================== */

  guardando = false;

  mensajeError = '';

  mensajeExito = '';


  constructor(
    private cargaService:
      CargaMasivaProductoService,

    private router:
      Router
  ) {}


  ngOnInit(): void {

    this.cargarCatalogos();

    this.agregarProducto();

  }


  /* =====================================================
     CARGAR CATALOGOS
  ===================================================== */

  cargarCatalogos(): void {

    this.cargandoCatalogos = true;

    this.mensajeError = '';


    let pendientes = 4;


    const finalizar = () => {

      pendientes--;

      if (pendientes === 0) {

        this.cargandoCatalogos =
          false;

      }

    };


    /* CATEGORIAS */

    this.cargaService
      .listarCategorias()
      .subscribe({

        next: (respuesta: any) => {

          this.categorias =
            this.extraerLista(
              respuesta
            )
              .filter(
                item =>
                  Number(
                    item.estado
                  ) === 1
              );

          finalizar();

        },

        error: (error: any) => {

          console.error(
            'Error categorías:',
            error
          );

          this.mensajeError =
            'No fue posible cargar las categorías.';

          finalizar();

        }

      });


    /* MARCAS */

    this.cargaService
      .listarMarcas()
      .subscribe({

        next: (respuesta: any) => {

          this.marcas =
            this.extraerLista(
              respuesta
            )
              .filter(
                item =>
                  Number(
                    item.estado
                  ) === 1
              );

          finalizar();

        },

        error: (error: any) => {

          console.error(
            'Error marcas:',
            error
          );

          this.mensajeError =
            'No fue posible cargar las marcas.';

          finalizar();

        }

      });


    /* MODELOS */

    this.cargaService
      .listarModelos()
      .subscribe({

        next: (respuesta: any) => {

          this.modelos =
            this.extraerLista(
              respuesta
            )
              .filter(
                item =>
                  Number(
                    item.estado
                  ) === 1
              );

          finalizar();

        },

        error: (error: any) => {

          console.error(
            'Error modelos:',
            error
          );

          this.mensajeError =
            'No fue posible cargar los modelos.';

          finalizar();

        }

      });


    /* TIPOS */

    this.cargaService
      .listarTipos()
      .subscribe({

        next: (respuesta: any) => {

          this.tiposProductos =
            this.extraerLista(
              respuesta
            )
              .filter(
                item =>
                  Number(
                    item.estado
                  ) === 1
              );

          finalizar();

        },

        error: (error: any) => {

          console.error(
            'Error tipos:',
            error
          );

          this.mensajeError =
            'No fue posible cargar los tipos de producto.';

          finalizar();

        }

      });

  }


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
     NUEVA FILA
  ===================================================== */

  private crearProductoVacio():
    ProductoMasivo {

    return {

      uid:
        this.siguienteUid++,

      codigo_barra: '',

      nombre: '',

      descripcion: '',

      id_categoria: null,

      id_marca: null,

      id_modelo: null,

      id_tipo_producto: null,

      precio_compra: null,

      precio_venta: null,

      stock_actual: 0,

      stock_minimo: 0,

      estado: 1

    };

  }


  agregarProducto(): void {

    this.productos.push(
      this.crearProductoVacio()
    );

  }


  /* =====================================================
     DUPLICAR
  ===================================================== */

  duplicarProducto(
    producto: ProductoMasivo
  ): void {

    const copia:
      ProductoMasivo = {

      ...producto,

      uid:
        this.siguienteUid++,

      /*
        Código de barras no se copia
        porque debe ser único.
      */

      codigo_barra: '',

      nombre:
        producto.nombre

    };


    const indice =
      this.productos
        .findIndex(
          item =>
            item.uid ===
            producto.uid
        );


    this.productos.splice(
      indice + 1,
      0,
      copia
    );

  }


  /* =====================================================
     ELIMINAR
  ===================================================== */

  eliminarProducto(
    uid: number
  ): void {

    if (
      this.productos.length === 1
    ) {

      this.productos[0] =
        this.crearProductoVacio();

      return;

    }


    this.productos =
      this.productos
        .filter(
          item =>
            item.uid !== uid
        );

  }


  /* =====================================================
     CAMBIO MARCA
  ===================================================== */

  cambioMarca(
    producto: ProductoMasivo
  ): void {

    producto.id_modelo =
      null;

  }


  /* =====================================================
     MODELOS POR MARCA
  ===================================================== */

  modelosPorMarca(
    idMarca: number | null
  ): any[] {

    if (!idMarca) {

      return [];

    }


    return this.modelos
      .filter(
        modelo =>
          Number(
            modelo.id_marca
          ) ===
          Number(
            idMarca
          )
      );

  }


  /* =====================================================
     NOMBRE CATEGORIA
  ===================================================== */

  nombreCategoria(
    idCategoria: number | null
  ): string {

    const categoria =
      this.categorias.find(
        item =>
          Number(
            item.id
          ) ===
          Number(
            idCategoria
          )
      );


    return categoria?.nombre ||
      'Sin categoría';

  }


  /* =====================================================
     PREFIJO CODIGO
  ===================================================== */

  codigoEstimado(
    producto: ProductoMasivo
  ): string {

    if (
      !producto.id_categoria
    ) {

      return 'Automático';

    }


    const nombre =
      this.nombreCategoria(
        producto.id_categoria
      );


    const prefijo =
      nombre
        .normalize('NFD')
        .replace(
          /[\u0300-\u036f]/g,
          ''
        )
        .replace(
          /[^a-zA-Z0-9]/g,
          ''
        )
        .toUpperCase()
        .substring(
          0,
          3
        )
        .padEnd(
          3,
          'X'
        );


    return `${prefijo}-XXXX`;

  }


  /* =====================================================
     VALIDAR FILA
  ===================================================== */

  productoValido(
    producto: ProductoMasivo
  ): boolean {

    return (

      String(
        producto.nombre ?? ''
      ).trim().length > 0

      &&

      Number(
        producto.id_categoria
      ) > 0

      &&

      Number(
        producto.id_marca
      ) > 0

      &&

      Number(
        producto.id_tipo_producto
      ) > 0

      &&

      producto.precio_compra !== null

      &&

      Number(
        producto.precio_compra
      ) >= 0

      &&

      producto.precio_venta !== null

      &&

      Number(
        producto.precio_venta
      ) >= 0

      &&

      Number.isInteger(
        Number(
          producto.stock_actual
        )
      )

      &&

      Number(
        producto.stock_actual
      ) >= 0

      &&

      Number.isInteger(
        Number(
          producto.stock_minimo
        )
      )

      &&

      Number(
        producto.stock_minimo
      ) >= 0

    );

  }


  /* =====================================================
     CONTADORES
  ===================================================== */

  get totalProductos():
    number {

    return this.productos.length;

  }


  get productosValidos():
    number {

    return this.productos
      .filter(
        producto =>
          this.productoValido(
            producto
          )
      )
      .length;

  }


  get productosPendientes():
    number {

    return (
      this.totalProductos -
      this.productosValidos
    );

  }


  /* =====================================================
     PRECIO FORMATO
  ===================================================== */

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


  /* =====================================================
     GUARDAR
  ===================================================== */

  guardar(): void {

    this.mensajeError = '';

    this.mensajeExito = '';


    if (
      this.productos.length === 0
    ) {

      this.mensajeError =
        'Debe agregar al menos un producto.';

      return;

    }


    /* ---------------------------------------------------
       VALIDAR FILAS
    --------------------------------------------------- */

    for (
      let i = 0;
      i < this.productos.length;
      i++
    ) {

      if (
        !this.productoValido(
          this.productos[i]
        )
      ) {

        this.mensajeError =
          `El producto ${i + 1} contiene datos incompletos o inválidos.`;

        return;

      }

    }


    /* ---------------------------------------------------
       CODIGOS DE BARRA DUPLICADOS
    --------------------------------------------------- */

    const barras =
      this.productos
        .map(
          producto =>
            String(
              producto.codigo_barra ??
              ''
            ).trim()
        )
        .filter(
          codigo =>
            codigo.length > 0
        );


    if (
      new Set(
        barras
      ).size !==
      barras.length
    ) {

      this.mensajeError =
        'Existen códigos de barra repetidos en la carga.';

      return;

    }


    /* ---------------------------------------------------
       PAYLOAD
    --------------------------------------------------- */

    const productos =
      this.productos.map(
        producto => ({

          codigo_barra:
            String(
              producto.codigo_barra ??
              ''
            ).trim() || null,

          nombre:
            String(
              producto.nombre
            ).trim(),

          descripcion:
            String(
              producto.descripcion ??
              ''
            ).trim() || null,

          id_categoria:
            Number(
              producto.id_categoria
            ),

          id_marca:
            Number(
              producto.id_marca
            ),

          id_modelo:
            producto.id_modelo
              ? Number(
                  producto.id_modelo
                )
              : null,

          id_tipo_producto:
            Number(
              producto.id_tipo_producto
            ),

          precio_compra:
            Number(
              producto.precio_compra
            ),

          precio_venta:
            Number(
              producto.precio_venta
            ),

          stock_actual:
            Number(
              producto.stock_actual
            ),

          stock_minimo:
            Number(
              producto.stock_minimo
            ),

          estado:
            Number(
              producto.estado
            )

        })
      );


    this.guardando = true;


    this.cargaService
      .guardarMasivo(
        productos
      )
      .subscribe({

        next: (respuesta: any) => {

          this.guardando =
            false;


          this.mensajeExito =
            respuesta?.mensaje ||
            `${productos.length} productos registrados correctamente.`;


          /*
            Dejamos una fila vacía
            para permitir otra carga.
          */

          this.productos = [];

          this.siguienteUid = 1;

          this.agregarProducto();


          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });

        },


        error: (error: any) => {

          console.error(
            'Error carga masiva:',
            error
          );


          this.guardando =
            false;


          const errores =
            error?.error?.errores;


          if (
            Array.isArray(
              errores
            ) &&
            errores.length > 0
          ) {

            const primero =
              errores[0];


            this.mensajeError =
              `Producto ${primero.fila}: ${
                primero.errores?.join(' ') ||
                'Datos inválidos.'
              }`;

          }
          else {

            this.mensajeError =
              error?.error?.mensaje ||
              'No fue posible registrar los productos.';

          }

        }

      });

  }


  /* =====================================================
     VOLVER
  ===================================================== */

  volver(): void {

    this.router.navigate(
      [
        '/admin/lista-productos'
      ]
    );

  }


  /* =====================================================
     TRACK BY
  ===================================================== */

  trackByProducto(
    index: number,
    producto: ProductoMasivo
  ): number {

    return producto.uid;

  }

}