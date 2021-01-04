import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Alumno, AsistenciaClase, Equipo, Grupo, Matricula, SesionClase } from '../clases';
import { CalculosService, PeticionesAPIService, SesionService } from '../servicios';
import { DatePipe } from '@angular/common';




@Component({
  selector: 'app-ver-grupo',
  templateUrl: './ver-grupo.page.html',
  styleUrls: ['./ver-grupo.page.scss'],
})
export class VerGrupoPage implements OnInit {

  grupo: Grupo;
  alumnosDelGrupo: Alumno[];
  listaEquipos: Equipo[];
  alumnosDelEquipo: Alumno[];
  matriculasGrupo: Matricula[];
  mostrarEquipos = false;
  mostrarAlumnos = true;
  sesionClase = false;
  registrarSesion = false;
  marca: string[] = [];
  fecha = 'Introduce dia/hora';
  dia: string;
  diaParaAlerta: string;
  hora: string;
  sesionCreada = false;
  sesionClaseId: number;
  descripcion: string;
  asistenciaRegistrada = false;
  asistencias: any[];
  sesiones: SesionClase[];
  sesionesAnteriores= false;
  asistenciaSesionElegida: any[];

  tiempos: any [];
  porcentajeAsistenciaAlumnos: any[] = [];
  porcentajeAsistenciaSesiones: any[] = [];
  datosGrafico: any[];
  grafico: any;
  nuevaSesion: SesionClase;
  editandoAsistencia = false;
  sesionElegida: SesionClase;
  asistenciaPreparada = false;
  listaAlumnos: Alumno [];
  datos: any[] = [];

  @ViewChild('accordion', {static: false}) accordion: MatAccordion;
  
  constructor(
    private peticionesAPI: PeticionesAPIService,
    private sesion: SesionService,
    private calculos: CalculosService,
    private route: Router,
    private alertCtrl: AlertController,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.grupo = this.sesion.DameGrupo ();
    this.AlumnosDelGrupo();
    this.EquiposDelGrupo();
  }

  AlumnosDelGrupo() {

    this.peticionesAPI.DameAlumnosGrupo(this.grupo.id)
    .subscribe(res => {

      if (res[0] !== undefined) {
        this.alumnosDelGrupo = res;
        this.DameSesionesDeClase();


      } else {
        console.log('No hay alumnos en este grupo');
      }
    });
    // this.peticionesAPI.DameMatriculasGrupo (this.grupo.id)
    // .subscribe ( res => this.matriculasGrupo = res);
  }
  EquiposDelGrupo() {
    this.peticionesAPI.DameEquiposDelGrupo(this.grupo.id)
    .subscribe(res => {
      if (res[0] !== undefined) {

        this.listaEquipos = res;
      } else {
        // Informar al usuario
        console.log('Este grupo no tiene equipos');
      }
    });
  }

  
  DameSesionesDeClase() {

    this.asistencias = [];
    this.peticionesAPI.DameSesionesClaseGrupo (this.grupo.id).
    subscribe (sesiones => {
      this.sesiones = sesiones;
      console.log ('ya tengo las sesiones');
      console.log (this.sesiones);
      this.sesiones.sort((a, b) => (a.Dia < b.Dia ? -1 : 1));
      this.PrepararDatos();
    });

  }

  PrepararDatos () {
    this.datos = [];
    // La estructura de datos clave para alimentar todas las pantallas es una lista.
    // La lista tiene una posición por cada alumno en la que hay:
    //  Los datos del alumno
    //  Los datos de las asistencias del alumno (un vector con tantas posiciones como sesiones,
    //  en el que en cada posición hay el id de la sesión y el tiempo que se registró)
    console.log ('vamos a preparar datos');
    console.log (this.sesiones);
    this.alumnosDelGrupo.forEach (al => {
      const asis = [];
      this.sesiones.forEach (sesion => {
        // Para cada sesión busco en la lista de asistencias a esa sesión la que corresponde al alumno
        const t = sesion.Asistencia.filter (a => a.alumnoId === al.id)[0].tiempo;
        asis.push ({
          sesionId: sesion.id,
          tiempo: t
        });
      });
      this.datos.push ({
        alumno: al,
        asistencias: asis
      });
    });
    console.log ('datos preparados');
    console.log (this.datos);
  }

  
CrearSesion() {

  if ((!this.fecha) || (!this.descripcion)) {
    this.alertCtrl.create({
      header: 'Introduce dia/hora y descripción',
      buttons: ['OK']
    // tslint:disable-next-line:no-shadowed-variable
    }).then (res => res.present());

  } else {
    this.dia = this.fecha.split ('T')[0];
    this.diaParaAlerta = this.datePipe.transform(this.dia, 'dd-MM-yyyy');
    this.hora = this.fecha.split ('T')[1];

    this.alertCtrl.create({
      header: '¿Seguro que quieres crear esta sesión?',
      message: 'Dia: ' + this.diaParaAlerta + '<br>Hora: ' + this.hora + '<br>Descripcion: ' + this.descripcion,
      buttons: [
        {
          text: 'SI',
          handler: () => {
            this.marca = [];
            const asistenciasNuevaSesion = [];
            // Creo la lista de asistencias para esta nueve sesión, indicando que los tiempos aun no han sido registrados
            // Tambien preparo el vector de marcas con la misma información del tiempo. De ahí es de donce se mostrará
            // en html los tiempos de cada alumno
            this.alumnosDelGrupo.forEach (alumno => {
              asistenciasNuevaSesion.push ({
                alumnoId: alumno.id,
                tiempo: undefined
              });
              this.marca.push (undefined);
            });
            console.log ('ya tengo la asistencia de la nueva sesion');
            console.log (asistenciasNuevaSesion);

            // tslint:disable-next-line:max-line-length
            this.peticionesAPI.CreaSesionClase(new SesionClase (this.dia, this.hora, this.descripcion, asistenciasNuevaSesion), this.grupo.id)
            .subscribe((res) => {
              if (res != null) {
                    console.log ('ya tengo la sesión creada');
                    this.sesionCreada = true; // Si tiro atrás y cambio algo se hará un PUT y no otro POST
                    this.sesionClaseId = res.id;
                    this.nuevaSesion = res;
                    console.log (this.nuevaSesion);
                    this.asistenciaRegistrada = false;
                    this.sesiones.push (this.nuevaSesion);
                    this.sesiones.sort((a, b) => (a.Dia < b.Dia ? -1 : 1));
                    this.PrepararDatos();
                   // this.PreparaSesion (this.nuevaSesion);
                    this.alertCtrl.create({
                      header: 'Sesión creada',
                      buttons: ['OK']
                    // tslint:disable-next-line:no-shadowed-variable
                    }).then (res => res.present());
              } else {
                this.alertCtrl.create({
                  header: 'Error al crear la sesión',
                  buttons: ['OK']
                // tslint:disable-next-line:no-shadowed-variable
                }).then (res => res.present());

              }
            });
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

MarcarAsistenciaAlumno(i) {

  // La sesión de clase con la que estoy trabajando está identificada con sesionClaseId
  // El tiempo se guarda tanto en la estructura datos como en el vector de marcas

  const asistencia = this.datos [i].asistencias.find (a => a.sesionId === this.sesionClaseId);
  if (asistencia.tiempo === undefined) {
    let marca: string;
    const d = new Date();
    if (d.getMinutes() < 10 ) {
        marca = d.getHours() + ':0' + d.getMinutes();
    } else {
        marca = d.getHours() + ':' + d.getMinutes();
    }
    asistencia.tiempo = marca;
  } else {
    asistencia.tiempo = undefined;

  }
  this.marca[i] = asistencia.tiempo;

}
MarcarTodos () {
  let marca: string;
  const d = new Date();
  if (d.getMinutes() < 10 ) {
      marca = d.getHours() + ':0' + d.getMinutes();
  } else {
      marca = d.getHours() + ':' + d.getMinutes();
  }
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < this.datos.length; i++) {
    const asistencia = this.datos [i].asistencias.find (a => a.sesionId === this.sesionClaseId);
    asistencia.tiempo = marca;
    this.marca[i] = marca;
  }
}
DesmarcarTodos () {
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < this.datos.length; i++) {
    const asistencia = this.datos [i].asistencias.find (a => a.sesionId === this.sesionClaseId);
    asistencia.tiempo = undefined;
    this.marca[i] = undefined;
  }
}

RegistrarAsistencia() {
  // Llamaré aquí cuando haya registrado la asistencia de los alumnos en una sesión recien creada
  // Recogo las asistencias de la sesión tal y como han quedado guardadas en datos para agregarlas
  // a la información de la sesión
  const asistenciasNuevaSesion = [];
  this.datos.forEach (dato => {
    const alId = dato.alumno.id;
    const t =  dato.asistencias.find (a => a.sesionId === this.sesionClaseId).tiempo;
    asistenciasNuevaSesion.push ({
      alumnoId: alId,
      tiempo: t
    });
  });
  let mensaje;
  this.nuevaSesion.Asistencia = asistenciasNuevaSesion;
  if (!this.marca.some (m => m !== undefined)) {
    mensaje = "No has marcado la hora de llegada de ningún alumno"
  }



  this.alertCtrl.create({
        header: '¿Seguro que quieres registrar la asistencia en este momento?',
        message: mensaje,
        buttons: [
          {
            text: 'SI',
            handler: () => {
              this.peticionesAPI.ModificaSesionClase (this.nuevaSesion)
              .subscribe (sesion => {
                this.asistenciaRegistrada = true;
                this.PrepararDatos();
              });
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

ModificarAsistencia() {
  // Esta función es similar a RegistrarAsistencia, aunque en este caso no se hace con la
  // sesión recien creada sino con la elegida por el usuario
  const asistenciasNuevas = [];
  this.datos.forEach (dato => {
    const alId = dato.alumno.id;
    const t =  dato.asistencias.find (a => a.sesionId === this.sesionClaseId).tiempo;
    asistenciasNuevas.push ({
      alumnoId: alId,
      tiempo: t
    });
  });
  let mensaje;
  this.sesionElegida.Asistencia = asistenciasNuevas;
  if (!this.marca.some (m => m !== undefined)) {
    mensaje = "No has marcado la hora de llegada de ningún alumno"
  }
  this.alertCtrl.create({
        header: '¿Seguro que quieres modificar la asistencia en este momento?',
        message: mensaje,
        buttons: [
          {
            text: 'SI',
            handler: () => {
              this.peticionesAPI.ModificaSesionClase (this.sesionElegida)
              .subscribe (sesion => {
                this.PrepararDatos();
                this.asistenciaRegistrada = true;
                this.asistenciaPreparada = true;
                this.editandoAsistencia = false;
              });
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



PreparaSesion(sesion: SesionClase) {
  // El usuario a elegido una sesión. Preparo el vector de marcas para mostrarlas
 
  this.sesionClaseId  = sesion.id;
  this.sesionElegida = sesion;
  for (let i = 0; i < this.datos.length; i++) {
    const asistencia = this.datos [i].asistencias.find (a => a.sesionId === this.sesionClaseId);
    this.marca[i] = asistencia.tiempo;
  }
  this.asistenciaPreparada = true;
  this.editandoAsistencia = false;

}

PreparaPorcentajesAsistencia() {
  this.porcentajeAsistenciaAlumnos = [];
  this.datos.forEach (dato => {
    let cont = 0;
    dato.asistencias.forEach (asistencia => {
      if (asistencia.tiempo !== undefined) {
        cont++;
      }
    });
    const p: number = Math.floor((cont * 100 / this.sesiones.length));
    this.porcentajeAsistenciaAlumnos.push (p);
  });

}

PreparaGrafico() {

  this.datosGrafico = [];
  // tslint:disable-next-line:prefer-for-of
  for ( let i = 0; i < this.sesiones.length; i++) {
    let cont = 0;
    this.sesiones[i].Asistencia.forEach (asistencia => {
      if (asistencia.tiempo) {
        cont++;
      }
    });
    const porcentaje = Math.floor (cont * 100 / this.alumnosDelGrupo.length);


    this.datosGrafico.push ( [ porcentaje, this.sesiones[i].Descripcion]);
  }


  this.datosGrafico = [['%', 'Sesión']].concat(this.datosGrafico.reverse());
  console.log ('datos');
  console.log (this.datosGrafico);

  this.grafico = {
    dataset: {
        source: this.datosGrafico,
    },
    grid: {containLabel: true},
    xAxis: {name: '%', min: 0, max: 100},
    yAxis: {type: 'category'},
    visualMap: {
        orient: 'horizontal',
        left: 'center',
        min: 0,
        max: 100,
        text: ['100%', '0%'],
        // Map the score column to color
        dimension: 0,
        inRange: {
            // color: ['#FFF633', '#33FF49']
            color: ['#F05D87', '#831837']
        }
    },
    series: [
        {
            type: 'bar',
            encode: {
                // Map the "amount" column to X axis.
                x: '%',
                // Map the "product" column to Y axis
                y: 'Sesión'
            }
        }
    ]
  };


}

  
  // Le pasamos el equipo y buscamos el logo que tiene y sus alumnos
  AlumnosDelEquipo(equipo: Equipo) {
    this.peticionesAPI.DameAlumnosEquipo(equipo.id)
    .subscribe(res => {
      if (res[0] !== undefined) {
        this.alumnosDelEquipo = res;

      } else {
        // Mensaje al usuario
        console.log('No hay alumnos en este equipo');
        this.alumnosDelEquipo = undefined;
      }
    });
  }

  MostrarEquipos () {
    this.mostrarEquipos = true;
    this.mostrarAlumnos = false;
  }

  SesionClase () {
    this.mostrarAlumnos = false;
    this.sesionClase = true;

    this.sesionCreada = false;
    this.nuevaSesion = undefined;
    this.fecha = undefined;
    this.descripcion = undefined;
    this.asistenciaRegistrada = false;
  }
  RegistraSesion () {
    this.sesionClase = false;
    this.registrarSesion = true;
  }
  SesionesAnteriores () {
    this.sesionesAnteriores = true;
    this.mostrarAlumnos = false;
    this.editandoAsistencia = false;
    this.asistenciaPreparada = false;
  }

  EditaAsistencia () {
    console.log ('voy a editar asistencia');
    console.log (this.asistenciaSesionElegida);

    this.editandoAsistencia = true;
    this.asistenciaRegistrada = false;
   
  }
 Volver () {
    this.mostrarEquipos = false;
    this.sesionesAnteriores = false;
    this.sesionClase = false;
    this.mostrarAlumnos = true;
  }

  VolverASesion () {
    // Se llama aquí al volver de la creación de una sesión

    if (this.sesionCreada && !this.asistenciaRegistrada) {
      this.alertCtrl.create({
        header: '¿Seguro que quieres volver?',
        message: 'No has hecho ningún registro de asistencia',
        buttons: [
          {
            text: 'SI',
            handler: async () => {
              this.mostrarAlumnos = true;
              this.registrarSesion = false;
              this.sesionCreada = false;
              this.sesionClase = false;
              this.nuevaSesion = undefined;
              this.descripcion = undefined;
              this.fecha = undefined;
              this.asistenciaRegistrada = false;
              // this.marca = Array(this.alumnosDelGrupo.length);
              // this.DameSesionesDeClase();

            }
          }, {
            text: 'NO',
            role: 'cancel',
        
            handler: () => {
            }
          }
        ]
      }).then (res => res.present());
    } else {
      this.mostrarAlumnos = true;
      this.registrarSesion = false;
      this.sesionCreada = false;
      this.sesionClase = false;
      this.nuevaSesion = undefined;
      this.descripcion = undefined;
      this.fecha = undefined;
      this.asistenciaRegistrada = false;
      // this.marca = Array(this.alumnosDelGrupo.length);
      // this.DameSesionesDeClase();
    }
  }

 
  ElegirAleatoriamente() {
    console.log ('Entramos');
    const numeroAlumnos = this.alumnosDelGrupo.length;
    const elegido = Math.floor(Math.random() * numeroAlumnos);
    const alumnoElegido = this.alumnosDelGrupo[elegido];
    this.alertCtrl.create({
      header: 'El alumno elegido es...',
      message: alumnoElegido.Nombre + ' ' + alumnoElegido.PrimerApellido + ' ' + alumnoElegido.SegundoApellido,
      buttons: ['OK']
    }).then(res => {
      res.present();
    });

  }
  

  EliminaSesion (sesion: SesionClase) {
    this.alertCtrl.create({
      header: '¿Seguro que quieres eliminar esta sesión?',
       buttons: [
        {
          text: 'SI',
          handler: () => {
            this.peticionesAPI.BorraSesionClase(sesion.id)
            .subscribe();
            this.alertCtrl.create({
                  header: 'Sesión eliminada',
                  buttons: ['OK']
                // tslint:disable-next-line:no-shadowed-variable
            }).then (res => res.present());
            this.sesiones = this.sesiones.filter (s => s.id !== sesion.id);
            this.PrepararDatos();

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
