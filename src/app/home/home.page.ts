import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController, AngularDelegate } from '@ionic/angular';
// import { HttpClient } from '@angular/common/http';
import { Alumno, Profesor } from '../clases';
import { IniciPage } from '../inici/inici.page';
import { TabsPage } from '../tabs/tabs.page';
import { PeticionesAPIService, SesionService, ComServerService} from '../servicios/index';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
//import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { Camera } from '@ionic-native/camera/ngx';
//import { Camera, CameraOptions } from '@ionic-native/camera';

import { Transfer } from '@ionic-native/transfer';
import { Media, MediaObject } from '@ionic-native/media/ngx';

import { WheelSelector } from '@ionic-native/wheel-selector/ngx';

import { LocalNotifications } from '@ionic-native/local-notifications/ngx';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],

})
export class HomePage {
  profesor: Profesor;
  nombre: string;
  apellido: string;
  audioFile: MediaObject;
  playing = false;
  recording = false;
  disponible = false;
  maxTime: any = 30;
  hidevalue = false;
  timer: any;

  coords: any = { lat: 0, lng: 0 };
  latitud;
  longitud;




  panelOpenState = false;
   
  data: any;
  answer: any[] = [];
  cont: any[];
  jsonData: any;


  midiendo = false;

  contNotif = 0;
  juegoRapido = false;
  clave: string;
  nickname: string;
  registro = false;
  login = true;

  primerApellido: string;
  segundoApellido: string;
  username = "talleres";
  password = "talleres";
  email: string;
  contrasena: string;
  contrasenaRep: string;
  identificador: string;
  private alumnosEnClasspip: Alumno[];


  constructor(
    // private http: HttpClient,
    private route: Router,
    public navCtrl: NavController,
    private peticionesAPI: PeticionesAPIService,
    private sesion: SesionService,
    public loadingController: LoadingController,
    public alertController: AlertController,
    private geolocation: Geolocation,
    private file: File,
    private media: Media,
    private comServer: ComServerService,
    private selector: WheelSelector,
    private localNotifications: LocalNotifications,
   

    )  {

  
  }


   


    ionViewDidEnter() {
      this.peticionesAPI.DameTodosLosAlumnos()
      .subscribe (alumnos => this.alumnosEnClasspip = alumnos);


      // this.StartTimer();
    }



  StartTimer() {
    this.timer = setTimeout(x => {
          if (this.maxTime <= 0) { }
          this.maxTime -= 1;
          if (this.maxTime > 0 ) {
            this.hidevalue = false;
            this.StartTimer();
          } else {
              this.hidevalue = true;
          }

      }, 1000);

  }






    async presentLoading() {
      const loading = await this.loadingController.create({
        message: 'Verificando Usuario',
        duration: 1500
      });
      await loading.present();

      const { role, data } = await loading.onDidDismiss();

      console.log('Loading dismissed!');
    }

    async presentAlert() {
      const alert = await this.alertController.create({
        header: 'Error',
        // subHeader: 'Subtitle',
        message: 'Usuario y/o contraseña incorrectos',
        buttons: ['OK']
      });

      await alert.present();
    }
 
    Autentificar() {
       
        this.presentLoading();
        console.log ('voy a autentificar a: ' + this.username + ' ' + this.password);
        this.peticionesAPI.DameProfesor(this.username, this.password)
        .subscribe( (res) => {
          console.log ('ya esta');
          console.log (res);
          if (res[0] !== undefined) {
            this.profesor = res[0];
            this.sesion.TomaProfesor(this.profesor);
            this.comServer.Conectar(this.profesor.id);

            setTimeout(() => {
              this.route.navigateByUrl('inici');
            }, 1500);
          } else {
            // Aqui habría que mostrar alguna alerta al usuario
            setTimeout(() => {
              this.presentAlert();
            }, 1500);
            console.log('profesor no existe');
          }
        });
    }

    AccesoJuegoRapido() {
      this.juegoRapido = true;
      this.login = false;
    }
    
    AccesoRegistro() {
      this.registro = true;
      this.login = false;
    }
    VolverDeJuegoRapido() {
      this.juegoRapido = false;
      this.login = true;
    }
    VolverDeRegistro() {
      this.registro = false;
      this.login = true;
    }

    ValidaEmail(email) {
      const re = /\S+@\S+\.\S+/;
      return re.test(email);
    }

    UsernameUsado(username: string) {
      return this.alumnosEnClasspip.some (alumno => alumno.Username === username);
    }
    async Registro() {
      console.log ('registro');
      console.log (this.nombre);
      console.log (this.contrasena);
      if (this.UsernameUsado (this.username)) {
        const alert = await this.alertController.create({
          header: 'Ya existe el nombre de usuario en Classpip',
          buttons: ['OK']
        });
        await alert.present();

      } else if (this.contrasena !== this.contrasenaRep) {
        const alert = await this.alertController.create({
          header: 'No coincide la contraseña con la contraseña repetida',
          buttons: ['OK']
        });
        await alert.present();
      } else if (!this.ValidaEmail (this.email)) {
        const alert = await this.alertController.create({
          header: 'El email es incorrecto',
          buttons: ['OK']
        });
        await alert.present();
      } else {
        const identificador = Math.random().toString().substr(2, 5);
        const profesor = new Profesor (
          this.nombre,
          this.primerApellido,
          this.segundoApellido,
          this.username,
          this.email,
          this.contrasena,
          null,
          identificador
        );
        this.peticionesAPI.RegistraProfesor (profesor)
        .subscribe (
            // tslint:disable-next-line:no-shadowed-variable
            (res) =>  this.alertController.create({
                        header: 'Registro realizado con éxito',
                        buttons: ['OK']
                      // tslint:disable-next-line:no-shadowed-variable
                      }).then (res => res.present()),
            (err) =>  this.alertController.create({
                        header: 'Fallo en la conexion con la base de datos',
                        buttons: ['OK']
                      }).then (res => res.present()),
        );
      }
      this.nombre = undefined;
      this.contrasena = undefined;
      this.login = true;
      this.registro = false;
    }

    async EnviarContrasena() {
      if (this.username === undefined) {
        const alert = await this.alertController.create({
          header: 'Atención: Introduce un nombre de usuario en el formulario',
          buttons: ['OK']
        });
        await alert.present();
      } else {
        console.log ('voy a pedir contraseña');
        this.peticionesAPI.DameContrasenaProfesor (this.username)
        .subscribe (async (res) => {
            if (res[0] !== undefined) {
              const profesor = res[0]; // Si es diferente de null, el alumno existe
              // le enviamos la contraseña
              this.comServer.RecordarContrasena (profesor);
              const alert = await this.alertController.create({
                header: 'En breve recibirás un email con tu contraseña',
                buttons: ['OK']
              });
              await alert.present();
            } else {
              const alert = await this.alertController.create({
                header: 'No hay ningun profesor con este nombre de usuario',
                buttons: ['OK']
              });
              await alert.present();
            }
        });
      }
  
    }
}



