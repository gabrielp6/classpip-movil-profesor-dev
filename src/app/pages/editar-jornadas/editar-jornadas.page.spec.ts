import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarJornadasPage } from './editar-jornadas.page';

describe('EditarJornadasPage', () => {
  let component: EditarJornadasPage;
  let fixture: ComponentFixture<EditarJornadasPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarJornadasPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarJornadasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
