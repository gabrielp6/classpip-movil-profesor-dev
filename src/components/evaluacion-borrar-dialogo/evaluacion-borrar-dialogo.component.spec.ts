import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionBorrarDialogoComponent } from './evaluacion-borrar-dialogo.component';

describe('EvaluacionBorrarDialogoComponent', () => {
  let component: EvaluacionBorrarDialogoComponent;
  let fixture: ComponentFixture<EvaluacionBorrarDialogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluacionBorrarDialogoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluacionBorrarDialogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
