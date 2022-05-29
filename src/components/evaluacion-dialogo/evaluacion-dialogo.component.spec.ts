import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionDialogoComponent } from './evaluacion-dialogo.component';

describe('EvaluacionDialogoComponent', () => {
  let component: EvaluacionDialogoComponent;
  let fixture: ComponentFixture<EvaluacionDialogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluacionDialogoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluacionDialogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
