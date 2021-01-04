import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JuegoCuestionarioRapidoPage } from './juego-cuestionario-rapido.page';

describe('JuegoCuestionarioRapidoPage', () => {
  let component: JuegoCuestionarioRapidoPage;
  let fixture: ComponentFixture<JuegoCuestionarioRapidoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JuegoCuestionarioRapidoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JuegoCuestionarioRapidoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
