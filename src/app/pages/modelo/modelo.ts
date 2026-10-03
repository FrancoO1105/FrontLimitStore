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

import { ModeloService } from '../../services/modelo';


@Component({
  selector: 'app-modelos',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './modelo.html',

  styleUrl: './modelo.css'
})
export class Modelos implements OnInit {

 mostrarModalMarca = false;

guardandoMarca = false;

mensajeErrorMarca = '';

nuevaMarca = {
  nombre: '',
  estado: 1
};

abrirModalMarca(): void {

  this.nuevaMarca = {
    nombre: '',
    estado: 1
  };

  this.mensajeErrorMarca = '';

  this.guardandoMarca = false;

  this.mostrarModalMarca = true;

}

cerrarModalMarca(): void {

  if (this.guardandoMarca) {
    return;
  }

  this.mostrarModalMarca = false;

  this.mensajeErrorMarca = '';

}


  /* =========================================
     LISTADOS
  ========================================= */

  modelos: any[] = [];

  modelosFiltrados: any[] = [];

  marcas: any[] = [];


  /* =========================================
     ESTADO GENERAL
  ========================================= */

  busqueda = '';

  cargando = false;

  mensajeError = '';


  /* =========================================
     MODAL
  ========================================= */

  mostrarModal = false;

  esEdicion = false;

  guardando = false;

  cargandoModelo = false;

  mensajeErrorModal = '';

  idModeloEditando: number | null = null;


  modeloFormulario = {
    id_marca: null as number | null,
    nombre: '',
    estado: 1
  };


  constructor(
    private modeloService: ModeloService
  ) {}


  ngOnInit(): void {

    this.listarMarcas();

    this.listarModelos();

  }


  /* =========================================
     MARCAS
  ========================================= */

  listarMarcas(): void {

    this.modeloService
      .listarMarcas()
      .subscribe({

        next: (respuesta: any) => {

          this.marcas =
            Array.isArray(respuesta?.data)
              ? respuesta.data
              : [];

        },

        error: (error: any) => {

          console.error(
            'Error al listar marcas:',
            error
          );

        }

      });

  }


  /* =========================================
     MODELOS
  ========================================= */

  listarModelos(): void {

    this.cargando = true;

    this.mensajeError = '';


    this.modeloService
      .listar()
      .subscribe({

        next: (respuesta: any) => {

          this.modelos =
            Array.isArray(respuesta?.data)
              ? respuesta.data
              : [];

          this.aplicarFiltro();

          this.cargando = false;

        },

        error: (error: any) => {

          console.error(
            'Error al listar modelos:',
            error
          );

          this.modelos = [];

          this.modelosFiltrados = [];

          this.mensajeError =
            error?.error?.mensaje ||
            'No fue posible cargar los modelos.';

          this.cargando = false;

        }

      });

  }


  /* =========================================
     BUSCADOR
  ========================================= */

  buscar(): void {

    this.aplicarFiltro();

  }


  limpiarBusqueda(): void {

    this.busqueda = '';

    this.aplicarFiltro();

  }


  private aplicarFiltro(): void {

    const termino =
      this.busqueda
        .trim()
        .toLowerCase();


    if (!termino) {

      this.modelosFiltrados =
        [...this.modelos];

      return;

    }


    this.modelosFiltrados =
      this.modelos.filter(
        (modelo: any) => {

          const texto = [

            modelo.nombre,

            modelo.marca

          ]
            .filter(
              valor =>
                valor !== null &&
                valor !== undefined
            )
            .join(' ')
            .toLowerCase();


          return texto.includes(
            termino
          );

        }
      );

  }


  /* =========================================
     NUEVO
  ========================================= */

  nuevoModelo(): void {

    this.esEdicion = false;

    this.idModeloEditando = null;

    this.mensajeErrorModal = '';

    this.guardando = false;

    this.cargandoModelo = false;


    this.modeloFormulario = {

      id_marca: null,

      nombre: '',

      estado: 1

    };


    this.mostrarModal = true;

  }


  /* =========================================
     EDITAR
  ========================================= */

  editarModelo(
    modelo: any
  ): void {

    const id =
      Number(modelo.id);


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      console.error(
        'ID de modelo inválido:',
        modelo
      );

      return;

    }


    this.esEdicion = true;

    this.idModeloEditando = id;

    this.mensajeErrorModal = '';

    this.cargandoModelo = true;

    this.mostrarModal = true;


    this.modeloService
      .obtenerPorId(id)
      .subscribe({

        next: (respuesta: any) => {

          const modeloBD =
            respuesta?.data;


          if (!modeloBD) {

            this.mensajeErrorModal =
              'No fue posible cargar el modelo.';

            this.cargandoModelo = false;

            return;

          }


          this.modeloFormulario = {

            id_marca:
              Number(
                modeloBD.id_marca
              ),

            nombre:
              modeloBD.nombre ?? '',

            estado:
              Number(
                modeloBD.estado ?? 1
              )

          };


          this.cargandoModelo = false;

        },

        error: (error: any) => {

          console.error(
            'Error al obtener modelo:',
            error
          );


          this.mensajeErrorModal =
            error?.error?.mensaje ||
            'No fue posible cargar el modelo.';


          this.cargandoModelo = false;

        }

      });

  }


  /* =========================================
     GUARDAR
  ========================================= */

  guardarModelo(): void {

    this.mensajeErrorModal = '';


    if (
      !this.modeloFormulario.id_marca
    ) {

      this.mensajeErrorModal =
        'Debe seleccionar una marca.';

      return;

    }


    const nombre =
      String(
        this.modeloFormulario.nombre ?? ''
      ).trim();


    if (!nombre) {

      this.mensajeErrorModal =
        'Debe ingresar el nombre del modelo.';

      return;

    }


    const data = {

      id_marca:
        Number(
          this.modeloFormulario.id_marca
        ),

      nombre,

      estado:
        Number(
          this.modeloFormulario.estado
        )

    };


    this.guardando = true;


    if (
      this.esEdicion &&
      this.idModeloEditando
    ) {

      this.actualizarModelo(
        data
      );

    } else {

      this.crearModelo(
        data
      );

    }

  }


  /* =========================================
     CREAR
  ========================================= */

  private crearModelo(
    data: any
  ): void {

    this.modeloService
      .crear(data)
      .subscribe({

        next: () => {

          this.guardando = false;

          this.cerrarModal();

          this.listarModelos();

        },

        error: (error: any) => {

          this.manejarError(
            error
          );

        }

      });

  }


  /* =========================================
     ACTUALIZAR
  ========================================= */

  private actualizarModelo(
    data: any
  ): void {

    if (
      !this.idModeloEditando
    ) {

      this.guardando = false;

      return;

    }


    this.modeloService
      .actualizar(
        this.idModeloEditando,
        data
      )
      .subscribe({

        next: () => {

          this.guardando = false;

          this.cerrarModal();

          this.listarModelos();

        },

        error: (error: any) => {

          this.manejarError(
            error
          );

        }

      });

  }


  /* =========================================
     ERROR
  ========================================= */

  private manejarError(
    error: any
  ): void {

    console.error(
      'Error guardando modelo:',
      error
    );


    this.guardando = false;


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
      'Ocurrió un error al guardar el modelo.';

  }


  /* =========================================
     CERRAR MODAL
  ========================================= */

  cerrarModal(): void {

    if (this.guardando) {
      return;
    }

    


    this.mostrarModal = false;

    this.esEdicion = false;

    this.idModeloEditando = null;

    this.cargandoModelo = false;

    this.mensajeErrorModal = '';


    this.modeloFormulario = {

      id_marca: null,

      nombre: '',

      estado: 1

    };

  }

  guardarMarca(): void {

  this.mensajeErrorMarca = '';

  const nombre =
    String(
      this.nuevaMarca.nombre ?? ''
    ).trim();


  if (!nombre) {

    this.mensajeErrorMarca =
      'Debe ingresar el nombre de la marca.';

    return;
  }


  const data = {
    nombre,
    estado: 1
  };


  this.guardandoMarca = true;


  this.modeloService
    .crearMarca(data)
    .subscribe({

      next: (respuesta: any) => {

        const idNuevaMarca =
          Number(
            respuesta?.id
          );


        this.guardandoMarca = false;

        this.mostrarModalMarca = false;


        // Recargar marcas
        this.recargarMarcasSeleccionando(
          idNuevaMarca
        );

      },

      error: (error: any) => {

        console.error(
          'Error al crear marca:',
          error
        );


        this.guardandoMarca = false;


        this.mensajeErrorMarca =
          error?.error?.mensaje ||
          'No fue posible crear la marca.';

      }

    });

}

private recargarMarcasSeleccionando(
  idMarca: number
): void {

  this.modeloService
    .listarMarcas()
    .subscribe({

      next: (respuesta: any) => {

        this.marcas =
          Array.isArray(
            respuesta?.data
          )
            ? respuesta.data
            : [];


        if (
          Number.isInteger(idMarca) &&
          idMarca > 0
        ) {

          this.modeloFormulario.id_marca =
            idMarca;

        }

      },

      error: (error: any) => {

        console.error(
          'Error al recargar marcas:',
          error
        );

      }

    });

}
  

}