import { Component, OnInit , ViewChild} from '@angular/core';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';


import {MatStepper} from '@angular/material';
import { AlertController } from '@ionic/angular';
import { CuestionarioSatisfaccion, JuegoDeCogerTurnoRapido, JuegoDeCuestionarioRapido, JuegoDeEncuestaRapida, JuegoDeVotacionRapida, Profesor } from '../../clases';
import { PeticionesAPIService, SesionService } from '../../services';
import { IonSlides } from '@ionic/angular';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';



@Component({
  selector: 'app-crear-juego-rapido',
  templateUrl: './crear-juego-rapido.page.html',
  styleUrls: ['./crear-juego-rapido.page.scss'],
})
export class CrearJuegoRapidoPage implements OnInit {

  profesor: Profesor;
 
  tipoDeJuegoRapido: string;
  misCuestionariosDeSatisfaccion: any[];
  cuestionariosDeSatisfaccionPublicos: any[];
  cuestionariosDeSatisfaccion: any[];
  cuestionarioDeSatisfaccionElegidoId: number;;
  mostrarPublicos = false;
  nombreDelJuego: string;

  puntuacionCorrecta: number;
  puntuacionIncorrecta: number;
  modoPresentacion: string;
  tiempoLimite: number;
  cuestionarioElegidoId: number;


  misCuestionarios: any[];
  cuestionariosPublicos: any[];
  cuestionarios: any[];
  listaDeTurnos: any[];
  fecha = 'Elije nueva fecha';
  presentacion: string;
  listaDeConceptos: any[];
  nuevoConcepto: string;
  modoDeReparto: string;
  puntosARepartir = 0;
  puntuaciones: number [];

  disablePrevBtn = true;
  disableNextBtn = false;
  ultimoSlide = false;
  modalidadJuegoCuestionario: string;



  @ViewChild(MatStepper, { static: false }) stepper: MatStepper;
  @ViewChild(IonSlides, { static: false }) slides: IonSlides;


  

  constructor (
    private peticionesAPI: PeticionesAPIService,
    private sesion: SesionService,
    private alertCtrl: AlertController,
    private route: Router,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.profesor = this.sesion.DameProfesor();

  }


  GuardaTipoDeJuego(event) {
    console.log('Seleccion ');
    console.log (event.detail);
    this.tipoDeJuegoRapido = event.detail.value;
    if (this.tipoDeJuegoRapido === 'Juego De Encuesta Rápida' ) {
      this.TraerCuestionariosSatisfaccion();

    } else  if (this.tipoDeJuegoRapido === 'Juego De Cuestionario Rápido' ) {
      this.TraerCuestionarios();

    } else {

    }
  }

  
  GuardaCuestionarioDeSatisfaccion(event) {
    this.cuestionarioDeSatisfaccionElegidoId = event.detail.value;
    console.log ('cuestionario elegido ' + this.cuestionarioDeSatisfaccionElegidoId);
  }
  MostrarCuestionariosDeSatisfaccionPublicos () {
    console.log ('voy a mostrar');
    this.cuestionariosDeSatisfaccion = this.misCuestionariosDeSatisfaccion.concat (this.cuestionariosDeSatisfaccionPublicos);
    this.mostrarPublicos = true;
  }

  OcultarCuestionariosDeSatisfaccionPublicos () {
    console.log ('voy a ocultar');
    this.cuestionariosDeSatisfaccion = this.misCuestionariosDeSatisfaccion;
    this.mostrarPublicos = false;
  }
  
  TraerCuestionariosSatisfaccion() {
    this.peticionesAPI.DameTodosMisCuestionariosSatisfaccion(this.profesor.id)
    .subscribe(cuestionarios => {
      if (cuestionarios !== undefined) {
        this.misCuestionariosDeSatisfaccion = cuestionarios;
        console.log ('ya tengo mis cuestionarios de satisfaccion ');
        console.log (this.misCuestionariosDeSatisfaccion);
        this.cuestionariosDeSatisfaccion = this.misCuestionariosDeSatisfaccion;
      }
    });
    this.peticionesAPI.DameCuestionariosSatisfaccionPublicos()
    .subscribe (publicos => {
      // me quedo con los públicos de los demás
      const publicosDeOtros = publicos.filter (cuestionario => cuestionario.profesorId !== Number(this.profesor.id));
      // traigo los profesores para añadir a los publicos el nombre del propietario
      this.peticionesAPI.DameProfesores ()
      .subscribe (profesores => {
        publicosDeOtros.forEach (publico => {
          const propietario = profesores.filter (profesor => profesor.id === publico.profesorId)[0];
          publico.Titulo = publico.Titulo + '(' + propietario.Nombre + ' ' + propietario.PrimerApellido + ')';
        });
        this.cuestionariosDeSatisfaccionPublicos = publicosDeOtros;
        console.log ('ya tengo los cuestionarios de satisfaccion publicos');
        console.log (this.cuestionariosDeSatisfaccionPublicos);
      });
    });
  }

    
  CrearJuegoDeEncuestaRapida() {

    this.alertCtrl.create({
      header: '¿Seguro que quieres crear el juego de encuesta rápida?',
      buttons: [
                {
                  text: 'SI',
                  handler: () => {
                    // genero una clave aleatoria de 8 digitos en forma de string
                    const clave = Math.random().toString().substr(2, 8);
                    const juegoDeEncuestaRapida = new JuegoDeEncuestaRapida (
                      this.nombreDelJuego,
                      this.tipoDeJuegoRapido,
                      clave,
                      this.profesor.id,
                      this.cuestionarioDeSatisfaccionElegidoId
                    );
                    console.log ('voy a crear juego');
                    console.log (juegoDeEncuestaRapida);
                    this.peticionesAPI.CreaJuegoDeEncuestaRapida (juegoDeEncuestaRapida)
                    .subscribe (juegoCreado => {
                      this.alertCtrl.create({
                        header: 'Juego creado',
                        buttons: [
                          {
                          text: 'OK',
                            handler: () => {
                              this.route.navigateByUrl('mis-juegos-rapidos');
                            }
                          }
                        ]
                      }).then (res => res.present());
                    });
                  }
                }, {
                text: 'Cancelar'
                }
      ]
    }).then (res => res.present());
  }

  
  TraerCuestionarios() {
    this.peticionesAPI.DameTodosMisCuestionarios(this.profesor.id)
    .subscribe ( res => {
      if (res[0] !== undefined) {
        this.misCuestionarios = res;
        this.cuestionarios = this.misCuestionarios;
      }
    });

    this.peticionesAPI.DameCuestionariosPublicos()
    .subscribe (publicos => {
      // me quedo con los públicos de los demás
      const publicosDeOtros = publicos.filter (cuestionario => cuestionario.profesorId !== Number(this.profesor.id));
      this.peticionesAPI.DameProfesores ()
      .subscribe (profesores => {
        publicosDeOtros.forEach (publico => {
          const propietario = profesores.filter (profesor => profesor.id === publico.profesorId)[0];
          publico.Titulo = publico.Titulo + '(' + propietario.Nombre + ' ' + propietario.PrimerApellido + ')';
        });
        this.cuestionariosPublicos = publicosDeOtros;
      });
    });
  }

  
  
  GuardaCuestionario(event) {
    this.cuestionarioElegidoId = event.detail.value;
   
  }

  MostrarCuestionariosPublicos() {
    this.cuestionarios = this.misCuestionarios.concat (this.cuestionariosPublicos);
    this.mostrarPublicos = true;
  }

  OcultarCuestionariosPublicos() {
    this.cuestionarios = this.misCuestionarios;
    this.mostrarPublicos = false;
  }

  PuntuacionesCorrectas(): boolean {
    if ((Number.isInteger (Number(this.puntuacionCorrecta))) && (Number.isInteger (Number(this.puntuacionIncorrecta)))) {
      console.log ('puntuaciones correctas');
      console.log (this.puntuacionIncorrecta);
      console.log (this.puntuacionCorrecta);

      return true;
    } else {
      console.log ('puntuaciones incorrectas');
      console.log (this.puntuacionIncorrecta);
      console.log (this.puntuacionCorrecta);

      return false;
    }
  }

  TiempoCorrecto(): boolean {
    if (Number.isInteger (Number(this.tiempoLimite))) {
      return true;
    } else {
      return false;
    }
  }
   
  GuardaModoDePresentacion(event) {
    this.modoPresentacion = event.detail.value;
  }

  CrearJuegoDeCuestionarioRapido() {

    // Tengo que crear un juego de tipo JuegoDeCuestionario y no uno de tipo Juego, como en los casos
    // anteriores. La razón es que no están bien organizado el tema de que los modelos de los diferentes juegos
    // tomen como base el modelo Juego genérico. De momento se queda así.
    this.alertCtrl.create({
      header: '¿Seguro que quieres crear el juego de cuestionario rápido?',
      buttons: [
                {
                  text: 'SI',
                  handler: () => {
                    const clave = Math.random().toString().substr(2, 8);
                    const juegoDeCuestionarioRapido = new JuegoDeCuestionarioRapido (
                      this.nombreDelJuego, this.tipoDeJuegoRapido,
                      this.modalidadJuegoCuestionario,
                      clave,
                      this.puntuacionCorrecta,
                      this.puntuacionIncorrecta, this.modoPresentacion,
                      false, false, this.profesor.id, this.cuestionarioElegidoId, this.tiempoLimite);
 
                    // tslint:disable-next-line:max-line-length
                    this.peticionesAPI.CreaJuegoDeCuestionarioRapido(juegoDeCuestionarioRapido)
                    .subscribe(juegoCreado => {
                      this.alertCtrl.create({
                        header: 'Juego creado',
                        buttons: [
                          {   
                          text: 'OK',
                            handler: () => {
                              this.route.navigateByUrl('mis-juegos-rapidos');
                            }
                          }
                        ]
                      }).then (res => res.present());

                    });
                  }
                }, {
                text: 'Cancelar'
                }
      ]
    }).then (res => res.present());
  }

  
  doCheck() {
    // Para decidir si hay que mostrar los botones de previo o siguiente slide
    const prom1 = this.slides.isBeginning();
    const prom2 = this.slides.isEnd();

    Promise.all([prom1, prom2]).then((data) => {
      data[0] ? this.disablePrevBtn = true : this.disablePrevBtn = false;
      data[1] ? this.disableNextBtn = true : this.disableNextBtn = false;
    });
    this.slides.getActiveIndex().then(index => {
      if ((index === 2) && (this.tipoDeJuegoRapido === 'Juego De Encuesta Rápida') ) {
        this.ultimoSlide = true;
      // tslint:disable-next-line:max-line-length
      } else if (( index === 3) && ((this.tipoDeJuegoRapido === 'Juego De Coger Turno Rápido')  || (this.tipoDeJuegoRapido === 'Juego De Votación Rápida'))) {
        this.ultimoSlide = true;
      // tslint:disable-next-line:max-line-length
      } else if ((index === 5) &&  (this.tipoDeJuegoRapido === 'Juego De Cuestionario Rápido') && (this.modalidadJuegoCuestionario === 'Kahoot')) {
        this.ultimoSlide = true;
      // tslint:disable-next-line:max-line-length
      } else if ((index === 6) &&  (this.tipoDeJuegoRapido === 'Juego De Cuestionario Rápido') && (this.modalidadJuegoCuestionario === 'Clásico')) {
        this.ultimoSlide = true;
      } else {
        this.ultimoSlide = false;
      }
    });
  }



  next() {
    console.log ('next');
    this.slides.getActiveIndex().then(index => {
      if ((index === 1) && (this.tipoDeJuegoRapido === 'Juego De Encuesta Rápida') ) {
        this.ultimoSlide = true;
      // tslint:disable-next-line:max-line-length
      } else if (( index === 2) && ((this.tipoDeJuegoRapido === 'Juego De Coger Turno Rápido')  || (this.tipoDeJuegoRapido === 'Juego De Votación Rápida'))) {
        this.ultimoSlide = true;
      } else if ((index === 4) &&  (this.tipoDeJuegoRapido === 'Juego De Cuestionario Rápido')) {
        this.ultimoSlide = true;
      }
      this.slides.slideNext();
    });
  }

  prev() {
    console.log ('prev');
    this.ultimoSlide = false;
    this.slides.slidePrev();
  }

  PonTurno (turno) {
    const nuevoTurno = turno.toString();
    const diaElegido = nuevoTurno.split('T')[0];
    const horaElegida = nuevoTurno.split('T')[1];
    if (this.listaDeTurnos === undefined) {
      this.listaDeTurnos = [];
    }
  
    this.listaDeTurnos.push ({
      dia: diaElegido,
      hora: horaElegida,
      persona: undefined,
    });
      // tslint:disable-next-line:only-arrow-functions
    this.listaDeTurnos.sort(function(a, b) {

        if (a.dia < b.dia) {
          return -1;
        } else if (a.dia > b.dia) {
          return 1;
        } else if (a.hora < b.hora) {
          return -1;
        } else if ( a.hora > b.hora) {
          return 1;
        } else {
          return 0;
        }
    });
    document.getElementById('inputDateTime').style.display = 'none';

  }
  MostrarInput() {
    document.getElementById('inputDateTime').style.display = 'block';
  }


  EliminarTurno(turno) {
    const dia = this.datePipe.transform(turno.dia, 'dd-MM-yyyy');
    this.alertCtrl.create({
      header: '¿Seguro que quieres eliminar este tuno?',
      message: '<strong>dia:  </strong>' + dia + '<br><strong>hora: </strong> ' + turno.hora,
      buttons: [
                {
                  text: 'SI',
                  handler: () => {
                    this.listaDeTurnos = this.listaDeTurnos.filter (t => ((t.dia !== turno.dia) || (t.hora !== turno.hora)) );
                  }
                }, {
                text: 'Cancelar'
                }
      ]
    }).then (res => res.present());

  }
  CrearJuegoDeCogerTurnoRapido() {

    this.alertCtrl.create({
      header: '¿Seguro que quieres crear el juego de coger turno rápido?',
      buttons: [
                {
                  text: 'SI',
                  handler: () => {
                    // genero una clave aleatoria de 8 digitos en forma de string
                    const clave = Math.random().toString().substr(2, 8);
                    const juegoDeCogerTurnoRapido = new JuegoDeCogerTurnoRapido (
                      this.nombreDelJuego,
                      this.tipoDeJuegoRapido,
                      clave,
                      this.profesor.id,
                      this.presentacion,
                      this.listaDeTurnos
                    );
                    this.peticionesAPI.CreaJuegoDeCogerTurnoRapido (juegoDeCogerTurnoRapido)
                    .subscribe (juegoCreado => {
                      this.alertCtrl.create({
                        header: 'Juego creado',
                        buttons: [
                          {
                          text: 'OK',
                            handler: () => {
                              this.route.navigateByUrl('mis-juegos-rapidos');
                            }
                          }
                        ]
                      }).then (res => res.present());
                    });
                  }
                }, {
                text: 'Cancelar'
                }
      ]
    }).then (res => res.present());
  }
  

  PonerConcepto () {
    if (this.nuevoConcepto) {

      if (this.listaDeConceptos === undefined) {
        this.listaDeConceptos = [];
      }
      this.listaDeConceptos.push (this.nuevoConcepto);
      this.nuevoConcepto = undefined;
    }
  }
  
  EliminarConcepto(concepto) {
    this.alertCtrl.create({
      header: '¿Seguro que quieres eliminar este concepto?',
      message: '<strong>' + concepto,
      buttons: [
                {
                  text: 'SI',
                  handler: () => {
                    this.listaDeConceptos = this.listaDeConceptos.filter (c => c !== concepto );
                  }
                }, {
                text: 'Cancelar'
                }
      ]
    }).then (res => res.present());

  }
  GuardarModoDeReparto (event){
    this.modoDeReparto = event.detail.value;
    console.log ('modo de reparto ' + this.modoPresentacion);
  }
 
  GuardaModalidad (event){
    this.modalidadJuegoCuestionario = event.detail.value;
   
  }
 

  Decrementar(i) {
    if (this.puntuaciones[i] > 0) {
      this.puntuaciones[i]--;
    }
  }
  Incrementar(i) {
    this.puntuaciones[i]++;
  }
  PonerPosicion () {
    if (this.puntuaciones === undefined) {
      this.puntuaciones = [];
    }
    this.puntuaciones.push (0);
  }
  EliminarPuntos (i) {
    this.puntuaciones.splice(i, 1);
  }
  DecrementarPuntosARepartir() {
    if (this.puntosARepartir > 0) {
      this.puntosARepartir--;
    }
  }
  IncrementarPuntosARepartir() {
    this.puntosARepartir++;
  }

  CrearJuegoDeVotacionRapida() {
    this.alertCtrl.create({
      header: '¿Seguro que quieres crear el juego de votación rápida?',
      buttons: [
                {
                  text: 'SI',
                  handler: () => {
                    const clave = Math.random().toString().substr(2, 8);
                    const juegoDeVotacionRapida = new JuegoDeVotacionRapida (
                      this.nombreDelJuego,
                      this.tipoDeJuegoRapido,
                      clave,
                      this.modoDeReparto,
                      this.profesor.id,
                      this.listaDeConceptos,
                      this.puntuaciones
                    );
                    console.log ('voy a crear un juego de votacion rápida');
                    console.log (juegoDeVotacionRapida);
                    this.peticionesAPI.CreaJuegoDeVotacionRapida (juegoDeVotacionRapida)
                    .subscribe (juegoCreado => {
                      this.alertCtrl.create({
                        header: 'Juego creado',
                        buttons: [
                          {
                          text: 'OK',
                            handler: () => {
                              this.route.navigateByUrl('mis-juegos-rapidos');
                            }
                          }
                        ]
                      }).then (res => res.present());
                    });
                  }
                }, {
                text: 'Cancelar'
                }
      ]
    }).then (res => res.present());
  
  }

  CrearJuego () {
    // compruebo que para cada tipo de juego están preparados todos los datos necesarios

    if (!this.nombreDelJuego || !this.tipoDeJuegoRapido) {
      this.alertCtrl.create({
        header: 'Faltan datos para poder crear el juego',
        buttons: ['OK']
      }).then (res => res.present());
    } else {
      if (this.tipoDeJuegoRapido === 'Juego De Encuesta Rápida') {
        if (this.cuestionarioDeSatisfaccionElegidoId) {
          this.CrearJuegoDeEncuestaRapida();

        } else {
          this.alertCtrl.create({
            header: 'Faltan datos para poder crear el juego',
            buttons: ['OK']
          }).then (res => res.present());
        }

      } else if ((this.tipoDeJuegoRapido === 'Juego De Cuestionario Rápido') && (this.modalidadJuegoCuestionario === 'Clásico')) {
          // tslint:disable-next-line:max-line-length
          if ( this.puntuacionCorrecta && this.puntuacionIncorrecta && this.modoPresentacion && this.cuestionarioElegidoId && this.tiempoLimite) {
            this.CrearJuegoDeCuestionarioRapido();
          } else {
            this.alertCtrl.create({
              header: 'Faltan datos para poder crear el juego',
              buttons: ['OK']
            }).then (res => res.present());
          }
      } else if ((this.tipoDeJuegoRapido === 'Juego De Cuestionario Rápido') && (this.modalidadJuegoCuestionario === 'Kahoot')) {
          // tslint:disable-next-line:max-line-length
          if ( this.modoPresentacion && this.cuestionarioElegidoId && this.tiempoLimite) {
            // algo hay que poner en estos atributos para que pueda crear bien el modelo, porque son obligatorios
            this.puntuacionCorrecta = 0;
            this.puntuacionIncorrecta = 0;
            this.CrearJuegoDeCuestionarioRapido();
          } else {
            this.alertCtrl.create({
              header: 'Faltan datos para poder crear el juego',
              buttons: ['OK']
            }).then (res => res.present());
          }

      } else if (this.tipoDeJuegoRapido === 'Juego De Votación Rápida') {
          if (this.modoDeReparto) {
            if ((this.modoDeReparto === 'Reparto libre') && this.puntosARepartir && this.listaDeConceptos) {
              this.puntuaciones = [];
              this.puntuaciones [0] = this.puntosARepartir;
              this.CrearJuegoDeVotacionRapida ();
            } else  if ((this.modoDeReparto !== 'Reparto libre') && this.puntuaciones && this.listaDeConceptos) {
              this.CrearJuegoDeVotacionRapida ();
            } else {
              this.alertCtrl.create({
                header: 'Faltan datos para poder crear el juego',
                buttons: ['OK']
              }).then (res => res.present());
            }

          } else {
            this.alertCtrl.create({
              header: 'Faltan datos para poder crear el juego',
              buttons: ['OK']
            }).then (res => res.present());
          }
      } else {
          if (this.presentacion && this.listaDeTurnos) {
            this.CrearJuegoDeCogerTurnoRapido();
          } else {
            this.alertCtrl.create({
              header: 'Faltan datos para poder crear el juego',
              buttons: ['OK']
            }).then (res => res.present());
          }

      }
    }
  }

}
