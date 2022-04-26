import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DialogData} from '../evaluacion-dialogo/evaluacion-dialogo.component';
import {JuegoDeEvaluacion} from '../../../clases/JuegoDeEvaluacion';
import {PeticionesAPIService} from '../../../services';
import {AlumnoJuegoDeEvaluacion} from '../../../clases/AlumnoJuegoDeEvaluacion';
import {EquipoJuegoDeEvaluacion} from '../../../clases/EquipoJuegoDeEvaluacion';

export interface DialogData {
  juego: JuegoDeEvaluacion;
  evaluadorId: number;
  evaluadoId: number;
  alumnosDeEquipo: [];
  profesor: boolean;
}

@Component({
  selector: 'app-evaluacion-borrar-dialogo',
  templateUrl: './evaluacion-borrar-dialogo.component.html',
  styleUrls: ['./evaluacion-borrar-dialogo.component.scss']
})
export class EvaluacionBorrarDialogoComponent implements OnInit {

  isDeleting = false;

  constructor(
    public dialogRef: MatDialogRef<EvaluacionBorrarDialogoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public peticionesAPI: PeticionesAPIService
  ) { }

  ngOnInit() {
    console.log(this.data);
  }

  delete(): void {
    this.isDeleting = true;
    if (this.data.juego.Modo === 'Individual') {
      this.peticionesAPI.DameRelacionAlumnosJuegoDeEvaluacion(this.data.juego.id)
        .subscribe((res: AlumnoJuegoDeEvaluacion[]) => {
          const relacion = res.find(item => item.alumnoId === this.data.evaluadoId);
          if (typeof relacion === 'undefined' || relacion.respuestas === null) {
            console.log('no se ha encontrado la nota', res);
            this.dialogRef.close(res);
            return;
          }
          let respuestas: object;
          if (this.data.profesor) {
            respuestas = relacion.respuestas.filter(item => !item.profesorId);
          } else {
            respuestas = relacion.respuestas.filter(item => item.alumnoId !== this.data.evaluadorId);
          }
          this.peticionesAPI.EnviarRespuestaAlumnosJuegoDeEvaluacion(relacion.id, {respuestas})
            .subscribe((res2: AlumnoJuegoDeEvaluacion) => {
              console.log(res2);
              console.log('Pre-change', res);
              res = res.map((item) => item.id === res2.id ? res2 : item);
              console.log('Post-change', res);
              this.dialogRef.close(res);
            });
        });
    } else if (this.data.juego.Modo === 'Equipos') {
      this.peticionesAPI.DameRelacionEquiposJuegoDeEvaluacion(this.data.juego.id)
        .subscribe((res: EquipoJuegoDeEvaluacion[]) => {
          const relacion = res.find(item => item.equipoId === this.data.evaluadoId);
          if (typeof relacion === 'undefined' || relacion.respuestas === null) {
            console.log('no se ha encontrado la nota', res);
            this.dialogRef.close(res);
            return;
          }
          console.log(relacion);
          let respuestas: object;
          if (this.data.profesor) {
            respuestas = relacion.respuestas.filter(item => !item.profesorId);
          } else if (relacion.alumnosEvaluadoresIds === null) {
            const alumnos = this.data.alumnosDeEquipo.find(item => item.equipoId === this.data.evaluadorId).alumnos.map(item => item.id);
            respuestas = relacion.respuestas.filter(item => !alumnos.includes(item.alumnoId));
          } else {
            respuestas = relacion.respuestas.filter(item => item.alumnoId !== this.data.evaluadorId);
          }
          this.peticionesAPI.EnviarRespuestaEquiposJuegoDeEvaluacion(relacion.id, {respuestas})
            .subscribe((res2: EquipoJuegoDeEvaluacion) => {
              console.log(res2);
              console.log('Pre-change', res);
              res = res.map((item) => item.id === res2.id ? res2 : item);
              console.log('Post-change', res);
              this.dialogRef.close(res);
            });
        });
    }
  }

  close(): void {
    this.dialogRef.close();
  }

}
