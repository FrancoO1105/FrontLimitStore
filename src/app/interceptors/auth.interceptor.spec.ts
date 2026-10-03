import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { appConfig } from '../app.config';
import { API_URL } from '../services/api.config';

describe('Configuración HTTP de la aplicación', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [...appConfig.providers, provideHttpClientTesting()] });
    localStorage.setItem('token', 'test-token');
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });
  it('adjunta el token al ajuste de stock mediante el interceptor configurado', () => {
    TestBed.inject(HttpClient).post(API_URL + '/productos/1/stock', {}).subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne(API_URL + '/productos/1/stock');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush({});
  });
  it('no envía credenciales a recursos ajenos a la API', () => {
    TestBed.inject(HttpClient).get('https://example.com/data').subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne('https://example.com/data');
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({});
  });
});
