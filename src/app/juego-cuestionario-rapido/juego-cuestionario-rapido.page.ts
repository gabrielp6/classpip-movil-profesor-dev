import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { AlertController, IonSlides } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Pregunta } from '../clases';
import { Cuestionario } from '../clases/Cuestionario';
import { CalculosService, SesionService, PeticionesAPIService, ComServerService } from '../servicios';
import * as URL from '../URLs/urls';

@Component({
  selector: 'app-juego-cuestionario-rapido',
  templateUrl: './juego-cuestionario-rapido.page.html',
  styleUrls: ['./juego-cuestionario-rapido.page.scss'],
})
export class JuegoCuestionarioRapidoPage implements OnInit {

  disablePrevBtn = true;
  disableNextBtn = false;

  juegoSeleccionado: any;
  participantes: any[];
  respuestas: any[] = [];;
  cuestionario: Cuestionario;
  preguntas: Pregunta[];
  histogramaAciertos: number[] = [];
  preguntasCuestionario: any[];

  mostrarParticipantes = true;
  informacionPreparada = false;
  profesorId: number;
  numeroRespuestas = 0;
  numeroParticipantes = 0;
  clasificacion: any [];
  dataSource;
  displayedColumns: string[] = ['nick', 'nota'];
  categoriasEjeX;
  grafico;
  donuts: any[] = [];
  misDonuts: any[] = [];


  ///////////para kahoot ////////////

  
  mostrarCuentaAtras = false;
  interval;
  cuentaAtras: number;
  interval2;
  cuentaAtras2: number;
  mostrarSiguientePregunta = false;
  preguntaAMostrar: Pregunta;
  siguientePregunta = 0;
  mostrarBotonLanzarPregunta = true;
  imagenesPreguntas: any[];
  imagenPreguntaAMostrar: string;
  contadorRespuestasKahoot: number;
  subscripcion: Subscription;
  opcionesDesordenadas: any[];
  listaAlumnos: any [] = [];
  displayedColumnsKahoot: string[] = ['nick', 'incremento', 'puntos'];
  dataSourceKahoot;
  finKahoot = false;
  respuestasPreguntaActual: any[];
  donutsKahoot: any[] = [];
  muestraClasificacion = true;
  muestraRespuestas = false;
  slideActual = 0;
  ultimoSlide = false;

 

  @ViewChild(IonSlides, { static: false }) slides: IonSlides;
  
  constructor(
    private calculos: CalculosService,
    private sesion: SesionService,
    private peticionesAPI: PeticionesAPIService,
    public comServer: ComServerService,
    private alertCtrl: AlertController,
    private route: Router ) { }
  
  ngOnInit() {
    console.log ('estoy');

    this.participantes = [];
    this.respuestas = [];
    this.clasificacion = [];
    this.listaAlumnos = [];

    console.log ('tengo juego');
    this.profesorId = this.sesion.DameProfesor().id;
    this.juegoSeleccionado = this.sesion.DameJuego();
    this.PreparaInfo();


    this.comServer.EsperoNickNames()
    .subscribe((nick) => {
        this.numeroParticipantes++;
        console.log ('se ha conectado ' + nick);
        this.participantes.push ({
          nickName: nick,
          preparado: false,
          contestado: false
        });
    });
    if (this.juegoSeleccionado.Modalidad === 'Kahoot') {
      this.comServer.Espero()
      .subscribe((nick) => {
        console.log ('recibo confirmacion preparado' + nick);
        this.participantes.filter (participante => participante.nickName === nick)[0].preparado = true;
        this.listaAlumnos.push ( {
          nickName: nick,
          incremento: 0,
          puntos: 0,
          aciertos: 0 // esto es para el histograma
        });
      });
    }

    this.comServer.EsperoRespuestasCuestionarioRapido()
    .subscribe((respuesta) => {
        this.numeroRespuestas++;
    

        // Actualizo el histograma y los donuts


        let aciertos = 0;
        for (let i = 0; i < respuesta.respuestas.Preguntas.length; i++) {
          const pregunta = this.preguntas.filter (p => p.id === respuesta.respuestas.Preguntas[i])[0];
          // busco el donut correspondiente a esta pregunta
          const indexDonut = this.misDonuts.findIndex (elemento => elemento[0].preguntaId === pregunta.id);

          if (pregunta.Tipo === 'Emparejamiento') {
            // primero actualizamos el histograma
            if (respuesta.respuestas.Respuestas[i] !== undefined) {
              // miro si todos los emparejamientos están bien
              let n = 0;
              for (let j = 0; j < pregunta.Emparejamientos.length; j++) {
                if (pregunta.Emparejamientos[j].r === respuesta.respuestas.Respuestas[i][j]) {
                  n++;
                }
              }
              if (n === pregunta.Emparejamientos.length) {
                aciertos++;
                this.misDonuts[indexDonut][1].cont++; // respuesta correcta
              } else {
                this.misDonuts[indexDonut][2].cont++; // respuesta incorecta
              }
            } else {
              this.misDonuts[indexDonut][3].cont++; // respuesta en blanco
            }

          } else if (pregunta.Tipo === 'Cuatro opciones') {
            // actualizo histograma
            if (pregunta.RespuestaCorrecta === respuesta.respuestas.Respuestas[i][0]) {
              aciertos++;
            }
            // actualido en el donut el contador correspondiente a la opción elegida
            this.misDonuts[indexDonut].filter (entrada => entrada.respuesta === respuesta.respuestas.Respuestas[i][0])[0].cont++;
          } else {
            // la pregunta es de tipo "Verdadero o falso" o de tipo "Respuesta abierta"

            if (pregunta.RespuestaCorrecta === respuesta.respuestas.Respuestas[i][0]) {
              aciertos++;
              this.misDonuts[indexDonut][1].cont++;  // respuesta correcta
            } else if (respuesta.respuestas.Respuestas[i][0] === '-') {
                this.misDonuts[indexDonut][3].cont++;  // respuesta en blanco
              } else {
                this.misDonuts[indexDonut][2].cont++;  // respuesta mal
              }
          }
        }
        this.histogramaAciertos[aciertos]++;

        // Actualizo la clasificación

        this.clasificacion.push ({
          nick: respuesta.nick,
          nota: respuesta.respuestas.Nota,
          tiempo: respuesta.respuestas.Tiempo
        });

        // tslint:disable-next-line:only-arrow-functions
        this.clasificacion = this.clasificacion.sort(function(a, b) {
          if (b.nota !== a.nota) {
            return b.nota - a.nota;
          } else {
            // en caso de empate en la nota, gana el que empleó menos tiempo
            return a.tiempo - b.tiempo;
          }
        });

        this.participantes.filter (participante => participante.nickName === respuesta.nick)[0].contestado = true;
        // vuelvo a cargar los gráficos con las novedades
        this.PrepararGraficos();
    });
  }


  PreparaInfo() {
    this.peticionesAPI.DameCuestionario (this.juegoSeleccionado.cuestionarioId)
    .subscribe (cuestionario => {
      this.cuestionario = cuestionario;

      this.peticionesAPI.DamePreguntasCuestionario (this.cuestionario.id)
      .subscribe ( preguntas => {
        this.preguntas = preguntas;
        // preparo el histograma
        this.histogramaAciertos = Array(this.preguntas.length + 1).fill(0);
        this.imagenesPreguntas = [];
        // preparo los donuts
        // preparo un donut para cada pregunta
        this.preguntas.forEach (pregunta => {
          this.imagenesPreguntas.push(URL.ImagenesPregunta + pregunta.Imagen);
          console.log ('ya tengo imagenes');
          console.log (this.imagenesPreguntas);
          let miDonut: any;
          miDonut = [];
          // preparo los datos del donut
          // los datos están en un vector en el que la posición 0 tiene el id de la pregunta y su tipo
          // las posiciones siguientes contienen las posibles respuestas a la pregunta
          miDonut.push ( { preguntaId: pregunta.id, Tipo: pregunta.Tipo});
          if (pregunta.Tipo === 'Cuatro opciones') {
            // cuatro posibles respuestas
            miDonut.push ( { respuesta: pregunta.RespuestaCorrecta, cont: 0});
            miDonut.push ( { respuesta: pregunta.RespuestaIncorrecta1, cont: 0});
            miDonut.push ( { respuesta: pregunta.RespuestaIncorrecta2, cont: 0});
            miDonut.push ( { respuesta: pregunta.RespuestaIncorrecta3, cont: 0});
            // esto es para el caso de respuesta en blanco
            miDonut.push ( { respuesta: '-', cont: 0});

          } else if (pregunta.Tipo === 'Respuesta abierta') {
            // respuesta correcta, incorrecta o en blanco
            miDonut.push ( { respuesta: pregunta.RespuestaCorrecta, cont: 0});
            miDonut.push ( { respuesta: 'Otras respuestas', cont: 0});
            // esto es para el caso de respuesta en blando
            miDonut.push ( { respuesta: '-', cont: 0});
          } else if (pregunta.Tipo === 'Verdadero o falso') {
            // respuesta correcta, incorrecta o en blanco
            miDonut.push ( { respuesta: pregunta.RespuestaCorrecta, cont: 0});
            miDonut.push ( { respuesta: 'Mal', cont: 0});
            // esto es para el caso de respuesta en blando
            miDonut.push ( { respuesta: '-', cont: 0});
          } else {
               // respuesta correcta, incorrecta o en blanco
            miDonut.push ( { respuesta: 'Emparejamientos correctos', cont: 0});
            miDonut.push ( { respuesta: 'Otros emparejamientos incorrectos', cont: 0});
            // esto es para el caso de respuesta en blando
            miDonut.push ( { respuesta: '-', cont: 0});
          }

          this.misDonuts.push (miDonut);
        });
       
        // ahora recupero las respuestas que ya tiene el cuestionario 
        this.respuestas = this.juegoSeleccionado.Respuestas;
        this.numeroRespuestas = this.respuestas.length;
        this.numeroParticipantes = this.numeroRespuestas;

        if (this.numeroRespuestas !== 0) {
          // actualizo el histograma y los donuts con la información de las respuestas ya existentes
          this.PrepararHitogramaYDonutsIniciales();
          // cargo los gráficos con los datos del histograma y los donuts
          this.PrepararGraficos();
        }
      });
    });

  }
  


  Eliminar() {

    this.alertCtrl.create({
      header: '¿Seguro que quieres eliminar este juego rápido?',
      buttons: [
                {
                  text: 'SI',
                  handler: async () => {
                    this.peticionesAPI.BorraJuegoDeCuestionarioRapido (this.juegoSeleccionado.id)
                    .subscribe(res => {
                      this.route.navigateByUrl('mis-juegos-rapidos');
                    });
                  }
                }, {
                text: 'Cancelar'
                }
              ]
    }).then ((res) => res.present());

  }

  PrepararHitogramaYDonutsIniciales() {

    this.respuestas.forEach (respuesta => {
      // Para cada respuesta tengo que actualizar el histograma y los donuts de cada una de las preguntas
      // En cada respuesta tengo un vector con los id de las preguntas y otro con las respuestas a cada una de las preguntas
      let aciertos = 0;
      for (let i = 0; i < respuesta.respuestas.Preguntas.length; i++) {
        // primero obtengo la pregunta
        const pregunta = this.preguntas.filter (p => p.id === respuesta.respuestas.Preguntas[i])[0];
        // ahora el donut correspondiente a esa pregunta
        const donut = this.misDonuts.filter (elemento => elemento[0].preguntaId === pregunta.id)[0];

        if (pregunta.Tipo === 'Emparejamiento') {
          // Veo si la respuesta es acertada y actualizo histograma y donut en coherencia
          if (respuesta.respuestas.Respuestas[i] !== undefined) {
            let n = 0;
            for (let j = 0; j < pregunta.Emparejamientos.length; j++) {
              if (pregunta.Emparejamientos[j].r === respuesta.respuestas.Respuestas[i][j]) {
                n++;
              }
            }
            if (n === pregunta.Emparejamientos.length) {
              aciertos++;
              donut[1].cont++; // respuesta correcta
            } else {
              donut[2].cont++; // respuesta incorecta
            }
          } else {
            donut[3].cont++; // respuesta en blanco
          }

        } else if (pregunta.Tipo === 'Cuatro opciones') {
          // actualizo histograma
          if (pregunta.RespuestaCorrecta === respuesta.respuestas.Respuestas[i][0]) {
            aciertos++;
          }
          donut.filter (entrada => entrada.respuesta === respuesta.respuestas.Respuestas[i][0])[0].cont++;
        } else {
          if (pregunta.RespuestaCorrecta === respuesta.respuestas.Respuestas[i][0]) {
            aciertos++;
            donut[1].cont++;  // respuesta correcta
          } else if (respuesta.respuestas.Respuestas[i][0] === '-') {
              donut[3].cont++;  // respuesta en blanco
            } else {
              donut[2].cont++;  // respuesta mal
            }
        }
      }
      this.histogramaAciertos[aciertos]++;

      this.clasificacion.push ({
        nick: respuesta.nick,
        nota: respuesta.respuestas.Nota,
        tiempo: respuesta.respuestas.Tiempo
      });

      // tslint:disable-next-line:only-arrow-functions
      this.clasificacion = this.clasificacion.sort(function(a, b) {
        if (b.nota !== a.nota) {
          return b.nota - a.nota;
        } else {
          // en caso de empate en la nota, gana el que empleó menos tiempo
          return a.tiempo - b.tiempo;
        }
      });
    });

  }


  PrepararGraficos() {

    // Histograda de número de aciertos
    this.categoriasEjeX = [];
    for (let n = 0; n < this.histogramaAciertos.length ; n++) {
      this.categoriasEjeX.push (n.toString());
    }


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
          name: '# aciertos',
          data: this.categoriasEjeX,
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [{
        type: 'value',
        name: '# alumnos'
      }],
      series: [{
        type: 'bar',
        barWidth: '60%',
        data: this.histogramaAciertos,
      }]
    };

    // ahora los donuts
    this.donuts = [];

    // en cada grafico donut tengo que poner los contadores de cada una de las respuestas e indicarle el color
    this.misDonuts.forEach (miDonut => {
      if (miDonut[0].Tipo === 'Cuatro opciones') {
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
            // text: 'Respuesta correcta ',
            // subtext: miDonut[1].respuesta ,
            // subtextStyle: ' font-size: large;',
            // left: 'center'
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
      } else if (miDonut[0].Tipo === 'Respuesta abierta') {
        const datos = [
          // las respuestas correctas siempre en verde
          {value: miDonut[1].cont, name: miDonut[1].respuesta, itemStyle: {color: 'green'}},
          {value: miDonut[2].cont, name: 'Otras respuestas', itemStyle: {color: 'rgb(50,50,50)'}},
          {value: miDonut[3].cont, name: 'No contesta ' , itemStyle: {color: 'rgb(150,150,150)'}}
        ];
        const  donut = {
          title: {
            // text: 'Respuesta correcta ',
            // subtext: miDonut[1].respuesta ,
            // left: 'center'
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
      } else if (miDonut[0].Tipo === 'Verdadero o falso') {
        const datos = [
          // las respuestas correctas siempre en verde
          {value: miDonut[1].cont, name: miDonut[1].respuesta, itemStyle: {color: 'green'}},
          {value: miDonut[2].cont, name: 'Mal', itemStyle: {color: 'rgb(50,50,50)'}},
          {value: miDonut[3].cont, name: 'No contesta ' , itemStyle: {color: 'rgb(150,150,150)'}}
        ];
        const  donut = {
          title: {
            // text: 'Respuesta correcta ',
            // subtext: miDonut[1].respuesta ,
            // left: 'center'
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
            // text: 'Respuesta correcta ',
            // subtext: miDonut[1].respuesta ,
            // left: 'center'
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
    this.slides.getActiveIndex ().then (index => {
      this.slideActual = index;
    });

    this.slides.isEnd().then((istrue) => {
      this.ultimoSlide = istrue;
    });

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

  
LanzarPregunta() {

  this.mostrarBotonLanzarPregunta = false;
  this.mostrarCuentaAtras = true;
  this.cuentaAtras = 3;
  this.preguntaAMostrar = this.preguntas [this.siguientePregunta];
  this.imagenPreguntaAMostrar = this.imagenesPreguntas[this.siguientePregunta];
  this.opcionesDesordenadas = [];
  // El el caso de 'Cuatro opciones' o 'Emparejamiento' desordeno las opciones y se las envio a todos
  // los alumnos. En el resto de casos la info es irrelevante
  if (this.preguntaAMostrar.Tipo === 'Cuatro opciones') {
    this.opcionesDesordenadas.push (this.preguntaAMostrar.RespuestaCorrecta);
    this.opcionesDesordenadas.push (this.preguntaAMostrar.RespuestaIncorrecta1);
    this.opcionesDesordenadas.push (this.preguntaAMostrar.RespuestaIncorrecta2);
    this.opcionesDesordenadas.push (this.preguntaAMostrar.RespuestaIncorrecta3);
    this.DesordenarVector (this.opcionesDesordenadas);
  } else if (this.preguntaAMostrar.Tipo === 'Emparejamiento') {
    this.preguntaAMostrar.Emparejamientos.forEach (pareja => {
      this.opcionesDesordenadas.push (pareja.r);
    });
    this.DesordenarVector (this.opcionesDesordenadas);
  }


  this.comServer.NotificarLanzarSiguientePregunta (this.juegoSeleccionado.Clave, this.opcionesDesordenadas);
  this.interval = setInterval(() => {
    this.cuentaAtras--;
    if (this.cuentaAtras === 0) {
      clearInterval(this.interval);


      this.mostrarSiguientePregunta = true;
      this.mostrarCuentaAtras = false;
      this.contadorRespuestasKahoot = 0;
      this.respuestasPreguntaActual = [];
      this.listaAlumnos.forEach (alumno => alumno.incremento = 0);
      this.subscripcion = this.comServer.EsperoRespuestasCuestionarioKahootRapido ()
      .subscribe( respuesta => {
           // La respuesta es undefined si respondió en blanco. En caso contrario la estructura es la siguiente siguiente:
        //    nick
        //    puntosObtenidos
        //    respuesta (Es un vector que contiene en la primera posición la respuesta en el caso de "Cuatro opciones", "Verdadero o
        //    falso" o "Respuesta abierta". En el caso de "Emparejamientos" contiene las partes derecha de las parejas. Está undefined
        //    su el participante la dejó sin contestar).
        //

        this.respuestasPreguntaActual.push (respuesta);
        const alumno = this.listaAlumnos.find (a => a.nickName === respuesta.nick);
        if (respuesta !== undefined) {
          alumno.incremento = respuesta.puntosObtenidos;
          alumno.puntos = alumno.puntos + respuesta.puntosObtenidos;
        }
        this.contadorRespuestasKahoot++;

      });
      this.cuentaAtras2 = this.juegoSeleccionado.TiempoLimite;
      this.interval2 = setInterval(() => {
        this.cuentaAtras2--;
        if (this.cuentaAtras2 === 0) {
            clearInterval(this.interval2);
            this.subscripcion.unsubscribe();
            this.listaAlumnos = this.listaAlumnos.sort(function(a, b) {
              return b.puntos - a.puntos;
            });
     
            // se acabo el tiempo
            // voy a ver cuántos no han respondido
            const sinRespuesta = this.listaAlumnos.length - this.contadorRespuestasKahoot;
            // ahora introduzco tantas respuestas en blanco como gente sin responder
            for (let i = 0; i < sinRespuesta; i++) {
              this.respuestasPreguntaActual.push (undefined);
            }

            this.MostrarDonut (this.preguntaAMostrar, this.respuestasPreguntaActual );
            this.respuestas.push (this.respuestasPreguntaActual);
            this.mostrarSiguientePregunta = false;
            this.mostrarBotonLanzarPregunta = true;
            this.siguientePregunta++;
            if (this.siguientePregunta === this.preguntas.length) {
              this.alertCtrl.create({
                header: 'Ya no hay más preguntas',
                buttons: ['OK']
              }).then (res => res.present());
              this.finKahoot = true;
              this.comServer.NotificarResultadoFinalKahoot (this.juegoSeleccionado.Clave, this.listaAlumnos);
              this.PrepararHistogramaKahoot ();
            }

        }
      }, 1000);
    }
  }, 1000);
}

DesordenarVector(vector: any[]) {
  // genera una permutación aleatoria de los elementos del vector

  let currentIndex = vector.length;
  let temporaryValue;
  let randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = vector[currentIndex];
    vector[currentIndex] = vector[randomIndex];
    vector[randomIndex] = temporaryValue;
  }
  console.log ('he terminado');
}

MostrarDonut (pregunta: Pregunta,  respuestas: any[]) {

  const miDonut = this.misDonuts.find (elemento => elemento[0].preguntaId === pregunta.id);

  if (pregunta.Tipo === 'Emparejamiento') {
    respuestas.forEach (r => {
      if (r === undefined || r.respuesta === undefined) {
        // respuesta en blanco
        miDonut[3].cont++; 
      } else if (r.puntosObtenidos > 0) {
        // acierto
        miDonut[1].cont++; // respuesta correcta
      } else {
        // fallo
        miDonut[2].cont++; // fallo
      }
    });
  } else if (pregunta.Tipo === 'Cuatro opciones') {
    respuestas.forEach (r => {
      if (r === undefined) {
        miDonut[5].cont++; // respuesta en blanco
      } else {miDonut.filter (entrada => entrada.respuesta === r.respuesta[0])[0].cont++;
       }
    });
  } else {
    respuestas.forEach (r => {
      if (r === undefined) {
        miDonut[3].cont++;  // respuesta en blanco
      } else if (pregunta.RespuestaCorrecta === r.respuesta[0]) {
        miDonut[1].cont++;  // respuesta correcta
      } else if (r.respuesta[0] === '-') {
        miDonut[3].cont++;  // respuesta en blanco
      } else {
        miDonut[2].cont++;  // respuesta mal
      }
    });
  }
  // Ahora preparamos el grafico
  // ahora los donuts

  if (miDonut[0].Tipo === 'Cuatro opciones') {
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
          // text: 'Respuesta correcta',
          // subtext: miDonut[1].respuesta ,
          // left: 'center'
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
    } else if (miDonut[0].Tipo === 'Respuesta abierta') {
      const datos = [
        // las respuestas correctas siempre en verde
        {value: miDonut[1].cont, name: miDonut[1].respuesta, itemStyle: {color: 'green'}},
        {value: miDonut[2].cont, name: 'Otras respuestas', itemStyle: {color: 'rgb(50,50,50)'}},
        {value: miDonut[3].cont, name: 'No contesta ' , itemStyle: {color: 'rgb(150,150,150)'}}
      ];
      const  donut = {
        title: {
          // text: 'Respuesta correcta',
          // subtext: miDonut[1].respuesta ,
          // left: 'center'
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
    } else if (miDonut[0].Tipo === 'Verdadero o falso') {
      const datos = [
        // las respuestas correctas siempre en verde
        {value: miDonut[1].cont, name: miDonut[1].respuesta, itemStyle: {color: 'green'}},
        {value: miDonut[2].cont, name: 'Mal', itemStyle: {color: 'rgb(50,50,50)'}},
        {value: miDonut[3].cont, name: 'No contesta ' , itemStyle: {color: 'rgb(150,150,150)'}}
      ];
      const  donut = {
        title: {
          // text: 'Respuesta correcta',
          // subtext: 'Respuesta correcta: ' + miDonut[1].respuesta ,
          // left: 'center'
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
          // text: 'Respuesta correcta',
          // subtext: miDonut[1].respuesta ,
          // left: 'center'
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
}

PrepararHistogramaKahoot () {
    console.log ('voy a preparar histograma');
    console.log (this.respuestas);

    for (let i = 0; i < this.preguntas.length; i++) {
      const pregunta = this.preguntas[i];
      const respuestasPregunta = this.respuestas [i];
      if (pregunta.Tipo === 'Emparejamiento') {
        // Recorro todas las respuestas a esa pregunta y computo el posible acierto al
        // nick correspondiente
        respuestasPregunta.forEach (r => {
          if (r !== undefined && r.respuesta !== undefined) {
            let n = 0;
            for (let j = 0; j < pregunta.Emparejamientos.length; j++) {
              if (pregunta.Emparejamientos[j].r === r.respuesta[j]) {
                n++;
              }
            }
            if (n === pregunta.Emparejamientos.length) {
              this.listaAlumnos.find (alumno => alumno.nickName === r.nick).aciertos++;
            }
          }
        });

      } else {
        // Para cualquier otro tipo de pregunta
        respuestasPregunta.forEach (r => {
          if (r !== undefined && pregunta.RespuestaCorrecta === r.respuesta[0]) {
            this.listaAlumnos.find (alumno => alumno.nickName === r.nick).aciertos++;
          }
        });
      }
    }
    this.histogramaAciertos = Array(this.preguntas.length + 1).fill (0);

    this.listaAlumnos.forEach (alumno => {
      this.histogramaAciertos[alumno.aciertos]++;
    });
    // Histograda de número de aciertos
    this.categoriasEjeX = [];
    for (let n = 0; n < this.histogramaAciertos.length ; n++) {
      this.categoriasEjeX.push (n.toString());
    }


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
          name: '# aciertos',
          data: this.categoriasEjeX,
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [{
        type: 'value',
        name: '# alumnos'
      }],
      series: [{
        type: 'bar',
        barWidth: '60%',
        data: this.histogramaAciertos,
      }]
    };




}
Cerrar() {
  this.route.navigateByUrl('/inici');
}

}
