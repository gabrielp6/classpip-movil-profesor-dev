import { Component, OnInit } from '@angular/core';

import { PeticionesAPIService, CalculosService, SesionService } from '../servicios/index';
import { NavController, IonContent, LoadingController, AlertController } from '@ionic/angular';
import {
  Juego, Equipo, Alumno, MiAlumnoAMostrarJuegoDePuntos, Grupo,
  MiEquipoAMostrarJuegoDePuntos, Cromo, Coleccion, Profesor
} from '../clases/index';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-seleccionar-alumnos',
  templateUrl: './seleccionar-alumnos.page.html',
  styleUrls: ['./seleccionar-alumnos.page.scss'],
})
export class SeleccionarAlumnosPage implements OnInit {

  alumnosDelGrupo: Alumno [];
  seleccion: boolean[];
  todos = false;

  constructor(
    private sesion: SesionService,
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    private peticionesAPI: PeticionesAPIService,
    private calculos: CalculosService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.alumnosDelGrupo = this.sesion.DameAlumnosJuegoDeColeccion();
    console.log (this.alumnosDelGrupo);
    this.seleccion = Array (this.alumnosDelGrupo.length).fill (false);
  }

  Toggle() {

    if (this.todos) {
      this.seleccion = Array (this.alumnosDelGrupo.length).fill (false);
      this.todos = false;
    } else {
      this.seleccion = Array (this.alumnosDelGrupo.length).fill (true);
      this.todos = true;
    }

  }

  
  radioSelect(event, i) {
    this.seleccion [i] = !this.seleccion [i];
  }

  AceptarSeleccion() {
    this.modalCtrl.dismiss({
      seleccion: this.seleccion
    });
  }

  HaySeleccion() {
    return this.seleccion.some (item => item);
  }

  Cancelar() {
    this.modalCtrl.dismiss({
      seleccion: undefined
    });

  }


}
