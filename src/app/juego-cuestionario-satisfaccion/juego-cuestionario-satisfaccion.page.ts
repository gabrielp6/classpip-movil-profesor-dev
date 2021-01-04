import { Component, OnInit, ViewChild } from '@angular/core';
import { PeticionesAPIService, SesionService } from '../servicios/index';
import { CalculosService, ComServerService } from '../servicios';
import { NavController, AlertController, PickerController  } from '@ionic/angular';
import { CuestionarioSatisfaccion, Alumno, AlumnoJuegoDeCuestionarioSatisfaccion } from '../clases';
import {MatStepper} from '@angular/material';
import {PickerOptions} from '@ionic/core';
import { IonSlides } from '@ionic/angular';
import { Router } from '@angular/router';







@Component({
  selector: 'app-juego-cuestionario-satisfaccion',
  templateUrl: './juego-cuestionario-satisfaccion.page.html',
  styleUrls: ['./juego-cuestionario-satisfaccion.page.scss'],
})
export class JuegoCuestionarioSatisfaccionPage implements OnInit {
  disablePrevBtn = true;
  disableNextBtn = false;

  juegoSeleccionado: any;
  inscripciones: AlumnoJuegoDeCuestionarioSatisfaccion[];
  respuestasAfirmaciones: number[];
  respuestasPreguntasAbiertas: string [][];
  cuestionario: CuestionarioSatisfaccion;
  numeroRespuestas: number;
  informacionPreparada = false;
  afirmaciones: any[];
  datosGrafico: any[];
  alumnosDelJuego: Alumno[];
  grafico;

  @ViewChild(MatStepper, { static: false }) stepper: MatStepper;
  @ViewChild(IonSlides, { static: false }) slides: IonSlides;


  constructor(
    public navCtrl: NavController,
    private sesion: SesionService,
    private peticionesAPI: PeticionesAPIService,
    private alertCtrl: AlertController,
    private pickerCtrl: PickerController,
    private comServer: ComServerService,
    private route: Router,
  ) {}


  ngOnInit() {
  

    this.juegoSeleccionado = this.sesion.DameJuego();
    this.peticionesAPI.DameCuestionarioSatisfaccion (this.juegoSeleccionado.cuestionarioSatisfaccionId)
    .subscribe (cuestionario => {
      this.cuestionario = cuestionario;
      this.RecuperarInscripcionesAlumnoJuego();
    });

  }

  RecuperarInscripcionesAlumnoJuego() {
    this.peticionesAPI.DameInscripcionesAlumnoJuegoDeCuestionarioSatisfaccion(this.juegoSeleccionado.id)
    .subscribe(inscripciones => {
      this.inscripciones = inscripciones;
      // tslint:disable-next-line:only-arrow-functions
      this.PreparaInformacion();
      this.informacionPreparada = true;
    });
  }


  
  PreparaInformacion() {
    this.numeroRespuestas = 0;
    this.respuestasAfirmaciones = Array(this.cuestionario.Afirmaciones.length).fill (0);
    this.respuestasPreguntasAbiertas = Array(this.cuestionario.PreguntasAbiertas.length);
    let i: number;
    for ( i = 0; i < this.respuestasPreguntasAbiertas.length; i++) {
      this.respuestasPreguntasAbiertas[i] = [];
    }
    this.inscripciones.forEach (inscripcion => {
      if (inscripcion.Contestado) {
        this.numeroRespuestas++;
        for ( i = 0; i < this.respuestasAfirmaciones.length; i++) {
          this.respuestasAfirmaciones[i] =  this.respuestasAfirmaciones[i]  + inscripcion.RespuestasAfirmaciones[i];
        }
        for ( i = 0; i < this.respuestasPreguntasAbiertas.length; i++) {
          this.respuestasPreguntasAbiertas[i].push (inscripcion.RespuestasPreguntasAbiertas[i]);
        }
      }
    });
    this.afirmaciones = [];
    this.datosGrafico = [];


    for ( i = 0; i < this.respuestasAfirmaciones.length; i++) {
      const media =  this.respuestasAfirmaciones[i] / this.numeroRespuestas;
      this.afirmaciones.push ({
        Texto: this.cuestionario.Afirmaciones[i],
        Media: media
      });
      this.datosGrafico.push ( [this.cuestionario.Afirmaciones[i], media]);
    }


    this.datosGrafico = [['afirmaciones', 'media']].concat(this.datosGrafico.reverse());

    console.log ('datos para grafico');
    console.log (this.datosGrafico);


    this.grafico = {
      dataset: {
          source: this.datosGrafico,
      },
      grid: {containLabel: true},
      xAxis: {name: 'media', min: 1, max: 5},
      yAxis: {type: 'category'},
      visualMap: {
          orient: 'horizontal',
          left: 'center',
          min: 1,
          max: 5,
          text: ['High Score', 'Low Score'],
          // Map the score column to color
          dimension: 1,
          inRange: {
              color: ['#FFF633', '#33FF49']
          }
      },
      series: [
          {
              type: 'bar',
              encode: {
                  // Map the "amount" column to X axis.
                  x: 'media',
                  // Map the "product" column to Y axis
                  y: 'afirmacion'
              }
          }
      ]
    };


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
