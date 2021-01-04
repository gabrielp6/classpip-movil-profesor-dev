import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JuegoEncuestaRapidaPage } from './juego-encuesta-rapida.page';

describe('JuegoEncuestaRapidaPage', () => {
  let component: JuegoEncuestaRapidaPage;
  let fixture: ComponentFixture<JuegoEncuestaRapidaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JuegoEncuestaRapidaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JuegoEncuestaRapidaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
