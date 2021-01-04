import { Component, OnInit, ViewChild } from '@angular/core';
import { PeticionesAPIService, SesionService } from '../servicios/index';
import { CalculosService, ComServerService } from '../servicios';
import { NavController, AlertController, PickerController } from '@ionic/angular';
import { JuegoDeVotacionTodosAUno, Alumno, AlumnoJuegoDeVotacionTodosAUno, TablaAlumnoJuegoDeVotacionTodosAUno } from '../clases';
import {PickerOptions} from '@ionic/core';
import {MatAccordion} from '@angular/material/expansion';

import { WheelSelector } from '@ionic-native/wheel-selector/ngx';


@Component({
  selector: 'app-juego-votacion-todos-auno',
  templateUrl: './juego-votacion-todos-auno.page.html',
  styleUrls: ['./juego-votacion-todos-auno.page.scss'],
})
export class JuegoVotacionTodosAUnoPage implements OnInit {
  @ViewChild('accordion', {static: false}) accordion: MatAccordion;
  juegoSeleccionado: any;
  alumnosDelJuego: Alumno[];
  listaAlumnosOrdenadaPorPuntos: AlumnoJuegoDeVotacionTodosAUno[];
  rankingIndividualJuegoDeVotacionTodosAUno: TablaAlumnoJuegoDeVotacionTodosAUno[] = [];
  datasourceAlumno;

  // tslint:disable-next-line:max-line-length
  displayedColumnsAlumnos: string[] = ['posicion', 'nombreAlumno', 'primerApellido', 'segundoApellido', 'votos',  'nota'];
  columnasListas = false;

  constructor(
    public sesion: SesionService,
    public peticionesAPI: PeticionesAPIService,
    public calculos: CalculosService,
    private comServer: ComServerService,
  ) { }

  ngOnInit() {
    
    this.juegoSeleccionado = this.sesion.DameJuego();
    console.log(this.juegoSeleccionado);
    // if (this.juegoSeleccionado.Conceptos.length > 1) {
    //   // Si solo hay un concepto entonces no añado nuevas columnas porque en la tabla solo se mostrará
    //   // la nota final y no la nota del concepto, que es la misma que la nota final.
    //   this.juegoSeleccionado.Conceptos.forEach (concepto => this.displayedColumnsAlumnos.push (concepto));
    // }
    // this.displayedColumnsAlumnos.push (' ');
    // this.columnasListas = true;
    // console.log ('columnas');
    // console.log (this.displayedColumnsAlumnos);
    // console.log ('conceptos');
    // console.log (this.juegoSeleccionado.Conceptos);


    if (this.juegoSeleccionado.Modo === 'Individual') {
      this.AlumnosDelJuego();
    } else {
      console.log ('aun no funciona la modalidad por equipos');
    }
    this.comServer.EsperoVotaciones()
    .subscribe((res: any) => {
        // Recupero las inscripciones de la base de datos para actualizar la tabla
        this.RecuperarInscripcionesAlumnoJuego();
    });
  }

    // Recupera los alumnos que pertenecen al juego
    AlumnosDelJuego() {
      console.log ('Vamos a pos los alumnos');
      this.peticionesAPI.DameAlumnosJuegoDeVotacionTodosAUno(this.juegoSeleccionado.id)
      .subscribe(alumnosJuego => {
        console.log ('Ya tengo los alumnos');
        console.log(alumnosJuego);
        this.alumnosDelJuego = alumnosJuego;
        this.RecuperarInscripcionesAlumnoJuego();
      });

  }

  RecuperarInscripcionesAlumnoJuego() {
    console.log ('vamos por las inscripciones ' + this.juegoSeleccionado.id);
    this.peticionesAPI.DameInscripcionesAlumnoJuegoDeVotacionTodosAUno(this.juegoSeleccionado.id)
    .subscribe(inscripciones => {
      this.listaAlumnosOrdenadaPorPuntos = inscripciones;
      this.TablaClasificacionTotal();
    });
  }

  TablaClasificacionTotal() {

    if (this.juegoSeleccionado.Modo === 'Individual') {
      // tslint:disable-next-line:max-line-length
      this.rankingIndividualJuegoDeVotacionTodosAUno = this.calculos.PrepararTablaRankingIndividualVotacionTodosAUno (
        this.listaAlumnosOrdenadaPorPuntos,
        this.alumnosDelJuego,
        this.juegoSeleccionado);
      // tslint:disable-next-line:only-arrow-functions
      this.rankingIndividualJuegoDeVotacionTodosAUno = this.rankingIndividualJuegoDeVotacionTodosAUno.sort(function(obj1, obj2) {
        return obj2.nota - obj1.nota;
      });
      console.log ('inscripciones');
      console.log (this.listaAlumnosOrdenadaPorPuntos);
      console.log ('ranking');
      console.log (this.rankingIndividualJuegoDeVotacionTodosAUno);
    
    } else {
      console.log ('la modalidad en equipo aun no está operativa');

    }
  }


  VotacionFinalizada() {
    // Miro si todos han votado
   return false;
  }


}
