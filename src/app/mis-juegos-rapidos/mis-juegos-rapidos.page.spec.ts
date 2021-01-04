import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MisJuegosRapidosPage } from './mis-juegos-rapidos.page';

describe('MisJuegosRapidosPage', () => {
  let component: MisJuegosRapidosPage;
  let fixture: ComponentFixture<MisJuegosRapidosPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MisJuegosRapidosPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MisJuegosRapidosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
