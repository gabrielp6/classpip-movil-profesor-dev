import { Component, OnInit, ViewChild } from '@angular/core';
import { Coleccion, Cromo } from '../../clases';
import { PeticionesAPIService, SesionService } from '../../services/index';
import * as URL from '../../URLs/urls';
import { AlertController, IonSlides, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-seleccionar-cromo',
  templateUrl: './seleccionar-cromo.page.html',
  styleUrls: ['./seleccionar-cromo.page.scss'],
})
export class SeleccionarCromoPage implements OnInit {

  coleccion: Coleccion;
  cromosColeccion: Cromo[];
  cromosImagenDelante: any[] = [];
  cromosImagenDetras: any[] = [];
  imagenesPreparadas = false;
  
  disablePrevBtn = true;
  disableNextBtn = false;
  @ViewChild(IonSlides, { static: false }) slides: IonSlides;


  constructor(
    private peticionesAPI: PeticionesAPIService,
    private sesion: SesionService,
    public modalCtrl: ModalController,
    private alertCtrl: AlertController,
  ) { }

  ngOnInit() {
    this.coleccion = this.sesion.DameColeccion();
    this.cromosColeccion = this.sesion.DameCromos();
    this.PreparaImagenes();
    this.slides.slideTo (0);
  }
  
  PreparaImagenes() {
    for (let i = 0; i < this.cromosColeccion.length; i++) {
      const cromo = this.cromosColeccion[i];
      this.cromosImagenDelante[i] = URL.ImagenesCromo + cromo.ImagenDelante;
      if (this.coleccion.DosCaras) {
        this.cromosImagenDetras[i] = URL.ImagenesCromo + cromo.ImagenDetras;
      }
    }
    this.imagenesPreparadas = true;
  }

  
  doCheck() {
    console.log ('do check');
    // Para decidir si hay que mostrar los botones de previo o siguiente slide
    const prom1 = this.slides.isBeginning();
    const prom2 = this.slides.isEnd();
  
    Promise.all([prom1, prom2]).then((data) => {
      data[0] ? this.disablePrevBtn = true : this.disablePrevBtn = false;
      data[1] ? this.disableNextBtn = true : this.disableNextBtn = false;
    });
  }

  
  next() {
    console.log ('next');
    this.slides.slideNext();
  }

  prev() {
    console.log ('prev');
    this.slides.slidePrev();
  }

  CromoSeleccionado(cromo) {
    console.log ('cromo seleccionado');
    console.log (cromo);
    this.alertCtrl.create({
      header: '¿Seguro que quieres asignar este cromo?',
      message: cromo.Nombre,
      buttons: [
        {
          text: 'SI',
          handler: async () => {

            this.modalCtrl.dismiss({
              cromoSeleccionado: cromo
            });

          }
        }, {
          text: 'NO',
          role: 'cancel',
          handler: () => {
            console.log('No regalo');
          }
        }
      ]
    }).then ( res => res.present());
  }


}
