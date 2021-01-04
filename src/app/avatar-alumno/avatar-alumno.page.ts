import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Alumno, AlumnoJuegoDeAvatar, JuegoDeAvatar } from '../clases';
import { SesionService, PeticionesAPIService } from '../servicios';
import * as URL from '../URLs/urls';

@Component({
  selector: 'app-avatar-alumno',
  templateUrl: './avatar-alumno.page.html',
  styleUrls: ['./avatar-alumno.page.scss'],
})
export class AvatarAlumnoPage implements OnInit {
  alumno: Alumno;
  juegoSeleccionado: JuegoDeAvatar;
  imagenesAvatares = URL.ImagenesAvatares;
  audiosAvatares = URL.AudiosAvatares;
  inscripcionAlumnoJuegoAvatar: AlumnoJuegoDeAvatar;

  constructor(
    private sesion: SesionService,
    private peticionesAPI: PeticionesAPIService,
    private alertCtrl: AlertController,
  ) { }

  ngOnInit() {
    this.alumno = this.sesion.DameAlumno ();
    this.juegoSeleccionado = this.sesion.DameJuegoAvatar();
    this.inscripcionAlumnoJuegoAvatar = this.sesion.DameInscripcionAlumno();
  }
  CambiarPrivilegios() {
    this.alertCtrl.create({
      header: 'Modifica los privilegios',
      inputs: [
        {
          type: 'checkbox',
          label: 'Complemento 1',
          value: 0,
          checked: this.inscripcionAlumnoJuegoAvatar.Privilegios[0]
        },

        {
          type: 'checkbox',
          label: 'Complemento 2',
          value: 1,
          checked: this.inscripcionAlumnoJuegoAvatar.Privilegios[1]
        },

        {
          type: 'checkbox',
          label: 'Complemento 3',
          value: 2,
          checked: this.inscripcionAlumnoJuegoAvatar.Privilegios[2]
        },

        {
          type: 'checkbox',
          label: 'Complemento 4',
          value: 3,
          checked: this.inscripcionAlumnoJuegoAvatar.Privilegios[3]
        },

        {
          type: 'checkbox',
          label: 'Poner voz',
          value: 4,
          checked: this.inscripcionAlumnoJuegoAvatar.Privilegios[4]
        },

        {
          type: 'checkbox',
          label: 'Espiar',
          value: 5,
          checked: this.inscripcionAlumnoJuegoAvatar.Privilegios[5]
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
            this.inscripcionAlumnoJuegoAvatar.Privilegios = Array (6).fill (false);
            data.forEach (p => this.inscripcionAlumnoJuegoAvatar.Privilegios[p] = true);
            this.peticionesAPI.ModificaInscripcionAlumnoJuegoDeAvatar (this.inscripcionAlumnoJuegoAvatar)
            .subscribe (res => {
              this.alertCtrl.create({
                header: 'Privilegios cambiados',
                buttons: ['OK']
              }).then(res => {
                res.present();
              });
            });
          }
        }
      ]
    }).then ( res => res.present());
  }


}
