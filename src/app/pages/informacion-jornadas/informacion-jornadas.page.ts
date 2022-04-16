import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PeticionesAPIService } from '../../services/index';
import { CalculosService } from '../../services/calculos.service';
import {
  Alumno, Juego, Jornada, TablaJornadas, EnfrentamientoLiga, TablaAlumnoJuegoDeCompeticion,

  TablaEquipoJuegoDeCompeticion, AlumnoJuegoDeCompeticionLiga, TablaClasificacionJornada, Equipo

} from '../../clases/index';
import { SesionService } from '../../services/sesion.service';
import { typeWithParameters } from '@angular/compiler/src/render3/util';

@Component({
  selector: 'app-informacion-jornadas',
  templateUrl: './informacion-jornadas.page.html',
  styleUrls: ['./informacion-jornadas.page.scss'],
})
export class InformacionJornadasPage implements OnInit {

  juegoSeleccionado: Juego;
  jornadas: Jornada[];
  numeroTotalJornadas: number;
  JornadasCompeticion: TablaJornadas[] = [];
  listaAlumnosClasificacion: TablaAlumnoJuegoDeCompeticion[] = [];
  listaEquiposClasificacion: TablaEquipoJuegoDeCompeticion[] = [];
  MiAlumno: Alumno;
  MiEquipo: Equipo;

  EnfrentamientosJornadaSeleccionada: EnfrentamientoLiga[] = [];
  botonResultadosDesactivado: boolean;

  //f1
  tablaf1Jornada: TablaClasificacionJornada[] = [];
  tablaf1Juego: EnfrentamientoLiga[][];
  datosClasificacionJornada: {
    participante: string[];
    puntos: number[];
    posicion: number[];
    participanteId: number[];
  };
  TablaClasificacionJornadaSeleccionada: TablaClasificacionJornada[];
  GanadoresJornadaF1: TablaClasificacionJornada[];

  constructor(
    private sesion: SesionService,
    public navCtrl: NavController,
    private peticionesAPI: PeticionesAPIService,
    private calculos: CalculosService,
  ) { }

  ngOnInit() {
    this.juegoSeleccionado = this.sesion.DameJuego();
    const datos = this.sesion.DameDatosJornadas();
    this.JornadasCompeticion = datos.jornadas;
  }

  JornadaFinalizada(jornadaSeleccionada: TablaJornadas) {
    const jornadaFinalizada = this.calculos.JornadaFinalizada(this.juegoSeleccionado, jornadaSeleccionada);
    if (jornadaFinalizada === true) {
      this.botonResultadosDesactivado = true;
    } else {
      this.botonResultadosDesactivado = false;
    }
    return jornadaFinalizada;
  }

}
