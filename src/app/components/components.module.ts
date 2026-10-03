// src/app/components/components.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Ya NO importes Footer, Navbar, Sidebar, ni MenuPrincipalComponent aquí

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  // NO DECLARES los componentes standalone aquí
  declarations: [],
  exports: []
})
export class ComponentsModule { }
