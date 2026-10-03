import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargaMasivaProductos } from './carga-masiva-productos';

describe('CargaMasivaProductos', () => {
  let component: CargaMasivaProductos;
  let fixture: ComponentFixture<CargaMasivaProductos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [CargaMasivaProductos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CargaMasivaProductos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
