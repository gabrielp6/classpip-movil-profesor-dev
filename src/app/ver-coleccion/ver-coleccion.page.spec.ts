import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerColeccionPage } from './ver-coleccion.page';

describe('VerColeccionPage', () => {
  let component: VerColeccionPage;
  let fixture: ComponentFixture<VerColeccionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerColeccionPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerColeccionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
