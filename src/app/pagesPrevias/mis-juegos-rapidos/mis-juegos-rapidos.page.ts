import { Component, OnInit, ViewChild } from '@angular/core';
import { SesionService } from '../../services/sesion.service';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PeticionesAPIService } from '../../services/index';
import { CalculosService } from '../../services/calculos.service';
import { Juego, Equipo } from '../../clases/index';
import { Router } from '@angular/router';
import { JuegoSeleccionadoPage } from '../juego-seleccionado/juego-seleccionado.page';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'app-mis-juegos-rapidos',
  templateUrl: './mis-juegos-rapidos.page.html',
  styleUrls: ['./mis-juegos-rapidos.page.scss'],
})
export class MisJuegosRapidosPage implements OnInit {
  id: number;

  juegosRapidos: Juego[] = [];
  disablePrevBtn = true;
  disableNextBtn = false;
  @ViewChild(IonSlides, { static: false }) slides: IonSlides;

  constructor(
    private route: Router,
    public navCtrl: NavController,
    private sesion: SesionService,
    private peticionesAPI: PeticionesAPIService,
    private calculos: CalculosService
  ) { }
 
  ngOnInit() {
    this.id = this.sesion.DameProfesor().id;
    this.calculos.DameJuegosRapidos(this.id)
    .subscribe(juegos => {
      this.juegosRapidos = juegos;
      console.log ('ya tengo los juegos rápidos');
      console.log (this.juegosRapidos);
    });
   }
 
   ionViewWillEnter() {
     console.log ('vuelvo');
     this.calculos.DameJuegosRapidos(this.id)
     .subscribe(juegos => {
       this.juegosRapidos = juegos;
       console.log ('ya tengo DE NUEVO los juegos rápidos');
       console.log (this.juegosRapidos);
     });
   }
   
 
   JuegoSeleccionado(juego: any) {
     console.log ('juego seleccionado');
     console.log (juego);
 
     this.sesion.TomaJuego(juego);
     if (juego.Tipo === 'Juego De Encuesta Rápida') {
       this.navCtrl.navigateForward('/juego-encuesta-rapida');
     } else if (juego.Tipo === 'Juego De Votación Rápida') {
       this.navCtrl.navigateForward('/juego-votacion-rapida');
     } else if (juego.Tipo === 'Juego De Cuestionario Rápido') {
       console.log ('vaaaamos');
       this.navCtrl.navigateForward('/juego-cuestionario-rapido');
     } else if (juego.Tipo === 'Juego De Coger Turno Rápido') {
       this.navCtrl.navigateForward('/juego-coger-turno-rapido');
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
