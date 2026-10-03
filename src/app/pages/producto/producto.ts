import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductoService } from '../../services/producto';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './producto.html',
  styleUrl: './producto.css'
})
export class Productos implements OnInit {

  /* =========================================
     LISTADO
  ========================================= */

  productos: any[] = [];
  productosFiltrados: any[] = [];

  busqueda = '';
  cargando = false;
  mensajeError = '';


  /* =========================================
     CATÁLOGOS
  ========================================= */

  categorias: any[] = [];
  marcas: any[] = [];
  modelos: any[] = [];
  modelosFiltrados: any[] = [];
  tiposProducto: any[] = [];


  /* =========================================
     PAGINACIÓN
  ========================================= */

  paginaActual = 1;
  registrosPorPagina = 10;


  /* =========================================
     MODAL
  ========================================= */

  mostrarModalProducto = false;
  esEdicion = false;

  cargandoProducto = false;
  guardandoProducto = false;

  idProductoEditando: number | null = null;
  mensajeErrorModal = '';
  cantidadAjuste = 0;
  motivoAjuste = '';
  mensajeAjuste = '';

  productoFormulario: any =
    this.crearProductoVacio();


  constructor(
    private productoService: ProductoService,
    public auth: AuthService
  ) {}


  ngOnInit(): void {
    this.listarProductos();
  }


  /* =========================================
     LISTAR PRODUCTOS + CATÁLOGOS
  ========================================= */

  listarProductos(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.productoService
      .listar()
      .subscribe({
        next: (respuesta: any) => {
          this.productos =
            Array.isArray(respuesta?.data)
              ? respuesta.data
              : [];

          this.cargarCatalogosRespuesta(
            respuesta?.catalogos
          );

          this.aplicarFiltro(false);
          this.cargando = false;
        },

        error: (error: any) => {
          console.error(
            'Error al listar productos:',
            error
          );

          this.productos = [];
          this.productosFiltrados = [];

          this.mensajeError =
            error?.error?.mensaje ||
            'No fue posible cargar los productos.';

          this.cargando = false;
        }
      });
  }


  private cargarCatalogosRespuesta(
    catalogos: any
  ): void {
    this.marcas =
      this.normalizarCatalogo(
        catalogos?.marcas
      );

    this.categorias =
      this.normalizarCatalogo(
        catalogos?.categorias
      );

    this.tiposProducto =
      this.normalizarCatalogo(
        catalogos?.tipos
      );

    this.modelos =
      this.normalizarCatalogo(
        catalogos?.modelos
      ).map((modelo: any) => ({
        ...modelo,
        id_marca:
          Number(modelo.id_marca)
      }));

    this.actualizarModelosFiltrados(
      false
    );
  }


  private normalizarCatalogo(
    lista: any
  ): any[] {
    if (!Array.isArray(lista)) {
      return [];
    }

    return lista
      .map((item: any) => ({
        ...item,
        id: Number(item.id),
        estado: Number(item.estado ?? 1)
      }))
      .filter(
        (item: any) =>
          Number.isInteger(item.id) &&
          item.id > 0 &&
          item.estado === 1
      );
  }


  /* =========================================
     MARCA -> MODELOS
  ========================================= */

  onMarcaChange(): void {
    this.actualizarModelosFiltrados(
      true
    );
  }


  private actualizarModelosFiltrados(
    limpiarModelo: boolean
  ): void {
    const idMarca =
      Number(
        this.productoFormulario
          .id_marca
      );

    if (
      !Number.isInteger(idMarca) ||
      idMarca <= 0
    ) {
      this.modelosFiltrados = [];

      if (limpiarModelo) {
        this.productoFormulario.id_modelo =
          null;
      }

      return;
    }

    this.modelosFiltrados =
      this.modelos.filter(
        (modelo: any) =>
          Number(modelo.id_marca) ===
          idMarca
      );

    if (limpiarModelo) {
      this.productoFormulario.id_modelo =
        null;
    }
  }


  /* =========================================
     BUSCADOR
  ========================================= */

  buscar(): void {
    this.paginaActual = 1;
    this.aplicarFiltro(false);
  }


  limpiarBusqueda(): void {
    this.busqueda = '';
    this.paginaActual = 1;
    this.aplicarFiltro(false);
  }


  private aplicarFiltro(
    resetearPagina = true
  ): void {
    if (resetearPagina) {
      this.paginaActual = 1;
    }

    const termino =
      this.busqueda
        .trim()
        .toLowerCase();

    if (!termino) {
      this.productosFiltrados =
        [...this.productos];

      this.corregirPaginaActual();
      return;
    }

    this.productosFiltrados =
      this.productos.filter(
        (producto: any) => {
          const texto = [
            producto.codigo,
            producto.codigo_barra,
            producto.nombre,
            producto.categoria,
            producto.marca,
            producto.modelo,
            producto.tipo_producto
          ]
            .filter(
              valor =>
                valor !== null &&
                valor !== undefined
            )
            .join(' ')
            .toLowerCase();

          return texto.includes(termino);
        }
      );

    this.corregirPaginaActual();
  }


  /* =========================================
     PAGINACIÓN
  ========================================= */

  get totalPaginas(): number {
    if (
      this.productosFiltrados.length === 0
    ) {
      return 1;
    }

    return Math.ceil(
      this.productosFiltrados.length /
      this.registrosPorPagina
    );
  }


  get productosPagina(): any[] {
    const inicio =
      (this.paginaActual - 1) *
      this.registrosPorPagina;

    const fin =
      inicio +
      this.registrosPorPagina;

    return this.productosFiltrados.slice(
      inicio,
      fin
    );
  }


  cambiarCantidadRegistros(): void {
    this.paginaActual = 1;
    this.corregirPaginaActual();
  }


  paginaAnterior(): void {
    if (this.paginaActual > 1) {
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


  irPagina(pagina: number): void {
    if (
      pagina >= 1 &&
      pagina <= this.totalPaginas
    ) {
      this.paginaActual = pagina;
    }
  }


  obtenerPaginas(): number[] {
    const paginas: number[] = [];
    const total = this.totalPaginas;

    if (total <= 7) {
      for (
        let i = 1;
        i <= total;
        i++
      ) {
        paginas.push(i);
      }

      return paginas;
    }

    let inicio =
      Math.max(
        1,
        this.paginaActual - 2
      );

    let fin =
      Math.min(
        total,
        inicio + 4
      );

    if (
      fin - inicio < 4
    ) {
      inicio =
        Math.max(
          1,
          fin - 4
        );
    }

    for (
      let i = inicio;
      i <= fin;
      i++
    ) {
      paginas.push(i);
    }

    return paginas;
  }


  private corregirPaginaActual(): void {
    if (
      this.paginaActual >
      this.totalPaginas
    ) {
      this.paginaActual =
        this.totalPaginas;
    }

    if (
      this.paginaActual < 1
    ) {
      this.paginaActual = 1;
    }
  }


  /* =========================================
     FORMATOS
  ========================================= */

  formatearPrecio(
    valor: any
  ): string {
    const numero =
      Number(valor) || 0;

    return new Intl.NumberFormat(
      'es-CL',
      {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
      }
    ).format(numero);
  }


  esStockBajo(
    producto: any
  ): boolean {
    const stockActual =
      Number(
        producto.stock_actual ?? 0
      );

    const stockMinimo =
      Number(
        producto.stock_minimo ?? 0
      );

    return (
      stockActual <= stockMinimo
    );
  }


  /* =========================================
     NUEVO PRODUCTO
  ========================================= */

  nuevoProducto(): void {
    if (!this.auth.isAdmin()) return;
    this.esEdicion = false;
    this.idProductoEditando = null;

    this.mensajeErrorModal = '';
    this.cargandoProducto = false;
    this.guardandoProducto = false;

    this.productoFormulario =
      this.crearProductoVacio();

    this.modelosFiltrados = [];

    this.mostrarModalProducto = true;
  }


  /* =========================================
     EDITAR PRODUCTO
  ========================================= */

  editarProducto(
    producto: any
  ): void {
    if (!this.auth.isAdmin()) return;
    this.cantidadAjuste = 0;
    this.motivoAjuste = '';
    this.mensajeAjuste = '';
    const id =
      this.obtenerIdProducto(
        producto
      );

    if (!id) {
      console.error(
        'No se encontró el ID del producto:',
        producto
      );

      this.mensajeError =
        'No fue posible identificar el producto.';

      return;
    }

    this.esEdicion = true;
    this.idProductoEditando = id;

    this.mensajeErrorModal = '';
    this.cargandoProducto = true;
    this.guardandoProducto = false;

    this.mostrarModalProducto = true;

    this.productoService
      .obtenerPorId(id)
      .subscribe({
        next: (respuesta: any) => {
          const p =
            respuesta?.data;

          if (!p) {
            this.mensajeErrorModal =
              'El producto no contiene información.';

            this.cargandoProducto = false;
            return;
          }

          this.productoFormulario = {
            codigo:
              p.codigo ?? '',

            codigo_barra:
              p.codigo_barra ?? '',

            nombre:
              p.nombre ?? '',

            descripcion:
              p.descripcion ?? '',

            id_categoria:
              this.valorNumeroONull(
                p.id_categoria
              ),

            id_marca:
              this.valorNumeroONull(
                p.id_marca
              ),

            id_modelo:
              this.valorNumeroONull(
                p.id_modelo
              ),

            id_tipo_producto:
              this.valorNumeroONull(
                p.id_tipo_producto
              ),

            precio_compra:
              Number(
                p.precio_compra ?? 0
              ),

            precio_venta:
              Number(
                p.precio_venta ?? 0
              ),

            stock_actual:
              Number(
                p.stock_actual ?? 0
              ),

            stock_minimo:
              Number(
                p.stock_minimo ?? 0
              ),

            estado:
              Number(
                p.estado ?? 1
              )
          };

          this.actualizarModelosFiltrados(
            false
          );

          this.cargandoProducto = false;
        },

        error: (error: any) => {
          console.error(
            'Error al obtener producto:',
            error
          );

          this.mensajeErrorModal =
            error?.error?.mensaje ||
            'No fue posible cargar el producto.';

          this.cargandoProducto = false;
        }
      });
  }


  /* =========================================
     GUARDAR
  ========================================= */

  guardarProducto(): void {
    if (!this.auth.isAdmin() || this.guardandoProducto) return;
    this.mensajeErrorModal = '';

    const nombre =
      String(
        this.productoFormulario
          .nombre ?? ''
      ).trim();

    if (!nombre) {
      this.mensajeErrorModal =
        'El nombre es obligatorio.';

      return;
    }

    const idCategoria =
      this.valorNumeroONull(
        this.productoFormulario
          .id_categoria
      );

    const idMarca =
      this.valorNumeroONull(
        this.productoFormulario
          .id_marca
      );

    const idModelo =
      this.valorNumeroONull(
        this.productoFormulario
          .id_modelo
      );

    const idTipoProducto =
      this.valorNumeroONull(
        this.productoFormulario
          .id_tipo_producto
      );

    if (!idCategoria) {
      this.mensajeErrorModal =
        'Debe seleccionar una categoría.';

      return;
    }

    if (!idMarca) {
      this.mensajeErrorModal =
        'Debe seleccionar una marca.';

      return;
    }

    if (!idModelo) {
      this.mensajeErrorModal =
        'Debe seleccionar un modelo.';

      return;
    }

    if (!idTipoProducto) {
      this.mensajeErrorModal =
        'Debe seleccionar un tipo de producto.';

      return;
    }

    const modeloSeleccionado =
      this.modelos.find(
        (modelo: any) =>
          Number(modelo.id) ===
          Number(idModelo)
      );

    if (
      !modeloSeleccionado ||
      Number(
        modeloSeleccionado.id_marca
      ) !== Number(idMarca)
    ) {
      this.mensajeErrorModal =
        'El modelo seleccionado no pertenece a la marca seleccionada.';

      return;
    }

    const camposObligatorios = [
      {
        valor:
          this.productoFormulario
            .precio_compra,
        mensaje:
          'El precio de compra es obligatorio.'
      },
      {
        valor:
          this.productoFormulario
            .precio_venta,
        mensaje:
          'El precio de venta es obligatorio.'
      },
      {
        valor:
          this.productoFormulario
            .stock_actual,
        mensaje:
          'El stock actual es obligatorio.'
      },
      {
        valor:
          this.productoFormulario
            .stock_minimo,
        mensaje:
          'El stock mínimo es obligatorio.'
      }
    ];

    for (
      const campo of camposObligatorios
    ) {
      if (
        campo.valor === '' ||
        campo.valor === null ||
        campo.valor === undefined
      ) {
        this.mensajeErrorModal =
          campo.mensaje;

        return;
      }
    }

    const precioCompra =
      Number(
        this.productoFormulario
          .precio_compra
      );

    const precioVenta =
      Number(
        this.productoFormulario
          .precio_venta
      );

    const stockActual =
      Number(
        this.productoFormulario
          .stock_actual
      );

    const stockMinimo =
      Number(
        this.productoFormulario
          .stock_minimo
      );

    if (
      !Number.isFinite(precioCompra) ||
      !Number.isFinite(precioVenta) ||
      !Number.isFinite(stockActual) ||
      !Number.isFinite(stockMinimo)
    ) {
      this.mensajeErrorModal =
        'Los precios y cantidades deben ser numéricos.';

      return;
    }

    if (
      precioCompra < 0 ||
      precioVenta < 0 ||
      stockActual < 0 ||
      stockMinimo < 0
    ) {
      this.mensajeErrorModal =
        'Los precios y cantidades no pueden ser negativos.';

      return;
    }

    if (
      !Number.isInteger(stockActual) ||
      !Number.isInteger(stockMinimo)
    ) {
      this.mensajeErrorModal =
        'El stock actual y el stock mínimo deben ser números enteros.';

      return;
    }

    const producto = {
      codigo_barra:
        this.valorTextoONull(
          this.productoFormulario
            .codigo_barra
        ),

      nombre,

      descripcion:
        this.valorTextoONull(
          this.productoFormulario
            .descripcion
        ),

      id_categoria:
        idCategoria,

      id_marca:
        idMarca,

      id_modelo:
        idModelo,

      id_tipo_producto:
        idTipoProducto,

      precio_compra:
        precioCompra,

      precio_venta:
        precioVenta,

      stock_actual:
        stockActual,

      stock_minimo:
        stockMinimo,

      estado:
        Number(
          this.productoFormulario
            .estado ?? 1
        )
    };

    this.guardandoProducto = true;

    if (
      this.esEdicion &&
      this.idProductoEditando
    ) {
      this.actualizarProducto(
        producto
      );
    } else {
      this.crearProducto(
        producto
      );
    }
  }


  /* =========================================
     CREAR
  ========================================= */

  private crearProducto(
    producto: any
  ): void {
    this.productoService
      .crear(producto)
      .subscribe({
        next: () => {
          this.guardandoProducto =
            false;

          this.cerrarModalProducto();
          this.listarProductos();
        },

        error: (error: any) => {
          this.manejarErrorProducto(
            error
          );
        }
      });
  }


  /* =========================================
     ACTUALIZAR
  ========================================= */

  private actualizarProducto(
    producto: any
  ): void {
    delete producto.stock_actual;
    if (
      !this.idProductoEditando
    ) {
      this.guardandoProducto =
        false;

      return;
    }

    this.productoService
      .actualizar(
        this.idProductoEditando,
        producto
      )
      .subscribe({
        next: () => {
          this.guardandoProducto =
            false;

          this.cerrarModalProducto();
          this.listarProductos();
        },

        error: (error: any) => {
          this.manejarErrorProducto(
            error
          );
        }
      });
  }


  /* =========================================
     ERRORES MODAL
  ========================================= */

  private manejarErrorProducto(
    error: any
  ): void {
    console.error(
      'Error guardando producto:',
      error
    );

    this.guardandoProducto =
      false;

    if (
      Array.isArray(
        error?.error?.errores
      )
    ) {
      this.mensajeErrorModal =
        error.error.errores.join(
          ' · '
        );

      return;
    }

    this.mensajeErrorModal =
      error?.error?.mensaje ||
      'Ocurrió un error al guardar el producto.';
  }

  ajustarStock(): void {
    if (!this.auth.isAdmin() || !this.idProductoEditando || this.guardandoProducto) return;
    this.mensajeErrorModal = '';
    this.mensajeAjuste = '';
    if (!Number.isSafeInteger(this.cantidadAjuste) || this.cantidadAjuste === 0 || !this.motivoAjuste.trim()) {
      this.mensajeErrorModal = 'Indique una cantidad entera distinta de cero y el motivo del ajuste.';
      return;
    }
    this.guardandoProducto = true;
    this.productoService.ajustarStock(this.idProductoEditando, this.cantidadAjuste, this.motivoAjuste.trim())
      .subscribe({
        next: respuesta => {
          this.productoFormulario.stock_actual = respuesta.data.stock_actual;
          this.cantidadAjuste = 0;
          this.motivoAjuste = '';
          this.guardandoProducto = false;
          this.mensajeAjuste = 'Ajuste registrado.';
          this.listarProductos();
        },
        error: error => this.manejarErrorProducto(error)
      });
  }


  /* =========================================
     CERRAR MODAL
  ========================================= */

  cerrarModalProducto(): void {
    if (
      this.guardandoProducto
    ) {
      return;
    }

    this.mostrarModalProducto =
      false;

    this.esEdicion =
      false;

    this.cargandoProducto =
      false;

    this.idProductoEditando =
      null;

    this.mensajeErrorModal =
      '';

    this.productoFormulario =
      this.crearProductoVacio();

    this.modelosFiltrados = [];
  }


  /* =========================================
     AUXILIARES
  ========================================= */

  private crearProductoVacio(): any {
    return {
      codigo: '',
      codigo_barra: '',
      nombre: '',
      descripcion: '',
      id_categoria: null,
      id_marca: null,
      id_modelo: null,
      id_tipo_producto: null,
      precio_compra: 0,
      precio_venta: 0,
      stock_actual: 0,
      stock_minimo: 0,
      estado: 1
    };
  }


  private obtenerIdProducto(
    producto: any
  ): number | null {
    const id =
      producto?.id_producto ??
      producto?.id ??
      producto?.producto_id;

    const numero =
      Number(id);

    if (
      !Number.isInteger(numero) ||
      numero <= 0
    ) {
      return null;
    }

    return numero;
  }


  private valorTextoONull(
    valor: any
  ): string | null {
    const texto =
      String(
        valor ?? ''
      ).trim();

    return texto || null;
  }


  private valorNumeroONull(
    valor: any
  ): number | null {
    if (
      valor === null ||
      valor === undefined ||
      valor === ''
    ) {
      return null;
    }

    const numero =
      Number(valor);

    if (
      !Number.isInteger(numero) ||
      numero <= 0
    ) {
      return null;
    }

    return numero;
  }
}
