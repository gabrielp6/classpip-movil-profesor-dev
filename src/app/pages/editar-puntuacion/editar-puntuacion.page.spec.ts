import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPuntuacionPage } from './editar-puntuacion.page';

describe('EditarPuntuacionPage', () => {
  let component: EditarPuntuacionPage;
  let fixture: ComponentFixture<EditarPuntuacionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarPuntuacionPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarPuntuacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
