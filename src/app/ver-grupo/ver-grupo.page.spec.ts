import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerGrupoPage } from './ver-grupo.page';

describe('VerGrupoPage', () => {
  let component: VerGrupoPage;
  let fixture: ComponentFixture<VerGrupoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerGrupoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerGrupoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
