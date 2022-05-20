import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Juego, Jornada, TablaJornadas, EnfrentamientoLiga, TablaAlumnoJuegoDeCompeticion,
  TablaEquipoJuegoDeCompeticion,
  AlumnoJuegoDeCompeticionLiga,
  EquipoJuegoDeCompeticionLiga, Alumno, Equipo, AlumnoJuegoDePuntos,
  EquipoJuegoDePuntos, AlumnoJuegoDeCuestionario, AlumnoJuegoDeVotacionUnoATodos} from './../../clases/index';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface Asignacion {modo: string; id: number;}

const ModoAsignacion: Asignacion[] = [
  {modo: 'Manualmente', id: 1},
  {modo: 'Aleatoriamente', id: 2},
  {modo: 'Según resultados de un juego', id: 3}
];

import { SesionService, CalculosService, PeticionesAPIService } from './../../services/index';
import {MatTableDataSource} from '@angular/material/table';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { Console } from 'console';

@Component({
  selector: 'app-asignacion-ganador',
  templateUrl: './asignacion-ganador.page.html',
  styleUrls: ['./asignacion-ganador.page.scss'],
})
export class AsignacionGanadorPage implements OnInit {

  selectionUno = new SelectionModel<any>(true, []);
  selectionDos = new SelectionModel<any>(true, []);
  selectionTres = new SelectionModel<any>(true, []);
  botonAsignarAleatorioDesactivado = true;
  botonAsignarManualDesactivado = true;
  botonAsignarJuegoDesactivado = true;
  modoAsignacion: Asignacion[] = ModoAsignacion;
  juegoSeleccionado: Juego;
  numeroTotalJornadas: number;
  jornadasDelJuego: Jornada[];
  JornadasCompeticion: TablaJornadas[] = [];
  jornadaId: number;
  juegoDisponibleSeleccionadoID: number;
  juegoDisponibleSeleccionado: Juego;
  modoAsignacionId: number;
  EnfrentamientosJornadaSeleccionada: EnfrentamientoLiga[] = [];
  resultados: number [] = [];
  listaAlumnosClasificacion: TablaAlumnoJuegoDeCompeticion[] = [];
  listaEquiposClasificacion: TablaEquipoJuegoDeCompeticion[] = [];
  listaAlumnosJuegoDePuntos: AlumnoJuegoDePuntos[];
  listaEquiposJuegoDePuntos: EquipoJuegoDePuntos[];
  listaAlumnosJuegoDeCuestionario: AlumnoJuegoDeCuestionario[];
  listaAlumnosJuegoDeVotacionUnoATodos: AlumnoJuegoDeVotacionUnoATodos[];
  juegosDisponibles: Juego[];
  juegosActivosPuntosModo: Juego[];
  juego: Juego[];
  NumeroDeJuegoDePuntos: number;
  dataSourceTablaGanadorIndividual;
  dataSourceTablaGanadorEquipo;
  displayedColumnsAlumno: string[] = ['select1', 'nombreJugadorUno', 'select2', 'nombreJugadorDos', 'select3', 'Empate'];
  asignados: boolean;

  constructor( public sesion: SesionService,
               public location: Location,
               public calculos: CalculosService,
               public peticionesAPI: PeticionesAPIService) { }

  ngOnInit() {

    this.juegoSeleccionado = this.sesion.DameJuego();
    console.log (this.juegoSeleccionado);
    this.numeroTotalJornadas = this.juegoSeleccionado.NumeroTotalJornadas;
    console.log (this.numeroTotalJornadas);
    const datos = this.sesion.DameDatosJornadas();
    console.log (datos);
    //this.JornadasCompeticion = datos.JornadasCompeticion;
    this.JornadasCompeticion = datos.jornadas;
    console.log("estas son las jornadas de Competicion @");
    console.log (this.JornadasCompeticion);

    if (this.juegoSeleccionado.Modo === 'Individual') {
      this.listaAlumnosClasificacion = this.sesion.DameTablaAlumnoJuegoDeCompeticion();
    } else {
      this.listaEquiposClasificacion = this.sesion.DameTablaEquipoJuegoDeCompeticion();
    } 
    
    this.juegosDisponibles = this.sesion.DameJuegosDePuntos().filter(juego => juego.Modo === this.juegoSeleccionado.Modo);   
    this.juegosDisponibles = this.juegosDisponibles.concat(this.sesion.DameJuegosDeCuestionariosAcabados());
    this.juegosDisponibles = this.juegosDisponibles.concat(this.sesion.DameJuegosDeVotacionUnoATodosAcabados());
    
    console.log ('Juegos para elegir ganadores ');
    console.log (this.juegosDisponibles);
    this.asignados = false;

  }

  ////////////////// FUNCIONES PARA OBTENER LOS DATOS NECESARIOS //////////////////////////
  ObtenerEnfrentamientosDeCadaJornada(jornadaId: number) {
    this.peticionesAPI.DameEnfrentamientosDeCadaJornadaLiga(jornadaId)
    .subscribe(enfrentamientos => {
      this.EnfrentamientosJornadaSeleccionada = enfrentamientos;
      this.ConstruirTablaElegirGanador();
    });
  }

  // Recupera las inscripciones de los alumnos en el juego y los puntos que tienen
  RecuperarInscripcionesAlumnosJuegoPuntos() {
    console.log ('voy a por las inscripciones ' + Number(this.juegoDisponibleSeleccionadoID));
    this.peticionesAPI.DameInscripcionesAlumnoJuegoDePuntos(Number(this.juegoDisponibleSeleccionadoID))
    .subscribe(inscripciones => {
      this.listaAlumnosJuegoDePuntos = inscripciones;
      console.log (this.listaAlumnosJuegoDePuntos);
    });
  }

  // Recupera las inscripciones de los alumnos en el juego y los puntos que tienen
  RecuperarInscripcionesEquiposJuegoPuntos() {
    console.log ('vamos por las inscripciones ' + Number(this.juegoDisponibleSeleccionadoID));
    this.peticionesAPI.DameInscripcionesEquipoJuegoDePuntos(Number(this.juegoDisponibleSeleccionadoID))
    .subscribe(inscripciones => {
      this.listaEquiposJuegoDePuntos = inscripciones;
      console.log(this.listaEquiposJuegoDePuntos);
      console.log ('ya tengo las inscripciones');
    });
  }

  RecuperarInscripcionesAlumnosJuegoCuestionario() {
    this.peticionesAPI.DameInscripcionesAlumnoJuegoDeCuestionario(this.juegoDisponibleSeleccionadoID)
    .subscribe(inscripciones => {
      this.listaAlumnosJuegoDeCuestionario = inscripciones;
    });
  }

  RecuperarInscripcionesAlumnosJuegoDeVotacionUnoATodos() {
    this.peticionesAPI.DameInscripcionesAlumnoJuegoDeVotacionUnoATodos(this.juegoDisponibleSeleccionadoID)
    .subscribe(inscripciones => {
      this.listaAlumnosJuegoDeVotacionUnoATodos = inscripciones;
    });

  }


  Disputada(jornadaId): boolean {
      return this.JornadasCompeticion.filter (jornada => jornada.id === Number(jornadaId))[0].Disputada;
  }

  ConstruirTablaElegirGanador() {
    if (this.juegoSeleccionado.Modo === 'Individual') {
      console.log('Estoy en ConstruirTablaElegirGanador() alumnos');
      for (let i = 0; i < this.EnfrentamientosJornadaSeleccionada.length; i++) {
   
        const JugadorUno = this.listaAlumnosClasificacion.filter (alumno => alumno.id === this.EnfrentamientosJornadaSeleccionada[i].JugadorUno )[0];

        this.EnfrentamientosJornadaSeleccionada[i].nombreJugadorUno = JugadorUno.nombre + ' ' + JugadorUno.primerApellido + ' ' + JugadorUno.segundoApellido;
        const JugadorDos = this.listaAlumnosClasificacion.filter (alumno => alumno.id === this.EnfrentamientosJornadaSeleccionada[i].JugadorDos)[0];
        this.EnfrentamientosJornadaSeleccionada[i].nombreJugadorDos = JugadorDos.nombre + ' ' + JugadorDos.primerApellido + ' ' + JugadorDos.segundoApellido;
      }
      console.log(this.EnfrentamientosJornadaSeleccionada);
      this.dataSourceTablaGanadorIndividual = new MatTableDataSource(this.EnfrentamientosJornadaSeleccionada);
      console.log('El dataSource es:');
      console.log(this.dataSourceTablaGanadorIndividual.data);

      // Ahora vamos a marcar los resultados en caso de que la jornada se haya disputado ya


      if (this.Disputada (this.jornadaId)) {
        for (let i = 0; i < this.EnfrentamientosJornadaSeleccionada.length; i++) {
          if (this.EnfrentamientosJornadaSeleccionada[i].Ganador === this.EnfrentamientosJornadaSeleccionada[i].JugadorUno) {
            this.selectionUno.select(this.dataSourceTablaGanadorIndividual.data[i]);
          } else if (this.EnfrentamientosJornadaSeleccionada[i].Ganador === this.EnfrentamientosJornadaSeleccionada[i].JugadorDos) {
            this.selectionDos.select(this.dataSourceTablaGanadorIndividual.data[i]);
          } else if (this.EnfrentamientosJornadaSeleccionada[i].Ganador === 0) {
            this.selectionTres.select(this.dataSourceTablaGanadorIndividual.data[i]);
          }
        }
      }

    } else {
      console.log('Estoy en ConstruirTablaElegirGanador() equipos');
      for (let i = 0; i < this.EnfrentamientosJornadaSeleccionada.length; i++) {
         // tslint:disable-next-line:max-line-length
         const EquipoUno = this.listaEquiposClasificacion.filter (equipo => equipo.id === this.EnfrentamientosJornadaSeleccionada[i].JugadorUno )[0];
         // tslint:disable-next-line:max-line-length
         this.EnfrentamientosJornadaSeleccionada[i].nombreJugadorUno = EquipoUno.nombre;
         // tslint:disable-next-line:max-line-length
         const EquipoDos = this.listaEquiposClasificacion.filter (equipo => equipo.id === this.EnfrentamientosJornadaSeleccionada[i].JugadorDos)[0];
         // tslint:disable-next-line:max-line-length
         this.EnfrentamientosJornadaSeleccionada[i].nombreJugadorDos = EquipoDos.nombre;
      }
      console.log(this.EnfrentamientosJornadaSeleccionada);
      this.dataSourceTablaGanadorEquipo = new MatTableDataSource(this.EnfrentamientosJornadaSeleccionada);
      console.log('El dataSource es:');
      console.log(this.dataSourceTablaGanadorEquipo.data);
      if (this.Disputada (this.jornadaId)) {
        for (let i = 0; i < this.EnfrentamientosJornadaSeleccionada.length; i++) {
          if (this.EnfrentamientosJornadaSeleccionada[i].Ganador === this.EnfrentamientosJornadaSeleccionada[i].JugadorUno) {
            this.selectionUno.select(this.dataSourceTablaGanadorEquipo.data[i]);
          } else if (this.EnfrentamientosJornadaSeleccionada[i].Ganador === this.EnfrentamientosJornadaSeleccionada[i].JugadorDos) {
            this.selectionDos.select(this.dataSourceTablaGanadorEquipo.data[i]);
          } else if (this.EnfrentamientosJornadaSeleccionada[i].Ganador === 0) {
            this.selectionTres.select(this.dataSourceTablaGanadorEquipo.data[i]);
          }
        }
      }

    }
  }

  ActualizarTablaClasificacion() {
    console.log('Estoy en ActualizarTablaClasificacion()');
    const jornadaActualizada = this.JornadasCompeticion.filter (jornada => jornada.id === Number(this.jornadaId))[0];
    jornadaActualizada.Disputada = true;
    for (let i = 0; i < this.JornadasCompeticion.length; i++) {
      if (this.JornadasCompeticion[i].id === Number(this.jornadaId)) {
        this.JornadasCompeticion[i] = jornadaActualizada;
      }
    }
  }

  //////// FUNCIONES PARA CONTROLAR LOS BOTONES Y LOS CHECKBOX ////////////////////////////


  // Esta función se ejecuta al seleccionar el modo de asignación
  SeleccionaModo() {
    console.log ('SeleccionaModo' + this.modoAsignacionId);
    // activamos el boton correspondiente si se eligió manual ao aleatorio
    if (Number(this.modoAsignacionId) === 1) { // Manual
        this.botonAsignarAleatorioDesactivado = true;
        this.botonAsignarManualDesactivado = false;
        this.botonAsignarJuegoDesactivado = true;
    } else if (Number(this.modoAsignacionId) === 2) { // Aleatorio
        this.botonAsignarManualDesactivado = true;
        this.botonAsignarAleatorioDesactivado = false;
        this.botonAsignarJuegoDesactivado = true;
    // Si se elijió asignación por juego de puntos y no hay juego de puntos para elegir se muestra una alarma
    // Si  hay juego de puntos no se hace nada porque ya aparecerá automáticamente el selector del juego
      } else if ((Number(this.modoAsignacionId) === 3) && (this.juegosDisponibles.length === 0)) { // JuegoPuntos
        this.botonAsignarManualDesactivado = true;
        this.botonAsignarAleatorioDesactivado = true;
        this.botonAsignarJuegoDesactivado = true;
        console.log ('Aviso');
        Swal.fire('Cuidado', 'No hay juegos finalizados disponibles para este grupo', 'warning');
      } else {
        console.log ('Salgo');
        console.log ('juegos disponibles');
        console.log (this.juegosDisponibles);
      }
  }

  // Me traigo el juego elegido para decidir los resultados de la jornada
  TraerJuegoDisponibleSeleccionado() {
    this.ObtenerEnfrentamientosDeCadaJornada(this.jornadaId);
    this.botonAsignarManualDesactivado = true;
    this.botonAsignarAleatorioDesactivado = true;
    this.botonAsignarJuegoDesactivado = false;
    console.log ('ID del juego seleccionado ' + this.juegoDisponibleSeleccionadoID);
    console.log (this.juegosDisponibles);
    this.juegoDisponibleSeleccionado = this.juegosDisponibles.filter (juego => juego.id === Number (this.juegoDisponibleSeleccionadoID))[0];
    console.log ('ya he seleccionado el juego');
    console.log (this.juegoDisponibleSeleccionado);
    if ( this.juegoDisponibleSeleccionado.Tipo === 'Juego De Puntos') {
      if (this.juegoSeleccionado.Modo === 'Individual') {
        this.RecuperarInscripcionesAlumnosJuegoPuntos();
      } else {
        this.RecuperarInscripcionesEquiposJuegoPuntos();
      }
    } else if ( this.juegoDisponibleSeleccionado.Tipo === 'Juego De Cuestionario') {
      // De momento solo hay individual
      this.RecuperarInscripcionesAlumnosJuegoCuestionario();
    } else if ( this.juegoDisponibleSeleccionado.Tipo === 'Juego De Votación Uno A Todos') {
      // De momento solo hay individual
      this.RecuperarInscripcionesAlumnosJuegoDeVotacionUnoATodos();
    }
  }

  /* Esta función decide si los botones deben estar activos (si se ha seleccionado la jornada)
     o si debe estar desactivado (si no se ha seleccionado la jornada) */
     SeleccionaJornada() {
      console.log('Estoy en actualizar botón');
      let jornadaAnterior : number;
      console.log (this.jornadaId);
      jornadaAnterior = this.jornadaId -1;
      console.log (jornadaAnterior);
      console.log (this.JornadasCompeticion[0].id);
      if (this.jornadaId == this.JornadasCompeticion[0].id) {
            this.ObtenerEnfrentamientosDeCadaJornada(this.jornadaId);
            console.log(this.modoAsignacionId);
            if (this.modoAsignacionId === undefined || this.jornadaId === undefined) {
              this.botonAsignarAleatorioDesactivado = true;
              this.botonAsignarManualDesactivado = true;
              this.botonAsignarJuegoDesactivado = true;
            } else if (Number(this.modoAsignacionId) === 1) { // Manual
              console.log('Modo manual');
              this.botonAsignarAleatorioDesactivado = true;
              this.botonAsignarManualDesactivado = false;
              this.botonAsignarJuegoDesactivado = true;
              this.ObtenerEnfrentamientosDeCadaJornada(this.jornadaId);
            } else if (Number(this.modoAsignacionId) === 2) { // Aleatorio
              console.log('Modo aleatorio');
              this.botonAsignarManualDesactivado = true;
              this.botonAsignarAleatorioDesactivado = false;
              this.botonAsignarJuegoDesactivado = true;
              this.ObtenerEnfrentamientosDeCadaJornada(this.jornadaId);
            } else if (Number(this.modoAsignacionId) === 3 && this.juegosDisponibles.length !== 0) { // JuegoPuntos
              console.log('Modo puntos');
              this.botonAsignarManualDesactivado = true;
              this.botonAsignarAleatorioDesactivado = true;
              this.botonAsignarJuegoDesactivado = false;
              this.ObtenerEnfrentamientosDeCadaJornada(this.jornadaId);
              this.ActualizarBotonJuego();
            } else if (Number(this.modoAsignacionId) === 3 && this.juegosDisponibles.length === 0) { // JuegoPuntos
              this.botonAsignarManualDesactivado = true;
              this.botonAsignarAleatorioDesactivado = true;
              this.botonAsignarJuegoDesactivado = true;
              Swal.fire('Cuidado', 'No hay juegos disponibles para este este grupo', 'warning');
            }
      } 
     else if (!this.Disputada(jornadaAnterior)){
        Swal.fire('Cuidado, no se ha jugado la jornada anterior');
        this.location.back();
      } else {
        this.ObtenerEnfrentamientosDeCadaJornada(this.jornadaId);
        console.log(this.modoAsignacionId);
        if (this.modoAsignacionId === undefined || this.jornadaId === undefined) {
          this.botonAsignarAleatorioDesactivado = true;
          this.botonAsignarManualDesactivado = true;
          this.botonAsignarJuegoDesactivado = true;
        } else if (Number(this.modoAsignacionId) === 1) { // Manual
          console.log('Modo manual');
          this.botonAsignarAleatorioDesactivado = true;
          this.botonAsignarManualDesactivado = false;
          this.botonAsignarJuegoDesactivado = true;
          this.ObtenerEnfrentamientosDeCadaJornada(this.jornadaId);
        } else if (Number(this.modoAsignacionId) === 2) { // Aleatorio
          console.log('Modo aleatorio');
          this.botonAsignarManualDesactivado = true;
          this.botonAsignarAleatorioDesactivado = false;
          this.botonAsignarJuegoDesactivado = true;
          this.ObtenerEnfrentamientosDeCadaJornada(this.jornadaId);
        } else if (Number(this.modoAsignacionId) === 3 && this.juegosDisponibles.length !== 0) { // JuegoPuntos
          console.log('Modo puntos');
          this.botonAsignarManualDesactivado = true;
          this.botonAsignarAleatorioDesactivado = true;
          this.botonAsignarJuegoDesactivado = false;
          this.ObtenerEnfrentamientosDeCadaJornada(this.jornadaId);
          this.ActualizarBotonJuego();
        } else if (Number(this.modoAsignacionId) === 3 && this.juegosDisponibles.length === 0) { // JuegoPuntos
          this.botonAsignarManualDesactivado = true;
          this.botonAsignarAleatorioDesactivado = true;
          this.botonAsignarJuegoDesactivado = true;
          Swal.fire('Cuidado', 'No hay juegos disponibles para este este grupo', 'warning');
        }
    }
  }

  ActualizarBotonJuego() {
    this.juegoDisponibleSeleccionado = this.juegosDisponibles.filter (juego => juego.id === Number (this.juegoDisponibleSeleccionadoID))[0];
    console.log ('ya he seleccionado el juego');
    console.log (this.juegoDisponibleSeleccionado);
    if ( this.juegoDisponibleSeleccionado.Tipo === 'Juego De Puntos') {
      if (this.juegoSeleccionado.Modo === 'Individual') {
        this.RecuperarInscripcionesAlumnosJuegoPuntos();
      } else {
        this.RecuperarInscripcionesEquiposJuegoPuntos();
      }
    } else {
      // Tiene que ser de cuestionario, y de momento solo hay individual
      this.RecuperarInscripcionesAlumnosJuegoCuestionario();
    }
  }

  // Cuando marco una casilla desmarco las otras casillas de esa fila
   Verificar(row, n) {
    if (n === 1) {
      this.selectionDos.deselect(row);
      this.selectionTres.deselect(row);
    }
    if (n === 2) {
      this.selectionUno.deselect(row);
      this.selectionTres.deselect(row);
    }
    if (n === 3) {
      this.selectionUno.deselect(row);
      this.selectionDos.deselect(row);
    }
  }

  AsignarGanadorManualmente() {
    // tslint:disable-next-line:no-inferrable-types
    let error: boolean = false;
    const resultados: number[] = [];
    let dataSource: any;
    if (this.juegoSeleccionado.Modo === 'Individual') {
      dataSource = this.dataSourceTablaGanadorIndividual;
    } else {
      dataSource = this.dataSourceTablaGanadorEquipo;
    }
      // tslint:disable-next-line:prefer-for-of
    dataSource.data.forEach (row => {
        if (this.selectionUno.isSelected(row)) {
              resultados.push (1);
        } else  if (this.selectionDos.isSelected(row)) {
              resultados.push (2);
        } else if (this.selectionTres.isSelected(row)) {
              resultados.push (0);
        } else {

              Swal.fire('Cuidado', 'No se han seleccionado resultados para todos los enfrentamientos de la jornada', 'warning');
              error = true;
        }
    });
    console.log(resultados);
    console.log('resultados');

    if (!error) {
      this.calculos.AsignarResultadosJornadaLiga(this.juegoSeleccionado , this.jornadaId, resultados);
      this.ActualizarTablaClasificacion();
      Swal.fire('Enhorabuena', 'Resutados asignados manualmente', 'success');
      this.asignados = true;

    }

  }

  AsignarGanadorAleatoriamente() {
    // tslint:disable-next-line:prefer-for-of
    const resultados: number[] = [];
    for (let i = 0; i < this.EnfrentamientosJornadaSeleccionada.length; i++) {
      const random = Math.random();
      console.log('Random ' + i + ' = ' + random);
      if (random < 0.33) {
        resultados.push (1);
        if (this.juegoSeleccionado.Modo === 'Individual') {
          this.selectionUno.select(this.dataSourceTablaGanadorIndividual.data[i]);
        } else {
          this.selectionUno.select(this.dataSourceTablaGanadorEquipo.data[i]);
        }

      } else if (random > 0.66) {
        resultados.push (2);
        if (this.juegoSeleccionado.Modo === 'Individual') {
          this.selectionDos.select(this.dataSourceTablaGanadorIndividual.data[i]);
        } else {
          this.selectionDos.select(this.dataSourceTablaGanadorEquipo.data[i]);
        }

      } else {
        resultados.push (0);
        if (this.juegoSeleccionado.Modo === 'Individual') {
          this.selectionTres.select(this.dataSourceTablaGanadorIndividual.data[i]);
        } else {
          this.selectionTres.select(this.dataSourceTablaGanadorEquipo.data[i]);
        }
      }
    }

    this.calculos.AsignarResultadosJornadaLiga(this.juegoSeleccionado , this.jornadaId, resultados);
    this.ActualizarTablaClasificacion();
    Swal.fire('Enhorabuena', 'Resutados asignados aleatoriamente', 'success');
    this.asignados = true;

  }

  AsignarGanadoresJuegoDisponibleSeleccionado() {
    const resultados: number [] = [];

    if (this.juegoDisponibleSeleccionado.Tipo === 'Juego De Puntos') {

      if (this.juegoDisponibleSeleccionado.Modo === 'Individual') {

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.EnfrentamientosJornadaSeleccionada.length; i++) {

          // Saco al jugador uno de la lista de participantes del juego de puntos
          // tslint:disable-next-line:max-line-length

          // tslint:disable-next-line:max-line-length
          const JugadorUno = this.listaAlumnosJuegoDePuntos.filter (a => a.alumnoId === Number (this.EnfrentamientosJornadaSeleccionada[i].JugadorUno))[0];
          // tslint:disable-next-line:max-line-length
          const JugadorDos = this.listaAlumnosJuegoDePuntos.filter (a => a.alumnoId === Number (this.EnfrentamientosJornadaSeleccionada[i].JugadorDos))[0];

          if (JugadorUno.PuntosTotalesAlumno > JugadorDos.PuntosTotalesAlumno) {
            resultados.push (1);
            this.selectionUno.select(this.dataSourceTablaGanadorIndividual.data[i]);

          } else  if (JugadorUno.PuntosTotalesAlumno < JugadorDos.PuntosTotalesAlumno) {
            resultados.push (2);
            this.selectionDos.select(this.dataSourceTablaGanadorIndividual.data[i]);

          } else {
            resultados.push (0);
            this.selectionTres.select(this.dataSourceTablaGanadorIndividual.data[i]);
          }
        }
      } else {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.EnfrentamientosJornadaSeleccionada.length; i++) {

          // Saco al jugador uno de la lista de participantes del juego de puntos
          // tslint:disable-next-line:max-line-length
          const equipoUno = this.listaEquiposJuegoDePuntos.filter (a => a.equipoId === this.EnfrentamientosJornadaSeleccionada[i].JugadorUno)[0];
          // tslint:disable-next-line:max-line-length
          const equipoDos = this.listaEquiposJuegoDePuntos.filter (a => a.equipoId === this.EnfrentamientosJornadaSeleccionada[i].JugadorDos)[0];

          if (equipoUno.PuntosTotalesEquipo > equipoDos.PuntosTotalesEquipo) {
            resultados.push (1);
            this.selectionUno.select(this.dataSourceTablaGanadorEquipo.data[i]);

          } else  if (equipoUno.PuntosTotalesEquipo < equipoDos.PuntosTotalesEquipo) {
            resultados.push (2);
            this.selectionDos.select(this.dataSourceTablaGanadorEquipo.data[i]);

          } else {
            resultados.push (0);
            this.selectionTres.select(this.dataSourceTablaGanadorEquipo.data[i]);
          }
        }
      }
    } else if (this.juegoDisponibleSeleccionado.Tipo === 'Juego De Cuestionario') {
      // El juego elegido es de cuestionario
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.EnfrentamientosJornadaSeleccionada.length; i++) {

        // Saco al jugador uno de la lista de participantes del juego de cuestionario
        // tslint:disable-next-line:max-line-length

        // tslint:disable-next-line:max-line-length
        const JugadorUno = this.listaAlumnosJuegoDeCuestionario.filter (a => a.alumnoId === Number (this.EnfrentamientosJornadaSeleccionada[i].JugadorUno))[0];
        // tslint:disable-next-line:max-line-length
        const JugadorDos = this.listaAlumnosJuegoDeCuestionario.filter (a => a.alumnoId === Number (this.EnfrentamientosJornadaSeleccionada[i].JugadorDos))[0];

        if (JugadorUno.Nota > JugadorDos.Nota) {
          resultados.push (1);
          this.selectionUno.select(this.dataSourceTablaGanadorIndividual.data[i]);

        } else  if (JugadorUno.Nota < JugadorDos.Nota) {
          resultados.push (2);
          this.selectionDos.select(this.dataSourceTablaGanadorIndividual.data[i]);

        } else  if (JugadorUno.TiempoEmpleado < JugadorDos.TiempoEmpleado) {
          resultados.push (1);
          this.selectionUno.select(this.dataSourceTablaGanadorIndividual.data[i]);

        } else  if (JugadorUno.TiempoEmpleado > JugadorDos.TiempoEmpleado) {
          resultados.push (2);
          this.selectionDos.select(this.dataSourceTablaGanadorIndividual.data[i]);

        } else {
          resultados.push (0);
          this.selectionTres.select(this.dataSourceTablaGanadorIndividual.data[i]);
        }
      }
    }  else if (this.juegoDisponibleSeleccionado.Tipo === 'Juego De Votación Uno A Todos') {
        if (this.juegoDisponibleSeleccionado.Modo === 'Individual') {
          // tslint:disable-next-line:prefer-for-of
          for (let i = 0; i < this.EnfrentamientosJornadaSeleccionada.length; i++) {

            // Saco al jugador uno de la lista de participantes del juego de votacion
            // tslint:disable-next-line:max-line-length

            // tslint:disable-next-line:max-line-length
            const JugadorUno = this.listaAlumnosJuegoDeVotacionUnoATodos.filter (a => a.alumnoId === Number (this.EnfrentamientosJornadaSeleccionada[i].JugadorUno))[0];
            // tslint:disable-next-line:max-line-length
            const JugadorDos = this.listaAlumnosJuegoDeVotacionUnoATodos.filter (a => a.alumnoId === Number (this.EnfrentamientosJornadaSeleccionada[i].JugadorDos))[0];

            console.log (JugadorUno.alumnoId + ' versus ' + JugadorDos.alumnoId);
            console.log (JugadorUno.PuntosTotales + ' versus ' + JugadorDos.PuntosTotales);
            if (JugadorUno.PuntosTotales > JugadorDos.PuntosTotales) {
              resultados.push (1);
              this.selectionUno.select(this.dataSourceTablaGanadorIndividual.data[i]);

            } else  if (JugadorUno.PuntosTotales < JugadorDos.PuntosTotales) {
              resultados.push (2);
              this.selectionDos.select(this.dataSourceTablaGanadorIndividual.data[i]);

            } else {
              resultados.push (0);
              this.selectionTres.select(this.dataSourceTablaGanadorIndividual.data[i]);
            }
          }
        } else {
          
        }
    }
    this.calculos.AsignarResultadosJornadaLiga(this.juegoSeleccionado , this.jornadaId, resultados);
    this.ActualizarTablaClasificacion();
    // Swal.fire('Resutados asignados', 'Enhorabuena', 'success');
    Swal.fire('Enhorabuena', 'Resutados asignados mediante juego de puntos', 'success');
    this.asignados = true;
  }



  goBack() {
    if (this.jornadaId === undefined) {
      this.location.back();
    } else if (!this.asignados && !this.Disputada(this.jornadaId)) {
      Swal.fire({
        title: '¿Estas seguro?',
        text: 'No has realizado la asignación',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, estoy seguro'
      }).then((result) => {
        if (result.value) {
          this.location.back();
        }
      });
    } else {
      this.location.back();
    }
  }


}
