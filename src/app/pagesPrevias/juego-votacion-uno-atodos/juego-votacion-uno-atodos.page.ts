import { Component, OnInit, ViewChild } from '@angular/core';
import { PeticionesAPIService, SesionService } from '../../services/index';
import { CalculosService, ComServerService } from '../../services';
import { NavController, AlertController, IonSlides } from '@ionic/angular';
import { JuegoDeVotacionUnoATodos, Alumno, AlumnoJuegoDeVotacionUnoATodos, TablaAlumnoJuegoDeVotacionUnoATodos } from '../../clases';


@Component({
  selector: 'app-juego-votacion-uno-atodos',
  templateUrl: './juego-votacion-uno-atodos.page.html',
  styleUrls: ['./juego-votacion-uno-atodos.page.scss'],
})
export class JuegoVotacionUnoATodosPage implements OnInit {
  juegoSeleccionado: any;
  alumnosDelJuego: Alumno[];
  listaAlumnosOrdenadaPorPuntos: AlumnoJuegoDeVotacionUnoATodos[];
  rankingIndividualJuegoDeVotacionUnoATodos: TablaAlumnoJuegoDeVotacionUnoATodos[] = [];
  interval;

  disablePrevBtn = true;
  disableNextBtn = false;
  @ViewChild(IonSlides, { static: false }) slides: IonSlides;
  constructor(
    public navCtrl: NavController,
    private sesion: SesionService,
    private peticionesAPI: PeticionesAPIService,
    private calculos: CalculosService,
    private alertCtrl: AlertController,
    private comServer: ComServerService
  ) { }

  
  ngOnInit() {

    this.juegoSeleccionado = this.sesion.DameJuego();
    console.log(this.juegoSeleccionado);

    if (this.juegoSeleccionado.Modo === 'Individual') {
      this.AlumnosDelJuego();
    } else {
      console.log ('aun no funciona la modalidad por equipos');
    }
    this.comServer.EsperoVotacion()
    .subscribe((res: any) => {
      
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < res.votacion.Votos.length; i++) {
          const votado = this.rankingIndividualJuegoDeVotacionUnoATodos.filter (al => al.id === res.votacion.Votos[i].alumnoId)[0];
          console.log ('votado');
          console.log (votado);
          votado.puntos = votado.puntos + res.votacion.Votos[i].puntos;
          votado.incremento = res.votacion.Votos[i].puntos;
        }
        // Tomo nota de que el alumno ya ha votado
        this.rankingIndividualJuegoDeVotacionUnoATodos.filter (al => al.id === res.votacion.alumnoId)[0].votado = true;
        console.log ('ranking');
        console.log (this.rankingIndividualJuegoDeVotacionUnoATodos);
        // tslint:disable-next-line:only-arrow-functions
        this.rankingIndividualJuegoDeVotacionUnoATodos = this.rankingIndividualJuegoDeVotacionUnoATodos.sort(function(obj1, obj2) {
          return obj2.puntos - obj1.puntos;
        });
        
        // Haremos que se muestren los incrementos de esa votaciñón durante 5 segundos
        this.interval = setInterval(() => {
          this.rankingIndividualJuegoDeVotacionUnoATodos.forEach (al => al.incremento = 0);
          clearInterval(this.interval);
        }, 5000);
    });
  }
    // Recupera los alumnos que pertenecen al juego
  AlumnosDelJuego() {
      console.log ('Vamos a pos los alumnos');
      this.peticionesAPI.DameAlumnosJuegoDeVotacionUnoATodos(this.juegoSeleccionado.id)
      .subscribe(alumnosJuego => {
        console.log ('Ya tengo los alumnos');
        console.log(alumnosJuego);
        this.alumnosDelJuego = alumnosJuego;
        this.RecuperarInscripcionesAlumnoJuego();
      });
  }

  RecuperarInscripcionesAlumnoJuego() {
    console.log ('vamos por las inscripciones ' + this.juegoSeleccionado.id);
    this.peticionesAPI.DameInscripcionesAlumnoJuegoDeVotacionUnoATodos(this.juegoSeleccionado.id)
    .subscribe(inscripciones => {
      this.listaAlumnosOrdenadaPorPuntos = inscripciones;
      // ordena la lista por puntos
      // tslint:disable-next-line:only-arrow-functions
      this.listaAlumnosOrdenadaPorPuntos = this.listaAlumnosOrdenadaPorPuntos.sort(function(obj1, obj2) {
        return obj2.PuntosTotales - obj1.PuntosTotales;
      });
      this.TablaClasificacionTotal();
    });
  }

  TablaClasificacionTotal() {

    if (this.juegoSeleccionado.Modo === 'Individual') {
      // tslint:disable-next-line:max-line-length
      this.rankingIndividualJuegoDeVotacionUnoATodos = this.calculos.PrepararTablaRankingIndividualVotacionUnoATodos (
        this.listaAlumnosOrdenadaPorPuntos,
        this.alumnosDelJuego);
      // tslint:disable-next-line:only-arrow-functions
      this.rankingIndividualJuegoDeVotacionUnoATodos = this.rankingIndividualJuegoDeVotacionUnoATodos.sort(function(obj1, obj2) {
        return obj2.puntos - obj1.puntos;
      });
    } else {
      console.log ('la modalidad en equipo aun no está operativa');

    }
  }

  
  doCheck() {
    // Para decidir si hay que mostrar los botones de previo o siguiente slide
    const prom1 = this.slides.isBeginning();
    const prom2 = this.slides.isEnd();
  
    Promise.all([prom1, prom2]).then((data) => {
      data[0] ? this.disablePrevBtn = true : this.disablePrevBtn = false;
      data[1] ? this.disableNextBtn = true : this.disableNextBtn = false;
    });
  }


  next() {
    this.slides.slideNext();
  }

  prev() {
    this.slides.slidePrev();
  }
}
