import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController} from '@ionic/angular';
import { PeticionesAPIService } from '../../services/index';
import { CalculosService } from '../../services/calculos.service';
import { Alumno, Equipo, Juego, TablaJornadas, AlumnoJuegoDeCompeticionLiga,
         TablaAlumnoJuegoDeCompeticion, TablaEquipoJuegoDeCompeticion, Jornada,
        EnfrentamientoLiga, EquipoJuegoDeCompeticionLiga } from '../../clases/index';
import { SesionService } from '../../services/sesion.service';
import { IonContent } from '@ionic/angular';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-juego-competicion-liga',
  templateUrl: './juego-competicion-liga.page.html',
  styleUrls: ['./juego-competicion-liga.page.scss'],
})
export class JuegoCompeticionLigaPage implements OnInit {

  juegoSeleccionado: Juego;
  MiAlumno: Alumno;
  MiEquipo: Equipo;
  MiAlumnoJuegoCompLiga: AlumnoJuegoDeCompeticionLiga;
  alumnosDelJuego: Alumno[];
  equiposDelJuego: Equipo[];
  listaAlumnosOrdenadaPorPuntos: AlumnoJuegoDeCompeticionLiga[];
  listaEquiposOrdenadaPorPuntos: EquipoJuegoDeCompeticionLiga[];
  rankingAlumnoJuegoDeCompeticion: TablaAlumnoJuegoDeCompeticion[] = [];
  rankingEquiposJuegoDeCompeticion: TablaEquipoJuegoDeCompeticion[] = [];
  infomialumno: TablaAlumnoJuegoDeCompeticion;
  infoMiEquipo: TablaEquipoJuegoDeCompeticion;
  alumnosEquipo: Alumno[];
  jornadas: Jornada[];
  JornadasCompeticion: TablaJornadas[] = [];
  enfrentamientosDelJuego: Array<Array<EnfrentamientoLiga>>;
  juegosActivosPuntos: Juego[] = [];

  public hideMe: boolean = false;
  public items: any = [];
  
  constructor(
    private sesion: SesionService,
    public navCtrl: NavController,
    private peticionesAPI: PeticionesAPIService,
    private calculos: CalculosService,
  ) { this.items = [
    { expanded: false },
  ]; }

  @ViewChild('content', { static: false }) content: IonContent;

  ngOnInit() {
    this.juegoSeleccionado = this.sesion.DameJuego();
    this.DameJornadasDelJuegoDeCompeticionSeleccionado();
  }

  expandItem(item): void {
    if (item.expanded) {
      item.expanded = false;
    } else {
      this.items.map(listItem => {
        if (item == listItem) {
          listItem.expanded = !listItem.expanded;
        } else {
          listItem.expanded = false;
        }
        return listItem;
      });
    }
  }

  expandItem2(item): void {
    if (item.expanded2) {
      item.expanded2 = false;
    } else {
      this.items.map(listItem => {
        if (item == listItem) {
          listItem.expanded2 = !listItem.expanded2;
        } else {
          listItem.expanded2 = false;
        }
        return listItem;
      });
    }
  }

  GoToManual() {
    console.log('Llego')
    this.navCtrl.navigateForward('/informacion-jornadas');
  }

  DameJornadasDelJuegoDeCompeticionSeleccionado() {

    console.log(this.juegoSeleccionado.Tipo);
    if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){

      this.peticionesAPI.DameJornadasDeCompeticionFormulaUno(this.juegoSeleccionado.id)
      .subscribe(inscripciones => {
        this.jornadas = inscripciones;
      });

    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){

      this.peticionesAPI.DameJornadasDeCompeticionLiga(this.juegoSeleccionado.id)
      .subscribe(inscripciones => {
        this.jornadas = inscripciones;
      });
      
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){

      this.peticionesAPI.DameJornadasDeCompeticionTorneo(this.juegoSeleccionado.id)
      .subscribe(inscripciones => {
        this.jornadas = inscripciones;
      });

    }
    
  }


  InformacionJornadas() {
    this.sesion.TomaDatosJornadas(this.jornadas);
    this.navCtrl.navigateForward('/informacion-jornadas');
  }

  EditarJornadas() {
    this.sesion.TomaDatosJornadas(this.jornadas);   
    this.navCtrl.navigateForward('/editar-jornadas');
  }

  Desactivar() {
    Swal.fire({
      title: '¿Seguro que quieres desactivar el juego?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, estoy seguro'
    }).then((result) => {
      if (result.value) {
        this.juegoSeleccionado.JuegoActivo = false;
        
        if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){

          this.peticionesAPI.CambiaEstadoJuegoDeCompeticionFormulaUno(this.juegoSeleccionado)
          .subscribe(res => {
            if (res !== undefined) {
              Swal.fire('El juego se ha desactivado correctamente');
              this.navCtrl.navigateForward('/inici');
            }
          });
    
        }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){
    
          this.peticionesAPI.CambiaEstadoJuegoDeCompeticionLiga(this.juegoSeleccionado)
          .subscribe(res => {
            if (res !== undefined) {
              Swal.fire('El juego se ha desactivado correctamente');
              this.navCtrl.navigateForward('/inici');
            }
          });

        }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){
    
          this.peticionesAPI.CambiaEstadoJuegoDeCompeticionTorneo(this.juegoSeleccionado)
          .subscribe(res => {
            if (res !== undefined) {
              Swal.fire('El juego se ha desactivado correctamente');
              this.navCtrl.navigateForward('/inici');
            }
          });

        }    
      }
    });
  }

  scrollToBottom(): void {
    this.content.scrollToBottom(300);
  }
  scrollToTop() {
    this.content.scrollToTop();
  }

}
