import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
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

  datasourceAlumno;
  datasourceEquipo;
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
  juegosPuntos: Juego[] = [];
  juegosCuestionariosTerminados: Juego[] = [];
  juegosDeVotacionUnoATodosTerminados: any[] = [];
  alumnosDelEquipo: Alumno[];

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
    console.log ('juego de liga que estamos probando');
    console.log(this.juegoSeleccionado);

    this.DameJornadasDelJuegoDeCompeticionSeleccionado();
    this.DameJuegosDePuntos();
    this.DameJuegosDeCuestionariosAcabados();
    this.DameJuegosdeVotacionUnoATodosAcabados();
  }

  DameJornadasDelJuegoDeCompeticionSeleccionado() {

    console.log(this.juegoSeleccionado.Tipo);
    if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){

      this.peticionesAPI.DameJornadasDeCompeticionFormulaUno(this.juegoSeleccionado.id)
      .subscribe(inscripciones => {
        this.jornadas = inscripciones;
        this.DameEnfrentamientosDelJuego();
      });

    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){

      this.peticionesAPI.DameJornadasDeCompeticionLiga(this.juegoSeleccionado.id)
      .subscribe(inscripciones => {
        this.jornadas = inscripciones;
        this.DameEnfrentamientosDelJuego();
      });
      
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){

      this.peticionesAPI.DameJornadasDeCompeticionTorneo(this.juegoSeleccionado.id)
      .subscribe(inscripciones => {
        this.jornadas = inscripciones;
        this.DameEnfrentamientosDelJuego();
      });

    }
    
  }

  DameEnfrentamientosDelJuego() {
    console.log('Estoy en DameEnfrentamientosDeLasJornadas()');
    let jornadasCounter = 0;
    this.enfrentamientosDelJuego = [];

    for (let i = 0; i < this.jornadas.length; i++) {
      console.log ('siguiente jornada');
      this.enfrentamientosDelJuego[i] = [];
      this.peticionesAPI.DameEnfrentamientosDeCadaJornadaLiga(this.jornadas[i].id)
      .subscribe((enfrentamientosDeLaJornada: Array<EnfrentamientoLiga>) => {
        jornadasCounter++;
        console.log('Los enfrentamiendos de la jornadaId ' + this.jornadas[i].id + ' son: ');
        console.log(enfrentamientosDeLaJornada);
        for (let j = 0; j < enfrentamientosDeLaJornada.length; j++) {
          this.enfrentamientosDelJuego[i][j] = new EnfrentamientoLiga();
          this.enfrentamientosDelJuego[i][j] = enfrentamientosDeLaJornada[j];
        }
        if (jornadasCounter === this.jornadas.length) {
          console.log('La lista final de enfrentamientos del juego es: ');
          console.log(this.enfrentamientosDelJuego);
          if (this.juegoSeleccionado.Modo === 'Individual') {
            this.AlumnosDelJuego();
          } else {
            this.EquiposDelJuego();
          }
        }
      });
    }
  }

  AlumnosDelJuego() {
    console.log ('Vamos a por los alumnos');
    console.log('Id juegoSeleccionado: ' + this.juegoSeleccionado.id);
    this.peticionesAPI.DameAlumnosJuegoDeCompeticionLiga(this.juegoSeleccionado.id)
    .subscribe(alumnosJuego => {
      console.log ('Ya tengo los alumnos: ' );
      console.log (alumnosJuego);
      this.alumnosDelJuego = alumnosJuego;
      this.RecuperarInscripcionesAlumnoJuego();
    });
  }

  EquiposDelJuego() {
    console.log ('Vamos a por los equipos');
    console.log('Id juegoSeleccionado: ' + this.juegoSeleccionado.id);
    this.peticionesAPI.DameEquiposJuegoDeCompeticionLiga(this.juegoSeleccionado.id)
    .subscribe(equiposJuego => {
      console.log ('ya tengo los equipos');
      console.log (equiposJuego);
      this.equiposDelJuego = equiposJuego;
      this.RecuperarInscripcionesEquiposJuego();
    });
  }

  AlumnosDelEquipo(equipo: Equipo) {
    console.log(equipo);

    this.peticionesAPI.DameAlumnosEquipo (equipo.id)
    .subscribe(res => {
      if (res[0] !== undefined) {
        this.alumnosDelEquipo = res;
        console.log('Los alumnos del equipo ' + equipo.id + ' son: ');
        console.log(res);
      } else {
        console.log('No hay alumnos en este equipo');
        this.alumnosDelEquipo = undefined;
      }
    });
  }

  /*AccederAlumno(alumno: TablaAlumnoJuegoDeCompeticion) {

    const alumnoSeleccionado = this.alumnosDelJuego.filter(res => res.Nombre === alumno.nombre &&
      res.PrimerApellido === alumno.primerApellido && res.SegundoApellido === alumno.segundoApellido)[0];

    const posicion = this.rankingAlumnoJuegoDeCompeticion.filter(res => res.nombre === alumno.nombre &&
      res.primerApellido === alumno.primerApellido && res.segundoApellido === alumno.segundoApellido)[0].posicion;

      // Informacion que se necesitara para ver la evolución del alumno, faltará la función DameDatosEvolucionAlumno..
    this.sesion.TomaDatosEvolucionAlumnoJuegoCompeticionLiga (
      posicion,
      alumnoSeleccionado,
      this.listaAlumnosOrdenadaPorPuntos.filter(res => res.AlumnoId === alumnoSeleccionado.id)[0]
    );
  }*/


  // Recupera los AlumnoJuegoDeCompeticionLiga del juegoSeleccionado.id ordenados por puntos de mayor a menor
  RecuperarInscripcionesAlumnoJuego() {
    this.peticionesAPI.DameInscripcionesAlumnoJuegoDeCompeticionLiga(this.juegoSeleccionado.id)
    .subscribe(inscripciones => {
      this.listaAlumnosOrdenadaPorPuntos = inscripciones;
      console.log ('AlumnosJuegoDeCompeticionLiga: ');
      console.log (this.listaAlumnosOrdenadaPorPuntos);
      // ordena la lista por puntos
      this.listaAlumnosOrdenadaPorPuntos = this.listaAlumnosOrdenadaPorPuntos.sort(function(obj1, obj2) {
        console.log (obj2.PuntosTotalesAlumno + ' ; ' + obj1.PuntosTotalesAlumno);
        return obj2.PuntosTotalesAlumno - obj1.PuntosTotalesAlumno;
      });
      console.log(this.listaAlumnosOrdenadaPorPuntos);
      this.TablaClasificacionTotal();
    });
  }

  // Recupera los EquipoJuegoDeCompeticionLiga del juegoSeleccionado.id ordenados por puntos de mayor a menor
  RecuperarInscripcionesEquiposJuego() {
    this.peticionesAPI.DameInscripcionesEquipoJuegoDeCompeticionLiga(this.juegoSeleccionado.id)
    .subscribe(inscripciones => {
      this.listaEquiposOrdenadaPorPuntos = inscripciones;
      // ordena la lista por puntos
      this.listaEquiposOrdenadaPorPuntos = this.listaEquiposOrdenadaPorPuntos.sort(function(obj1, obj2) {
        console.log (obj2.PuntosTotalesEquipo + ' ; ' + obj1.PuntosTotalesEquipo);
        return obj2.PuntosTotalesEquipo - obj1.PuntosTotalesEquipo;
      });
      console.log(this.listaEquiposOrdenadaPorPuntos);
      this.TablaClasificacionTotal();
    });
  }

  TablaClasificacionTotal() {

    if (this.juegoSeleccionado.Modo === 'Individual') {
      this.rankingAlumnoJuegoDeCompeticion = this.calculos.PrepararTablaRankingIndividualLiga (this.listaAlumnosOrdenadaPorPuntos,
                                                                                               this.alumnosDelJuego, this.jornadas,
                                                                                               this.enfrentamientosDelJuego);
      console.log ('Estoy en TablaClasificacionTotal(), la tabla que recibo desde calculos es:');
      console.log (this.rankingAlumnoJuegoDeCompeticion);
      this.datasourceAlumno = new MatTableDataSource(this.rankingAlumnoJuegoDeCompeticion);

    } else {
      this.rankingEquiposJuegoDeCompeticion = this.calculos.PrepararTablaRankingEquipoLiga (this.listaEquiposOrdenadaPorPuntos,
                                                                                            this.equiposDelJuego, this.jornadas,
                                                                                            this.enfrentamientosDelJuego);
      this.datasourceEquipo = new MatTableDataSource(this.rankingEquiposJuegoDeCompeticion);
      console.log('Estoy en TablaClasificacionTotal(), la tabla que recibo desde calculos es:');
      console.log (this.rankingEquiposJuegoDeCompeticion);
    }
  }

  applyFilter(filterValue: string) {
    this.datasourceAlumno.filter = filterValue.trim().toLowerCase();
  }

  applyFilterEquipo(filterValue: string) {
    this.datasourceEquipo.filter = filterValue.trim().toLowerCase();
  }

  EditarJornadas() {
    this.sesion.TomaJuego (this.juegoSeleccionado);
    this.JornadasCompeticion = this.calculos.GenerarTablaJornadasLiga(this.juegoSeleccionado, this.jornadas, this.enfrentamientosDelJuego);
    this.sesion.TomaDatosJornadas(this.jornadas,this.JornadasCompeticion); 
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

  InformacionJornadas() {
    this.sesion.TomaJuego (this.juegoSeleccionado);
    this.JornadasCompeticion = this.calculos.GenerarTablaJornadasLiga(this.juegoSeleccionado, this.jornadas, this.enfrentamientosDelJuego);
    this.sesion.TomaDatosJornadas(this.jornadas,this.JornadasCompeticion);
    this.sesion.TomaTablaAlumnoJuegoDeCompeticion(this.rankingAlumnoJuegoDeCompeticion);
    this.sesion.TomaTablaEquipoJuegoDeCompeticion(this.rankingEquiposJuegoDeCompeticion);
    this.navCtrl.navigateForward('/informacion-jornadas');
  }

  AsignacionGanador(){
    this.sesion.TomaJuego (this.juegoSeleccionado);
    this.JornadasCompeticion = this.calculos.GenerarTablaJornadasLiga(this.juegoSeleccionado, this.jornadas, this.enfrentamientosDelJuego);
    this.sesion.TomaDatosJornadas(this.jornadas,this.JornadasCompeticion);
    this.sesion.TomaJuegosDePuntos(this.juegosPuntos);
    this.sesion.TomaJuegosDeCuestionario (this.juegosCuestionariosTerminados);
    this.sesion.TomaJuegosDeVotacionUnoATodos (this.juegosDeVotacionUnoATodosTerminados);
    this.sesion.TomaTablaAlumnoJuegoDeCompeticion(this.rankingAlumnoJuegoDeCompeticion);
    this.sesion.TomaTablaEquipoJuegoDeCompeticion(this.rankingEquiposJuegoDeCompeticion);
    this.sesion.TomaInscripcionAlumno(this.listaAlumnosOrdenadaPorPuntos);
    this.sesion.TomaInscripcionEquipo(this.listaEquiposOrdenadaPorPuntos);

    this.navCtrl.navigateForward('/asignacion-ganador');

  }

  DameJuegosDePuntos() {
    this.peticionesAPI.DameJuegoDePuntosGrupo(this.juegoSeleccionado.grupoId)
    .subscribe(juegosPuntos => {
      for (let i = 0; i < juegosPuntos.length; i++) {
          this.juegosPuntos.push(juegosPuntos[i]);
      }
    });

  }

  DameJuegosDeCuestionariosAcabados() {
    console.log ('vamos a por los juegos de cuestionarios del grupo ' + this.juegoSeleccionado.grupoId);
    this.peticionesAPI.DameJuegoDeCuestionario(this.juegoSeleccionado.grupoId)
    .subscribe(juegosCuestionarios => {
      console.log ('Ya tengo los juegos cuestionarios');
      console.log (juegosCuestionarios);
      for (let i = 0; i < juegosCuestionarios.length; i++) {
        if (juegosCuestionarios[i].JuegoTerminado === true) {
          this.juegosCuestionariosTerminados.push(juegosCuestionarios[i]);
        }
      }
      console.log('Juegos de cuestionario disponibles');
      console.log(this.juegosCuestionariosTerminados);
    });
  }

  DameJuegosdeVotacionUnoATodosAcabados() {
    console.log ('vamos a por los juegos de votacion Uno A Todos ' + this.juegoSeleccionado.grupoId);
    this.peticionesAPI.DameJuegosDeVotacionUnoATodos(this.juegoSeleccionado.grupoId)
    .subscribe(juegos => {
      console.log ('Ya tengo los juegos de votacion Uno A Todos');
      console.log (juegos);
      for (let i = 0; i < juegos.length; i++) {
        if (juegos[i].JuegoActivo === false) {
          this.juegosDeVotacionUnoATodosTerminados.push(juegos[i]);
        }
      }
      console.log('Juegos de  votacion Uno A Todos disponibles');
      console.log(this.juegosDeVotacionUnoATodosTerminados);
    });
  }

  CompeticionFinalizada(): boolean {
    this.JornadasCompeticion = this.calculos.GenerarTablaJornadasLiga(this.juegoSeleccionado, this.jornadas, this.enfrentamientosDelJuego);
        let finalizada: boolean = true;
        this.JornadasCompeticion.forEach (jornada => {
                  console.log (jornada);
                  if (!this.calculos.JornadaFinalizada (this.juegoSeleccionado, jornada)) {
                    console.log ('La jornada ' + jornada.id + 'no se ha disputado');
                    finalizada = false;
                  }
        });
        return finalizada;
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

  scrollToBottom(): void {
    this.content.scrollToBottom(300);
  }
  scrollToTop() {
    this.content.scrollToTop();
  }


}
