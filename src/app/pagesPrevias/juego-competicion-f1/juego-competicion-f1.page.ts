import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { AlertController, IonContent, NavController } from '@ionic/angular';
// Clases
import {
  Juego, Alumno, Equipo, AlumnoJuegoDeCompeticionFormulaUno, Jornada, TablaJornadas,
  EquipoJuegoDeCompeticionFormulaUno, TablaAlumnoJuegoDeCompeticion, TablaEquipoJuegoDeCompeticion
} from '../../clases/index';

import { Chart } from 'chart.js';

// Servicio
import { PeticionesAPIService } from '../../services/index';
import { CalculosService } from '../../services/calculos.service';
import { SesionService } from '../../services/sesion.service';

@Component({
  selector: 'app-juego-competicion-f1',
  templateUrl: './juego-competicion-f1.page.html',
  styleUrls: ['./juego-competicion-f1.page.scss'],
})
export class JuegoCompeticionF1Page implements OnInit {

  // Juego De Competicion Formula Uno seleccionado
  juegoSeleccionado: Juego;

  // Recupera la informacion del juego, los alumnos o los equipos
  alumnosDelJuego: Alumno[];
  equiposDelJuego: Equipo[];

  MiAlumno: Alumno;
  MiEquipo: Equipo;
  posicionDeMiEquipo: number;

  alumnosEquipo: Alumno[];

  listaAlumnosOrdenadaPorPuntos: AlumnoJuegoDeCompeticionFormulaUno[];
  listaEquiposOrdenadaPorPuntos: EquipoJuegoDeCompeticionFormulaUno[];

  rankingIndividualFormulaUno: TablaAlumnoJuegoDeCompeticion[] = [];
  rankingEquiposFormulaUno: TablaEquipoJuegoDeCompeticion[] = [];

  infomialumno: TablaAlumnoJuegoDeCompeticion;

  jornadas: Jornada[];
  JornadasCompeticion: TablaJornadas[];


  @ViewChild('barChart', { static: false }) barChart: ElementRef;
  bars: any;
  colorArray: any;



  public hideMe: boolean = false;

  mostrarGeneral = true;
  mostrarJornadas = false;
  asignarResultados = false;
  tablaJornada: any[];
  asignacionManual = false;

  juegosPuntos: any[];
  juegosDeVotacionUnoATodosTerminados: any[];
  juegosCuestionariosTerminados: any[];


  listaAlumnosOrdenadaPorPuntosJuegoDePuntos: any[];
  listaAlumnosOrdenadaPorPuntosJuegoDeCuestionario: any[];
  listaEquiposOrdenadaPorPuntosJuegoDePuntos: any[];
  listaAlumnosOrdenadaPorPuntosJuegoDeVotacionUnoATodos: any[];


  constructor(
    private sesion: SesionService,
    public navCtrl: NavController,
    private peticionesAPI: PeticionesAPIService,
    private calculos: CalculosService,
    private alertCtrl: AlertController,
  ) { }


  @ViewChild('content', { static: false }) content: IonContent;



  ngOnInit() {
    this.juegoSeleccionado = this.sesion.DameJuego();
    console.log(this.juegoSeleccionado);

    if (this.juegoSeleccionado.Modo === 'Individual') {
      this.AlumnosDelJuego();
    } else {
      //this.EquiposDelJuego();
    }
    this.DameJornadasDelJuegoDeCompeticionSeleccionado();
    this.DameJuegosdePuntos();
    this.DameJuegosdeCuestionariosAcabados();
    this.DameJuegosdeVotacionUnoATodosAcabados();
  }

    // Recupera los alumnos que pertenecen al juego
  AlumnosDelJuego() {
      this.peticionesAPI.DameAlumnosJuegoDeCompeticionFormulaUno(this.juegoSeleccionado.id)
        .subscribe(alumnosJuego => {
          this.alumnosDelJuego = alumnosJuego;
          this.RecuperarInscripcionesAlumnoJuego();
        });
    }
  

  // // Recupera los equipos que pertenecen al juego
  // EquiposDelJuego() {
  //   console.log ('Vamos a pos los equipos');
  //   this.peticionesAPI.DameEquiposJuegoDeCompeticionFormulaUno(this.juegoSeleccionado.id)
  //   .subscribe(equiposJuego => {
  //     console.log ('ya tengo los equipos');
  //     this.equiposDelJuego = equiposJuego;
  //     this.RecuperarInscripcionesEquiposJuego();
  //   });
  // }

  
  RecuperarInscripcionesAlumnoJuego() {

    console.log ('vamos por las inscripciones ' + this.juegoSeleccionado.id);
    this.peticionesAPI.DameInscripcionesAlumnoJuegoDeCompeticionFormulaUno(this.juegoSeleccionado.id)
    .subscribe(inscripciones => {
      this.listaAlumnosOrdenadaPorPuntos = inscripciones;
      // ordena la lista por puntos
      // tslint:disable-next-line:only-arrow-functions
      this.listaAlumnosOrdenadaPorPuntos = this.listaAlumnosOrdenadaPorPuntos.sort(function(obj1, obj2) {
        return obj2.PuntosTotalesAlumno - obj1.PuntosTotalesAlumno;
      });
      console.log ('ya tengo las inscripciones: ');
      this.TablaClasificacionTotal();
    });
  }

  // RecuperarInscripcionesEquiposJuego() {
  //   console.log ('vamos por las inscripciones ' + this.juegoSeleccionado.id);
  //   this.peticionesAPI.DameInscripcionesEquipoJuegoDeCompeticionFormulaUno(this.juegoSeleccionado.id)
  //   .subscribe(inscripciones => {
  //     this.listaEquiposOrdenadaPorPuntos = inscripciones;
  //     console.log(this.listaEquiposOrdenadaPorPuntos);

  //     // ordenamos por puntos
  //     // tslint:disable-next-line:only-arrow-functions
  //     this.listaEquiposOrdenadaPorPuntos = this.listaEquiposOrdenadaPorPuntos.sort(function(obj1, obj2) {
  //       return obj2.PuntosTotalesEquipo - obj1.PuntosTotalesEquipo;
  //     });
  //     console.log ('ya tengo las inscripciones');
  //     this.TablaClasificacionTotal();
  //   });
  // }

  // La uso para señalar en la clasificacion general al ganador cuando la competición ha finalizado

  // CompeticionFinalizada(): boolean {
  // // tslint:disable-next-line:no-inferrable-types
  //     let finalizada: boolean = true;
  //     this.jornadas.forEach (jornada => {
  //               if (!this.calculos.JornadaF1TieneGanadores (jornada.id, this.jornadas)) {
  //                 finalizada = false;
  //               }
  //     });
  //     return finalizada;
  // }

  
  TablaClasificacionTotal() {
    if (this.juegoSeleccionado.Modo === 'Individual') {
      this.rankingIndividualFormulaUno = this.calculos.PrepararTablaRankingIndividualFormulaUno(this.listaAlumnosOrdenadaPorPuntos,
        this.alumnosDelJuego);
      console.log('Ya tengo la tabla');
      console.log(this.rankingIndividualFormulaUno);
    } else {

      this.rankingEquiposFormulaUno = this.calculos.PrepararTablaRankingEquipoFormulaUno(this.listaEquiposOrdenadaPorPuntos,
        this.equiposDelJuego);
      console.log('Ya tengo la tabla');
      console.log(this.rankingEquiposFormulaUno);
    }
  }

  VerJornadas () {
    this.mostrarJornadas = true;
    this.mostrarGeneral = false;

  }

  VolverAGeneral () {
    this.mostrarJornadas = false;
    this.mostrarGeneral = true;
  }

  
  AsignarGanadoresAleatoriamente(jornada: Jornada) {
    
    const ganadores: any[] = [];
    const participantes: any[] = [];
    let listaGanadores = '<p>';
    // Preparo la lista de participantes de la que iré eligiendo aleatoriamente
    if (this.juegoSeleccionado.Modo === 'Individual') {
      this.alumnosDelJuego.forEach(alumno => participantes.push(alumno));
    } else {
    //  this.listaEquiposClasificacion.forEach(equipo => participantes.push(equipo));
    }
    let i = 0;
    while (i < this.juegoSeleccionado.NumeroParticipantesPuntuan) {
      const numeroParticipantes = participantes.length;
      const elegido = Math.floor(Math.random() * numeroParticipantes);
      // guardo el id del elegido
      ganadores.push(participantes[elegido].id);
      listaGanadores = listaGanadores + '<br>' + participantes[elegido].Nombre + ' ' + participantes[elegido].PrimerApellido;
   
      // Lo elimino de los participantes para seguir eligiendo
      participantes.splice(elegido, 1);
      // tslint:disable-next-line:max-line-length
      i++;
    }


    this.alertCtrl.create({
      header: '¿Seguro que quieres asignar este resultado a la jornada?',
      message: listaGanadores,
      buttons: [
        {
          text: 'SI',
          handler: () => {
            this.calculos.AsignarResultadosJornadaF1(this.juegoSeleccionado, jornada, ganadores);
            this.PrepararResultados (ganadores);
            this.ActualizarRankingIndividual (ganadores);
            this.asignacionManual = false;
          }
        },
        {
          text: 'NO',
          role: 'cancel',
          handler: () => {
            this.rankingIndividualFormulaUno.sort ((a , b) => b.puntos - a.puntos);
          }
        }
      ]
    }).then (res => res.present());
   
  }
  PrepararAsignacionManual() {
    this.asignacionManual = true;
  }

  AsignarGanadoresManual(jornada: Jornada) {
    let listaGanadores = '<p>';
    const ganadores: any[] = [];
    for (let i = 0;  i < this.juegoSeleccionado.NumeroParticipantesPuntuan; i++) {
      ganadores.push(this.rankingIndividualFormulaUno[i].id);
      // tslint:disable-next-line:max-line-length
      listaGanadores = listaGanadores + '<br>' + this.rankingIndividualFormulaUno[i].nombre + ' ' + this.rankingIndividualFormulaUno[i].primerApellido;
    }
    listaGanadores = listaGanadores = listaGanadores + '</p>';
    this.alertCtrl.create({
      header: '¿Seguro que quieres asignar este resultado a la jornada?',
      message: listaGanadores,
      buttons: [
        {
          text: 'SI',
          handler: () => {
            this.calculos.AsignarResultadosJornadaF1(this.juegoSeleccionado, jornada, ganadores);
            this.PrepararResultados (ganadores);
            this.ActualizarRankingIndividual (ganadores);
            this.asignacionManual = false;
          }
        },
        {
          text: 'NO',
          role: 'cancel',
          handler: () => {
            this.rankingIndividualFormulaUno.sort ((a , b) => b.puntos - a.puntos);
          }
        }
      ]
    }).then (res => res.present());
  }

  ActualizarRankingIndividual (ganadores) {


    for (let i = 0; i < ganadores.length ; i++) {
          const ganador = this.rankingIndividualFormulaUno.filter (al => al.id === ganadores[i])[0];
          ganador.puntos = ganador.puntos +  this.juegoSeleccionado.Puntos[i];
    }
    this.rankingIndividualFormulaUno.sort ((a , b) => b.puntos - a.puntos);

  }
  PonPrimero(i) {
    const itemMove = this.rankingIndividualFormulaUno.splice(i, 1)[0];
    this.rankingIndividualFormulaUno.splice(0, 0, itemMove);

  }

  
  Disputada(jornadaId): boolean {
    return this.calculos.JornadaF1TieneGanadores(jornadaId, this.jornadas);
  }


  //   // Construye la tabla que muestra los resultados de la jornada
  // ConstruirTabla() {
  //     this.tablaJornada = [];
  //     let i;
  //     if (this.juegoSeleccionado.Modo === 'Individual') {
  //       for (i = 0; i < this.alumnosDelJuego.length; i++) {
  //         const participante: any = [];
  //         participante.nombre = this.alumnosDelJuego[i].Nombre;
  //         participante.primerApellido = this.alumnosDelJuego[i].PrimerApellido;
  //         participante.segundoApellido = this.alumnosDelJuego[i].SegundoApellido;
  //         participante.puntos = 0;
  //         participante.id = this.alumnosDelJuego[i].id;
  //         this.tablaJornada.push (participante);
        
  //       }
  //       console.log (this.tablaJornada);
  //     } else {
  //       // for (i = 0; i < this.listaEquiposClasificacion.length; i++) {
  //       //   const participante: any = [];
  //       //   participante.nombre = this.listaEquiposClasificacion[i].nombre;
  //       //   participante.puntos = 0;
  //       //   participante.id = this.listaEquiposClasificacion[i].id;
  //       //   this.tablaJornada.push (participante);
  
  //       // }
  //     }
  //   }
  
    // Añado los puntos correspondientes a los ganadores de la jornada)
    PrepararResultados(ganadores) {
      // ganadores es un vector con los id de los ganadores de la jornada
      // Los puntos que hay que asignar a cada uno de los ganadores, segun su posición, estan en juegoSeleccionado.Puntos
      this.tablaJornada = [];
      if (ganadores !== undefined) {
        let i;
        for (i = 0; i < ganadores.length ; i++) {
          const ganador = this.alumnosDelJuego.filter (al => al.id === ganadores[i])[0];
          this.tablaJornada.push ( {
            alumno: ganador,
            puntos: this.juegoSeleccionado.Puntos[i]
          });
        }
        // this.tablaJornada.sort ((a , b) => b.puntos - a.puntos);
        console.log ('la tabla');
        console.log (this.tablaJornada);
      }
    }
  
    // Esta función se ejecuta al seleccionar una jornada
    SeleccionarJornada(jornada: Jornada) {
      if (this.Disputada(jornada.id)) {
        // Añadimos los ganadores a la tabla
        this.PrepararResultados ( jornada.GanadoresFormulaUno);
      }
    }
  

  datatochart() {
    const labels: string[] = [];
    const datos: number[] = [];
    for (let i = 0; i < this.jornadas.length; i++) {
      labels.push("J" + (i + 1));
      if (this.jornadas[i].GanadoresFormulaUno !== undefined) {
        // La jornada se ha disputado
        // miramos si el jugador esta entre los que han puntuado
        let pos;
        if (this.juegoSeleccionado.Modo === 'Individual') {
          pos = this.jornadas[i].GanadoresFormulaUno.indexOf (this.MiAlumno.id);
        } else {
           pos = this.jornadas[i].GanadoresFormulaUno.indexOf (this.MiEquipo.id);
        }
        if (pos !== -1) {
            // si esta. Guardamos los puntos que sacó en esa jorada.
            datos.push(this.juegoSeleccionado.Puntos[pos]);
        } else {
          datos.push(0);
        }
      }
      console.log(datos);
    }
    this.createBarChart(labels, datos);
  }

  createBarChart(labels, datos) {
    this.bars = new Chart(this.barChart.nativeElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Puntos por jornada',
          data: datos,
          backgroundColor: 'transparent',
          borderColor: 'rgb(38, 194, 129)',
          borderWidth: 2
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }


  // Recuperamos las jornadas para poder mandarlas a otras paginas
  DameJornadasDelJuegoDeCompeticionSeleccionado() {
    this.peticionesAPI.DameJornadasDeCompeticionFormulaUno(this.juegoSeleccionado.id)
      .subscribe(inscripciones => {
        this.jornadas = inscripciones;
        console.log ('jornadas');
        console.log (this.jornadas);
        // this.datatochart();
      });
  }


  // Recupera los equipos que pertenecen al juego
  // EquiposDelJuego() {
  //   this.peticionesAPI.DameEquiposJuegoDeCompeticionFormulaUno(this.juegoSeleccionado.id)
  //     .subscribe(equiposJuego => {
  //       this.equiposDelJuego = equiposJuego;
  //       this.RecuperarInscripcionesEquiposJuego();
  //       this.DameEquipoAlumnoConectado();
  //       this.DameJornadasDelJuegoDeCompeticionSeleccionado();
  //     });
  // }

  DameEquipoAlumnoConectado() {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.equiposDelJuego.length; i++) {
      this.peticionesAPI.DameAlumnosEquipo(this.equiposDelJuego[i].id)
        .subscribe(res => {
          console.log('miro en: ' + this.equiposDelJuego[i]);
          // tslint:disable-next-line:prefer-for-of
          for (let j = 0; j < res.length; j++) {
            if (res[j].id === this.MiAlumno.id) {
              console.log(res);
              this.MiEquipo = this.equiposDelJuego[i];
              console.log('tu equipo');
              console.log(this.MiEquipo);
              // tslint:disable-next-line:max-line-length
              this.posicionDeMiEquipo = this.listaEquiposOrdenadaPorPuntos.findIndex (equipo => equipo.EquipoId === this.MiEquipo.id) + 1;
            }
          }
        });
    }
  }


  // RecuperarInscripcionesEquiposJuego() {
  //   console.log('vamos por las inscripciones ' + this.juegoSeleccionado.id);
  //   this.peticionesAPI.DameInscripcionesEquipoJuegoDeCompeticionFormulaUno(this.juegoSeleccionado.id)
  //     .subscribe(inscripciones => {
  //       this.listaEquiposOrdenadaPorPuntos = inscripciones;
  //       console.log(this.listaEquiposOrdenadaPorPuntos);

  //       // ordenamos por puntos
  //       // tslint:disable-next-line:only-arrow-functions
  //       this.listaEquiposOrdenadaPorPuntos = this.listaEquiposOrdenadaPorPuntos.sort(function (obj1, obj2) {
  //         return obj2.PuntosTotalesEquipo - obj1.PuntosTotalesEquipo;
  //       });
  //       console.log('ya tengo las inscripciones');
  //       this.TablaClasificacionTotal();
  //     });
  // }

  AlumnosDelEquipo(equipo: Equipo) {
    console.log(equipo);

    this.peticionesAPI.DameAlumnosEquipo(equipo.id)
      .subscribe(res => {
        if (res[0] !== undefined) {
          this.alumnosEquipo = res;
          console.log(res);
        } else {
          console.log('No hay alumnos en este equipo');
          this.alumnosEquipo = undefined;
        }
      });
  }


  TablaClasificacionMiAlumno() {
    for (let i = 0; i < this.rankingIndividualFormulaUno.length; i++) {
      if (this.rankingIndividualFormulaUno[i].id == this.MiAlumno.id) {
        console.log(this.rankingIndividualFormulaUno[i].id);
        this.infomialumno = this.rankingIndividualFormulaUno[i];
      }
    }
    console.log('toma a tu alumno');
    console.log(this.infomialumno);
    return this.infomialumno;
  }

  InformacionJornadas() {
    console.log('Aquí estará la información del juego');
    console.log('Voy a pasar la información del juego seleccionado');
    this.sesion.TomaJuego(this.juegoSeleccionado);
    this.JornadasCompeticion = this.calculos.GenerarTablaJornadasF1(this.juegoSeleccionado, this.jornadas,
      this.rankingIndividualFormulaUno, this.rankingEquiposFormulaUno);
    console.log('Voy a pasar la información de las jornadas del juego');
    this.sesion.TomaDatosJornadas(this.jornadas,
      this.JornadasCompeticion);
    this.sesion.TomaTablaAlumnoJuegoDeCompeticion(this.rankingIndividualFormulaUno);
    this.sesion.TomaTablaEquipoJuegoDeCompeticion(this.rankingEquiposFormulaUno);
    this.navCtrl.navigateForward('/informacion-jornadas');
  }

  MuestraElRanking() {
    this.hideMe = true;
    this.scrollToBottom();
    console.log(this.hideMe)
  }
  OcultarElRanking() {
    this.scrollToTop();
    this.hideMe = false;
    console.log(this.hideMe)
  }
  scrollToBottom(): void {
    this.content.scrollToBottom(300);
  }
  scrollToTop() {
    this.content.scrollToTop();
  }

  DameJuegosdePuntos() {
    this.juegosPuntos = [];
    this.peticionesAPI.DameJuegoDePuntosGrupo(this.juegoSeleccionado.grupoId)
    .subscribe(juegosPuntos => {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < juegosPuntos.length; i++) {
          this.juegosPuntos.push(juegosPuntos[i]);
      }
    });

  }

  DameJuegosdeCuestionariosAcabados() {
    this.juegosCuestionariosTerminados = [];
    console.log ('vamos a por los juegos de cuestionarios del grupo ' + this.juegoSeleccionado.grupoId);
    this.peticionesAPI.DameJuegoDeCuestionario(this.juegoSeleccionado.grupoId)
    .subscribe(juegosCuestionarios => {
      console.log ('Ya tengo los juegos cuestionarios');
      console.log (juegosCuestionarios);
      // tslint:disable-next-line:prefer-for-of
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
    this.juegosDeVotacionUnoATodosTerminados = [];
    console.log ('vamos a por los juegos de votacion Uno A Todos ' + this.juegoSeleccionado.grupoId);
    this.peticionesAPI.DameJuegosDeVotacionUnoATodos(this.juegoSeleccionado.grupoId)
    .subscribe(juegos => {
      console.log ('Ya tengo los juegos de votacion Uno A Todos');
      console.log (juegos);
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < juegos.length; i++) {
        if (juegos[i].JuegoActivo === false) {
          this.juegosDeVotacionUnoATodosTerminados.push(juegos[i]);
        }
      }
      console.log('Juegos de  votacion Uno A Todos disponibles');
      console.log(this.juegosDeVotacionUnoATodosTerminados);
    });


  }

  AsignarSegunJuego(jornada: Jornada) {
    let juegosDisponibles = this.juegosPuntos;
    juegosDisponibles = juegosDisponibles.concat (this.juegosCuestionariosTerminados);
    juegosDisponibles = juegosDisponibles.concat (this.juegosDeVotacionUnoATodosTerminados);
    const inputJuegos: any[] = [];
    juegosDisponibles.forEach (juego => inputJuegos.push ({
      type: 'radio',
      label: juego.NombreJuego,
      value: juego
    }));


    this.alertCtrl.create({
      header: 'Elije uno entre estos juegos disponibles',
      inputs: inputJuegos,
      buttons: [
        {
          text: 'Cancel',

          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (juegoSeleccionado) => {
            console.log('juego elegido');
            console.log (juegoSeleccionado);
            this.AsignarGanadoresJuegoDisponibleSeleccionado (juegoSeleccionado, jornada);
            
          }
        }
      ]
    }).then (res => res.present());


  }

  
  // Me traigo el juego elegido para decidir los resultados de la jornada
  AsignarGanadoresJuegoDisponibleSeleccionado(juegoSeleccionado, jornada) {
  
    if ( juegoSeleccionado.Tipo === 'Juego De Puntos') {
      if (juegoSeleccionado.Modo === 'Individual') {
        this.RecuperarInscripcionesAlumnosJuegoPuntos(juegoSeleccionado, jornada);
      } else {
        this.RecuperarInscripcionesEquiposJuegoPuntos(juegoSeleccionado, jornada);
      }
    } else if ( juegoSeleccionado.Tipo === 'Juego De Cuestionario') {
      // De momento solo hay individual
      this.RecuperarInscripcionesAlumnosJuegoCuestionario(juegoSeleccionado, jornada)
    } else if ( juegoSeleccionado.Tipo === 'Juego De Votación Uno A Todos') {
      // De momento solo hay individual
      this.RecuperarInscripcionesAlumnosJuegoDeVotacionUnoATodos(juegoSeleccionado, jornada);
    }
  }

  
  RecuperarInscripcionesAlumnosJuegoPuntos(juegoSeleccionado, jornada) {
    this.peticionesAPI.DameInscripcionesAlumnoJuegoDePuntos(juegoSeleccionado.id)
    .subscribe(inscripciones => {
      this.listaAlumnosOrdenadaPorPuntosJuegoDePuntos = inscripciones;
      // ordena la lista por puntos
      // tslint:disable-next-line:only-arrow-functions
      this.listaAlumnosOrdenadaPorPuntosJuegoDePuntos = this.listaAlumnosOrdenadaPorPuntosJuegoDePuntos.sort(function(obj1, obj2) {
        return obj2.PuntosTotalesAlumno - obj1.PuntosTotalesAlumno;
      });
      this.RealizarAsignacion (juegoSeleccionado, jornada);
    });
  }

  RecuperarInscripcionesEquiposJuegoPuntos(juegoSeleccionado, jornada) {
    this.peticionesAPI.DameInscripcionesEquipoJuegoDePuntos(juegoSeleccionado.id)
    .subscribe(inscripciones => {
      this.listaEquiposOrdenadaPorPuntosJuegoDePuntos = inscripciones;
      // tslint:disable-next-line:only-arrow-functions
      this.listaEquiposOrdenadaPorPuntosJuegoDePuntos = this.listaEquiposOrdenadaPorPuntosJuegoDePuntos.sort(function(obj1, obj2) {
        return obj2.PuntosTotalesEquipo - obj1.PuntosTotalesEquipo;
      });
      this.RealizarAsignacion (juegoSeleccionado, jornada);
    });

  }

  RecuperarInscripcionesAlumnosJuegoCuestionario(juegoSeleccionado, jornada) {
    this.peticionesAPI.DameInscripcionesAlumnoJuegoDeCuestionario(juegoSeleccionado.id)
    .subscribe(inscripciones => {
      this.listaAlumnosOrdenadaPorPuntosJuegoDeCuestionario = inscripciones;
      // tslint:disable-next-line:max-line-length
      this.listaAlumnosOrdenadaPorPuntosJuegoDeCuestionario = this.listaAlumnosOrdenadaPorPuntosJuegoDeCuestionario.sort(function(obj1, obj2) {
        return obj2.Nota - obj1.Nota;
      });
      this.RealizarAsignacion (juegoSeleccionado, jornada);
    });
  }


  RecuperarInscripcionesAlumnosJuegoDeVotacionUnoATodos(juegoSeleccionado, jornada) {
    this.peticionesAPI.DameInscripcionesAlumnoJuegoDeVotacionUnoATodos(juegoSeleccionado.id)
    .subscribe(inscripciones => {
      this.listaAlumnosOrdenadaPorPuntosJuegoDeVotacionUnoATodos = inscripciones;
      // ordena la lista por puntos
      // tslint:disable-next-line:max-line-length
      this.listaAlumnosOrdenadaPorPuntosJuegoDeVotacionUnoATodos = this.listaAlumnosOrdenadaPorPuntosJuegoDeVotacionUnoATodos.sort(function(obj1, obj2) {
        return obj2.puntosTotales - obj1.puntosTotales;
      });
      this.RealizarAsignacion (juegoSeleccionado, jornada);
    });

  }

  RealizarAsignacion(juegoDisponibleSeleccionado, jornada) {
    const ganadores: any[] = [];

    // Selecciono los ganadores a partir del ranking del juego de puntos
    if (this.juegoSeleccionado.Modo === 'Individual') {
      if (juegoDisponibleSeleccionado.Tipo === 'Juego De Puntos') {
        let i = 0;
        while (i < this.juegoSeleccionado.NumeroParticipantesPuntuan) {
          ganadores.push(this.listaAlumnosOrdenadaPorPuntosJuegoDePuntos[i].alumnoId);
          i++;
        }
      } else if (juegoDisponibleSeleccionado.Tipo === 'Juego De Cuestionario') {
        let i = 0;
        while (i < this.juegoSeleccionado.NumeroParticipantesPuntuan) {
          ganadores.push(this.listaAlumnosOrdenadaPorPuntosJuegoDeCuestionario[i].alumnoId);
          i++;
        }
      } else if (juegoDisponibleSeleccionado.Tipo === 'Juego De Votación Uno A Todos') {
        let i = 0;
        while (i < this.juegoSeleccionado.NumeroParticipantesPuntuan) {
          ganadores.push(this.listaAlumnosOrdenadaPorPuntosJuegoDeVotacionUnoATodos[i].alumnoId);
          i++;
        }
      }
    } else {
      let i = 0;
      while (i < this.juegoSeleccionado.NumeroParticipantesPuntuan) {
        ganadores.push(this.listaEquiposOrdenadaPorPuntosJuegoDePuntos[i].equipoId);
        i++;
      }
    }

    let  listaGanadores = '<p>';
    for (let i = 0;  i < this.juegoSeleccionado.NumeroParticipantesPuntuan; i++) {
      const ganador = this.rankingIndividualFormulaUno.filter (alumno => alumno.id === ganadores [i])[0];
      // tslint:disable-next-line:max-line-length
      listaGanadores = listaGanadores + '<br>' + ganador.nombre + ' ' + ganador.primerApellido;
    }
    listaGanadores = listaGanadores = listaGanadores + '</p>';
    this.alertCtrl.create({
      header: '¿Seguro que quieres asignar este resultado a la jornada?',
      message: listaGanadores,
      buttons: [
        {
          text: 'SI',
          handler: () => {
            console.log ('Si se asigna');
            this.calculos.AsignarResultadosJornadaF1(this.juegoSeleccionado, jornada, ganadores);
            this.PrepararResultados (ganadores);
            this.ActualizarRankingIndividual (ganadores);
            this.asignacionManual = false;
          }
        },
        {
          text: 'NO',
          role: 'cancel',
          handler: () => {
           
          }
        }
      ]
    }).then (res => res.present());
 

  }



}
