import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { PeticionesAPIService } from '../servicios/index';
import { CalculosService } from '../servicios/calculos.service';
import {
  Alumno, Equipo, Juego, Punto, Nivel, AlumnoJuegoDePuntos, EquipoJuegoDePuntos,
  TablaAlumnoJuegoDePuntos, TablaEquipoJuegoDePuntos, TablaHistorialPuntosEquipo,
  TablaHistorialPuntosAlumno } from '../clases/index';
import { SesionService } from '../servicios/sesion.service';
import { IonContent } from '@ionic/angular';
import {MatAccordion} from '@angular/material/expansion'; 
import { SeleccionarAlumnosPage } from '../seleccionar-alumnos/seleccionar-alumnos.page';

@Component({
  selector: 'app-juego-puntos',
  templateUrl: './juego-puntos.page.html',
  styleUrls: ['./juego-puntos.page.scss'],
})
export class JuegoPuntosPage implements OnInit {

  infoPuntosView: boolean = false;
  infoView: boolean = false;
  juegoSeleccionado: Juego;
  MiAlumno: Alumno;
  MiEquipo: Equipo;
  MiHistorialPuntos: any[] = [];
  EsteAlumnoJuegoDePuntos: any[] = [];
  MiNivel: Nivel;
  NombreNivel: string;
  MiAlumnoJDP: number;
  TodosLosPuntos: Punto[] = [];
  nivelesDelJuego: Nivel[];

  alumnosDelJuego: Alumno[];
  historialalumno: TablaHistorialPuntosAlumno[] = [];
  equiposDelJuego: Equipo[];
  historialequipo: TablaHistorialPuntosEquipo[] = [];

  alumnosEquipo: Alumno[];

  // Recoge la inscripción de un alumno en el juego ordenada por puntos
  listaAlumnosOrdenadaPorPuntos: AlumnoJuegoDePuntos[];
  listaEquiposOrdenadaPorPuntos: EquipoJuegoDePuntos[];
  alumnoJuegoDePuntos: AlumnoJuegoDePuntos;
  equipoJuegoDePuntos: EquipoJuegoDePuntos;

  // Muestra la posición del alumno, el nombre y los apellidos del alumno, los puntos y el nivel
  rankingJuegoDePuntos: TablaAlumnoJuegoDePuntos[] = [];
  rankingEquiposJuegoDePuntos: TablaEquipoJuegoDePuntos[] = [];

  // EN el panel que muestra la info, enseñaremos los puntos de porfma preddeterminada
  Tipo: String;

  puntoAleatorioId: number;

  public hideMe: boolean = false;
  historialAlumno: any[];

  @ViewChild('accordion', {static: false}) accordion: MatAccordion;

  constructor(
    private sesion: SesionService,
    public navCtrl: NavController,
    private peticionesAPI: PeticionesAPIService,
    private calculos: CalculosService,
    private alertCtrl: AlertController,
    public modalController: ModalController
  ) { }
  @ViewChild('content', { static: false }) content: IonContent;
  toggleInfoView() {
    this.infoView = !this.infoView;
  }

  ngOnInit() {
    this.juegoSeleccionado = this.sesion.DameJuego();

   
   // this.listaSeleccionable[0] =  new Punto('Totales');

    this.NivelesJuego();
    this.DamePuntosDelJuego();

    if (this.juegoSeleccionado.Modo === 'Individual') {
      this.AlumnosDelJuego();
    } else {
      this.EquiposDelJuego();
    }




    // this.MiAlumno = this.sesion.DameAlumno();
    // console.log(this.MiAlumno);
    // console.log(this.juegoSeleccionado.id);

    // if (this.juegoSeleccionado.Modo === 'Individual') {
    //   this.calculos.DameHistorialMisPuntos(this.juegoSeleccionado.id, this.MiAlumno.id).subscribe(
    //     lista => {
    //       console.log(lista);
    //       this.EsteAlumnoJuegoDePuntos = lista.AlumnoJDP;
    //       console.log(this.EsteAlumnoJuegoDePuntos[0]);
    //       this.MiHistorialPuntos = lista.Historial;
    //       this.peticionesAPI.DameInscripcionAlumnoJuegoDePuntos(this.MiAlumno.id, this.juegoSeleccionado.id).subscribe(
    //         AlumnoJDP => {
    //           this.MiAlumnoJDP = AlumnoJDP[0].PuntosTotalesAlumno;
    //           console.log(this.MiAlumnoJDP);
    //         });
    //     }
    //   );
    //   this.AlumnosDelJuego();
    // } else {
    //   this.EquiposDelJuego();
    // }
  }

  
  async SeleccionarAlumnos(): Promise<any> {
    // La selección de los alumnos quería hacerla con una alerta con checkbox, pero 
    // no vi la manera de tener un boton para seleccionarlos todos.
    // Por eso lo hago con una página a la que accedo de forma modal.
    this.sesion.TomaAlumnosJuegoDeColeccion (this.alumnosDelJuego);
    const modalAlumnos = await this.modalController.create({
      component: SeleccionarAlumnosPage,
      cssClass: 'my-custom-class',
    });
    await modalAlumnos.present();
    // tslint:disable-next-line:semicolon
    const { data }  = await modalAlumnos.onWillDismiss();
    return data.seleccion;
  }
  AsignarASeleccion () {
    const opciones: any[] = [];
    this.TodosLosPuntos.forEach (tipo => {
      opciones.push ({
          type: 'radio',
          label: tipo.Nombre,
          value: tipo.id
      });
    });

    this.alertCtrl.create({
      header: 'Selecciona el tipo de punto a asignar',
      inputs: opciones,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'OK',
          handler: (tipoPuntoId) => {
         
            this.SeleccionarAlumnos()
            .then (seleccion => {
              console.log ('seleccion');
              console.log (seleccion);
              if (seleccion) {
                let i;
                for (i = 0; i < this.alumnosDelJuego.length; i++) {
                  if (seleccion[i]) {
                    console.log ('Alumnos del juego');
                    console.log (this.alumnosDelJuego);
                    console.log ('lista ordenada');
                    console.log (this.listaAlumnosOrdenadaPorPuntos);
                    console.log ('renking');
                    console.log (this.rankingJuegoDePuntos);
                    // tslint:disable-next-line:max-line-length
                    const inscripcionAlumno = this.listaAlumnosOrdenadaPorPuntos.filter (inscripcion => inscripcion.alumnoId === this.alumnosDelJuego[i].id)[0];
                    this.calculos.AsignarPuntosAlumno (inscripcionAlumno,
                      this.nivelesDelJuego, 1, tipoPuntoId);
                    this.rankingJuegoDePuntos.filter (r => r.id === inscripcionAlumno.alumnoId)[0].puntos++;

                    if (inscripcionAlumno.nivelId !== undefined) {
                      const nivel = this.nivelesDelJuego.filter (n => n.id === inscripcionAlumno.nivelId)[0];
                      this.rankingJuegoDePuntos.filter (r => r.id === inscripcionAlumno.alumnoId)[0].nivel = nivel.Nombre;
                    }
                  }
                }
                // tslint:disable-next-line:only-arrow-functions
                this.listaAlumnosOrdenadaPorPuntos = this.listaAlumnosOrdenadaPorPuntos.sort(function(obj1, obj2) {
                      return obj2.PuntosTotalesAlumno - obj1.PuntosTotalesAlumno;
                 });
                 // tslint:disable-next-line:only-arrow-functions
                this.rankingJuegoDePuntos = this.rankingJuegoDePuntos.sort(function(obj1, obj2) {
                      return obj2.puntos - obj1.puntos;
                });
                // tslint:disable-next-line:no-shadowed-variable
                for (let j = 0; j < this.rankingJuegoDePuntos.length; j++) {
                      this.rankingJuegoDePuntos[j].posicion = j + 1;
                }

                this.alertCtrl.create({
                  header: 'Puntos asignados',
                  buttons: ['OK']
                }).then(res => {
                  res.present();
                });
              }
            });
          }
        }
      ]
    }).then (res => res.present());
  }

  DameEquipoAlumnoConectado() {
    console.log('voy a por el equipo del alumno');
    for ( let i = 0; i < this.equiposDelJuego.length; i++){
      this.peticionesAPI.DameAlumnosEquipo(this.equiposDelJuego[i].id)
      .subscribe(res => {
        console.log('miro en: ' + this.equiposDelJuego[i]);
        for (let j = 0; j < res.length; j++)
          if (res[j].id === this.MiAlumno.id) {
            console.log(res);
            this.MiEquipo = this.equiposDelJuego[i];
            console.log('tu equipo');
            console.log(this.MiEquipo);
          }
      });
    }
  }

  // Recupera los alumnos que pertenecen al juego
  AlumnosDelJuego() {
    console.log('Vamos a pos los alumnos');
    this.peticionesAPI.DameAlumnosJuegoDePuntos(this.juegoSeleccionado.id)
      .subscribe(alumnosJuego => {
        console.log('Ya tengo los alumnos');
        console.log(alumnosJuego);
        this.alumnosDelJuego = alumnosJuego;
        this.RecuperarInscripcionesAlumnoJuego();
      });
  }




  // Recupera los equipos que pertenecen al juego
  EquiposDelJuego() {
    this.peticionesAPI.DameEquiposJuegoDePuntos(this.juegoSeleccionado.id)
      .subscribe(equiposJuego => {
        console.log('ya tengo los equipos');
        this.equiposDelJuego = equiposJuego;
        this.RecuperarInscripcionesEquiposJuego();
        this.DameEquipoAlumnoConectado();
      });

  }

  // Recupera los niveles de los que dispone el juego
  NivelesJuego() {
    this.peticionesAPI.DameNivelesJuegoDePuntos(this.juegoSeleccionado.id)
      .subscribe(niveles => {
        this.nivelesDelJuego = niveles;
        console.log('Los niveles del juego son')
        console.log(this.nivelesDelJuego)
        for (let i = 0; i < this.nivelesDelJuego.length; i++) {
          console.log('entro a buscar nivel y foto');
          console.log(this.nivelesDelJuego[i]);
          if (this.nivelesDelJuego[i].Imagen !== undefined) {
            // Busca en la base de datos la imágen con el nombre registrado en equipo.FotoEquipo y la recupera
            this.peticionesAPI.DameImagenNivel(this.nivelesDelJuego[i].Imagen)
              .subscribe(response => {
                const blob = new Blob([response.blob()], { type: 'image/jpg' });
    
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                  this.nivelesDelJuego[i].Imagen = reader.result.toString();
                }, false);
    
                if (blob) {
                  reader.readAsDataURL(blob);
                }
              });
    
            // Sino la imagenLogo será undefined para que no nos pinte la foto de otro equipo préviamente seleccionado
          } else {
            this.nivelesDelJuego[i].Imagen = undefined;
          }
        }
      });
  }

DamePuntosDelJuego() {
  this.peticionesAPI.DamePuntosJuegoDePuntos(this.juegoSeleccionado.id).subscribe(
    puntos => {
      this.TodosLosPuntos = puntos;
      console.log(this.TodosLosPuntos);
      this.puntoAleatorioId = this.TodosLosPuntos.filter (p => p.Nombre === 'Aleatorio')[0].id;
    }
  );
}

// Recupera las inscripciones de los alumnos en el juego y los puntos que tienen y los ordena de mayor a menor valor
RecuperarInscripcionesAlumnoJuego() {
  this.peticionesAPI.DameInscripcionesAlumnoJuegoDePuntos(this.juegoSeleccionado.id)
    .subscribe(inscripciones => {
      console.log('ya tengo las inscripcionesssssssssssssssssssssssssssssss');
      console.log(inscripciones);
      this.listaAlumnosOrdenadaPorPuntos = inscripciones;
      // ordena la lista por puntos
      // tslint:disable-next-line:only-arrow-functions
      this.listaAlumnosOrdenadaPorPuntos = this.listaAlumnosOrdenadaPorPuntos.sort(function (obj1, obj2) {
        return obj2.PuntosTotalesAlumno - obj1.PuntosTotalesAlumno;
      });
      console.log('ya tengo las inscripciones');
      console.log(this.listaAlumnosOrdenadaPorPuntos);
      // this.OrdenarPorPuntos();
      this.TablaClasificacionTotal();
    });
}

// Recupera las inscripciones de los alumnos en el juego y los puntos que tienen y los ordena de mayor a menor valor
RecuperarInscripcionesEquiposJuego() {
  console.log('vamos por las inscripciones ' + this.juegoSeleccionado.id);
  this.peticionesAPI.DameInscripcionesEquipoJuegoDePuntos(this.juegoSeleccionado.id)
    .subscribe(inscripciones => {
      this.listaEquiposOrdenadaPorPuntos = inscripciones;
      console.log(this.listaEquiposOrdenadaPorPuntos);

      // ordenamos por puntos
      // tslint:disable-next-line:only-arrow-functions
      this.listaEquiposOrdenadaPorPuntos = this.listaEquiposOrdenadaPorPuntos.sort(function (obj1, obj2) {
        return obj2.PuntosTotalesEquipo - obj1.PuntosTotalesEquipo;
      });
      console.log('ya tengo las inscripciones');
      this.TablaClasificacionTotal();
      console.log(this.MiEquipo);
    });
}




AsignarPuntoAleatorio() {
  console.log ('niveles del juego');
  console.log (this.nivelesDelJuego);
  if (this.juegoSeleccionado.Modo === 'Individual') {
    console.log ('Entramos');
    const numeroAlumnos = this.alumnosDelJuego.length;
    const elegido = Math.floor(Math.random() * numeroAlumnos);
    const alumnoElegido = this.rankingJuegoDePuntos[elegido];

    this.alertCtrl.create({
      header: '¿Quieres asignar un punto aleatorio a:?',
      message: alumnoElegido.nombre + ' ' + alumnoElegido.primerApellido + ' ' + alumnoElegido.segundoApellido,
      buttons: [
        {
          text: 'SI',
          handler: () => {
            this.calculos.AsignarPuntosAlumno ( this.listaAlumnosOrdenadaPorPuntos[elegido],
              this.nivelesDelJuego, 1, this.puntoAleatorioId);
            this.rankingJuegoDePuntos[elegido].puntos = this.rankingJuegoDePuntos[elegido].puntos + 1;
            if (this.listaAlumnosOrdenadaPorPuntos[elegido].nivelId !== undefined) {
              const nivel = this.nivelesDelJuego.filter (n => n.id === this.listaAlumnosOrdenadaPorPuntos[elegido].nivelId)[0];
              this.rankingJuegoDePuntos[elegido].nivel = nivel.Nombre;
            }

            // tslint:disable-next-line:only-arrow-functions
            this.listaAlumnosOrdenadaPorPuntos = this.listaAlumnosOrdenadaPorPuntos.sort(function(obj1, obj2) {
              return obj2.PuntosTotalesAlumno - obj1.PuntosTotalesAlumno;
            });
            // tslint:disable-next-line:only-arrow-functions
            this.rankingJuegoDePuntos = this.rankingJuegoDePuntos.sort(function(obj1, obj2) {
              return obj2.puntos - obj1.puntos;
            });
            for (let i = 0; i < this.rankingJuegoDePuntos.length; i++) {
              this.rankingJuegoDePuntos[i].posicion = i + 1;
            }
            this.alertCtrl.create({
              header: 'Punto asignado',
              buttons: ['OK']
            }).then(res => {
              res.present();
            });

          }
        }, {
          text: 'NO',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    }).then (res => res.present());
  }

}




// Alumnos de cada equipo
AlumnosDelEquipo(equipo: Equipo) {
  console.log(equipo);
  this.cierraHistorial();

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

// En función del modo, recorremos la lisa de Alumnos o de Equipos y vamos rellenando el rankingJuegoDePuntos
// ESTO DEBERIA IR AL SERVICIO DE CALCULO, PERO DE MOMENTO NO LO HAGO PORQUE SE GENERAN DOS TABLAS
// Y NO COMPRENDO BIEN LA NECESIDAD DE LAS DOS
TablaClasificacionTotal() {

  if (this.juegoSeleccionado.Modo === 'Individual') {
    this.rankingJuegoDePuntos = this.calculos.PrepararTablaRankingIndividual(
      this.listaAlumnosOrdenadaPorPuntos,
      this.alumnosDelJuego,
      this.nivelesDelJuego
    );
    console.log('Ya tengo la tabla');
    console.log(this.rankingJuegoDePuntos);
  } else {

    this.rankingEquiposJuegoDePuntos = this.calculos.PrepararTablaRankingEquipos(
      this.listaEquiposOrdenadaPorPuntos, this.equiposDelJuego, this.nivelesDelJuego
    );
    console.log('ranking ' + this.rankingEquiposJuegoDePuntos);
    console.log(this.rankingEquiposJuegoDePuntos);
  }
}

MuestrameInfoEquipoSeleccionado(equipo: TablaEquipoJuegoDePuntos) {
  this.MuestraHistorial();
  const equipoSeleccionado = this.equiposDelJuego.filter(res => res.Nombre === equipo.nombre)[0];


  const posicion = this.rankingEquiposJuegoDePuntos.filter(res => res.nombre === equipo.nombre)[0].posicion;
  console.log(posicion);
  // Informacion que se necesitara para ver la evolución del equipo

  this.sesion.TomaDatosEvolucionEquipoJuegoPuntos(
    posicion,
    equipoSeleccionado,
    this.listaEquiposOrdenadaPorPuntos.filter(res => res.equipoId === equipoSeleccionado.id)[0],
    this.nivelesDelJuego,
    this.TodosLosPuntos
  );
  this.MostrarHistorialSeleccionado();
}

MostrarHistorialSeleccionado() {
  const res = this.sesion.DameDatosEvolucionEquipoJuegoPuntos();
  this.equipoJuegoDePuntos = res.inscripcionEquipoJuego;
  // traigo el historial
  this.calculos.PreparaHistorialEquipo(this.equipoJuegoDePuntos, this.TodosLosPuntos).
    subscribe(res => {
      this.historialequipo = res;
      console.log(this.historialequipo);
    });
}


MostrarHistorialAlumno(alumno: TablaAlumnoJuegoDePuntos) {

  const inscripcionAlumno = this.listaAlumnosOrdenadaPorPuntos.filter (inscripcion => inscripcion.alumnoId === alumno.id)[0];
  console.log ('alumno');
  console.log (alumno);
  console.log ('inscripcion');
  console.log (inscripcionAlumno);
  this.calculos.PreparaHistorialAlumno(inscripcionAlumno, this.TodosLosPuntos)
  .subscribe(historial => {
    console.log ('historial del alumno');
    console.log(historial);
    this.historialAlumno = historial;
  });
}

HistorialTotal() {
  const res = this.sesion.DameDatosEvolucionAlumnoJuegoPuntos();
  this.alumnoJuegoDePuntos = res.inscripcionAlumnoJuego;
  // traigo el historial
  this.calculos.PreparaHistorialAlumno(this.alumnoJuegoDePuntos, this.TodosLosPuntos).
    subscribe(res => {
      this.historialalumno = res;
      console.log ('historial del alumno');
      console.log(this.historialalumno);
    });
}

MuestraElRanking() {
  this.hideMe = true;
  this.scrollToBottom();
  console.log(this.hideMe)
}
OcultarElRanking(){
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

// configuramos el slider de los cromos
sliderConfig = {
  slidesPerView: 1.6,
  spaceBetween: 10,
  centeredSlides: true
};

// Muestra los puntos de cada alumno-equipo
MuestraHistorial() {
  this.infoPuntosView = !this.infoPuntosView;
}

// Cerrar otros dialogos de puntos del equipo si estuvieran abiertos
cierraHistorial() {
  if (this.infoPuntosView == true) {
    this.infoPuntosView = false;
  }
}

ionViewWillEnter (){
  this.Tipo = "Puntos";
}
}
