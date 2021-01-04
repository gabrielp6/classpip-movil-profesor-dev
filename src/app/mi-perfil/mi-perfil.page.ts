import { Component, OnInit } from '@angular/core';
import { PeticionesAPIService} from '../servicios/index';
import { SesionService} from '../servicios/sesion.service';
import { CalculosService } from '../servicios/calculos.service';
import { Juego, Equipo, Alumno, MiAlumnoAMostrarJuegoDePuntos, Grupo, MiEquipoAMostrarJuegoDePuntos, Profesor } from '../clases/index';
import { File } from '@ionic-native/file/ngx';
import { ActionSheetController, AlertController } from '@ionic/angular';
// import { Camera, CameraOptions } from '@ionic-native/Camera/ngx';
import * as URL from '../URLs/urls';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.page.html',
  styleUrls: ['./mi-perfil.page.scss'],
})
export class MiPerfilPage implements OnInit {

  base64Image: any;
  profesor: Profesor;
  MiImagenAlumno: string[] = [];
  MisAlumnosAMostrar: MiAlumnoAMostrarJuegoDePuntos[] = [];
  imagenPerfil: string;
  contrasenaRep: string;
  cambio = false;
  cambioPass = false;

  constructor(
    private peticionesAPI: PeticionesAPIService,
    private sesion: SesionService,
    private calculos: CalculosService,
    public alertController: AlertController,
    //public camera: Camera,
    public actionSheetController: ActionSheetController,
    private file: File
  ) { }

  ngOnInit() {
    console.log ('estoy en mi perfil');
    this.profesor = this.sesion.DameProfesor();
    console.log (this.profesor);
   
  }

 


  CambiarImagen() {
    document.getElementById('inputImagen').click();
  }

  EmailCorrecto(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }


  SeleccionarImagenPerfil($event) {
    const imagen = $event.target.files[0];
    const formData = new FormData();
    formData.append(imagen.name, imagen);
    this.peticionesAPI.PonImagenPerfil(formData)
    .subscribe (() => {
      this.profesor.ImagenPerfil = URL.ImagenesPerfil + imagen.name;
      this.peticionesAPI.ModificaProfesor (this.profesor).subscribe();
     });
  }
  async CambiarDatos () {


    const confirm = await this.alertController.create({
      header: '¿Seguro que quieres modificar tus datos?',
      buttons: [
        {
          text: 'SI',
          handler: async () => {
            if (this.cambioPass && (this.profesor.Password !== this.contrasenaRep)) {
              const alert = await this.alertController.create({
                header: 'No coincide la contraseña con la contraseña repetida',
                buttons: ['OK']
              });
              await alert.present();
            } else if (!this.EmailCorrecto (this.profesor.email)) {
              const alert = await this.alertController.create({
                header: 'El email es incorrecto',
                buttons: ['OK']
              });
              await alert.present();
            } else {
                this.peticionesAPI.ModificaProfesor (this.profesor)
                .subscribe (async () => {
                  const alert = await this.alertController.create({
                    header: 'Datos modificados con éxito',
                    buttons: ['OK']
                  });
                  await alert.present();
                });
            }
          }
        }, {
          text: 'NO',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    await confirm.present();



  }
}
