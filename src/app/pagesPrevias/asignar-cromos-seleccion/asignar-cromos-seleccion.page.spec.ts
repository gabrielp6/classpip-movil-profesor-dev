import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarCromosSeleccionPage } from './asignar-cromos-seleccion.page';

describe('AsignarCromosSeleccionPage', () => {
  let component: AsignarCromosSeleccionPage;
  let fixture: ComponentFixture<AsignarCromosSeleccionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsignarCromosSeleccionPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignarCromosSeleccionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
