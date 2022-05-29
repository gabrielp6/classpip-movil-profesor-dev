import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Juego, Jornada, TablaJornadas, EnfrentamientoLiga, TablaAlumnoJuegoDeCompeticion,
  TablaEquipoJuegoDeCompeticion, AlumnoJuegoDeCompeticionLiga, EquipoJuegoDeCompeticionLiga, Alumno, Equipo, AlumnoJuegoDePuntos,
  EquipoJuegoDePuntos, AlumnoJuegoDeCuestionario, AlumnoJuegoDeVotacionUnoATodos
} from './../../clases/index';
import {AlumnoJuegoDeEvaluacion} from 'src/app/clases/AlumnoJuegoDeEvaluacion';
import{EnfrentamientoTorneo} from 'src/app/clases/EnfrentamientoTorneo';
import{EquipoJuegoDeVotacionUnoATodos} from 'src/app/clases/EquipoJuegoDeVotacionUnoATodos';
export interface Asignacion {modo: string; id: number;}
import{EquipoJuegoDeEvaluacion} from 'src/app/clases/EquipoJuegoDeEvaluacion';
const ModoAsignacion: Asignacion[] = [
  {modo: 'Manualmente', id: 1},
  {modo: 'Aleatoriamente', id: 2},
  {modo: 'Según resultados de un juego', id: 3}
];

import { SesionService, CalculosService, PeticionesAPIService } from './../../services/index';
import {MatTableDataSource} from '@angular/material/table';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';


@Component({
  selector: 'app-asignacion-ganador',
  templateUrl: './asignacion-ganador.page.html',
  styleUrls: ['./asignacion-ganador.page.scss'],
})

export class AsignacionGanadorPage implements OnInit {

  [x: string]: any;
  jornadaSiguiente : number;
  EnfrentamientosGanadoresJornadaSeleccionada: EnfrentamientoTorneo[] = [];
  EnfrentamientosPerdedoresJornadaSeleccionada: EnfrentamientoTorneo[] = [];
  EnfrentamientosPerdedores: Array<Array<EnfrentamientoTorneo>>;
  listaPerdedores: Array<number>;
  listaGanadoresPerdedores: number[];
  listaGanadores: number[];
  dataSourceTablaPerdedoresIndividual;
  dataSourceTablaPerdedoresEquipo;
  EnfrentamientosJornadaSeleccionadaTorneo: EnfrentamientoTorneo[] = [];
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
  alumnosDelJuego: Alumno[];
  equiposDelJuego: Equipo[];
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
  displayedColumnsAlumnoTorneo: string[] = ['select1', 'nombreJugadorUno', 'select2', 'nombreJugadorDos'];
  asignados: boolean;

  /*tablaJornada: any [] = [];
  alumnosParticipantes: any [] = [];
  equiposParticipantes: any [] = [];
  ganadoresElegidos: any[] = [];
  dataSourceJornada;
  dataSourceParticipantes;
  dataSourceElegidos;
*/
  columnasJornadaAlumnos: string[] = ['nombre', 'primer', 'segundo', 'puntos'];
  columnasJornadaEquipos: string[] = ['nombre', 'puntos'];
  columnasAlumnosParticipantes: string[] = ['nombre', 'primer', 'segundo', 'pon'];
  columnasAlumnosElegidos: string[] = ['posicion', 'nombre', 'primer', 'segundo', 'quita'];
  columnasEquiposParticipantes: string[] = ['nombre', 'pon'];
  columnasEquiposElegidos: string[] = ['posicion', 'nombre', 'quita'];
 
  textoParticipantesPuntuan: string;
  isDisabledAnadirGanadores = true; 
  //botonAsignarPuntosDesactivado = true;
  listaAlumnosOrdenadaPorPuntosJuegoDePuntos: AlumnoJuegoDePuntos[];
  listaEquiposOrdenadaPorPuntosJuegoDePuntos: EquipoJuegoDePuntos[];

  listaAlumnosOrdenadaPorPuntosJuegoDeCuestionario: AlumnoJuegoDeCuestionario[];
  listaAlumnosOrdenadaPorPuntosJuegoDeVotacionUnoATodos: AlumnoJuegoDeVotacionUnoATodos[];
  listaEquiposOrdenadaPorPuntosJuegoDeVotacionUnoATodos: EquipoJuegoDeVotacionUnoATodos[];
  listaAlumnosOrdenadaPorPuntosJuegoDeEvaluacion: AlumnoJuegoDeEvaluacion[];
  listaEquiposOrdenadaPorPuntosJuegoDeEvaluacion: EquipoJuegoDeEvaluacion[];

  constructor( public sesion: SesionService,
    public location: Location,
    public calculos: CalculosService,
    public peticionesAPI: PeticionesAPIService
  ) { }

  ngOnInit() {

    this.juegoSeleccionado = this.sesion.DameJuego();
    this.numeroTotalJornadas = this.juegoSeleccionado.NumeroTotalJornadas;
    const datos = this.sesion.DameDatosJornadas();
    this.jornadasDelJuego = datos.jornadas;
    //this.numeroTotalJornadas = datos.jornadas.length;
    this.JornadasCompeticion = datos.JornadasCompeticion;


    if (this.juegoSeleccionado.Modo === 'Individual') {

      if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){
        this.listaAlumnosClasificacion = this.sesion.DameTablaAlumnoJuegoDeCompeticion();
      }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){
        this.listaAlumnosClasificacion = this.sesion.DameTablaAlumnoJuegoDeCompeticion();
      }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){
        this.alumnosDelJuego = this.sesion.DameAlumnoJuegoDeCompeticionTorneo();
        console.log("Donde estan los alumnos");
        console.log(this.alumnosDelJuego);
      }
     
    } else {

      if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){
        this.listaEquiposClasificacion = this.sesion.DameTablaEquipoJuegoDeCompeticion();
      }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){
        this.listaEquiposClasificacion = this.sesion.DameTablaEquipoJuegoDeCompeticion();
      }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){
        this.equiposDelJuego = this.sesion.DameEquipoJuegoDeCompeticionTorneo();
      }
      
    } 
    
    this.juegosDisponibles = this.sesion.DameJuegosDePuntos().filter(juego => juego.Modo === this.juegoSeleccionado.Modo);   
    this.juegosDisponibles = this.juegosDisponibles.concat(this.sesion.DameJuegosDeCuestionariosAcabados());
    this.juegosDisponibles = this.juegosDisponibles.concat(this.sesion.DameJuegosDeVotacionUnoATodosAcabados());
    this.juegosDisponibles = this.juegosDisponibles.concat (this.sesion.DameJuegosDeEvaluacionTerminados());
   
    console.log ('Juegos para elegir ganadores ');
    console.log (this.juegosDisponibles);
    this.asignados = false;

  }

  ////////////////// FUNCIONES PARA OBTENER LOS DATOS NECESARIOS //////////////////////////
  ObtenerEnfrentamientosDeCadaJornada(jornadaId: number) {
    if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){
  
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){
      this.peticionesAPI.DameEnfrentamientosDeCadaJornadaLiga(jornadaId)
      .subscribe(enfrentamientos => {
        this.EnfrentamientosJornadaSeleccionada = enfrentamientos;
        this.ConstruirTablaElegirGanador();
      });
      
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){
      this.peticionesAPI.DameEnfrentamientosDeCadaJornadaTorneo(jornadaId)
      .subscribe(enfrentamientos => {
        this.EnfrentamientosJornadaSeleccionadaTorneo = enfrentamientos;
        this.ConstruirTablaElegirGanador();
      });
    }
    
  }

  // Recupera las inscripciones de los alumnos en el juego y los puntos que tienen
  RecuperarInscripcionesAlumnosJuegoPuntos() {
    console.log ('voy a por las inscripciones ' + Number(this.juegoDisponibleSeleccionadoID));
    this.peticionesAPI.DameInscripcionesAlumnoJuegoDePuntos(Number(this.juegoDisponibleSeleccionadoID))
    .subscribe(inscripciones => {
      this.listaAlumnosJuegoDePuntos = inscripciones;
      this.listaAlumnosOrdenadaPorPuntosJuegoDePuntos = this.listaAlumnosJuegoDePuntos.sort(function(obj1, obj2) {
        return obj2.PuntosTotalesAlumno - obj1.PuntosTotalesAlumno;
      });
    });
  }

  // Recupera las inscripciones de los alumnos en el juego y los puntos que tienen
  RecuperarInscripcionesEquiposJuegoPuntos() {
    console.log ('vamos por las inscripciones ' + Number(this.juegoDisponibleSeleccionadoID));
    this.peticionesAPI.DameInscripcionesEquipoJuegoDePuntos(Number(this.juegoDisponibleSeleccionadoID))
    .subscribe(inscripciones => {
      this.listaEquiposOrdenadaPorPuntosJuegoDePuntos = inscripciones;
      console.log(this.listaEquiposJuegoDePuntos);
      console.log ('ya tengo las inscripciones');
    });
  }

  RecuperarInscripcionesAlumnosJuegoCuestionario() {
    this.peticionesAPI.DameInscripcionesAlumnoJuegoDeCuestionario(this.juegoDisponibleSeleccionadoID)
    .subscribe(inscripciones => {
      this.listaAlumnosJuegoDeCuestionario = inscripciones;
      this.listaAlumnosOrdenadaPorPuntosJuegoDeCuestionario = this.listaAlumnosJuegoDeCuestionario.sort(function(obj1, obj2) {
        if (obj1.Nota !== obj2.Nota) {
          return obj2.Nota - obj1.Nota;
        } else {
          return obj1.TiempoEmpleado - obj2.TiempoEmpleado;
        }
      });
    });
  }

  RecuperarInscripcionesAlumnosJuegoDeVotacionUnoATodos() {
    this.peticionesAPI.DameInscripcionesAlumnoJuegoDeVotacionUnoATodos(this.juegoDisponibleSeleccionadoID)
    .subscribe(inscripciones => {
      this.listaAlumnosJuegoDeVotacionUnoATodos = inscripciones;
      this.listaAlumnosOrdenadaPorPuntosJuegoDeVotacionUnoATodos = this.listaAlumnosJuegoDeVotacionUnoATodos.sort(function(obj1, obj2) {
        return obj2.PuntosTotales - obj1.PuntosTotales;
      });
    });

  }

  RecuperarInscripcionesEquiposJuegoEvaluacion() {
    this.peticionesAPI.DameRelacionEquiposJuegoDeEvaluacion(this.juegoDisponibleSeleccionadoID)
    .subscribe((res: EquipoJuegoDeEvaluacion[]) => {
      this.equiposRelacion = res;
      this.listaEquiposOrdenadaPorPuntosJuegoDeEvaluacion = this.equiposRelacion.sort(function(obj1, obj2) {
        return obj2.notaFinal - obj1.notaFinal;
      });
    });

  }

    RecuperarInscripcionesAlumnosJuegoEvaluacion() {
    this.peticionesAPI.DameRelacionAlumnosJuegoDeEvaluacion(this.juegoDisponibleSeleccionadoID)
      .subscribe((res: AlumnoJuegoDeEvaluacion[]) => {
        console.log ('ya tengo las inscripcuones ', res);
        this.listaAlumnosOrdenadaPorPuntosJuegoDeEvaluacion = res;
        this.listaAlumnosOrdenadaPorPuntosJuegoDeEvaluacion = this.listaAlumnosOrdenadaPorPuntosJuegoDeEvaluacion.sort(function(obj1, obj2) {
          return obj2.notaFinal - obj1.notaFinal;
        });
      });
  }


  Disputada(jornadaId): boolean {
    if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){
      return this.calculos.JornadaF1TieneGanadores(jornadaId, this.jornadasDelJuego);
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){
      return this.JornadasCompeticion.filter (jornada => jornada.id === Number(jornadaId))[0].Disputada;
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){
      return this.JornadasCompeticion.filter (jornada => jornada.id === Number(jornadaId))[0].Disputada;
    }    
  }

  ConstruirTablaElegirGanador() {

    if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){
     
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){
      
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
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){
      
       
      if (this.juegoSeleccionado.Modo === 'Individual') {
        console.log('Estoy en ConstruirTablaElegirGanador() alumnos');
        this.EnfrentamientosGanadoresJornadaSeleccionada = [];
        this.EnfrentamientosPerdedoresJornadaSeleccionada = [];
        for (let i = 0; i < this.EnfrentamientosJornadaSeleccionadaTorneo.length; i++) {
        
              if (this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno !== 0) {
              const JugadorUno = this.alumnosDelJuego.filter (alumno => alumno.id === this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno )[0]; 
              console.log(JugadorUno);
              this.EnfrentamientosJornadaSeleccionadaTorneo[i].nombreJugadorUno = JugadorUno.Nombre + ' ' + JugadorUno.PrimerApellido + ' ' + JugadorUno.SegundoApellido;
              } else {
                this.EnfrentamientosJornadaSeleccionadaTorneo[i].nombreJugadorUno ='Jugador fantasma';
              }

              if (this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos !== 0) {
              const JugadorDos = this.alumnosDelJuego.filter (alumno => alumno.id === this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos)[0];
              console.log(JugadorDos);
              this.EnfrentamientosJornadaSeleccionadaTorneo[i].nombreJugadorDos = JugadorDos.Nombre + ' ' + JugadorDos.PrimerApellido + ' ' + JugadorDos.SegundoApellido;
              } else{
                this.EnfrentamientosJornadaSeleccionadaTorneo[i].nombreJugadorDos ='Jugador fantasma';
              }
              
              if (this.EnfrentamientosJornadaSeleccionadaTorneo[i].perdedor === undefined) {
                this.EnfrentamientosGanadoresJornadaSeleccionada.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i]);
              }else{
                this.EnfrentamientosPerdedoresJornadaSeleccionada.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i]);
              }
            
        }
        if (this.juegoSeleccionado.ModeloTorneo === 'Clásico' ) {
          console.log(this.EnfrentamientosJornadaSeleccionadaTorneo);
          this.dataSourceTablaGanadorIndividual = new MatTableDataSource(this.EnfrentamientosJornadaSeleccionadaTorneo);
          console.log('El dataSource :');
          console.log(this.dataSourceTablaGanadorIndividual.data);
          }
        // Ahora vamos a marcar los resultados en caso de que la jornada se haya disputado ya


        if (this.Disputada (this.jornadaId)) {
          // tslint:disable-next-line:prefer-for-of
          if (this.juegoSeleccionado.ModeloTorneo === 'Clásico' ) {
            for (let i = 0; i < this.EnfrentamientosGanadoresJornadaSeleccionada.length; i++) {
              if (this.EnfrentamientosGanadoresJornadaSeleccionada[i].Ganador === this.EnfrentamientosGanadoresJornadaSeleccionada[i].JugadorUno) {
                this.selectionUno.select(this.dataSourceTablaGanadorIndividual.data[i]);
              } else if (this.EnfrentamientosGanadoresJornadaSeleccionada[i].Ganador === this.EnfrentamientosGanadoresJornadaSeleccionada[i].JugadorDos) {
                this.selectionDos.select(this.dataSourceTablaGanadorIndividual.data[i]);
              } 
            }
          }
        }
        

      } else {
        console.log('Estoy en ConstruirTablaElegirGanador() equipos');
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.EnfrentamientosJornadaSeleccionadaTorneo.length; i++) {
          // tslint:disable-next-line:max-line-length
          if (this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno !== 0) {
            const EquipoUno = this.equiposDelJuego.filter (equipo => equipo.id === this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno )[0];
          // tslint:disable-next-line:max-line-length
          console.log(EquipoUno);
          this.EnfrentamientosJornadaSeleccionadaTorneo[i].nombreJugadorUno = EquipoUno.Nombre;
          }
          else {
            this.EnfrentamientosJornadaSeleccionadaTorneo[i].nombreJugadorUno ='Equipo fantasma';
          }
          if (this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos !== 0) {
          // tslint:disable-next-line:max-line-length
          const EquipoDos = this.equiposDelJuego.filter (equipo => equipo.id === this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos)[0];
          // tslint:disable-next-line:max-line-length
          console.log(EquipoDos);
          this.EnfrentamientosJornadaSeleccionadaTorneo[i].nombreJugadorDos = EquipoDos.Nombre;
          }
          else {
          this.EnfrentamientosJornadaSeleccionadaTorneo[i].nombreJugadorDos ='Equipo fantasma';
        }

        }
        console.log(this.EnfrentamientosJornadaSeleccionadaTorneo);
        this.dataSourceTablaGanadorEquipo = new MatTableDataSource(this.EnfrentamientosJornadaSeleccionadaTorneo);
        console.log('El dataSource es:');
        console.log(this.dataSourceTablaGanadorEquipo.data);

        if (this.Disputada (this.jornadaId)) {
          // tslint:disable-next-line:prefer-for-of
          for (let i = 0; i < this.EnfrentamientosJornadaSeleccionadaTorneo.length; i++) {
            if (this.EnfrentamientosJornadaSeleccionadaTorneo[i].Ganador === this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno) {
              this.selectionUno.select(this.dataSourceTablaGanadorEquipo.data[i]);
            } else if (this.EnfrentamientosJornadaSeleccionadaTorneo[i].Ganador === this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos) {
              this.selectionDos.select(this.dataSourceTablaGanadorEquipo.data[i]);
            } 
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
      this.RecuperarInscripcionesAlumnosJuegoCuestionario();
    } else if ( this.juegoDisponibleSeleccionado.Tipo === 'Juego De Votación Uno A Todos') {
      if (this.juegoSeleccionado.Modo === 'Individual') {
        this.RecuperarInscripcionesAlumnosJuegoDeVotacionUnoATodos();
      } else {
        this.RecuperarInscripcionesEquiposJuegoDeVotacionUnoATodos();
      }
    } else if ( this.juegoDisponibleSeleccionado.Tipo === 'Evaluacion') {
      if (this.juegoSeleccionado.Modo === 'Individual') {
        this.RecuperarInscripcionesAlumnosJuegoEvaluacion();
      } else {
        this.RecuperarInscripcionesEquiposJuegoEvaluacion();
      }
    } 

  }

 
  SeleccionaJornada() {

    if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){

      let jornadaAnterior : number;
      jornadaAnterior = this.jornadaId -1;
      console.log (this.jornadaId);
      console.log (jornadaAnterior);
      console.log (this.jornadasDelJuego[0].id);
      if (this.jornadaId == this.jornadasDelJuego[0].id) {
            this.ConstruirTabla();
            if (this.Disputada(this.jornadaId)) {
              // Si ya se ha disputado, los ganadores están en la información de la jornada
              const ganadores = this.jornadasDelJuego.filter (jornada => jornada.id === Number (this.jornadaId))[0].GanadoresFormulaUno;
              // Añadimos los ganadores a la tabla
              this.AñadirResultados ( ganadores);
            }
            this.dataSourceJornada = new MatTableDataSource (this.tablaJornada);
      } else if (!this.Disputada(jornadaAnterior)){
        Swal.fire('Cuidado, no se ha jugado la jornada anterior');
        this.location.back();
      } else {
        this.ConstruirTabla();
        if (this.Disputada(this.jornadaId)) {
          // Si ya se ha disputado, los ganadores están en la información de la jornada
          const ganadores = this.jornadasDelJuego.filter (jornada => jornada.id === Number (this.jornadaId))[0].GanadoresFormulaUno;
          // Añadimos los ganadores a la tabla
          this.AñadirResultados ( ganadores);
        }
        this.dataSourceJornada = new MatTableDataSource (this.tablaJornada);
      }

    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){
        
      console.log('Estoy en actualizar botón');
      let jornadaAnterior : number;
      console.log (this.jornadaId);
      jornadaAnterior = this.jornadaId -1;
      console.log (jornadaAnterior);
      console.log (this.jornadasDelJuego[0].id);

      if (this.jornadaId == this.jornadasDelJuego[0].id) {
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
      } else if (!this.Disputada(jornadaAnterior)){
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

    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){
        
      let jornadaAnterior : number;

      jornadaAnterior = this.jornadaId -1;
    
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

    if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){
  
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){
      
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
      
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){
      
      if (n === 1) {
        this.selectionDos.deselect(row);
      }
      if (n === 2) {
        this.selectionUno.deselect(row);
      }

    }
    
  }

  AsignarGanadorManualmente() {

    if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){
  
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){  
      
      let error: boolean = false;
      const resultados: number[] = [];
      let dataSource: any;
      if (this.juegoSeleccionado.Modo === 'Individual') {
        dataSource = this.dataSourceTablaGanadorIndividual;
      } else {
        dataSource = this.dataSourceTablaGanadorEquipo;
      }
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

    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){
      
      let error: boolean = false;
      this.resultados= [];
      let dataSource: any;
      let dataSourceEliminacion: any;
      if (this.juegoSeleccionado.Modo === 'Individual') {
        dataSource = this.dataSourceTablaGanadorIndividual;
        dataSourceEliminacion = this.dataSourceTablaPerdedoresIndividual;
      } else {
        dataSource = this.dataSourceTablaGanadorEquipo;
        dataSourceEliminacion = this.dataSourceTablaPerdedoresEquipo;
      }
      
      this.listaGanadores=[];
      this.listaGanadoresPerdedores=[];
      this.listaPerdedores=[];
      console.log ('listaganadores vacia?');
      console.log (this.listaGanadores);
      this.ObtenerEnfrentamientosDeCadaJornada(this.jornadaId);
      
      dataSource.data.forEach (row => {
          console.log (row.JugadorUno);
          console.log (row.JugadorDos);
          if (this.selectionUno.isSelected(row) && row.JugadorUno !==0) {
            this.resultados.push (1);
            this.listaGanadores.push(row.JugadorUno);
            this.listaPerdedores.push(row.JugadorDos);
          } else if (this.selectionUno.isSelected(row) && row.JugadorUno ===0) {
            Swal.fire('El jugador fantasma no puede ganar el enfrentamiento, seleccione al otro jugador');
            error = true; 
          } else if (this.selectionDos.isSelected(row)&& row.JugadorDos !==0) {
            this.resultados.push (2);
            this.listaGanadores.push(row.JugadorDos);
            this.listaPerdedores.push(row.JugadorUno);        
          } else if (this.selectionDos.isSelected(row) && row.JugadorDos ===0) {
            Swal.fire('El jugador fantasma no puede ganar el enfrentamiento, seleccione al otro jugador');
            error = true;
          }
          else {
                Swal.fire('Cuidado', 'No se han seleccionado resultados para todos los enfrentamientos de la jornada', 'warning');
                error = true;
          }
      });

      if (!error) {
        
        console.log(this.jornadaId);
        const numEnfrentamientos =  this.resultados.length / 2;
        console.log(numEnfrentamientos);
        if (this.EnfrentamientosGanadoresJornadaSeleccionada.length > 1) {
          let EnfrentamientosTorneo: EnfrentamientoTorneo;
          this.jornadaSiguiente= Number(this.jornadaId) + 1;
          console.log(this.jornadaSiguiente);

            for (let i = 0, j= 0; i < numEnfrentamientos ; i++,j=j+2) {   
              EnfrentamientosTorneo= new EnfrentamientoTorneo (this.listaGanadores[j], this.listaGanadores[j+1], undefined, this.jornadaSiguiente);
              console.log(EnfrentamientosTorneo);      
              this.peticionesAPI.CrearEnfrentamientoTorneo(EnfrentamientosTorneo,this.jornadaSiguiente)
                .subscribe(enfrentamientocreado => {
                console.log('enfrentamiento creado');
                console.log(enfrentamientocreado);
              });
            }

          Swal.fire('Enhorabuena', 'Resutados asignados manualmente', 'success');
          this.calculos.AsignarResultadosJornadaTorneo(this.juegoSeleccionado , this.jornadaId,  this.resultados);
          this.asignados = true;
          this.ActualizarTablaClasificacion();

        } else {

          if (this.juegoSeleccionado.Modo === 'Individual') {
            const ganador = this.alumnosDelJuego.filter (alumno => alumno.id === Number(this.listaGanadores))[0];
            console.log(ganador.Nombre);
            this.calculos.AsignarResultadosJornadaTorneo(this.juegoSeleccionado , this.jornadaId,  this.resultados);
            this.asignados = true;
            this.ActualizarTablaClasificacion();
            Swal.fire('El torneo ha finalizado, el ganador es: ' + ganador.Nombre + ganador.PrimerApellido + ganador.SegundoApellido);
            this.location.back();
          } else {
            const ganador = this.equiposDelJuego.filter (equipo => equipo.id === Number(this.listaGanadores))[0];
            console.log(ganador.Nombre);
            this.calculos.AsignarResultadosJornadaTorneo(this.juegoSeleccionado , this.jornadaId,  this.resultados);
            this.asignados = true;
            this.ActualizarTablaClasificacion();
            Swal.fire('El torneo ha finalizado, el ganador es: ' + ganador.Nombre);
            this.location.back();
          }
        }

      }
    }
  }

  AsignarGanadorAleatoriamente() {

    if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){
  
      const ganadores: any[] = [];
      const participantes: any[] = [];
      // Preparo la lista de participantes de la que iré eligiendo aleatoriamente
      if (this.juegoSeleccionado.Modo === 'Individual') {
        this.listaAlumnosClasificacion.forEach(alumno => participantes.push(alumno));
      } else {
        this.listaEquiposClasificacion.forEach(equipo => participantes.push(equipo));
      }
      let i = 0;
      while (i < this.juegoSeleccionado.NumeroParticipantesPuntuan) {
        const numeroParticipantes = participantes.length;
        const elegido = Math.floor(Math.random() * numeroParticipantes);
        // guardo el id del elegido
        ganadores.push(participantes[elegido].id);
        // Lo elimino de los participantes para seguir eligiendo
        participantes.splice(elegido, 1);
        i++;
      }
      // Añado puntos de elegidos a la tabla
      this.AñadirResultados ( ganadores);
      this.dataSourceJornada = new MatTableDataSource (this.tablaJornada);
      // Selecciono la jornada implicada
      const jornadaSeleccionada = this.jornadasDelJuego.filter (jornada => jornada.id === Number(this.jornadaId))[0];
      // Asigno los resultados a la jornada
      this.calculos.AsignarResultadosJornadaF1(this.juegoSeleccionado, jornadaSeleccionada, ganadores);
      Swal.fire('Enhorabuena', 'Resutados asignados aleatoriamente', 'success');
      this.asignados = true;

    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){
      
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

    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){

      const resultados: number[] = [];
      let listaGanadores: number[];
      listaGanadores=[];
      console.log ('listaganadores vacia?');
      console.log (listaGanadores);
      for (let i = 0; i < this.EnfrentamientosJornadaSeleccionadaTorneo.length; i++) {
        const random = Math.random();
        console.log('Random ' + i + ' = ' + random);
      
        if (this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno !==0 && this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos !==0) {
          if (random < 0.5) {
            resultados.push (1);
            listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno);
            if (this.juegoSeleccionado.Modo === 'Individual') {
              
              this.selectionUno.select(this.dataSourceTablaGanadorIndividual.data[i]);
            } else {
              this.selectionUno.select(this.dataSourceTablaGanadorEquipo.data[i]);
            }

          } else if (random >= 0.5) {
            resultados.push (2);
            listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos);
            if (this.juegoSeleccionado.Modo === 'Individual') {
              this.selectionDos.select(this.dataSourceTablaGanadorIndividual.data[i]);
            } else {
              this.selectionDos.select(this.dataSourceTablaGanadorEquipo.data[i]);
            }

          } 
        } else if (this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno ===0) {
            console.log('Primer jugador fantasma');
            resultados.push (2);
            listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos);
            if (this.juegoSeleccionado.Modo === 'Individual') {
              this.selectionDos.select(this.dataSourceTablaGanadorIndividual.data[i]);
            } else {
              this.selectionDos.select(this.dataSourceTablaGanadorEquipo.data[i]);
            }
        } else if (this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos ===0) {
            console.log('Segundo jugador fantasma');
            resultados.push (1);
            listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno);
            if (this.juegoSeleccionado.Modo === 'Individual') {
              this.selectionUno.select(this.dataSourceTablaGanadorIndividual.data[i]);
            } else {
              this.selectionUno.select(this.dataSourceTablaGanadorEquipo.data[i]);
            }
        }
      }

      console.log(resultados);
      console.log('resultados');
      console.log(listaGanadores);
      this.calculos.AsignarResultadosJornadaTorneo(this.juegoSeleccionado , this.jornadaId, resultados);
      const numEnfrentamientos = resultados.length / 2;
      console.log(numEnfrentamientos);

      if (numEnfrentamientos>=1) {
        let EnfrentamientosTorneo: EnfrentamientoTorneo;
        this.jornadaSiguiente= Number(this.jornadaId) + 1;
        console.log(this.jornadaSiguiente);
          for (let i = 0, j= 0; i < numEnfrentamientos ; i++,j=j+2) {    
            EnfrentamientosTorneo= new EnfrentamientoTorneo (listaGanadores[j], listaGanadores[j+1], undefined, this.jornadaSiguiente);
            console.log(EnfrentamientosTorneo);
            this.peticionesAPI.CrearEnfrentamientoTorneo(EnfrentamientosTorneo,this.jornadaSiguiente)
            .subscribe(enfrentamientocreado => {
              console.log('enfrentamiento creado');
              console.log(enfrentamientocreado);
            });
          }
        
          Swal.fire('Enhorabuena', 'Resutados asignados aleatoriamente', 'success');
          this.asignados = true;
          this.ActualizarTablaClasificacion();
      } else{

        if (this.juegoSeleccionado.Modo === 'Individual') {
          const ganador = this.alumnosDelJuego.filter (alumno => alumno.id === Number(listaGanadores))[0];
          Swal.fire('El torneo ha finalizado, el ganador es: ' + ganador.Nombre + ganador.PrimerApellido + ganador.SegundoApellido);
          this.location.back();
        } else {
          const ganador = this.equiposDelJuego.filter (equipo => equipo.id === Number(listaGanadores))[0];
          Swal.fire('El torneo ha finalizado, el ganador es: ' + ganador.Nombre);
          this.location.back();
        }  
        
      }
      
    }

  }

  ConstruirTabla() {
    this.tablaJornada = [];
    let i;
    if (this.juegoSeleccionado.Modo === 'Individual') {
      for (i = 0; i < this.listaAlumnosClasificacion.length; i++) {
        const participante: any = [];
        participante.nombre = this.listaAlumnosClasificacion[i].nombre;
        participante.primerApellido = this.listaAlumnosClasificacion[i].primerApellido;
        participante.segundoApellido = this.listaAlumnosClasificacion[i].segundoApellido;
        participante.puntos = 0;
        participante.id = this.listaAlumnosClasificacion[i].id;
        this.tablaJornada.push (participante);
      }
    } else {
      for (i = 0; i < this.listaEquiposClasificacion.length; i++) {
        const participante: any = [];
        participante.nombre = this.listaEquiposClasificacion[i].nombre;
        participante.puntos = 0;
        participante.id = this.listaEquiposClasificacion[i].id;
        this.tablaJornada.push (participante);

      }
    }
  }

  AñadirResultados(ganadores) {
    // ganadores es un vector con los id de los ganadores de la jornada
    // Los puntos que hay que asignar a cada uno de los ganadores, segun su posición, estan en juegoSeleccionado.Puntos

    if (ganadores !== undefined) {
      let i;
      for (i = 0; i < ganadores.length ; i++) {
        this.tablaJornada.filter (participante => participante.id === ganadores[i])[0].puntos = this.juegoSeleccionado.Puntos[i];
      }
      this.tablaJornada.sort ((a , b) => b.puntos - a.puntos);
    }
  }

  // Funciones para AsignarMasivoManualmente
  LimpiarCamposTexto() {
    this.textoParticipantesPuntuan = undefined;
    this.isDisabledAnadirGanadores = true;
  }

  DisabledTexto() {

    if (this.textoParticipantesPuntuan === undefined) {
      this.isDisabledAnadirGanadores = true;
    } else {
      this.isDisabledAnadirGanadores = false;
    }
  }

  AsignarMasivoManualmente() {
    const lineas: string[] = this.textoParticipantesPuntuan.split('\n');
    console.log ('Numero de lineas ' + lineas.length);
    console.log(lineas.length + ' === ' + this.juegoSeleccionado.NumeroParticipantesPuntuan);
    if (lineas.length !== this.juegoSeleccionado.NumeroParticipantesPuntuan) {
      Swal.fire('Cuidado', 'Esta jornada tiene ' + this.juegoSeleccionado.NumeroParticipantesPuntuan +
      ' participantes que puntúan, pero se han introducido ' + lineas.length, 'warning');
    } else {
      let ganadores;
      if (this.juegoSeleccionado.Modo === 'Individual') {
        ganadores = this.calculos.DameIdAlumnos(lineas, this.listaAlumnosClasificacion);
      } else {
        ganadores = this.calculos.DameIdEquipos(lineas, this.listaEquiposClasificacion);
      }
       // Añado puntos de elegidos a la tabla
      this.AñadirResultados ( ganadores);
      this.dataSourceJornada = new MatTableDataSource (this.tablaJornada);
      // Selecciono la jornada implicada
      const jornadaSeleccionada = this.jornadasDelJuego.filter (jornada => jornada.id === Number(this.jornadaId))[0];
      // Asigno los resultados a la jornada
      if (ganadores !== undefined) {
        this.calculos.AsignarResultadosJornadaF1(this.juegoSeleccionado, jornadaSeleccionada, ganadores);
        Swal.fire('Enhorabuena', 'Resutados asignados manualmente', 'success');
      }
      this.asignados = true;

    }
  }

  cambioTab(tabChangeEvent) {
    if (tabChangeEvent.index === 1) {
      // preparamos las tablas para elegir a los ganadores manualmente a partir de la lista de participantes

      this.ganadoresElegidos = [];
      this.dataSourceElegidos = new MatTableDataSource (this.ganadoresElegidos);

      if (this.juegoSeleccionado.Modo === 'Individual') {
        this.alumnosParticipantes = [];
        this.listaAlumnosClasificacion.forEach (alumno => this.alumnosParticipantes.push(alumno));
        this.alumnosParticipantes.sort((a, b) => a.primerApellido.localeCompare(b.primerApellido));
        this.dataSourceParticipantes = new MatTableDataSource (this.alumnosParticipantes);
      } else {
        this.equiposParticipantes = [];
        this.listaEquiposClasificacion.forEach (equipo => this.equiposParticipantes.push(equipo));
        this.equiposParticipantes.sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.dataSourceParticipantes = new MatTableDataSource (this.equiposParticipantes);
      }
    } else {
      // Para el método manualmente masivo no necesitamos cargar nada
    }
  }

  AgregarGanador(participante) {
    if (this.ganadoresElegidos.length === this.juegoSeleccionado.NumeroParticipantesPuntuan) {
      Swal.fire('Cuidado', 'Ya has asignado a todos los participantes que puntuan', 'warning');
    } else {

      this.ganadoresElegidos.push (participante);
      this.dataSourceElegidos = new MatTableDataSource (this.ganadoresElegidos);
      if (this.juegoSeleccionado.Modo === 'Individual') {
        // tslint:disable-next-line:max-line-length
        this.alumnosParticipantes = this.alumnosParticipantes.filter(alumno => alumno.id !== participante.id);
        this.dataSourceParticipantes = new MatTableDataSource (this.alumnosParticipantes);
       } else {
         // tslint:disable-next-line:max-line-length
        this.equiposParticipantes = this.equiposParticipantes.filter(equipo => equipo.id !== participante.id);
        this.dataSourceParticipantes = new MatTableDataSource (this.equiposParticipantes);
      }
    }
  }

  QuitarGanador(participante) {
    this.ganadoresElegidos = this.ganadoresElegidos.filter (elegido => elegido.id !== participante.id);
    this.dataSourceElegidos = new MatTableDataSource (this.ganadoresElegidos);
    if (this.juegoSeleccionado.Modo === 'Individual') {
      this.alumnosParticipantes.push (participante);
      this.alumnosParticipantes.sort((a, b) => a.primerApellido.localeCompare(b.primerApellido));
      this.dataSourceParticipantes = new MatTableDataSource (this.alumnosParticipantes);
    } else {
      this.equiposParticipantes.push (participante);
      this.equiposParticipantes.sort((a, b) => a.nombre.localeCompare(b.nombre));
      this.dataSourceParticipantes = new MatTableDataSource (this.equiposParticipantes);
    }
  }

  AsignarGanadoresElegidos() {
    if (this.ganadoresElegidos.length < this.juegoSeleccionado.NumeroParticipantesPuntuan) {
      Swal.fire('Cuidado', 'Aún falta seleccionar algún participante que puntúa', 'warning');
    } else {
      // Preparo el vector con los identificadores de los ganadores
      const ganadores: any[] = [];
      let i = 0;
      while (i < this.juegoSeleccionado.NumeroParticipantesPuntuan) {
        ganadores.push(this.ganadoresElegidos[i].id);
        i++;
      }
     // Añado puntos de elegidos a la tabla
      this.AñadirResultados ( ganadores);
      this.dataSourceJornada = new MatTableDataSource (this.tablaJornada);
    // Selecciono la jornada implicada
      const jornadaSeleccionada = this.jornadasDelJuego.filter (jornada => jornada.id === Number(this.jornadaId))[0];
    // Asigno los resultados a la jornada
      this.calculos.AsignarResultadosJornadaF1(this.juegoSeleccionado, jornadaSeleccionada, ganadores);
      Swal.fire('Enhorabuena', 'Resutados asignados manualmente', 'success');
      this.asignados = true;
    }
  }




  AsignarGanadoresJuegoDisponibleSeleccionado() {

    console.log("demogorgon");
    if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){
  
      const ganadores: any[] = [];
      // Selecciono los ganadores a partir del ranking del juego de puntos
      if (this.juegoSeleccionado.Modo === 'Individual') {
        if (this.juegoDisponibleSeleccionado.Tipo === 'Juego De Puntos') {
          let i = 0;
          while (i < this.juegoSeleccionado.NumeroParticipantesPuntuan) {
            ganadores.push(this.listaAlumnosOrdenadaPorPuntosJuegoDePuntos[i].alumnoId);
            i++;
            console.log("demogorgon");
            console.log(ganadores);
          }
        } else if (this.juegoDisponibleSeleccionado.Tipo === 'Juego De Cuestionario') {
          let i = 0;
          while (i < this.juegoSeleccionado.NumeroParticipantesPuntuan) {
            ganadores.push(this.listaAlumnosOrdenadaPorPuntosJuegoDeCuestionario[i].alumnoId);
            i++;
          }
        } else if (this.juegoDisponibleSeleccionado.Tipo === 'Juego De Votación Uno A Todos') {
          let i = 0;
          while (i < this.juegoSeleccionado.NumeroParticipantesPuntuan) {
            ganadores.push(this.listaAlumnosOrdenadaPorPuntosJuegoDeVotacionUnoATodos[i].alumnoId);
            i++;
          }
        } else if (this.juegoDisponibleSeleccionado.Tipo === 'Evaluacion') {
          let i = 0;
          while (i < this.juegoSeleccionado.NumeroParticipantesPuntuan) {
            ganadores.push(this.listaAlumnosOrdenadaPorPuntosJuegoDeEvaluacion[i].alumnoId);
            i++;
          }
        }
      } else {
        
        if (this.juegoDisponibleSeleccionado.Tipo === 'Juego De Puntos') {
          let i = 0;
          while (i < this.juegoSeleccionado.NumeroParticipantesPuntuan) {
            ganadores.push(this.listaEquiposOrdenadaPorPuntosJuegoDePuntos[i].equipoId);
            i++;
          }
        } else if (this.juegoDisponibleSeleccionado.Tipo === 'Evaluacion') {
          let i = 0;
          while (i < this.juegoSeleccionado.NumeroParticipantesPuntuan) {
            ganadores.push(this.listaEquiposOrdenadaPorPuntosJuegoDeEvaluacion[i].equipoId);
            i++;
          }
        } else if (this.juegoDisponibleSeleccionado.Tipo === 'Juego De Votación Uno A Todos') {
          let i = 0;
          while (i < this.juegoSeleccionado.NumeroParticipantesPuntuan) {
            ganadores.push(this.listaEquiposOrdenadaPorPuntosJuegoDeVotacionUnoATodos[i].equipoId);
            i++;
          }
        }
      }
      // Añado puntos de elegidos a la tabla
      this.AñadirResultados ( ganadores);
      this.dataSourceJornada = new MatTableDataSource (this.tablaJornada);
      // Selecciono la jornada implicada
      const jornadaSeleccionada = this.jornadasDelJuego.filter (jornada => jornada.id === Number(this.jornadaId))[0];
      // Asigno los resultados a la jornada
      this.calculos.AsignarResultadosJornadaF1(this.juegoSeleccionado, jornadaSeleccionada, ganadores);
      Swal.fire('Enhorabuena', 'Resutados asignados mediante juego de puntos', 'success');
      this.asignados = true;

    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){ 
      
      const resultados: number [] = [];

      if (this.juegoDisponibleSeleccionado.Tipo === 'Juego De Puntos') {

        if (this.juegoDisponibleSeleccionado.Modo === 'Individual') {

          for (let i = 0; i < this.EnfrentamientosJornadaSeleccionada.length; i++) {
            const JugadorUno = this.listaAlumnosJuegoDePuntos.filter (a => a.alumnoId === Number (this.EnfrentamientosJornadaSeleccionada[i].JugadorUno))[0];
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
          for (let i = 0; i < this.EnfrentamientosJornadaSeleccionada.length; i++) {

            const equipoUno = this.listaEquiposJuegoDePuntos.filter (a => a.equipoId === this.EnfrentamientosJornadaSeleccionada[i].JugadorUno)[0];
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
       
        for (let i = 0; i < this.EnfrentamientosJornadaSeleccionada.length; i++) {

          const JugadorUno = this.listaAlumnosJuegoDeCuestionario.filter (a => a.alumnoId === Number (this.EnfrentamientosJornadaSeleccionada[i].JugadorUno))[0];
          
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
            for (let i = 0; i < this.EnfrentamientosJornadaSeleccionada.length; i++) {

              const JugadorUno = this.listaAlumnosJuegoDeVotacionUnoATodos.filter (a => a.alumnoId === Number (this.EnfrentamientosJornadaSeleccionada[i].JugadorUno))[0];
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


    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){
      
      
      const resultados: number [] = [];
      let listaGanadores: number[];
      listaGanadores=[];
      if (this.juegoDisponibleSeleccionado.Tipo === 'Juego De Puntos') {

        if (this.juegoDisponibleSeleccionado.Modo === 'Individual') {

          for (let i = 0; i < this.EnfrentamientosJornadaSeleccionadaTorneo.length; i++) {

            if (this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno !==0 && this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos !==0) {
          
              const JugadorUno = this.listaAlumnosJuegoDePuntos.filter (a => a.alumnoId === Number (this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno))[0];
              const JugadorDos = this.listaAlumnosJuegoDePuntos.filter (a => a.alumnoId === Number (this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos))[0];
              
              if (JugadorUno.PuntosTotalesAlumno > JugadorDos.PuntosTotalesAlumno) {
                resultados.push (1);
                listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno);
                this.selectionUno.select(this.dataSourceTablaGanadorIndividual.data[i]);

              } else  if (JugadorUno.PuntosTotalesAlumno < JugadorDos.PuntosTotalesAlumno) {
                resultados.push (2);
                listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos);
                this.selectionDos.select(this.dataSourceTablaGanadorIndividual.data[i]);

              } else { // Empate: Se hará aleatoriamente
                const random = Math.random();
                console.log('Random ' + i + ' = ' + random);
                
                  if (random < 0.5) {
                    resultados.push (1);
                    listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno);
                    this.selectionUno.select(this.dataSourceTablaGanadorIndividual.data[i]);

                  } else if (random >= 0.5) {
                    resultados.push (2);
                    listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos);
                    this.selectionDos.select(this.dataSourceTablaGanadorIndividual.data[i]);
                  } 
                  Swal.fire('Empate! Se ha seleccionado un ganador aleatoriamente');
              }
                
            } else if (this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno ===0) {
              console.log('Primer jugador fantasma');
              resultados.push (2);
              listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos);
                this.selectionDos.select(this.dataSourceTablaGanadorIndividual.data[i]);
            } else if (this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos ===0) {
              console.log('Segundo jugador fantasma');
              resultados.push (1);
              listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno);
              this.selectionUno.select(this.dataSourceTablaGanadorIndividual.data[i]);
            }
          }
        } else {
        
          for (let i = 0; i < this.EnfrentamientosJornadaSeleccionadaTorneo.length; i++) {
            if (this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno !==0 && this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos !==0) {
              
              const equipoUno = this.listaEquiposJuegoDePuntos.filter (a => a.equipoId === this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno)[0];
              const equipoDos = this.listaEquiposJuegoDePuntos.filter (a => a.equipoId === this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos)[0];

              if (equipoUno.PuntosTotalesEquipo > equipoDos.PuntosTotalesEquipo) {
                resultados.push (1);
                listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno);
                this.selectionUno.select(this.dataSourceTablaGanadorEquipo.data[i]);

              } else  if (equipoUno.PuntosTotalesEquipo < equipoDos.PuntosTotalesEquipo) {
                resultados.push (2);
                listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos);
                this.selectionDos.select(this.dataSourceTablaGanadorEquipo.data[i]);

              } else {// Empate: Se hará aleatoriamente
                const random = Math.random();
                console.log('Random ' + i + ' = ' + random);
                
                  if (random < 0.5) {
                    resultados.push (1);
                    listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno);
                    this.selectionUno.select(this.dataSourceTablaGanadorEquipo.data[i]);

                  } else if (random >= 0.5) {
                    resultados.push (2);
                    listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos);
                    this.selectionDos.select(this.dataSourceTablaGanadorEquipo.data[i]);
                  } 
                  Swal.fire('Empate! Se ha seleccionado un ganador aleatoriamente');
              }
            }
          }
        }
      } else if (this.juegoDisponibleSeleccionado.Tipo === 'Juego De Cuestionario') {
    
        for (let i = 0; i < this.EnfrentamientosJornadaSeleccionadaTorneo.length; i++) {
          if (this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno !==0 && this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos !==0) {
             
              const JugadorUno = this.listaAlumnosJuegoDeCuestionario.filter (a => a.alumnoId === Number (this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno))[0];
              const JugadorDos = this.listaAlumnosJuegoDeCuestionario.filter (a => a.alumnoId === Number (this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos))[0];

              if (JugadorUno.Nota > JugadorDos.Nota) {
                resultados.push (1);
                listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno);
                this.selectionUno.select(this.dataSourceTablaGanadorIndividual.data[i]);

              } else  if (JugadorUno.Nota < JugadorDos.Nota) {
                resultados.push (2);
                listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos);
                this.selectionDos.select(this.dataSourceTablaGanadorIndividual.data[i]);

              } else {
              // Empate: Se hará aleatoriamente
              const random = Math.random();
              console.log('Random ' + i + ' = ' + random);
              
                if (random < 0.5) {
                  resultados.push (1);
                  listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno);
                  this.selectionUno.select(this.dataSourceTablaGanadorIndividual.data[i]);

                } else if (random >= 0.5) {
                  resultados.push (2);
                  listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos);
                  this.selectionDos.select(this.dataSourceTablaGanadorIndividual.data[i]);
                } 
                Swal.fire('Empate! Se ha seleccionado un ganador aleatoriamente');
              }
          }
        }
      }  else if (this.juegoDisponibleSeleccionado.Tipo === 'Juego De Votación Uno A Todos') {
        for (let i = 0; i < this.EnfrentamientosJornadaSeleccionadaTorneo.length; i++) {
          if (this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno !==0 && this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos !==0) {
         
            const JugadorUno = this.listaAlumnosJuegoDeVotacionUnoATodos.filter (a => a.alumnoId === Number (this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno))[0];
            const JugadorDos = this.listaAlumnosJuegoDeVotacionUnoATodos.filter (a => a.alumnoId === Number (this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos))[0];

            console.log (JugadorUno.alumnoId + ' versus ' + JugadorDos.alumnoId);
            console.log (JugadorUno.PuntosTotales + ' versus ' + JugadorDos.PuntosTotales);
            if (JugadorUno.PuntosTotales > JugadorDos.PuntosTotales) {
              resultados.push (1);
              listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno);
              this.selectionUno.select(this.dataSourceTablaGanadorIndividual.data[i]);

            } else  if (JugadorUno.PuntosTotales < JugadorDos.PuntosTotales) {
              resultados.push (2);
              listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos);
              this.selectionDos.select(this.dataSourceTablaGanadorIndividual.data[i]);

            } else {
              // Empate: Se hará aleatoriamente
              const random = Math.random();
              console.log('Random ' + i + ' = ' + random);
              
                if (random < 0.5) {
                  resultados.push (1);
                  listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorUno);
                  this.selectionUno.select(this.dataSourceTablaGanadorIndividual.data[i]);

                } else if (random >= 0.5) {
                  resultados.push (2);
                  listaGanadores.push(this.EnfrentamientosJornadaSeleccionadaTorneo[i].JugadorDos);
                  this.selectionDos.select(this.dataSourceTablaGanadorIndividual.data[i]);
                } 
                Swal.fire('Empate! Se ha seleccionado un ganador aleatoriamente');
            }
          }
        }      
      }

      this.calculos.AsignarResultadosJornadaTorneo(this.juegoSeleccionado , this.jornadaId, resultados);
      const numEnfrentamientos = resultados.length / 2;
      console.log(numEnfrentamientos);
      if (numEnfrentamientos>=1) {
        let EnfrentamientosTorneo: EnfrentamientoTorneo;
        this.jornadaSiguiente= Number(this.jornadaId) + 1;
        console.log(this.jornadaSiguiente);
          for (let i = 0, j= 0; i < numEnfrentamientos ; i++,j=j+2) {
              
              EnfrentamientosTorneo= new EnfrentamientoTorneo (listaGanadores[j], listaGanadores[j+1], undefined, this.jornadaSiguiente);
              console.log(EnfrentamientosTorneo);
          
            this.peticionesAPI.CrearEnfrentamientoTorneo(EnfrentamientosTorneo,this.jornadaSiguiente)
            .subscribe(enfrentamientocreado => {
            console.log('enfrentamiento creado');
            console.log(enfrentamientocreado);
            });
          }
        
        Swal.fire('Enhorabuena', 'Resutados asignados mediante otro juego', 'success');
        this.asignados = true;
        this.ActualizarTablaClasificacion();
      } else{
        const ganador = this.alumnosDelJuego.filter (alumno => alumno.id === Number(listaGanadores))[0];
        console.log(ganador.Nombre);
        Swal.fire('El torneo ha finalizado, el ganador es: ' + ganador.Nombre + ganador.PrimerApellido + ganador.SegundoApellido);
        this.location.back();
      }
    }  
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
