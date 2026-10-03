import { of, throwError } from 'rxjs';
import { Productos } from './producto';

describe('Edición y ajuste de inventario', () => {
  let component: Productos;
  let api: any;
  beforeEach(() => {
    api = jasmine.createSpyObj('ProductoService', ['actualizar', 'ajustarStock', 'listar']);
    api.actualizar.and.returnValue(of({ ok: true }));
    api.listar.and.returnValue(of({ data: [], catalogos: {} }));
    component = new Productos(api, { isAdmin: () => true } as any);
    component.esEdicion = true;
    component.idProductoEditando = 1;
    component.modelos = [{ id: 1, id_marca: 1 }];
    component.productoFormulario = {
      nombre: 'Producto', id_categoria: 1, id_marca: 1, id_modelo: 1, id_tipo_producto: 1,
      precio_compra: 60, precio_venta: 100, stock_actual: 10, stock_minimo: 1, estado: 1
    };
  });
  it('guardar datos no envía el stock antiguo al servidor', () => {
    component.guardarProducto();
    expect(api.actualizar).toHaveBeenCalled();
    expect(api.actualizar.calls.mostRecent().args[1].stock_actual).toBeUndefined();
  });
  it('aplica ajustes separados y muestra el stock devuelto por el servidor', () => {
    api.ajustarStock.and.returnValue(of({ data: { stock_actual: 11 } }));
    component.cantidadAjuste = 3;
    component.motivoAjuste = 'Recepción';
    component.ajustarStock();
    expect(api.ajustarStock).toHaveBeenCalledWith(1, 3, 'Recepción');
    expect(component.productoFormulario.stock_actual).toBe(11);
    expect(api.actualizar).not.toHaveBeenCalled();
  });
  it('un ajuste rechazado conserva el formulario y muestra el motivo', () => {
    api.ajustarStock.and.returnValue(throwError(() => ({ error: { mensaje: 'Stock insuficiente' } })));
    component.cantidadAjuste = -20;
    component.motivoAjuste = 'Corrección';
    component.ajustarStock();
    expect(component.productoFormulario.stock_actual).toBe(10);
    expect(component.mensajeErrorModal).toBe('Stock insuficiente');
    expect(component.guardandoProducto).toBeFalse();
  });
});
