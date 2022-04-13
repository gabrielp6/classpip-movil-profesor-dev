
import { Component, OnInit, ViewChild } from '@angular/core';
import { Coleccion, Cromo } from '../../clases';
import { PeticionesAPIService, SesionService } from '../../services/index';
import * as URL from '../../URLs/urls';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'app-ver-coleccion',
  templateUrl: './ver-coleccion.page.html',
  styleUrls: ['./ver-coleccion.page.scss'],
})
export class VerColeccionPage implements OnInit {
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
    private sesion: SesionService
  ) { }

  ngOnInit() {
    this.coleccion = this.sesion.DameColeccion();
    this.cromosColeccion = this.sesion.DameCromos();
    this.PreparaImagenes();
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


}
