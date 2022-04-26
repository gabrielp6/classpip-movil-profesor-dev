import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {JuegoDeEvaluacion} from '../../../clases/JuegoDeEvaluacion';
import {Alumno, Equipo, Rubrica} from '../../../clases';
import {AlumnoJuegoDeEvaluacion} from '../../../clases/AlumnoJuegoDeEvaluacion';
import {EquipoJuegoDeEvaluacion} from '../../../clases/EquipoJuegoDeEvaluacion';
import {PeticionesAPIService} from '../../../services';

export interface DialogData {
  juego: JuegoDeEvaluacion;
  rubrica: Rubrica;
  alumnos: Alumno[];
  alumnosRelacion: AlumnoJuegoDeEvaluacion[];
  equipos: Equipo[];
  equiposRelacion: EquipoJuegoDeEvaluacion[];
  alumnosDeEquipo;
  evaluadorId: number;
  evaluadoId: number;
  profesor: boolean;
  editable: boolean;
  global: boolean;

  notaMedia: number | string;

}

@Component({
  selector: 'app-evaluacion-dialogo',
  templateUrl: './evaluacion-dialogo.component.html',
  styleUrls: ['./evaluacion-dialogo.component.scss']
})
export class EvaluacionDialogoComponent implements OnInit {

  respuestaEvaluacion: Array<any>;
  respuestaProfesor: Array<any>;
  // Form elements
  allCompleted: Array<boolean>;
  indeterminated: Array<boolean>;
  comentario = '';
  isLoading = false;
  evaluadores = [];
  respuestasPreguntasAbiertas;
  nombreEquipoEvaluado;

  constructor(
    public dialogRef: MatDialogRef<EvaluacionDialogoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public peticionesAPI: PeticionesAPIService
  ) { }

  ngOnInit() {
    console.log ('datos');
    console.log (this.data);
    if (this.data.juego.rubricaId > 0) {
      console.log ('datos');
      console.log (this.data);
      // juego con rúbrica
      if (this.data.editable) {
        this.respuestaEvaluacion = new Array<any>(this.data.rubrica.Criterios.length);
        this.data.rubrica.Criterios.forEach((item, index) => {
          this.respuestaEvaluacion[index] = new Array<boolean>(this.data.rubrica.Criterios[index].Elementos.length).fill(false);
        });
        this.respuestaEvaluacion.push('');
        this.allCompleted = new Array<boolean>(this.data.rubrica.Criterios.length).fill(false);
        this.indeterminated = new Array<boolean>(this.data.rubrica.Criterios.length).fill(false);
        return;
      }
      if (this.data.juego.Modo === 'Individual') {
        const evaluado = this.data.alumnosRelacion.find(item => item.alumnoId === this.data.evaluadoId);
        console.log ('evaluado');
        console.log (evaluado);
        if (this.data.profesor) {
          this.respuestaEvaluacion = evaluado.respuestas.find(item => item.profesorId).respuesta;
        } else if (this.data.global) {
          this.respuestaEvaluacion = evaluado.respuestas.map(item => item.respuesta);
        } else {
          this.respuestaEvaluacion = evaluado.respuestas.find(item => item.alumnoId === this.data.evaluadorId).respuesta;
        }
      } else if (this.data.juego.Modo === 'Equipos') {
        const evaluado = this.data.equiposRelacion.find(item => item.equipoId === this.data.evaluadoId);
        if (this.data.profesor) {
          this.respuestaEvaluacion = evaluado.respuestas.find(item => item.profesorId).respuesta;
        } else if (this.data.global) {
          this.respuestaEvaluacion = evaluado.respuestas.map(item => item.respuesta);
        } else if (evaluado.alumnosEvaluadoresIds !== null) {
          this.respuestaEvaluacion = evaluado.respuestas.find(item => item.alumnoId === this.data.evaluadorId).respuesta;
        } else {
          // tslint:disable-next-line:max-line-length
          const alumnosDeEquipo = this.data.alumnosDeEquipo.find(item => item.equipoId === this.data.evaluadorId).alumnos.map(item => item.id);
          this.respuestaEvaluacion = evaluado.respuestas.find(item => alumnosDeEquipo.includes(item.alumnoId)).respuesta;
        }
      }
      console.log('respuesta evaluacion', this.respuestaEvaluacion);
    } else {
      // juego con preguntas abiertas
      this.respuestasPreguntasAbiertas = Array(this.data.juego.PreguntasAbiertas.length).fill(undefined);

      if (this.data.juego.Modo === 'Individual') {
        const evaluado = this.data.alumnosRelacion.find(item => item.alumnoId === this.data.evaluadoId);
        console.log ('alumno evaluado');
        console.log (evaluado);
      //  this.nombreEquipoEvaluado = this.data.equipos.find (equipo => equipo.id === this.data.evaluadoId).Nombre;
        if (this.data.global) {
          const respuestasAlumnos = evaluado.respuestas.filter (item => item.alumnoId);
          this.respuestaEvaluacion = respuestasAlumnos.map(item => item.respuesta);
          // puede que haya también respuesta del profeesor
          const respuestaProfesor = evaluado.respuestas.filter (item => item.profesorId);
          this.respuestaProfesor = respuestaProfesor.map(item => item.respuesta);
          // Eso me da un vector con una sola posición. La respuesta es el contenido de esa posición
          this.respuestaProfesor =  this.respuestaProfesor [0];
          console.log ('repsuesta profesor');
          console.log (this.respuestaProfesor);
          // preparo los nombres de los evaluadores
          let evaluadoresId = evaluado.respuestas.map(item => item.alumnoId);
          // Si entre los evaluadores esta el profesor entonces mete un undefined que lo elimino a continuación
          evaluadoresId = evaluadoresId.filter (evaluador => evaluador !== undefined);

          evaluadoresId.forEach (id => {
            this.evaluadores.push (this.data.alumnos.find (alumno => alumno.id === Number(id)));
          });

        } else if (this.data.profesor) {
          if (!this.data.editable) {
            this.respuestaEvaluacion = evaluado.respuestas.find(item => item.profesorId).respuesta;
          } else {
            this.respuestasPreguntasAbiertas = Array(this.data.juego.PreguntasAbiertas.length).fill(undefined);
          }

        } else {
          this.respuestaEvaluacion = evaluado.respuestas.find(item => item.alumnoId === this.data.evaluadorId).respuesta;
        }
      } else if (this.data.juego.Modo === 'Equipos') {
        const evaluado = this.data.equiposRelacion.find(item => item.equipoId === this.data.evaluadoId);
        if (this.data.global) {
          console.log ('evaluado');
          console.log (evaluado);
          // Las respuestas de los equipos vienen identificadas con el id del alumno que respondió
          const respuestasEquipos = evaluado.respuestas.filter (item => item.alumnoId);
          this.respuestaEvaluacion = respuestasEquipos.map(item => item.respuesta);

          // puede que haya también respuesta del profeesor
          const respuestaProfesor = evaluado.respuestas.filter (item => item.profesorId);
          this.respuestaProfesor = respuestaProfesor.map(item => item.respuesta);
          // Eso me da un vector con una sola posición. La respuesta es el contenido de esa posición
          this.respuestaProfesor =  this.respuestaProfesor [0];
          console.log ('repsuesta profesor');
          console.log (this.respuestaProfesor);
          // preparo los nombres de los evaluadores
          let evaluadoresId = evaluado.respuestas.map(item => item.alumnoId);
          // Si entre los evaluadores esta el profesor entonces mete un undefined que lo elimino a continuación
          evaluadoresId = evaluadoresId.filter (evaluador => evaluador !== undefined);
          console.log ('ID de equipos evaluadores');
          console.log (evaluadoresId);

          //// ESTO ES LO QUE HAY QUE HACER PARA PREPARAR LOS NOMBRES DE LOS EVALUADORES SI LOS EVALUADORES SON EQUIPOS
          // A partir de los id de los alumnos evaluadores creo la lista de los nombres de los equipos a los que pertenecen.
          if (this.data.equiposRelacion[0].alumnosEvaluadoresIds === null) {
            console.log('Equipos evaluados por equipos');
            evaluadoresId.forEach (id => {
              const equipoId = this.data.alumnosDeEquipo.find (equipo => equipo.alumnos.some (alumno => alumno.id === id)).equipoId;
              const nombreEquipo = this.data.equipos.find (equipo => equipo.id === equipoId).Nombre;
              this.evaluadores.push (nombreEquipo);
            });
          } else {
            //// ESTO ES LO QUE HAY QUE HACER PARA PREPARAR LOS NOMBRES DE LOS EVALUADORES SI LOS EVALUADORES SON ALUMNOS
            evaluadoresId.forEach (id => {
              this.evaluadores.push (this.data.alumnos.find (alumno => alumno.id === Number(id)));
            });
          }


          console.log ('nombre de evaluadores');
          console.log (this.evaluadores);

        } else if (this.data.profesor) {
          if (!this.data.editable) {
            this.respuestaEvaluacion = evaluado.respuestas.find(item => item.profesorId).respuesta;
          } else {
            this.respuestasPreguntasAbiertas = Array(this.data.juego.PreguntasAbiertas.length).fill(undefined);
          }

        } else {
          //Aqui tengo que distinguir entre evaluación por equipos y evaluación por individuos
          // lo que hay aqui es para evaluación por equipos
            console.log ('equipos evaluados por equipos');
            // Recojo los id de los alumnos que pertenecen al equipo evaluador
          // tslint:disable-next-line:max-line-length
          ///ESTO ES LO QUE HAY QUE HACER SI EQUIPOS POR EQUIPOS
            if (this.data.equiposRelacion[0].alumnosEvaluadoresIds === null) {
              // tslint:disable-next-line:max-line-length
              const alumnosDeEquipo = this.data.alumnosDeEquipo.find(item => item.equipoId === this.data.evaluadorId).alumnos.map(item => item.id);
              // Ahora cojo la respuesta del alumno cuyo id esta en la lista de alumnosDeEquipo
              this.respuestaEvaluacion = evaluado.respuestas.find(item => alumnosDeEquipo.includes(item.alumnoId)).respuesta;
            } else {
              ///ESTO ES LO QUE HAY QUE HACER SI EQUIPOS POR ALUMNOS
              this.respuestaEvaluacion = evaluado.respuestas.find(item => item.alumnoId === this.data.evaluadorId).respuesta;
            }
            console.log ('respuestasEvaluacion');
            console.log (this.respuestaEvaluacion);
        }
      }

    }
  }


  CalcularNotaCriterio(index: number): number {
    console.log ('voy a calcular la nota del criterio ' + index);
    console.log (this.respuestaEvaluacion);
    let subNota: number;
    if (this.data.juego.metodoSubcriterios) {
      subNota = 0;
      for (let j = 1; j < this.data.juego.Pesos[index].length; j++) {
        if (this.respuestaEvaluacion[index][j - 1]) {
          subNota += this.data.juego.Pesos[index][j] / 10;
        }
      }
    } else {
      subNota = 10;
      const fallos = this.respuestaEvaluacion[index].filter(item => item === false).length;
      if (fallos > 0) {
        let minimo: number;
        let rangoMinimo;
        let maximo: number;
        minimo = Math.min.apply(Math, this.data.juego.Penalizacion[index].map(item => item.num));
        if (fallos >= minimo) {
          rangoMinimo = this.data.juego.Penalizacion[index].filter(item => item.num <= fallos);
          if (rangoMinimo.length === 0) {
            maximo = Math.max.apply(Math, this.data.juego.Penalizacion[index].map(item => item.num));
          } else {
            maximo = Math.max.apply(Math, rangoMinimo.map(item => item.num));
          }
          const penalizacion = this.data.juego.Penalizacion[index].find(item => item.num === maximo).p;
          subNota = penalizacion / 10;
        }
      }
    }
    return Math.round((subNota + Number.EPSILON) * 100) / 100;
  }

  CalcularNotaFinal(): number {
    let finalNota = 0;
    let subNota: number;
    if (this.data.juego.metodoSubcriterios) {
      for (let i = 0; i < this.data.juego.Pesos.length; i++) {
        subNota = 0;
        for (let j = 1; j < this.data.juego.Pesos[i].length; j++) {
          if (this.respuestaEvaluacion[i][j - 1]) {
            subNota += this.data.juego.Pesos[i][j] / 10;
          }
        }
        finalNota += subNota * this.data.juego.Pesos[i][0] / 100;
      }
    } else {
      for (let i = 0; i < this.data.juego.Penalizacion.length - 1; i++) {
        subNota = 10;
        const fallos = this.respuestaEvaluacion[i].filter(item => item === false).length;
        if (fallos > 0) {
          let minimo: number;
          let rangoMinimo;
          let maximo: number;
          minimo = Math.min.apply(Math, this.data.juego.Penalizacion[i].map(item => item.num));
          if (fallos >= minimo) {
            rangoMinimo = this.data.juego.Penalizacion[i].filter(item => item.num <= fallos);
            if (rangoMinimo.length === 0) {
              maximo = Math.max.apply(Math, this.data.juego.Penalizacion[i].map(item => item.num));
            } else {
              maximo = Math.max.apply(Math, rangoMinimo.map(item => item.num));
            }
            const penalizacion = this.data.juego.Penalizacion[i].find(item => item.num === maximo).p;
            subNota = penalizacion / 10;
          }
        }
        finalNota += subNota * this.data.juego.Penalizacion[this.data.juego.Penalizacion.length - 1][i] / 100;
      }
    }
    return Math.round((finalNota + Number.EPSILON) * 100) / 100;
  }

  numeroDeFallos(index: number): number {
    return this.respuestaEvaluacion[index].filter(item => item === false).length;
  }

  CalcularNotasCriterios(index: number): number {
    console.log ('voy a calcular la nota del criterio ' + index);
    console.log (this.respuestaEvaluacion);
    let subNota;
    let notaCriterio = 0;
    if (this.data.juego.metodoSubcriterios) {
      subNota = 0;
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.respuestaEvaluacion.length; i++) {
        for (let j = 1; j < this.data.juego.Pesos[index].length; j++) {
          if (this.respuestaEvaluacion[i][index][j - 1]) {
            subNota += this.data.juego.Pesos[index][j] / 10;
          }
          notaCriterio += subNota / this.respuestaEvaluacion.length;
          subNota = 0;
        }
      }
      return Math.round((notaCriterio + Number.EPSILON) * 100) / 100;
    } else {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.respuestaEvaluacion.length; i++) {
        subNota = 10;
        const fallos = this.respuestaEvaluacion[i][index].filter(item => item === false).length;
        if (fallos > 0) {
          let minimo: number;
          let rangoMinimo;
          let maximo: number;
          minimo = Math.min.apply(Math, this.data.juego.Penalizacion[index].map(item => item.num));
          if (fallos >= minimo) {
            rangoMinimo = this.data.juego.Penalizacion[index].filter(item => item.num <= fallos);
            if (rangoMinimo.length === 0) {
              maximo = Math.max.apply(Math, this.data.juego.Penalizacion[index].map(item => item.num));
            } else {
              maximo = Math.max.apply(Math, rangoMinimo.map(item => item.num));
            }
            const penalizacion = this.data.juego.Penalizacion[index].find(item => item.num === maximo).p;
            subNota = penalizacion / 10;
          }
        }
        notaCriterio += subNota / this.respuestaEvaluacion.length;
      }
      return Math.round((notaCriterio + Number.EPSILON) * 100) / 100;
    }
  }

  numeroMarcados(i: number, j: number): number {
    // console.log(i, j, this.respuestaEvaluacion);
    return this.respuestaEvaluacion.map(item => item[i][j]).filter(item => item === true).length;
  }

  MostrarComentario(i: number): string {
    let evaluado;
    if (this.data.juego.Modo === 'Individual') {
      evaluado = this.data.alumnosRelacion.find(item => item.alumnoId === this.data.evaluadoId);
    } else if (this.data.juego.Modo === 'Equipos') {
      evaluado = this.data.equiposRelacion.find(item => item.equipoId === this.data.evaluadoId);
    }
    const comentario = evaluado.respuestas[i].respuesta[evaluado.respuestas[i].respuesta.length - 1];
    if (comentario === '') {
      return null;
    }
    let autor: string;
    if (evaluado.respuestas[i].profesorId && evaluado.respuestas[i].profesorId === this.data.juego.profesorId) {
      autor = 'Profesor';
    } else if (evaluado.respuestas[i].alumnoId) {
      autor = this.data.alumnos.find(alumno => alumno.id === evaluado.respuestas[i].alumnoId).Username;
    } else {
      return null;
    }
    return autor + ': ' + comentario;
  }

  SetAll(i: number): void {
    if (this.respuestaEvaluacion[i] == null) {
      return;
    }
    setTimeout(() => {
      for (let j = 0; j < this.respuestaEvaluacion[i].length; j++) {
        this.respuestaEvaluacion[i][j] = this.allCompleted[i];
      }
    });
  }

  CheckboxChanged(i: number): void {
    if (this.respuestaEvaluacion[i] == null) {
      return;
    }
    const allItems = this.respuestaEvaluacion[i].length;
    const selectedItems = this.respuestaEvaluacion[i].filter(item => item === true).length;
    if (selectedItems > 0 && selectedItems < allItems) {
      this.indeterminated[i] = true;
      this.allCompleted[i] = false;
    } else if (selectedItems === allItems) {
      this.indeterminated[i] = false;
      this.allCompleted[i] = true;
    } else {
      this.indeterminated[i] = false;
      this.allCompleted[i] = false;
    }
  }
  async EnviarRespuesta() {
    if (!this.data.editable) {
      return;
    }
    if (this.data.juego.rubricaId > 0) {
      // juego con rubrica
      console.log ('voy a enviar resultados');
      if (!this.data.editable) {
        return;
      }
      this.isLoading = true;
      this.respuestaEvaluacion[this.respuestaEvaluacion.length - 1] = this.comentario;
      console.log('enviando respuesta evaluacion', this.respuestaEvaluacion);

      if (this.data.juego.Modo === 'Individual') {
        console.log ('juego individual');
        this.peticionesAPI.DameRelacionAlumnosJuegoDeEvaluacion(this.data.juego.id).subscribe((res) => {
          console.log ('tengo relacion alumnos');
          console.log (res);
          console.log ('alumno evaluado');
          console.log (this.data.evaluadoId);
          const tmp = res.find(item => item.alumnoId === this.data.evaluadoId);
          if (typeof tmp === 'undefined') {
            console.log('no se ha encontrado la relacion', res);
            this.dialogRef.close(res);
            return;
          } else {
            let respuestas: any[];
            if (tmp.respuestas === null) {
              respuestas = [];
            } else {
              if (tmp.respuestas.find(item => item.profesorId === this.data.evaluadorId)) {
                console.log('Ya he votado', res);
                this.dialogRef.close(res);
                return;
              }
              respuestas = tmp.respuestas;
            }
            respuestas.push({profesorId: this.data.evaluadorId, respuesta: this.respuestaEvaluacion});
            console.log ('voy a enviar respuesta');
            this.peticionesAPI.EnviarRespuestaAlumnosJuegoDeEvaluacion(tmp.id, {respuestas})
              .subscribe((res2) => {
                console.log ('respuesta enviada');
                console.log(res2);
                console.log('Pre-change', res);
                res = res.map((item) => item.id === res2.id ? res2 : item);
                console.log('Post-change', res);
                this.dialogRef.close(res);
              });
          }
        });
      } else if (this.data.juego.Modo === 'Equipos') {
        this.peticionesAPI.DameRelacionEquiposJuegoDeEvaluacion(this.data.juego.id).subscribe((res) => {
          const tmp = res.find(item => item.equipoId === this.data.evaluadoId);
          console.log(tmp);
          if (typeof tmp === 'undefined') {
            console.log('no se ha encontrado la relacion', res);
            this.dialogRef.close(res);
            return;
          }
          let respuestas: any[];
          if (tmp.respuestas === null) {
            respuestas = [];
          } else {
            if (tmp.respuestas.find(item => item.profesorId === this.data.evaluadorId)) {
              console.log('Ya he votado', res);
              this.dialogRef.close(res);
              return;
            }
            respuestas = tmp.respuestas;
          }
          respuestas.push({profesorId: this.data.evaluadorId, respuesta: this.respuestaEvaluacion});
          this.peticionesAPI.EnviarRespuestaEquiposJuegoDeEvaluacion(tmp.id, {respuestas})
            .subscribe((res2) => {
              console.log(res2);
              console.log('Pre-change', res);
              res = res.map((item) => item.id === res2.id ? res2 : item);
              console.log('Post-change', res);
              this.dialogRef.close(res);
            });
        });
      }
    } else {
      // juego con preguntas abiertas
      this.respuestaEvaluacion = this.respuestasPreguntasAbiertas;
      if (this.data.juego.Modo === 'Individual') {
        this.peticionesAPI.DameRelacionAlumnosJuegoDeEvaluacion(this.data.juego.id).subscribe((res) => {
          const tmp = res.find(item => item.alumnoId === this.data.evaluadoId);
          if (typeof tmp === 'undefined') {
            console.log('no se ha encontrado la relacion', res);
            this.dialogRef.close(res);
            return;
          } else {
            let respuestas: any[];
            if (tmp.respuestas === null) {
              respuestas = [];
            } else {
              if (tmp.respuestas.find(item => item.profesorId === this.data.evaluadorId)) {
                console.log('Ya he votado', res);
                this.dialogRef.close(res);
                return;
              }
              respuestas = tmp.respuestas;
            }
            respuestas.push({profesorId: this.data.evaluadorId, respuesta: this.respuestaEvaluacion});
            this.peticionesAPI.EnviarRespuestaAlumnosJuegoDeEvaluacion(tmp.id, {respuestas})
              .subscribe((res2) => {
                console.log(res2);
                console.log('Pre-change', res);
                res = res.map((item) => item.id === res2.id ? res2 : item);
                console.log('Post-change', res);
                this.dialogRef.close(res);
              });
          }
        });
      } else if (this.data.juego.Modo === 'Equipos') {
        this.peticionesAPI.DameRelacionEquiposJuegoDeEvaluacion(this.data.juego.id).subscribe((res) => {
          const tmp = res.find(item => item.equipoId === this.data.evaluadoId);
          console.log(tmp);
          if (typeof tmp === 'undefined') {
            console.log('no se ha encontrado la relacion', res);
            this.dialogRef.close(res);
            return;
          }
          let respuestas: any[];
          if (tmp.respuestas === null) {
            respuestas = [];
          } else {
            if (tmp.respuestas.find(item => item.profesorId === this.data.evaluadorId)) {
              console.log('Ya he votado', res);
              this.dialogRef.close(res);
              return;
            }
            respuestas = tmp.respuestas;
          }
          respuestas.push({profesorId: this.data.evaluadorId, respuesta: this.respuestaEvaluacion});
          this.peticionesAPI.EnviarRespuestaEquiposJuegoDeEvaluacion(tmp.id, {respuestas})
            .subscribe((res2) => {
              console.log(res2);
              console.log('Pre-change', res);
              res = res.map((item) => item.id === res2.id ? res2 : item);
              console.log('Post-change', res);
              this.dialogRef.close(res);
            });
        });
      }
    }
  }


  close(): void {
    this.dialogRef.close();
  }
}
