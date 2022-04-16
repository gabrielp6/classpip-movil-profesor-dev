import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearJuegoRapidoPage } from './crear-juego-rapido.page';

describe('CrearJuegoRapidoPage', () => {
  let component: CrearJuegoRapidoPage;
  let fixture: ComponentFixture<CrearJuegoRapidoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrearJuegoRapidoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearJuegoRapidoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
