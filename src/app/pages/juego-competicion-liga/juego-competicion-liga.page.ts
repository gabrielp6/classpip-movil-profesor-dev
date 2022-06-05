import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NavController} from '@ionic/angular';
import { PeticionesAPIService } from '../../services/index';
import { CalculosService } from '../../services/calculos.service';
import { Alumno, Equipo, Juego, TablaJornadas, AlumnoJuegoDeCompeticionLiga,AlumnoJuegoDeCompeticionFormulaUno,EquipoJuegoDeCompeticionFormulaUno,
         TablaAlumnoJuegoDeCompeticion, TablaEquipoJuegoDeCompeticion, Jornada, TablaPuntosFormulaUno,
         EnfrentamientoLiga, EquipoJuegoDeCompeticionLiga } from '../../clases/index';
import { SesionService } from '../../services/sesion.service';
import { IonContent } from '@ionic/angular';
import Swal from 'sweetalert2';
import { EnfrentamientoTorneo } from 'src/app/clases/EnfrentamientoTorneo';


@Component({
  selector: 'app-juego-competicion-liga',
  templateUrl: './juego-competicion-liga.page.html',
  styleUrls: ['./juego-competicion-liga.page.scss'],
})
export class JuegoCompeticionLigaPage implements OnInit {

  
  juegosDeEvaluacionTerminados: any[] = [];
  botoneditarPuntosDesactivado = true;
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
  juegosEvaluacion: Juego[] = [];
  juegosCuestionariosTerminados: Juego[] = [];
  juegosDeVotacionUnoATodosTerminados: any[] = [];
  alumnosDelEquipo: Alumno[];
  enfrentamientosDelJuegoTorneo: Array<Array<EnfrentamientoTorneo>>;
  participantestorneo:Array<Array<string>>;
  GanadorTorneo: any;
  listaAlumnosOrdenadaPorPuntosFormula1: AlumnoJuegoDeCompeticionFormulaUno[];
  listaEquiposOrdenadaPorPuntosFormula1: EquipoJuegoDeCompeticionFormulaUno[];
  rankingIndividualFormulaUno: TablaAlumnoJuegoDeCompeticion[] = [];
  rankingEquiposFormulaUno: TablaEquipoJuegoDeCompeticion[] = [];
  TablaeditarPuntos: TablaPuntosFormulaUno[];

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
    this.DameJuegosdeEvaluacionAcabados();
  }

  DameJornadasDelJuegoDeCompeticionSeleccionado() {

    console.log(this.juegoSeleccionado.Tipo);
    if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){

      this.peticionesAPI.DameJornadasDeCompeticionFormulaUno(this.juegoSeleccionado.id)
      .subscribe(inscripciones => {
        this.jornadas = inscripciones;

        if (this.juegoSeleccionado.Modo === 'Individual') {
          this.AlumnosDelJuego();
        } else {
          this.EquiposDelJuego();
        }
        
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

    let jornadasCounter = 0;
    this.enfrentamientosDelJuego = [];
    this.enfrentamientosDelJuegoTorneo = [];

    for (let i = 0; i < this.jornadas.length; i++) {

      if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){

        this.enfrentamientosDelJuego[i] = [];

        this.peticionesAPI.DameEnfrentamientosDeCadaJornadaLiga(this.jornadas[i].id)
        .subscribe((enfrentamientosDeLaJornada: Array<EnfrentamientoLiga>) => {
          jornadasCounter++;
          
          for (let j = 0; j < enfrentamientosDeLaJornada.length; j++) {
            this.enfrentamientosDelJuego[i][j] = new EnfrentamientoLiga();
            this.enfrentamientosDelJuego[i][j] = enfrentamientosDeLaJornada[j];
          }
          if (jornadasCounter === this.jornadas.length) {
    
            if (this.juegoSeleccionado.Modo === 'Individual') {
              this.AlumnosDelJuego();
            } else {
              this.EquiposDelJuego();
            }
          }
        });
          
      }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){

        this.enfrentamientosDelJuegoTorneo[i] = [];
        
        this.peticionesAPI.DameEnfrentamientosDeCadaJornadaTorneo(this.jornadas[i].id)
        .subscribe((enfrentamientosDeLaJornada: Array<EnfrentamientoTorneo>) => {
          jornadasCounter++;

          for (let j = 0; j < enfrentamientosDeLaJornada.length; j++) {
            this.enfrentamientosDelJuegoTorneo[i][j] = new EnfrentamientoTorneo();
            this.enfrentamientosDelJuegoTorneo[i][j] = enfrentamientosDeLaJornada[j];
          }
          if (jornadasCounter === this.jornadas.length) {
    
            if (this.juegoSeleccionado.Modo === 'Individual') {
              this.AlumnosDelJuego();
            } else {
              this.EquiposDelJuego();
            }
          }
        });

      }   
    }
  }

  
  AlumnosDelJuego() {

    console.log ('Vamos a por los alumnos');
    console.log('Id juegoSeleccionado: ' + this.juegoSeleccionado.id);

    if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){

      this.peticionesAPI.DameAlumnosJuegoDeCompeticionFormulaUno(this.juegoSeleccionado.id)
      .subscribe(alumnosJuego => {
        console.log ('Ya tengo los alumnos: ' );
        console.log (alumnosJuego);
        this.alumnosDelJuego = alumnosJuego;
        this.RecuperarInscripcionesAlumnoJuego();
      });

    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){

      this.peticionesAPI.DameAlumnosJuegoDeCompeticionLiga(this.juegoSeleccionado.id)
      .subscribe(alumnosJuego => {
        console.log ('Ya tengo los alumnos: ' );
        console.log (alumnosJuego);
        this.alumnosDelJuego = alumnosJuego;
        this.RecuperarInscripcionesAlumnoJuego();
      });
         
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){

      this.peticionesAPI.DameAlumnosJuegoDeCompeticionTorneo(this.juegoSeleccionado.id)
      .subscribe(alumnosJuego => {
        console.log ('Ya tengo los alumnos: ' );
        console.log (alumnosJuego);
        this.alumnosDelJuego = alumnosJuego;
        this.DameNombresDeLosEnfrentamientos();
      });
    }   

  }

  EquiposDelJuego() {
    console.log ('Vamos a por los equipos');
    console.log('Id juegoSeleccionado: ' + this.juegoSeleccionado.id);

    if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){

      this.peticionesAPI.DameEquiposJuegoDeCompeticionFormulaUno(this.juegoSeleccionado.id)
      .subscribe(equiposJuego => {
        console.log ('ya tengo los equipos');
        console.log (equiposJuego);
        this.equiposDelJuego = equiposJuego;
        this.RecuperarInscripcionesEquiposJuego();
      });
     

    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){

      this.peticionesAPI.DameEquiposJuegoDeCompeticionLiga(this.juegoSeleccionado.id)
      .subscribe(equiposJuego => {
        console.log ('ya tengo los equipos');
        console.log (equiposJuego);
        this.equiposDelJuego = equiposJuego;
        this.RecuperarInscripcionesEquiposJuego();
      });
           
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){

      this.peticionesAPI.DameEquiposJuegoDeCompeticionTorneo(this.juegoSeleccionado.id)
      .subscribe(equiposJuego => {
        console.log ('ya tengo los equipos');
        console.log (equiposJuego);
        this.equiposDelJuego = equiposJuego;
        this.DameNombresDeLosEnfrentamientos();
      });
      
    }
    
  }

  DameNombresDeLosEnfrentamientos() {

    console.log ('voy a por los nombres de los participantes');
    let enfrentamientosjornada: Array<Array<number>>;
    enfrentamientosjornada= [];
    this.participantestorneo= [];
    let rondas: number =this.enfrentamientosDelJuegoTorneo.length;
    let rondafinal: number;
    rondafinal=rondas-1;
    console.log ('num jornadas: '+this.enfrentamientosDelJuegoTorneo.length);
    
    for (let i = 0; i < this.enfrentamientosDelJuegoTorneo.length; i++) {

      if (this.enfrentamientosDelJuegoTorneo[i].length !== 0) {

        enfrentamientosjornada[i] = [];
        for (let a = 0, j=0; j < this.enfrentamientosDelJuegoTorneo[i].length; a=a+2,j++) {     
          enfrentamientosjornada[i][a]=this.enfrentamientosDelJuegoTorneo[i][j].JugadorUno;
          enfrentamientosjornada[i][a+1]=this.enfrentamientosDelJuegoTorneo[i][j].JugadorDos;
          console.log ('e1:  ' + enfrentamientosjornada[i][a] + enfrentamientosjornada[i][a+1]);
        }

        console.log ('prueba enfrentamientos  ' + enfrentamientosjornada[i]);
        console.log ('alumnos enfrentamientos  ' + this.alumnosDelJuego);
        console.log ('equipos enfrentamientos  ' + this.equiposDelJuego);
      
        this.participantestorneo[i] = [];
        for (let a = 0; a < enfrentamientosjornada[i].length; a++) {

          if (enfrentamientosjornada[i][a] !== 0) {

            if (this.juegoSeleccionado.Modo === 'Individual') { 
              const alumno = this.alumnosDelJuego.filter (alumno => alumno.id === Number(enfrentamientosjornada[i][a]))[0];
              this.participantestorneo[i].push(alumno.Nombre + alumno.PrimerApellido);
            } else {
              const equipo = this.equiposDelJuego.filter (equipo => equipo.id === Number(enfrentamientosjornada[i][a]))[0];
              console.log ('equipo encontrado' + equipo);
              this.participantestorneo[i].push(equipo.Nombre);
              console.log(equipo.Nombre);
            }

          } else{
            this.participantestorneo[i].push(undefined);
          }
        }
      }
    }

    if (this.enfrentamientosDelJuegoTorneo[rondafinal][0] !== undefined) {
      if (this.enfrentamientosDelJuegoTorneo[rondafinal][0].Ganador!== undefined) {
        this.DameNombreGanador();
      }
    }
  
  }

  DameNombreGanador() {

    console.log ('voy a por el nombre del ganador');
    let rondas: number =this.enfrentamientosDelJuegoTorneo.length;
    let rondafinal: number;
    rondafinal=rondas-1;
    let idganador: number;
    console.log ('numRondas: '+ rondafinal);

    if (this.enfrentamientosDelJuegoTorneo[rondafinal][0] !== undefined) {

      if (this.enfrentamientosDelJuegoTorneo[rondafinal][0].Ganador!== undefined) {

        idganador = this.enfrentamientosDelJuegoTorneo[rondafinal][0].Ganador;
        console.log ('idganador: '+ idganador);

        if (this.juegoSeleccionado.Modo === 'Individual') {

        const alumno = this.alumnosDelJuego.filter (alumno => alumno.id === Number(idganador))[0];
        console.log ('alumnoganador: '+ alumno);
        this.GanadorTorneo= alumno.Nombre + ' ' + alumno.PrimerApellido;
        console.log(this.GanadorTorneo);
        
        } else{

          const equipo = this.equiposDelJuego.filter (equipo => equipo.id === Number(idganador))[0];
          console.log ('equipoganador: '+ equipo);
          this.GanadorTorneo= equipo.Nombre;
          console.log(this.GanadorTorneo);
        }

      }
    }

    console.log ('GANADOR: '+   this.GanadorTorneo);
    
  }

  AlumnosDelEquipo(equipo: Equipo) {

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
    console.log(equipo);
  }

  AccederAlumno(alumno: TablaAlumnoJuegoDeCompeticion) {

    const alumnoSeleccionado = this.alumnosDelJuego.filter(res => res.Nombre === alumno.nombre && res.PrimerApellido === alumno.primerApellido && res.SegundoApellido === alumno.segundoApellido)[0];
    const posicion = this.rankingAlumnoJuegoDeCompeticion.filter(res => res.nombre === alumno.nombre && res.primerApellido === alumno.primerApellido && res.segundoApellido === alumno.segundoApellido)[0].posicion;

    if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){
    

    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){

      this.sesion.TomaDatosEvolucionAlumnoJuegoCompeticionLiga (
        posicion,
        alumnoSeleccionado,
        this.listaAlumnosOrdenadaPorPuntos.filter(res => res.AlumnoId === alumnoSeleccionado.id)[0]
      );
           
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){

      
    }
    
  }

  RecuperarInscripcionesAlumnoJuego() {

    if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){
      
      console.log ('vamos por las inscripciones ' + this.juegoSeleccionado.id);
      this.peticionesAPI.DameInscripcionesAlumnoJuegoDeCompeticionFormulaUno(this.juegoSeleccionado.id)
      .subscribe(inscripciones => {
        this.listaAlumnosOrdenadaPorPuntosFormula1 = inscripciones;
        // ordena la lista por puntos
        // tslint:disable-next-line:only-arrow-functions
        this.listaAlumnosOrdenadaPorPuntosFormula1 = this.listaAlumnosOrdenadaPorPuntosFormula1.sort(function(obj1, obj2) {
          return obj2.PuntosTotalesAlumno - obj1.PuntosTotalesAlumno;
        });
        console.log ('ya tengo las inscripciones: ');
        this.TablaClasificacionTotal();
      });

    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){

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
           
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){
      
    }  
  }

  
  RecuperarInscripcionesEquiposJuego() {

    if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){
       
      console.log ('vamos por las inscripciones ' + this.juegoSeleccionado.id);
      this.peticionesAPI.DameInscripcionesEquipoJuegoDeCompeticionFormulaUno(this.juegoSeleccionado.id)
      .subscribe(inscripciones => {
        this.listaEquiposOrdenadaPorPuntosFormula1 = inscripciones;
        console.log(this.listaEquiposOrdenadaPorPuntos);
        // ordenamos por puntos
        // tslint:disable-next-line:only-arrow-functions
        this.listaEquiposOrdenadaPorPuntosFormula1 = this.listaEquiposOrdenadaPorPuntosFormula1.sort(function(obj1, obj2) {
          return obj2.PuntosTotalesEquipo - obj1.PuntosTotalesEquipo;
        });
        console.log ('ya tengo las inscripciones');
        this.TablaClasificacionTotal();
      });
      
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){
      
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
           
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){


    }

  }

  TablaClasificacionTotal() {

    if (this.juegoSeleccionado.Modo === 'Individual') {

      if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){
       
        this.rankingIndividualFormulaUno = this.calculos.PrepararTablaRankingIndividualFormulaUno (this.listaAlumnosOrdenadaPorPuntosFormula1,
        this.alumnosDelJuego);
        this.datasourceAlumno = new MatTableDataSource(this.rankingIndividualFormulaUno);
        console.log ('Ya tengo la tabla');
        console.log(this.datasourceAlumno.data); 
        this.BotonEditarDesactivado();
      
      }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){
        
        this.rankingAlumnoJuegoDeCompeticion = this.calculos.PrepararTablaRankingIndividualLiga (this.listaAlumnosOrdenadaPorPuntos,this.alumnosDelJuego, this.jornadas,this.enfrentamientosDelJuego);
        console.log ('Estoy en TablaClasificacionTotal(), la tabla que recibo desde calculos es:');
        console.log (this.rankingAlumnoJuegoDeCompeticion);
        this.datasourceAlumno = new MatTableDataSource(this.rankingAlumnoJuegoDeCompeticion);
             
      }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){
        
      }

    } else {

      if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){
       
        
        this.rankingEquiposFormulaUno = this.calculos.PrepararTablaRankingEquipoFormulaUno (this.listaEquiposOrdenadaPorPuntosFormula1,
        this.equiposDelJuego);
        this.datasourceEquipo = new MatTableDataSource(this.rankingEquiposFormulaUno);
        console.log('Ya tengo la tabla');
        console.log(this.datasourceEquipo);
        this.BotonEditarDesactivado();

      }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){
        
        this.rankingEquiposJuegoDeCompeticion = this.calculos.PrepararTablaRankingEquipoLiga (this.listaEquiposOrdenadaPorPuntos,this.equiposDelJuego, this.jornadas, this.enfrentamientosDelJuego);
        this.datasourceEquipo = new MatTableDataSource(this.rankingEquiposJuegoDeCompeticion);
        console.log('Estoy en TablaClasificacionTotal(), la tabla que recibo desde calculos es:');
        console.log (this.rankingEquiposJuegoDeCompeticion);
             
      }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){
        
      }
      
    }
  }

  BotonEditarDesactivado() {
    console.log(this.rankingIndividualFormulaUno);
    console.log(this.rankingEquiposFormulaUno);
    let SumatorioPuntos: number;
    SumatorioPuntos = 0;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.rankingIndividualFormulaUno.length; i++) {
      SumatorioPuntos = SumatorioPuntos + this.rankingIndividualFormulaUno[i].puntos;
    }
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.rankingEquiposFormulaUno.length; i++) {
      SumatorioPuntos = SumatorioPuntos + this.rankingEquiposFormulaUno[i].puntos;
    }
    console.log('Sumatorio');
    console.log(SumatorioPuntos);
    if (SumatorioPuntos === 0) {
      this.botoneditarPuntosDesactivado = false;
    } else {
      this.botoneditarPuntosDesactivado = true;
    }
  }

  applyFilter(filterValue: string) {
    this.datasourceAlumno.filter = filterValue.trim().toLowerCase();
  }

  applyFilterEquipo(filterValue: string) {
    this.datasourceEquipo.filter = filterValue.trim().toLowerCase();
  }

  EditarPuntuacion(){
    this.TablaeditarPuntos = this.calculos.DameTablaeditarPuntos(this.juegoSeleccionado);
    console.log(this.TablaeditarPuntos);
    this.sesion.TomaJuego (this.juegoSeleccionado);
    this.sesion.TomaTablaeditarPuntos(this.TablaeditarPuntos);
    this.sesion.TomaTablaAlumnoJuegoDeCompeticion(this.rankingIndividualFormulaUno);
    this.sesion.TomaTablaEquipoJuegoDeCompeticion(this.rankingEquiposFormulaUno);
    this.navCtrl.navigateForward('/editar-puntuacion');
  }

  EditarJornadas() {
    this.sesion.TomaJuego (this.juegoSeleccionado);
   
    if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){
      
      this.JornadasCompeticion = this.calculos.GenerarTablaJornadasF1(this.juegoSeleccionado, this.jornadas,
      this.rankingIndividualFormulaUno, this.rankingEquiposFormulaUno);
      console.log('Juego activo' + this.JornadasCompeticion);
      this.sesion.TomaDatosJornadas(this.jornadas,this.JornadasCompeticion);
      // Necesario para Editar Puntos:
      this.TablaeditarPuntos = this.calculos.DameTablaeditarPuntos(this.juegoSeleccionado);
      console.log(this.TablaeditarPuntos);
      this.sesion.TomaTablaeditarPuntos(this.TablaeditarPuntos);
      this.sesion.TomaTablaAlumnoJuegoDeCompeticion(this.rankingIndividualFormulaUno);
      this.sesion.TomaTablaEquipoJuegoDeCompeticion(this.rankingEquiposFormulaUno);
      this.navCtrl.navigateForward('/editar-jornadas');
     
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){
      
      this.JornadasCompeticion = this.calculos.GenerarTablaJornadasLiga(this.juegoSeleccionado, this.jornadas, this.enfrentamientosDelJuego);
      this.sesion.TomaDatosJornadas(this.jornadas,this.JornadasCompeticion); 
      this.navCtrl.navigateForward('/editar-jornadas');
           
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){
      
      this.JornadasCompeticion = this.calculos.GenerarTablaJornadasTorneo(this.juegoSeleccionado, this.jornadas, this.enfrentamientosDelJuegoTorneo);
      this.sesion.TomaDatosJornadas(this.jornadas,this.JornadasCompeticion); 
      this.navCtrl.navigateForward('/editar-jornadas');
    }
    
  }

  editarpuntos() {
    this.TablaeditarPuntos = this.calculos.DameTablaeditarPuntos(this.juegoSeleccionado);
    console.log(this.TablaeditarPuntos);
    this.sesion.TomaJuego (this.juegoSeleccionado);
    this.sesion.TomaTablaeditarPuntos(this.TablaeditarPuntos);
    this.sesion.TomaTablaAlumnoJuegoDeCompeticion(this.rankingIndividualFormulaUno);
    this.sesion.TomaTablaEquipoJuegoDeCompeticion(this.rankingEquiposFormulaUno);
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

    if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){

      this.JornadasCompeticion = this.calculos.GenerarTablaJornadasF1(this.juegoSeleccionado, this.jornadas,
      this.rankingIndividualFormulaUno, this.rankingEquiposFormulaUno);
      console.log ('Voy a pasar la información de las jornadas del juego');
      this.sesion.TomaDatosJornadas(this.jornadas,this.JornadasCompeticion);
      this.sesion.TomaTablaAlumnoJuegoDeCompeticion(this.rankingIndividualFormulaUno);
      this.sesion.TomaTablaEquipoJuegoDeCompeticion(this.rankingEquiposFormulaUno);
      this.navCtrl.navigateForward('/informacion-jornadas');

    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){
      
      this.JornadasCompeticion = this.calculos.GenerarTablaJornadasLiga(this.juegoSeleccionado, this.jornadas, this.enfrentamientosDelJuego);
      this.sesion.TomaDatosJornadas(this.jornadas,this.JornadasCompeticion);
      this.sesion.TomaTablaAlumnoJuegoDeCompeticion(this.rankingAlumnoJuegoDeCompeticion);
      this.sesion.TomaTablaEquipoJuegoDeCompeticion(this.rankingEquiposJuegoDeCompeticion);
      this.navCtrl.navigateForward('/informacion-jornadas');
           
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){
      
      this.JornadasCompeticion = this.calculos.GenerarTablaJornadasTorneo(this.juegoSeleccionado, this.jornadas, this.enfrentamientosDelJuegoTorneo);
      this.sesion.TomaDatosJornadas(this.jornadas,this.JornadasCompeticion);
      this.sesion.TomaTablaAlumnoJuegoDeCompeticion(this.rankingAlumnoJuegoDeCompeticion);
      this.sesion.TomaTablaEquipoJuegoDeCompeticion(this.rankingEquiposJuegoDeCompeticion);
      this.navCtrl.navigateForward('/informacion-jornadas');

    }
    
  }

  AsignacionGanador(){

    this.sesion.TomaJuego (this.juegoSeleccionado);

    if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){

      this.JornadasCompeticion = this.calculos.GenerarTablaJornadasF1(this.juegoSeleccionado, this.jornadas, this.rankingIndividualFormulaUno, this.rankingEquiposFormulaUno);
      this.sesion.TomaDatosJornadas(this.jornadas,this.JornadasCompeticion);
      this.sesion.TomaTablaAlumnoJuegoDeCompeticion(this.rankingIndividualFormulaUno);
      this.sesion.TomaTablaEquipoJuegoDeCompeticion(this.rankingEquiposFormulaUno);
      this.sesion.TomaInscripcionAlumno(this.listaAlumnosOrdenadaPorPuntos);
      this.sesion.TomaInscripcionEquipo(this.listaEquiposOrdenadaPorPuntos);
      this.sesion.TomaJuegosDePuntos(this.juegosPuntos);
      this.sesion.TomaJuegosDeCuestionario (this.juegosCuestionariosTerminados);
      this.sesion.TomaJuegosDeVotacionUnoATodos (this.juegosDeVotacionUnoATodosTerminados);
      this.sesion.TomaJuegosDeEvaluacion (this.juegosDeEvaluacionTerminados);
      this.navCtrl.navigateForward('/asignacion-ganador');
      
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){
      
      this.JornadasCompeticion = this.calculos.GenerarTablaJornadasLiga(this.juegoSeleccionado, this.jornadas, this.enfrentamientosDelJuego);
      this.sesion.TomaDatosJornadas(this.jornadas,this.JornadasCompeticion);
      this.sesion.TomaJuegosDePuntos(this.juegosPuntos);
      this.sesion.TomaJuegosDeEvaluacion(this.juegosEvaluacion);
      this.sesion.TomaJuegosDeCuestionario (this.juegosCuestionariosTerminados);
      this.sesion.TomaJuegosDeVotacionUnoATodos (this.juegosDeVotacionUnoATodosTerminados);
      this.sesion.TomaTablaAlumnoJuegoDeCompeticion(this.rankingAlumnoJuegoDeCompeticion);
      this.sesion.TomaTablaEquipoJuegoDeCompeticion(this.rankingEquiposJuegoDeCompeticion);
      this.sesion.TomaInscripcionAlumno(this.listaAlumnosOrdenadaPorPuntos);
      this.sesion.TomaInscripcionEquipo(this.listaEquiposOrdenadaPorPuntos);
      this.navCtrl.navigateForward('/asignacion-ganador');
           
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){
      
    
      this.JornadasCompeticion = this.calculos.GenerarTablaJornadasTorneo( this.juegoSeleccionado, this.jornadas, this.enfrentamientosDelJuegoTorneo);
      this.sesion.TomaDatosJornadas(this.jornadas,this.JornadasCompeticion);
      this.sesion.TomaAlumnoJuegoDeCompeticionTorneo(this.alumnosDelJuego);
      this.sesion.TomaEquipoJuegoDeCompeticionTorneo(this.equiposDelJuego);
      this.sesion.TomaJuegosDePuntos(this.juegosPuntos);
      this.sesion.TomaJuegosDeEvaluacion(this.juegosEvaluacion);
      this.sesion.TomaJuegosDeCuestionario (this.juegosCuestionariosTerminados);
      this.sesion.TomaJuegosDeVotacionUnoATodos (this.juegosDeVotacionUnoATodosTerminados);
      this.navCtrl.navigateForward('/asignacion-ganador');
    }
  
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

  DameJuegosdeEvaluacionAcabados() {
    console.log ('vamos a por los juegos de evaluacion acabados' + this.juegoSeleccionado.grupoId);
    this.peticionesAPI.DameJuegosDeEvaluacion(this.juegoSeleccionado.grupoId)
    .subscribe(juegos => {
      console.log ('Ya tengo los juegos de evaluacion');
      console.log (juegos);
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < juegos.length; i++) {
        if ((juegos[i].JuegoActivo === false) && (juegos[i].rubricaId > 0)) {
          this.juegosDeEvaluacionTerminados.push(juegos[i]);
        }
      }
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

    if (this.juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno' ){

      let finalizada: boolean = true;
      this.jornadas.forEach (jornada => {
        if (!this.calculos.JornadaF1TieneGanadores (jornada.id, this.jornadas)) {
          finalizada = false;
        }
      });
      return finalizada;
     
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Liga'){
      
      this.JornadasCompeticion = this.calculos.GenerarTablaJornadasLiga(this.juegoSeleccionado, this.jornadas, this.enfrentamientosDelJuego); 
      let finalizada: boolean = true; this.JornadasCompeticion.forEach (jornada => {
        console.log (jornada);
        if (!this.calculos.JornadaFinalizada (this.juegoSeleccionado, jornada)) {
          console.log ('La jornada ' + jornada.id + 'no se ha disputado');
          finalizada = false;
        }
      });

      return finalizada;
           
    }else if (this.juegoSeleccionado.Tipo === 'Juego De Competición Torneo'){
      
      this.JornadasCompeticion = this.calculos.GenerarTablaJornadasTorneo(this.juegoSeleccionado, this.jornadas, this.enfrentamientosDelJuegoTorneo); 
      let finalizada: boolean = true; this.JornadasCompeticion.forEach (jornada => {
        console.log (jornada);
        if (!this.calculos.JornadaFinalizada (this.juegoSeleccionado, jornada)) {
          console.log ('La jornada ' + jornada.id + 'no se ha disputado');
          finalizada = false;
        }
      });

      return finalizada;

    }

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
