import { Component, OnInit } from '@angular/core';
import { PeticionesAPIService, SesionService, ComServerService } from '../servicios/index';
import { CalculosService } from '../servicios/calculos.service';
import { NavController, AlertController } from '@ionic/angular';
import { Alumno, JuegoDeAvatar, AlumnoJuegoDeAvatar, Profesor } from '../clases/index';

import * as URL from '../URLs/urls';
import { ModalController } from '@ionic/angular';
import {AvatarEditorPage} from '../avatar-editor/avatar-editor.page';

@Component({
  selector: 'app-juego-avatar',
  templateUrl: './juego-avatar.page.html',
  styleUrls: ['./juego-avatar.page.scss'],
})
export class JuegoAvatarPage implements OnInit {

  alumno: Alumno;
  profesor: Profesor;
  InfoMiAlumno: AlumnoJuegoDeAvatar;
  juegoSeleccionado: any;
  alumnosDelJuego: Alumno[];
  inscripcionesAlumnosJuegodeAvatar: AlumnoJuegoDeAvatar[];
  criterios: Array<{nombre: string, criterio: string}>;
  imagenSilueta: any;
  inscripcionAlumnoJuegoAvatar: AlumnoJuegoDeAvatar;
  tieneAvatar = false;
  interval;
  imagenesAvatares = URL.ImagenesAvatares;
  audioAvatar;
  tieneVoz = false;


  alumnosDelGrupo: Alumno[];



  constructor(
    public navCtrl: NavController,
    private sesion: SesionService,
    private peticionesAPI: PeticionesAPIService,
    public modalController: ModalController,
    private alertCtrl: AlertController,
    private comServer: ComServerService
  ) { }

  ngOnInit() {

      this.juegoSeleccionado = this.sesion.DameJuego();
      this.profesor = this.sesion.DameProfesor();
      
      if (this.juegoSeleccionado.Modo === 'Individual') {
        this.peticionesAPI.DameAlumnosGrupo (this.juegoSeleccionado.grupoId)
        .subscribe ( res => {
          this.alumnosDelGrupo = res;

        });
        this.peticionesAPI.DameInscripcionesAlumnoJuegoDeAvatar (this.juegoSeleccionado.id)
        .subscribe (res => {
          this.inscripcionesAlumnosJuegodeAvatar = res;
        });
      }

     
    // this.juegoSeleccionado = this.sesion.DameJuegoAvatar();
    // this.alumno = this.sesion.DameAlumno();
    // if (this.juegoSeleccionado.Modo === 'Individual') {
    //   this.peticionesAPI.DameInscripcionAlumnoJuegoDeAvatar (this.juegoSeleccionado.id, this.alumno.id)
    //   .subscribe (inscripcion => {
    //     this.inscripcionAlumnoJuegoAvatar = inscripcion[0];
    //     if (this.inscripcionAlumnoJuegoAvatar.Silueta !== undefined) {
    //       this.tieneAvatar = true;
    //       if ((this.inscripcionAlumnoJuegoAvatar.Privilegios[4]) && (this.inscripcionAlumnoJuegoAvatar.Voz)) {
    //         this.tieneVoz = true;
    //         this.audioAvatar = URL.AudiosAvatares + this.inscripcionAlumnoJuegoAvatar.Voz;
    //       }
    //     }
    //     this.PrepararCriterios();
    //   });
    //  } else {
    //    // De momento no hay juego de avatar de equipo
    //  }
  }

  MostrarAvatar(alumno) {
    this.sesion.TomaAlumno (alumno);
    this.sesion.TomaJuegoAvatar (this.juegoSeleccionado);
    const inscripcionAlumno = this.inscripcionesAlumnosJuegodeAvatar.filter (inscripcion => inscripcion.alumnoId === alumno.id)[0];
    this.sesion.TomaInscripcionAlumno (inscripcionAlumno);
    this.navCtrl.navigateForward('/avatar-alumno');
  }

  DarPrivilegiosATodos() {
    this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Selecciona los privilegios que quieres DAR a todos',
      inputs: [
        {
          type: 'checkbox',
          label: 'Complemento 1',
          value: 0,
        },

        {
          type: 'checkbox',
          label: 'Complemento 2',
          value: 1,
        },

        {
          type: 'checkbox',
          label: 'Complemento 3',
          value: 2,
        },

        {
          type: 'checkbox',
          label: 'Complemento 4',
          value: 3,
        },

        {
          type: 'checkbox',
          label: 'Poner voz',
          value: 4,
        },

        {
          type: 'checkbox',
          label: 'Espiar',
          value: 5,
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Ok',
          handler: (data: any) => {
            console.log('Confirm Ok');
            console.log (data);
            if (data.length === 0) {
              this.alertCtrl.create({
                header: 'No hay privilegios que añadir',
                buttons: ['OK']
              }).then(res => {
                res.present();
              });

            } else {
              this.inscripcionesAlumnosJuegodeAvatar.forEach (inscripcion => {
                data.forEach (p => inscripcion.Privilegios[p] = true);
                this.peticionesAPI.ModificaInscripcionAlumnoJuegoDeAvatar (inscripcion)
                .subscribe ();
              });
              this.alertCtrl.create({
                  header: 'Privilegios AÑADIDOS',
                  buttons: ['OK']
                }).then(res => {
                  res.present();
              });
            }

          }
        }
      ]
    }).then ( res => res.present());

  }

  QuitarPrivilegiosATodos() {
    this.alertCtrl.create({
      header: 'Selecciona los privilegios que quieres QUITAR a todos',
      inputs: [
        {
          type: 'checkbox',
          label: 'Complemento 1',
          value: 0,
        },

        {
          type: 'checkbox',
          label: 'Complemento 2',
          value: 1,
        },

        {
          type: 'checkbox',
          label: 'Complemento 3',
          value: 2,
        },

        {
          type: 'checkbox',
          label: 'Complemento 4',
          value: 3,
        },

        {
          type: 'checkbox',
          label: 'Poner voz',
          value: 4,
        },

        {
          type: 'checkbox',
          label: 'Espia',
          value: 5,
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Ok',
          handler: (data: any) => {
            console.log('Confirm Ok');
            console.log (data);
            if (data.length === 0) {
              this.alertCtrl.create({
                header: 'No hay privilegios que quitar',
                buttons: ['OK']
              }).then(res => {
                res.present();
              });

            } else {
              this.inscripcionesAlumnosJuegodeAvatar.forEach (inscripcion => {
                data.forEach (p => inscripcion.Privilegios[p] = false);
                this.peticionesAPI.ModificaInscripcionAlumnoJuegoDeAvatar (inscripcion)
                .subscribe ();
              });
              this.alertCtrl.create({
                  header: 'Privilegios QUITADOS',
                  buttons: ['OK']
                }).then(res => {
                  res.present();
              });
            }

          }
        }
      ]
    }).then ( res => res.present());

  }


}
