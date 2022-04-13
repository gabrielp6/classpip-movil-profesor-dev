import { Component, OnInit, ViewChild } from '@angular/core';
import { SesionService } from '../../services/sesion.service';
import { NavController, IonContent, LoadingController, AlertController } from '@ionic/angular';
import { PeticionesAPIService } from '../../services/index';
import { CalculosService } from '../../services/calculos.service';
import {
  Juego, Equipo, Alumno, MiAlumnoAMostrarJuegoDePuntos, Grupo,
  MiEquipoAMostrarJuegoDePuntos, Cromo, Coleccion, Profesor, AlumnoJuegoDeColeccion, Album
} from '../../clases/index';

import { ModalController } from '@ionic/angular';
import { IntercambiarCromosPage } from '../intercambiar-cromos/intercambiar-cromos.page';

import 'hammerjs';
import { LongPressModule } from 'ionic-long-press';


import * as URL from '../../URLs/urls';
import { IonSlides } from '@ionic/angular';
import { SeleccionarCromoPage } from '../seleccionar-cromo/seleccionar-cromo.page';
import { SeleccionarAlumnosPage } from '../seleccionar-alumnos/seleccionar-alumnos.page';

@Component({
  selector: 'app-juego-colleccion',
  templateUrl: './juego-colleccion.page.html',
  styleUrls: ['./juego-colleccion.page.scss'],
})
export class JuegoColleccionPage implements OnInit {

  juegoSeleccionado: Juego;


  cromosQueTengoImagenDelante: string[] = [];
  cromosQueTengoImagenDetras: string[] = [];
  cromosQueNoTengoImagenDelante: string[] = [];
  cromosQueNoTengoImagenDetras: string[] = [];
  cromosQueTengo: any[] = [];
  cromosQueNoTengo: any[] = [];
  cromosSinRepetidos: any[];
  alumno: Alumno;
  equipo: Equipo;
  alumnosJuegoDeColeccion: Alumno[] = [];
  equiposJuegoDeColeccion: Equipo[] = [];

  sliderConfig: any;
  coleccion: Coleccion;

  progress = 0;
  elem: any;
  pos: number;
  preparado: boolean = false;

  disablePrevBtn = true;
  disableNextBtn = false;

  profesor: Profesor;
  alumnosDelGrupo: Alumno[];
 
 
  cromosColeccion: Cromo[];
  inscripcionesAlumnos: AlumnoJuegoDeColeccion[];
  probabilidadCromos: number[];




  @ViewChild(IonSlides, { static: false }) slides: IonSlides;



  constructor(
    private sesion: SesionService,
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    private peticionesAPI: PeticionesAPIService,
    private calculos: CalculosService,
    public modalController: ModalController
  ) { }

  @ViewChild('content', { static: false }) content: IonContent;

  ngOnInit() {
    this.sliderConfig = {
      slidesPerView: 1.6,
      spaceBetween: 10,
      centeredSlides: true
    };
    this.juegoSeleccionado = this.sesion.DameJuego();
    this.profesor = this.sesion.DameProfesor();
    this.peticionesAPI.DameColeccion(this.juegoSeleccionado.coleccionId)
    .subscribe (coleccion => {
      this.coleccion = coleccion;
      this.peticionesAPI.DameCromosColeccion(this.coleccion.id)
      .subscribe(res => {
          this.cromosColeccion = res;
      
          this.probabilidadCromos = [];
          // tslint:disable-next-line:prefer-for-of
          for (let i = 0; i < this.cromosColeccion.length; i ++) {
              if (this.cromosColeccion[i].Probabilidad === 'Muy Baja') {
                this.probabilidadCromos[i] = 3;

              } else if (this.cromosColeccion[i].Probabilidad === 'Baja') {

                this.probabilidadCromos[i] = 7;

              } else if (this.cromosColeccion[i].Probabilidad === 'Media') {

                this.probabilidadCromos[i] = 20;

              } else if (this.cromosColeccion[i].Probabilidad === 'Alta') {

                this.probabilidadCromos[i] = 30;

              } else {

                this.probabilidadCromos[i] = 40;

              }
          }

          if (this.juegoSeleccionado.Modo === 'Individual') {
            this.peticionesAPI.DameAlumnosGrupo (this.juegoSeleccionado.grupoId)
            .subscribe ( res => {
              this.alumnosDelGrupo = res;
            });

            this.peticionesAPI.DameInscripcionesAlumnoJuegoDeColeccion(this.juegoSeleccionado.id)
            .subscribe(inscripciones => {
              this.inscripcionesAlumnos = inscripciones;
            });

            this.peticionesAPI.DameCromosColeccion(this.coleccion.id)
            .subscribe(res => {
                this.cromosColeccion = res;
            });
          } else {
            console.log ('juego de colección en equipo');
            console.log (this.juegoSeleccionado);
          }
      });
    });
  }

  MostrarAlbum(alumno) {
    this.sesion.TomaAlumno (alumno);
    this.sesion.TomaColeccion (this.coleccion);
    this.DameLosCromosDelAlumnoYMuestraAlbum (alumno);

  }

 

  async SeleccionarAlumnos(): Promise<any> {
    // La selección de los alumnos quería hacerla con una alerta con checkbox, pero 
    // no vi la manera de tener un boton para seleccionarlos todos.
    // Por eso lo hago con una página a la que accedo de forma modal.
    this.sesion.TomaAlumnosJuegoDeColeccion (this.alumnosDelGrupo);
    const modalAlumnos = await this.modalController.create({
      component: SeleccionarAlumnosPage,
      cssClass: 'my-custom-class',
    });
    await modalAlumnos.present();
    // tslint:disable-next-line:semicolon
    const { data }  = await modalAlumnos.onWillDismiss();
    return data.seleccion;
  }

  AsignacionSeleccion() {
    this.alertCtrl.create({
        header: 'Asigna cromos a alumnos seleccionados',
        subHeader: 'Indica qué deseas hacer',
        buttons: [
          {
            text: 'Asignar un sobre de cromos a alumnos seleccionados',
            handler: () => {
              console.log('Asignar un sobre de cromos al alumno seleccionado');
              this.alertCtrl.create({
                header: 'Introduce el número de cromos del sobre',
                inputs: [
                  {
                    name: 'numero',
                    placeholder: 'Número de cromos del sobre',
                  },
                ],
                buttons: [
                  {
                    text: 'Cancelar',
                    handler: (data: any) => {
                    }
                  },
                  {
                    text: 'Hecho',
                    handler:  (res: any) => {

                      if ( (res.numero) < 1 || !Number.isInteger (Number(res.numero))) {
                        console.log('No es un numero');
                        this.alertCtrl.create({
                          header: 'Introduce bien el número de cromos',
                          buttons: ['OK']
                        }).then(res => {
                          res.present();
                        });
                        return false;
                      } else {


                        // En esta ocasión activo la seleccion de alumnos de manera diferente.
                        // Si lo hago con una llamada normar que recoge el resultado de la función
                        // tengo que poner un await para que espere los resultados. Pero entonces
                        // me obliga a poner async al handler, y en ese caso, si el número introdicido 
                        // es erroneo cierra el dialogo (return false no tiene efecto)
                        this.SeleccionarAlumnos()
                        .then (seleccion => {
                          console.log ('seleccion');
                          console.log (seleccion);
                          if (seleccion) {
                            let i;
                            for (i = 0; i < this.alumnosDelGrupo.length; i++) {
                              if (seleccion[i]) {
                                this.calculos.AsignarCromosAleatoriosAlumno (
                                  // tslint:disable-next-line:max-line-length
                                  this.alumnosDelGrupo[i], this.inscripcionesAlumnos,  res.numero, this.probabilidadCromos, this.cromosColeccion)
                              }
                            }
                            this.alertCtrl.create({
                              header: 'Cromos asignados',
                              buttons: ['OK']
                            }).then(res => {
                              res.present();
                            });
                          }

                        })
                      }
                    }
                  }
                ]
              }).then(res => {
                res.present();
              });
            }
          },
          {
            text: 'Asignar un cromo concreto a alumnos seleccionados',
            handler: async () => {
              console.log('Asignar un cromo concreto a alumnos seleccionados');
              this.sesion.TomaColeccion (this.coleccion);
              this.sesion.TomaCromos (this.cromosColeccion);
              const modalCromo = await this.modalController.create({
                component: SeleccionarCromoPage,
                cssClass: 'my-custom-class',
              });
              await modalCromo.present();
              const { data } = await modalCromo.onWillDismiss();
              // En data me indica si ha regalado el cromo o no
              const cromoSeleccionado = data.cromoSeleccionado;
              console.log ('cromo seleccionado');
              console.log (cromoSeleccionado);
              const seleccion = await this.SeleccionarAlumnos();
              if (seleccion) {
          
                let i;
                for (i = 0; i < this.alumnosDelGrupo.length; i++) {
                  if (seleccion[i]) {
                    // tslint:disable-next-line:max-line-length
                    const inscripcionId = this.inscripcionesAlumnos.filter (inscripcion => inscripcion.alumnoId === this.alumnosDelGrupo[i].id)[0].id;
                    this.peticionesAPI.AsignarCromoAlumno(new Album (inscripcionId, cromoSeleccionado.id))
                    .subscribe();
                  }
                }
                this.alertCtrl.create({
                  header: 'Cromo asignado',
                  buttons: ['OK']
                }).then(res => {
                  res.present();
                });
              }
            }
          }
        ]
      }).then(res => {
        res.present();
    });

  }

  
  // DameLosCromosDelEquipo() {
  //   console.log ('voy a por los cromos del equipo');

  //   // primero me traigo el equipo del alumno que participa en el juego
  //   this.calculos.DameEquipoAlumnoEnJuegoDeColeccion (this.alumno.id, this.juegoSeleccionado.id)
  //   .subscribe (equipo => {
  //     this.equipo = equipo;
  //     // Ahora traigo la inscripcion del equipo en el juego
  //     this.peticionesAPI.DameInscripcionEquipoJuegoDeColeccion(this.juegoSeleccionado.id, equipo.id)
  //     .subscribe(inscripcionEquipo => {
  //       // Y ahora me traigo los cromos del equipo
  //       this.peticionesAPI.DameCromosEquipo(inscripcionEquipo[0].id)
  //       .subscribe(CromosEquipo => {
  //           console.log('aquí están los cromos: ');
  //           console.log(CromosEquipo);
  //           // this.AlumnoMisCromos = CromosAlumno;
  //           this.cromosQueTengo = CromosEquipo;
  //           // this.AlumnolistaCromosSinRepetidos = this.calculos.GeneraListaSinRepetidos(this.cromosDelAlumno);
  //           this.cromosSinRepetidos = this.calculos.GeneraListaSinRepetidos(this.cromosQueTengo);
  //           // this.sesion.TomaCromosSinRepetidos(this.cromosSinRepetidos);
  //           this.peticionesAPI.DameCromosColeccion(this.juegoSeleccionado.coleccionId).subscribe(
  //             todosLosCromos => {
  //               console.log('aqui estan todos los cromos');
  //               console.log(todosLosCromos);
  //              // this.AlumnoCromosQueNoTengo = this.calculos.DameCromosQueNoTengo(this.AlumnoMisCromos, TodosLosCromosAlumno);
  //               console.log ('cromos que tengo');
  //               console.log (this.cromosQueTengo);
  //               this.cromosQueNoTengo = this.calculos.DameCromosQueNoTengo(this.cromosQueTengo, todosLosCromos);
  //               console.log ('cromos que NO tengo');
  //               console.log (this.cromosQueNoTengo);
  //               this.PreparaImagenesCromosQueTengo();
  //               this.PreparaImagenesCromosQueFaltan();
  //               this.preparado = true;
  //             });
  //         });


  //     });


  //   });

  // }


  DameLosCromosDelAlumnoYMuestraAlbum(alumno) {
    this.peticionesAPI.DameInscripcionAlumnoJuegoDeColeccion(this.juegoSeleccionado.id, alumno.id).subscribe(
        InscripcionAlumno => {
          this.peticionesAPI.DameCromosAlumno(InscripcionAlumno[0].id).subscribe(
            CromosAlumno => {
              console.log('aquí están los cromos: ');
              console.log(CromosAlumno);
              // this.AlumnoMisCromos = CromosAlumno;
              this.cromosQueTengo = CromosAlumno;
              this.sesion.TomaCromos (this.cromosQueTengo);
              this.navCtrl.navigateForward('/album-alumno');
            });
        });
  }



  VerColeccion() {
    this.sesion.TomaColeccion (this.coleccion);
    this.sesion.TomaCromos (this.cromosColeccion);
    this.navCtrl.navigateForward('/ver-coleccion');

  }

  AsignacionAleatoria() {
    this.alertCtrl.create({
      header: 'Asignación aleatoria',
      subHeader: 'Asigna un sobre de cromos a un alumno elegido aleatoriamente',
      message: 'Introduce el número de cromos del sobre',
      inputs: [
        {
          name: 'numero',
          placeholder: 'Número de cromos del sobre',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          handler: (data: any) => {
            console.log('Canceled', data);
          }
        },
        {
          text: 'Hecho',
          handler: (res: any) => {
            console.log('Numero de cromos', res.numero);

            if ( (res.numero) < 1 || !Number.isInteger (Number(res.numero))) {
              console.log('No es un numero');
              this.alertCtrl.create({
                header: 'Introduce bien el número de cromos',
                buttons: ['OK']
              }).then(res => {
                res.present();
              });
              return false;

            } else {

              this.AsignarCromosAleatoriosAlumnoAleatorio (res.numero);
            }

          }
        }
      ]
    }).then(res => {
      res.present();
    });

  }

  
  AsignarCromosAleatoriosAlumnoAleatorio(numeroCromos: number) {
    const numeroAlumnos = this.alumnosDelGrupo.length;
    const elegido = Math.floor(Math.random() * numeroAlumnos);
    const alumnoElegido = this.alumnosDelGrupo[elegido];
    this.alertCtrl.create({
      header: 'Confirmación de asignación aleatoria',
      // tslint:disable-next-line:max-line-length
      message: '¿Quieres asignar ' + numeroCromos + ' cromos a <strong> ' + alumnoElegido.Nombre + ' ' + alumnoElegido.PrimerApellido + ' ' + alumnoElegido.SegundoApellido + ' </strong>?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
          }
        },
        {
          text: 'Si',
          handler: () => {
            console.log ('voy a asignar cromos');
            console.log (this.cromosColeccion);
            this.calculos.AsignarCromosAleatoriosAlumno (
              alumnoElegido, this.inscripcionesAlumnos, numeroCromos, this.probabilidadCromos, this.cromosColeccion
            );
            this.alertCtrl.create({
              header: 'Cromos asignados',
              buttons: ['OK']
            }).then(res => {
        
              res.present();
        
            });

          }
        }
      ]
    }).then(res => {
      res.present();
    });
  }


}

