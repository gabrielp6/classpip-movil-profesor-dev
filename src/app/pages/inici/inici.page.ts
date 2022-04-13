import { Component, OnInit, ViewChild } from '@angular/core';
import { SesionService } from '../../services/sesion.service';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PeticionesAPIService } from '../../services/index';
import { CalculosService } from '../../services/calculos.service';
import { Juego, Equipo, Grupo } from '../../clases/index';
import { Router } from '@angular/router';
import { JuegoSeleccionadoPage } from '../../pagesPrevias/juego-seleccionado/juego-seleccionado.page';
import { IonSlides } from '@ionic/angular';


@Component({
  selector: 'app-inici',
  templateUrl: './inici.page.html',
  styleUrls: ['./inici.page.scss'],
})
export class IniciPage implements OnInit {

  /* Creamos los array con los juegos activos e inactivos que solicitaremos a la API */
  id: number;
  juegosRapidos: Juego[] = [];
  juegosActivos: Juego[] = [];
  juegosInactivos: Juego[] = [];
  juegosPreparados: Juego[] = [];
  disablePrevBtn = true;
  disableNextBtn = false;
  listaGrupos: Grupo [];




  @ViewChild(IonSlides, { static: false }) slides: IonSlides;



  //animals: any[];

  constructor(
    private route: Router,
    public navCtrl: NavController,
    private sesion: SesionService,
    private peticionesAPI: PeticionesAPIService,
    private calculos: CalculosService
  ) { }
  

  ngOnInit() {
    this.id = this.sesion.DameProfesor().id;
    // this.ObtenJuegosDelProfesor();
 
  }
  ionViewWillEnter() {
    // Esto se ejecutara despues del noOnInit y cada vez que regresemos al inicio
    // De esta forma recuperamos la lista de juegos por si hubiera habido alguna novedad
    this.ObtenJuegosDelProfesor();
 
  }
  

  
  ObtenJuegosDelProfesor() {
    this.calculos.DameJuegosRapidos(this.id)
    .subscribe(juegos => {
      this.juegosRapidos = juegos;
      this.sesion.TomaJuegosRapidos (this.juegosRapidos);
    });
    this.juegosActivos = [];
    this.peticionesAPI.DameGruposProfesor(this.id)
    .subscribe(res => {
      this.listaGrupos = res;
      if (res[0] !== undefined) {
        let cont = 0;
        this.listaGrupos.forEach (grupo => {
          this.calculos.DameListaJuegos(grupo.id)
          .subscribe ( listas => {
                  this.juegosActivos = this.juegosActivos.concat (listas.activos);
                  this.juegosInactivos = this.juegosInactivos.concat (listas.inactivos);
                  this.juegosInactivos = this.juegosInactivos.concat (listas.preparados);
                  cont = cont + 1;
                  if (cont === this.listaGrupos.length) {
                    console.log ('ya tengo los juegos');
                    this.sesion.TomaJuegosInactivos (this.juegosInactivos);
                    this.sesion.TomaJuegosPreparados (this.juegosPreparados);
                  }
          });
        });
      }
    });
  }

  DameNombreGrupo(grupoId: number): string {
    return this.listaGrupos.filter (grupo => grupo.id === grupoId)[0].Nombre;
  }


  JuegoSeleccionado(juego: any) {

    this.sesion.TomaJuego(juego);
    if (juego.Tipo === 'Juego De Puntos') {
      this.navCtrl.navigateForward('/juego-puntos');
    } else if (juego.Tipo === 'Juego De Competición Liga') {
      this.navCtrl.navigateForward('/juego-competicion-liga');
    } else if (juego.Tipo === 'Juego De Competición Fórmula Uno') {
      this.navCtrl.navigateForward('/juego-competicion-f1');
    } else if (juego.Tipo === 'Juego De Cuestionario') {
      this.navCtrl.navigateForward('/juego-de-cuestionario');
    } else if (juego.Tipo === 'Juego De Geocaching') {
      this.navCtrl.navigateForward('/juego-de-geocaching');
    } else if (juego.Tipo === 'Juego De Avatar') {
      this.sesion.TomaJuegoAvatar(juego);
      this.navCtrl.navigateForward('/juego-avatar');
    } else if (juego.Tipo === 'Juego De Votación Uno A Todos') {
      this.navCtrl.navigateForward('/juego-votacion-uno-atodos');
    } else if (juego.Tipo === 'Juego De Votación Todos A Uno') {
      this.navCtrl.navigateForward('/juego-votacion-todos-auno');
    } else if (juego.Tipo === 'Juego De Cuestionario de Satisfacción') {
        this.navCtrl.navigateForward('/juego-cuestionario-satisfaccion');
    } else {
      this.navCtrl.navigateForward('/juego-colleccion');
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
