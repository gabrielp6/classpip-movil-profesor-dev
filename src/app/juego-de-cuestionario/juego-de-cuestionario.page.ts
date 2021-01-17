import { Component, OnInit, ViewChild } from '@angular/core';
import { SesionService, PeticionesAPIService } from '../servicios';
import { NavController, AlertController, Platform, IonSlides } from '@ionic/angular';
import { CalculosService, ComServerService } from '../servicios';
import { Alumno, Juego, TablaAlumnoJuegoDeCuestionario } from '../clases';
import { Cuestionario } from '../clases/Cuestionario';
import { Pregunta } from '../clases/Pregunta';
import { AlumnoJuegoDeCuestionario } from '../clases/AlumnoJuegoDeCuestionario';
import { Router } from '@angular/router';
import { MiAlumnoAMostrarJuegoDeCuestionario } from '../clases/MiAlumnoAMostrarJuegoDeCuestionario';
import { RespuestaJuegoDeCuestionario } from '../clases/RespuestaJuegoDeCuestionario';
import {MatStepper} from '@angular/material';
import {MatAccordion} from '@angular/material/expansion'; 




@Component({
  selector: 'app-juego-de-cuestionario',
  templateUrl: './juego-de-cuestionario.page.html',
  styleUrls: ['./juego-de-cuestionario.page.scss'],
})
export class JuegoDeCuestionarioPage implements OnInit {

  empezado = false;

  alumnoId: number;
  alumnoJuegoDeCuestionario: AlumnoJuegoDeCuestionario;
  juegoSeleccionado: any;
  cuestionario: Cuestionario;
  PreguntasCuestionario: Pregunta[];
  preguntas: Pregunta[];
  descripcion = '';
  puntuacionCorrecta: number;
  puntuacionIncorrecta: number;
  respuestasPosibles: string[] = [];
  RespuestaEscogida: string;
  RespuestasAlumno: string[] = [];
  Nota = 0;
  puntuacionMaxima = 0;
  NotaInicial = '';
  feedbacks: string[] = [];

  // Con este array establecemos la posicion donde estara colocada la respuesta correcta en cada una de las preguntas
  ordenRespuestaCorrecta: number[] = [2, 3, 0, 1, 2, 0, 3, 1, 1, 0, 2];

  // Caso de un cuestionario con preguntas mezcladas
  nuevaOrdenacion: number[] = [];
  PreguntasCuestionarioOrdenadas: Pregunta[];

  // Caso de un cuestionario con respuestas mezcladas tambien
  todasRespuestas: string[] = [];
  mezclaRespuestas: string[] = [];
  numeroDeRespuestas = 0;
  tiempoLimite: number;
  tiempoRestante: number;
  timer;
  contar = false;

  // Datos juego de cuestionario finalizado
  MisAlumnosDelJuegoDeCuestionario: MiAlumnoAMostrarJuegoDeCuestionario[];
  reorden: AlumnoJuegoDeCuestionario[];
  nickName: string;
  cuestionarioRapido = false;
  seleccion: boolean[][];

  alumnosDelJuego: Alumno[];
  listaAlumnosOrdenadaPorNota: AlumnoJuegoDeCuestionario[];
  rankingAlumnosPorNota: TablaAlumnoJuegoDeCuestionario[];
  inscripcionAlumnoJuegoDeCuestionario: AlumnoJuegoDeCuestionario;
  titulos: string[];
  barras: any[];
  info: any;

  analizar = false;


  ////////////////////////////////////////////////
  donut = {
    tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    series: [
        {
            name: '',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: '30',
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: false
            },
            data: [
                {value: 5, name: 'respuesta A'},
                {value: 7, name: 'respuesta B'},
                {value: 2, name: 'respuesta C'},
                {value: 0, name: 'respuesta D'}
            ]
        }
    ]
  };


  datos: any[] = [];
  donuts: any[] = [];
  misDonuts: any[] = [];

  histogramaAciertos: any [];
  grafico: any;
  infA: any;

  respuestasJuegoDeCuestionario: RespuestaJuegoDeCuestionario[];
  categoriasEjeX;
  ///////////////////////////////////////// 
  disablePrevBtn = true;
  disableNextBtn = false;




  // @ViewChild('stepper') stepper: MatStepper;

  @ViewChild(MatStepper, { static: false }) stepper: MatStepper;
  @ViewChild('accordion', {static: false}) accordion: MatAccordion;
  @ViewChild(IonSlides, { static: false }) slides: IonSlides;

  constructor(
    private sesion: SesionService,
    public navCtrl: NavController,
    private route: Router,
    private peticionesAPI: PeticionesAPIService,
    private calculos: CalculosService,
    private alertCtrl: AlertController,
    private platform: Platform,
    private comServer: ComServerService
  ) {
  }



  
  ngOnInit() {
    this.juegoSeleccionado = this.sesion.DameJuego();
    this.AlumnosDelJuego();
    this.peticionesAPI.DameCuestionario (this.juegoSeleccionado.cuestionarioId)
    .subscribe (cuestionario => {
            this.cuestionario = cuestionario;
            this.peticionesAPI.DamePreguntasCuestionario (this.cuestionario.id)
            .subscribe ( preguntas => {
              this.preguntas = preguntas;
            });
    });

    this.comServer.EsperoRespuestasJuegoDeCuestionario()
    .subscribe((alumno: any) => {
         //  sound.play();
           console.log ('Ya ha contestado: ' + alumno.id);
           console.log ('La nota es: ' + alumno.nota);
           // esto lo hago para que al desplegar las respuestas del alumno no me diga que aun no ha contestado
           this.listaAlumnosOrdenadaPorNota.filter (a => a.alumnoId === alumno.id )[0].Contestado = true;
           const al = this.rankingAlumnosPorNota.filter (a => a.id === alumno.id )[0];
           al.nota = alumno.nota;
           al.tiempoEmpleado = alumno.tiempo;
           al.contestado = true;
           console.log ('tabla');
           console.log (this.rankingAlumnosPorNota);
           // tslint:disable-next-line:only-arrow-functions
           this.rankingAlumnosPorNota = this.rankingAlumnosPorNota.sort(function(a, b) {
             if (b.nota !== a.nota) {
               return b.nota - a.nota;
             } else {
               // en caso de empate en la nota, gana el que empleó menos tiempo
               return a.tiempoEmpleado - b.tiempoEmpleado;
             }
           });
       });
  }

  AlumnosDelJuego() {
    this.peticionesAPI.DameAlumnosJuegoDeCuestionario(this.juegoSeleccionado.id)
    .subscribe(alumnosJuego => {
      this.alumnosDelJuego = alumnosJuego;
      this.RecuperarInscripcionesAlumnoJuego();
    });
  }

  RecuperarInscripcionesAlumnoJuego() {
    this.peticionesAPI.DameInscripcionesAlumnoJuegoDeCuestionario (this.juegoSeleccionado.id)
    .subscribe(inscripciones => {
      this.listaAlumnosOrdenadaPorNota = inscripciones;
      // tslint:disable-next-line:only-arrow-functions
      this.listaAlumnosOrdenadaPorNota = this.listaAlumnosOrdenadaPorNota.sort(function(a, b) {
        if (b.Nota !== a.Nota) {
          return b.Nota - a.Nota;
        } else {
          // en caso de empate en la nota, gana el que empleó menos tiempo
          return a.TiempoEmpleado - b.TiempoEmpleado;
        }
      });
      console.log ('inscripciones');
      console.log (this.listaAlumnosOrdenadaPorNota);
      this.rankingAlumnosPorNota = this.calculos.PrepararTablaRankingCuestionario(this.listaAlumnosOrdenadaPorNota,
        this.alumnosDelJuego);
    });
  }

  
  MostrarRespuestasAlumno (alumno) {
    console.log ('Mostrar respuestas de');
    console.log (alumno);
    console.log ('lista');
    console.log (this.listaAlumnosOrdenadaPorNota);
    //this.alumno = this.sesion.DameAlumnoJuegoDeCuestionario();
    this.inscripcionAlumnoJuegoDeCuestionario = this.listaAlumnosOrdenadaPorNota.filter (a => a.alumnoId === alumno.id)[0];
    console.log (this.inscripcionAlumnoJuegoDeCuestionario);
    this.PrepararInfoAlumno();
  }




  PrepararInfoAlumno() {
    // Me traigo el cuestionario y las preguntas
    this.peticionesAPI.DameCuestionario (this.juegoSeleccionado.cuestionarioId)
    .subscribe (cuestionario => {
            this.cuestionario = cuestionario;
            this.peticionesAPI.DamePreguntasCuestionario (this.cuestionario.id)
            .subscribe ( preguntas => {
              this.preguntas = preguntas;
              this.preguntas.sort((a , b) => (a.id > b.id ? 1 : -1));
              // guardo los titulos de las preguntas para mostrarlos en el grafico
              this.titulos = [];
              this.preguntas.forEach (pregunta => this.titulos.push (pregunta.Titulo));

              // Traigo las respuestas del alumno a las preguntas
              this.peticionesAPI.DameRespuestasAlumnoJuegoDeCuestionario (this.inscripcionAlumnoJuegoDeCuestionario.id)
              .subscribe (respuestas => {
                // preparo la información para cada una de las barras horizontales
                this.barras = [];
                respuestas.sort((a , b) => (a.preguntaId > b.preguntaId) ? 1 : -1);
                respuestas.forEach (respuesta => {
                  const pregunta = this.preguntas.filter (p => p.id === respuesta.preguntaId)[0];
                  if (pregunta.Tipo === 'Emparejamiento') {

                    if (respuesta.Respuesta === undefined) {
                      this.barras.push (
                        {value: -1, respuesta: '-', label: {position: 'right'}, itemStyle: {color: 'red'}}
                      );
                    } else {
                      let cont = 0;
                      for (let i = 0; i < pregunta.Emparejamientos.length; i++) {
                        if (pregunta.Emparejamientos[i].r === respuesta.Respuesta[i]) {
                          cont++;
                        }
                      }
                      if (cont === pregunta.Emparejamientos.length) {
                        this.barras.push (
                          {value: 1, respuesta: respuesta.Respuesta, itemStyle: {color: 'green'}}
                        );
                      } else {
                        this.barras.push (
                          {value: -1, respuesta: respuesta.Respuesta, label: {position: 'right'}, itemStyle: {color: 'red'}}
                        );
                      }
                    }

                  } else {
                    const respuestaCorrecta = pregunta.RespuestaCorrecta;
                    if (respuestaCorrecta === respuesta.Respuesta[0]) {
                      // la respuesta es correcta: barra verde
                      this.barras.push (
                        {value: 1, respuesta: respuesta.Respuesta[0], itemStyle: {color: 'green'}}
                      );
                    } else {
                      // la respuesta es incorrecta: barra roja
                      this.barras.push (
                        {value: -1, respuesta: respuesta.Respuesta[0], label: {position: 'right'}, itemStyle: {color: 'red'}}
                      );
                    }
                  }
                });

                // preparo el objeto json que se necesita para crear el gráfico
                this.PreparaBarras();

              });
            });
    });
  }


  PreparaBarras() {

    this.info = {
     // aqui se indica lo que se mostrará cuando el ratón esté sobre la barra
      tooltip: {
          trigger: 'axis',
          axisPointer: {
              type: 'shadow'
          },
          formatter(data) {
            // mostraré la respuesta que dió el alumno, que está en el campo respuesta del
            // objeto que creé para la barra
            // data es un vector, pero en esta caso solo hay una barra para cada elemento de la serie. Por eso
            // solo me interesa data[0]
            return data[0].data.respuesta;
          }
      },
      grid: {
          top: 80,
          bottom: 30,
          letf: 50,
          right: 50
      },
      xAxis: {
        type: 'value',
        show: false,
        splitLine: {show: false}
      },
      yAxis: {
          // en el eje y estará los títulos de las preguntas
          type: 'category',
          axisLine: {show: false},
          axisLabel: {show: false},
          axisTick: {show: false},
          splitLine: {show: false},
          data: this.titulos,
      },
      series: [
          {
              name: 'Res ',
              type: 'bar',
              label: {
                // en cada barra muestro el titulo de la pregunta
                show: true,
                formatter: '{b}'
              },
              data: this.barras
          }
      ]
    };


  }

  Desactivar() {
    this.juegoSeleccionado.JuegoActivo = false;
    this.juegoSeleccionado.JuegoTerminado = false;
    this.peticionesAPI.ModificaJuegoDeCuestionario (this.juegoSeleccionado, this.juegoSeleccionado.id, this.juegoSeleccionado.grupoId)
    .subscribe(res => {
      this.route.navigateByUrl('/inici');
    });

  }
  Activar() {
    this.juegoSeleccionado.JuegoActivo = true;
    this.juegoSeleccionado.JuegoTerminado = false;
    this.peticionesAPI.ModificaJuegoDeCuestionario (this.juegoSeleccionado, this.juegoSeleccionado.id, this.juegoSeleccionado.grupoId)
    .subscribe(res => {
      this.route.navigateByUrl('/inici');
    });

  }

  Finalizar () {
    this.juegoSeleccionado.JuegoActivo = false;
    this.juegoSeleccionado.JuegoTerminado = true;
    this.peticionesAPI.ModificaJuegoDeCuestionario (this.juegoSeleccionado, this.juegoSeleccionado.id, this.juegoSeleccionado.grupoId)
    .subscribe(res => {
      this.route.navigateByUrl('/inici');
    });

  }

  Analizar () {
    this.analizar = true;
    this.TraeInfo();
  }

  
  TraeInfo() {
    this.histogramaAciertos = Array(this.preguntas.length + 1).fill(0);
    this.respuestasJuegoDeCuestionario = [];
    let cont = 0;
    this.listaAlumnosOrdenadaPorNota.forEach (alumno => {
      this.peticionesAPI.DameRespuestasAlumnoJuegoDeCuestionario (alumno.id)
      .subscribe (respuestas => {

        let aciertos = 0;
        // voy a contar los aciertos de este alumno
        respuestas.forEach (respuesta => {
          const pregunta = this.preguntas.filter (p => p.id === respuesta.preguntaId)[0];
          if (pregunta.Tipo === 'Emparejamiento') {
            if (respuesta.Respuesta !== undefined) {
              let n = 0;
              for (let i = 0; i < pregunta.Emparejamientos.length; i++) {
                if (pregunta.Emparejamientos[i].r === respuesta.Respuesta[i]) {
                  n++;
                }
              }
              if (n === pregunta.Emparejamientos.length) {
                aciertos++;
              }
            }

          } else {
            if (pregunta.RespuestaCorrecta === respuesta.Respuesta[0]) {
              aciertos++;
            }
          }
        });
        this.histogramaAciertos[aciertos]++;
        this.respuestasJuegoDeCuestionario = this.respuestasJuegoDeCuestionario.concat (respuestas);
        cont++;
        if (cont === this.listaAlumnosOrdenadaPorNota.length) {
          // preparo el vector con las categorias para el eje X del histograma
          this.categoriasEjeX = [];
          for (let n = 0; n < this.histogramaAciertos.length ; n++) {
            this.categoriasEjeX.push (n.toString());
          }
          this.PrepararDonuts();
        }
     

      });
    });
  }

  
  PrepararDonuts() {
    // preparo un donut para cada pregunta
    this.preguntas.forEach (pregunta => {
      // selecciono las respuestas para esa pregunta
      const respuestas = this.respuestasJuegoDeCuestionario.filter (respuesta => respuesta.preguntaId === pregunta.id);
      let miDonut: any;
      miDonut = [];
      // preparo los datos del donut
      // primero meto el tipo de pregunta
      miDonut.push ( { tipo: pregunta.Tipo});
      if (pregunta.Tipo === 'Cuatro opciones') {
        miDonut.push ( { respuesta: pregunta.RespuestaCorrecta, cont: 0});
        miDonut.push ( { respuesta: pregunta.RespuestaIncorrecta1, cont: 0});
        miDonut.push ( { respuesta: pregunta.RespuestaIncorrecta2, cont: 0});
        miDonut.push ( { respuesta: pregunta.RespuestaIncorrecta3, cont: 0});
        // esto es para el caso de respuesta en blando
        miDonut.push ( { respuesta: '-', cont: 0});
        // ahora cuento las veces que aparece cada una de las respuestas
        respuestas.forEach (respuesta =>
          miDonut.filter (entrada => entrada.respuesta === respuesta.Respuesta[0])[0].cont++
        );

      } else if (pregunta.Tipo === 'Respuesta abierta') {
        miDonut.push ( { respuesta: pregunta.RespuestaCorrecta, cont: 0});
        miDonut.push ( { respuesta: 'Otras respuestas', cont: 0});
        // esto es para el caso de respuesta en blando
        miDonut.push ( { respuesta: '-', cont: 0});
        // ahora cuento las veces que aparece cada una de las respuestas
        respuestas.forEach (respuesta => {
          if (respuesta.Respuesta[0] === pregunta.RespuestaCorrecta) {
            miDonut.filter (entrada => entrada.respuesta === pregunta.RespuestaCorrecta)[0].cont++;
          } else if (respuesta.Respuesta[0] === '-') {
            miDonut.filter (entrada => entrada.respuesta === '-')[0].cont++;
          } else {
            miDonut.filter (entrada => entrada.respuesta === 'Otras respuestas')[0].cont++;
          }
        });

      } else if (pregunta.Tipo === 'Verdadero o falso') {
        miDonut.push ( { respuesta: pregunta.RespuestaCorrecta, cont: 0});
        miDonut.push ( { respuesta: 'Mal', cont: 0});
        // esto es para el caso de respuesta en blando
        miDonut.push ( { respuesta: '-', cont: 0});
        // ahora cuento las veces que aparece cada una de las respuestas
        respuestas.forEach (respuesta => {
          if (respuesta.Respuesta[0] === pregunta.RespuestaCorrecta) {
            miDonut.filter (entrada => entrada.respuesta === pregunta.RespuestaCorrecta)[0].cont++;
          } else if (respuesta.Respuesta[0] === '-') {
            miDonut.filter (entrada => entrada.respuesta === '-')[0].cont++;
          } else {
            miDonut.filter (entrada => entrada.respuesta === 'Mal')[0].cont++;
          }
        });

      } else {
        miDonut.push ( { respuesta: 'Emparejamientos correctos', cont: 0});
        miDonut.push ( { respuesta: 'Otros emparejamientos incorrectos', cont: 0});
        // esto es para el caso de respuesta en blando
        miDonut.push ( { respuesta: '-', cont: 0});
        // ahora cuento las veces que aparece cada una de las respuestas
        respuestas.forEach (respuesta => {
          if (respuesta.Respuesta === undefined) {
            miDonut.filter (entrada => entrada.respuesta === '-')[0].cont++;
          } else {
            let n = 0;
            for (let i = 0; i < pregunta.Emparejamientos.length; i++) {
              if (pregunta.Emparejamientos[i].r === respuesta.Respuesta[i]) {
                n++;
              }
            }
            if (n === pregunta.Emparejamientos.length) {
              miDonut.filter (entrada => entrada.respuesta === 'Emparejamientos correctos')[0].cont++;
            } else {
              miDonut.filter (entrada => entrada.respuesta ===  'Otros emparejamientos incorrectos')[0].cont++;
            }
          }
        });

      }

      this.misDonuts.push (miDonut);
    });

    this.PrepararGraficos();
  }

  PrepararGraficos() {
    // Histograda de número de aciertos

    const histo = this.histogramaAciertos;

    this.grafico = {
      color: ['#3398DB'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: 'aciertos: {b}  <br/>{c}'
      },
      grid: {
        left: '20%',
        right: '20%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          name: '#aciertos',
          data: this.categoriasEjeX,
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [{
        type: 'value',
        name: '#alumnos'
      }],
      series: [{
        type: 'bar',
        barWidth: '60%',
        data: this.histogramaAciertos,
      }]
    };

    // ahora preparo los donuts
    console.log ('PREPARO DONUTS');
    console.log (this.misDonuts);
    let i = 1;
    this.misDonuts.forEach (miDonut => {
      if (miDonut[0].tipo === 'Cuatro opciones') {
        const datos = [
          // las respuestas correctas siempre en verde
          {value: miDonut[1].cont, name: miDonut[1].respuesta, itemStyle: {color: 'green'}},
          {value: miDonut[2].cont, name: miDonut[2].respuesta, itemStyle: {color: 'rgb(50,50,50)'}},
          {value: miDonut[3].cont, name: miDonut[3].respuesta, itemStyle: {color: 'rgb(100,100,100)'}},
          {value: miDonut[4].cont, name: miDonut[4].respuesta, itemStyle: {color: 'rgb(125,125,125)'}},
          {value: miDonut[5].cont, name: 'No contesta ' , itemStyle: {color: 'rgb(150,150,150)'}}
        ];
        const  donut = {
          title: {
            text: 'Respuesta correcta',
            subtext: miDonut[1].respuesta ,
            left: 'center'
          },
          tooltip: {
              trigger: 'item',
              formatter: '{c} alumnos <br/> ({d}%)'
          },
          series: [
              {
                  name: '',
                  type: 'pie',
                  radius: ['50%', '70%'],
                  avoidLabelOverlap: false,
                  label: {
                      show: false,
                      position: 'center'
                  },
                  emphasis: {
                      label: {
                          show: true,
                          fontSize: '30',
                          fontWeight: 'bold'
                      }
                  },
                  labelLine: {
                      show: false
                  },
                  data: datos
              }
          ]
        };
        this.donuts.push (donut);
      } else if (miDonut[0].tipo === 'Respuesta abierta') {
        const datos = [
          // las respuestas correctas siempre en verde
          {value: miDonut[1].cont, name: miDonut[1].respuesta, itemStyle: {color: 'green'}},
          {value: miDonut[2].cont, name: 'Otras respuestas', itemStyle: {color: 'rgb(50,50,50)'}},
          {value: miDonut[3].cont, name: 'No contesta ' , itemStyle: {color: 'rgb(150,150,150)'}}
        ];
        const  donut = {
          title: {
            text: 'Respuesta correcta',
            subtext: miDonut[1].respuesta ,
            left: 'center'
          },
          tooltip: {
              trigger: 'item',
              formatter: '{c} alumnos <br/> ({d}%)'
          },
          series: [
              {
                  name: '',
                  type: 'pie',
                  radius: ['50%', '70%'],
                  avoidLabelOverlap: false,
                  label: {
                      show: false,
                      position: 'center'
                  },
                  emphasis: {
                      label: {
                          show: true,
                          fontSize: '30',
                          fontWeight: 'bold'
                      }
                  },
                  labelLine: {
                      show: false
                  },
                  data: datos
              }
          ]
        };
        this.donuts.push (donut);
      } else if (miDonut[0].tipo === 'Verdadero o falso') {
        const datos = [
          // las respuestas correctas siempre en verde
          {value: miDonut[1].cont, name: miDonut[1].respuesta, itemStyle: {color: 'green'}},
          {value: miDonut[2].cont, name: 'Mal', itemStyle: {color: 'rgb(50,50,50)'}},
          {value: miDonut[3].cont, name: 'No contesta ' , itemStyle: {color: 'rgb(150,150,150)'}}
        ];
        const  donut = {
          title: {
            text: 'Respuesta correcta',
            subtext: miDonut[1].respuesta ,
            left: 'center'
          },
          tooltip: {
              trigger: 'item',
              formatter: '{c} alumnos <br/> ({d}%)'
          },
          series: [
              {
                  name: '',
                  type: 'pie',
                  radius: ['50%', '70%'],
                  avoidLabelOverlap: false,
                  label: {
                      show: false,
                      position: 'center'
                  },
                  emphasis: {
                      label: {
                          show: true,
                          fontSize: '30',
                          fontWeight: 'bold'
                      }
                  },
                  labelLine: {
                      show: false
                  },
                  data: datos
              }
          ]
        };
        this.donuts.push (donut);
      } else {
        const datos = [
          // las respuestas correctas siempre en verde
          {value: miDonut[1].cont, name: 'Emparejamientos correctos', itemStyle: {color: 'green'}},
          {value: miDonut[2].cont, name: 'Otros emparejamientos incorrectos', itemStyle: {color: 'rgb(50,50,50)'}},
          {value: miDonut[3].cont, name: 'No contesta ' , itemStyle: {color: 'rgb(150,150,150)'}}
        ];
        const  donut = {
          title: {
            text: 'Respuesta correcta',
            subtext: miDonut[1].respuesta ,
            left: 'center'
          },
          tooltip: {
              trigger: 'item',
              formatter: '{c} alumnos <br/> ({d}%)'
          },
          series: [
              {
                  name: '',
                  type: 'pie',
                  radius: ['50%', '70%'],
                  avoidLabelOverlap: false,
                  label: {
                      show: false,
                      position: 'center'
                  },
                  emphasis: {
                      label: {
                          show: true,
                          fontSize: '30',
                          fontWeight: 'bold'
                      }
                  },
                  labelLine: {
                      show: false
                  },
                  data: datos
              }
          ]
        };
        this.donuts.push (donut);
      }
    });

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


  Volver() {
    this.analizar = false;
  }

  Cerrar() {
    this.comServer.DesconectarJuegoRapido();
    this.route.navigateByUrl('/home');
  }
}
