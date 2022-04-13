import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { AlertController, IonSlides } from '@ionic/angular';

import { CuestionarioSatisfaccion } from '../../clases';
import { SesionService, PeticionesAPIService, ComServerService } from '../../services';

@Component({
  selector: 'app-juego-encuesta-rapida',
  templateUrl: './juego-encuesta-rapida.page.html',
  styleUrls: ['./juego-encuesta-rapida.page.scss'],
})
export class JuegoEncuestaRapidaPage implements OnInit {
  disablePrevBtn = true;
  disableNextBtn = false;

  participantes: any[];
  profesorId: number;
  juegoSeleccionado: any;
  respuestas: any;

  mostrarParticipantes = true;
  informacionPreparada = false;


  respuestasAfirmaciones: number[];
  respuestasPreguntasAbiertas: string [][];
  cuestionario: CuestionarioSatisfaccion;
  numeroRespuestas: number;
  numeroParticipantes: number;
  afirmaciones: any[];
  datosGrafico: any[];

  grafico;

  ficheroGenerado = false;
  todoGuardado = true;
  sonido = true;





  @ViewChild(IonSlides, { static: false }) slides: IonSlides;

  constructor(
    private sesion: SesionService,
    private peticionesAPI: PeticionesAPIService,
    private comServer: ComServerService,
    private alertCtrl: AlertController,
    private route: Router,
  ) { }

  
  ngOnInit() {
  
    this.participantes = [];
    this.profesorId = this.sesion.DameProfesor().id;
    this.juegoSeleccionado = this.sesion.DameJuego();
    // puede haber respuestas ya guardadas en el juego
    this.respuestas = this.juegoSeleccionado.Respuestas;
    if (this.respuestas === undefined) {
      this.respuestas = [];
      this.numeroParticipantes = 0;
      this.numeroRespuestas = 0;
    } else {
      console.log ('ya hay respuestas');
      console.log (this.respuestas);
      this.numeroParticipantes = this.respuestas.length;
      this.numeroRespuestas = this.respuestas.length;
    }
    this.peticionesAPI.DameCuestionarioSatisfaccion (this.juegoSeleccionado.cuestionarioSatisfaccionId)
    .subscribe (cuestionario => {
      this.cuestionario = cuestionario;
      this.PreparaInformacion();
    });
    this.comServer.EsperoNickNames()
    .subscribe((nick) => {
        // if (this.sonido) {
        //   sound.volume (0.1);
        //   sound.play();
        // }
        this.numeroParticipantes++;
        this.participantes.push ({
          nickName: nick,
          contestado: false
        });
    });
    this.comServer.EsperoRespuestasEncuestaRapida()
    .subscribe((respuesta) => {
        // if (this.sonido) {
        //   sound.volume (0.1);
        //   sound.play();
        // }
        // tomo nota de que hay respuestas sin guardar en el pdf
        this.todoGuardado = false;
        this.numeroRespuestas++;
        console.log ('recibo respuesta');
        console.log (respuesta);
        this.respuestas.push (respuesta.respuestas);
        this.participantes.filter (participante => participante.nickName === respuesta.nick)[0].contestado = true;
        // Esto lo hago para que la información se actualice en la página en tiempo real
        this.PreparaInformacion();
    });
  }

  
  PreparaInformacion() {

    this.respuestasAfirmaciones = Array(this.cuestionario.Afirmaciones.length).fill (0);
    this.respuestasPreguntasAbiertas = Array(this.cuestionario.PreguntasAbiertas.length);
    let i: number;
    for ( i = 0; i < this.respuestasPreguntasAbiertas.length; i++) {
      this.respuestasPreguntasAbiertas[i] = [];
    }
    this.respuestas.forEach (respuesta => {
        for ( i = 0; i < this.respuestasAfirmaciones.length; i++) {
          this.respuestasAfirmaciones[i] =  this.respuestasAfirmaciones[i]  + respuesta.RespuestasAfirmaciones[i];
        }
        for ( i = 0; i < this.respuestasPreguntasAbiertas.length; i++) {
          if (respuesta.RespuestasPreguntasAbiertas[i]) {
            // La respuesta podría estsr vacia
            this.respuestasPreguntasAbiertas[i].push (respuesta.RespuestasPreguntasAbiertas[i]);
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
  //  this.dataSource = new MatTableDataSource(this.afirmaciones);

    this.grafico = {
      dataset: {
          source: this.datosGrafico,
      },
      grid: {containLabel: true},
      xAxis: {name: 'media', min: 0, max: 5},
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

  Eliminar() {

    this.alertCtrl.create({
      header: '¿Seguro que quieres eliminar este juego rápido?',
      buttons: [
                {
                  text: 'SI',
                  handler: async () => {
                    this.peticionesAPI.BorraJuegoDeEncuestaRapida (this.juegoSeleccionado.id)
                    .subscribe(res => {
                      this.route.navigateByUrl('mis-juegos-rapidos');
                    });
                  }
                }, {
                text: 'Cancelar'
                }
              ]
    }).then ((res) => res.present());

  }

}
