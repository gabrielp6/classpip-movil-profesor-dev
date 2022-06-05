import { Component, OnInit} from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { Alumno } from '../app/clases/Alumno';
import { SesionService, ComServerService } from './services';
import * as URL from '../app//URLs/urls';
import { Profesor } from './clases';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  profesor: Profesor;
  navigate: any;
  imagenPerfil: string;

  constructor(
    private sesion: SesionService,
    private comServer: ComServerService,
    private route: Router,
    public navCtrl: NavController,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.sesion.EnviameProfesor().subscribe ((profesor) => {
        this.profesor = profesor;
      //  this.imagenPerfil = URL.ImagenesPerfil + this.MiAlumno.ImagenPerfil;
      });
    });
  }

  GoOut() {
    this.comServer.Desconectar(this.profesor.id);
    this.route.navigateByUrl('/home');
  }

  GoMiPerfil() {
    console.log ('vamos a mi perfil');
    this.route.navigateByUrl('tabs/mi-perfil');
    //this.route.navigateByUrl('tabs/mis-grupos');
  }

  GoMisGrupos() {
    console.log ('vamos a mis grupos');
 
    this.route.navigateByUrl('tabs/mis-grupos');
  }

  GoMisJuegosActivos() {
    this.route.navigateByUrl('tabs/inici');
  }
  
  GoMisJuegosInactivos() {
    this.route.navigateByUrl('tabs/mis-juegos-inactivos');
  } 

  GoMisJuegosRapidos() {
    this.route.navigateByUrl('mis-juegos-rapidos');
  } 

   
  GoMisJuegosPreparados() {
    this.route.navigateByUrl('tabs/mis-juegos-inactivos');
  } 

  CrearJuegoRapido() {
    this.route.navigateByUrl('crear-juego-rapido');

  }
}