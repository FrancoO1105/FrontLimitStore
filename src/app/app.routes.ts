import { Routes } from '@angular/router';
import { AdminShell } from './pages/admin-shell/admin-shell';
import { Categorias } from './pages/categorias/categorias';
import { authGuard, authChildGuard, adminGuard } from './guards/auth-guard';


export const routes: Routes = [

  {
    path: 'admin',
    component: AdminShell,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [

      {
  path: '',
  pathMatch: 'full',
  redirectTo: 'home'
},

{
  path: 'home',
  loadComponent: () =>
    import('./pages/menu-principal/menu-principal')
      .then(m => m.MenuPrincipalComponent)
},
      {
        path: 'lista-productos',
        loadComponent: () =>
          import('./pages/producto/producto')
            .then(m => m.Productos)
      },

      {
        path: 'categorias',
        canActivate: [adminGuard],
        component: Categorias
      },

      {
        path: 'marcas',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/marcas/marcas')
            .then(m => m.Marcas)
      },
      {
        path: 'modelos',
        canActivate: [adminGuard],

        loadComponent: () =>
          import('./pages/modelo/modelo')
            .then(m => m.Modelos)
      },
      {
        path: 'promociones',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/promocion/promocion')
            .then(m => m.Promociones)
      },
      {
        path: 'carga-masiva-productos',
        canActivate: [adminGuard],

        loadComponent: () =>
          import('./pages/carga-masiva-productos/carga-masiva-productos')
            .then(m =>m.CargaMasivaProductos)
      },
      {
        path: 'ventas',

        loadComponent: () =>
          import('./pages/ventas/ventas')
            .then(
              m => m.Ventas
            )
      }

    ]
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login/login')
        .then(m => m.Login)
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];
