import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionGanadorPage } from './asignacion-ganador.page';

describe('AsignacionGanadorPage', () => {
  let component: AsignacionGanadorPage;
  let fixture: ComponentFixture<AsignacionGanadorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsignacionGanadorPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignacionGanadorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
