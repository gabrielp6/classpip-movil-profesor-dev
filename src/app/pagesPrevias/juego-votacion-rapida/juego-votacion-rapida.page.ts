import { Component, OnInit , ViewChild} from '@angular/core';
import { PeticionesAPIService, SesionService } from '../../services/index';
import { CalculosService, ComServerService } from '../../services';
import { NavController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'app-juego-votacion-rapida',
  templateUrl: './juego-votacion-rapida.page.html',
  styleUrls: ['./juego-votacion-rapida.page.scss'],
})
export class JuegoVotacionRapidaPage implements OnInit {
  disablePrevBtn = true;
  disableNextBtn = false;

  juegoSeleccionado: any;
  participantes: any[];
  respuestas: any[];

  mostrarParticipantes = true;
  puntos: number[];
  numeroRespuestas = 0;
  numeroParticipantes = 0;
  informacionPreparada = false;
  datos: any[];
  dataSource;
  displayedColumns: string[] = ['concepto', 'puntos'];
  profesorId: number;
  sonido = true;
  ficheroGenerado = false;

  
  @ViewChild(IonSlides, { static: false }) slides: IonSlides;

  constructor(
    public navCtrl: NavController,
    private sesion: SesionService,
    private peticionesAPI: PeticionesAPIService,
    private alertCtrl: AlertController,
    private comServer: ComServerService,
    private route: Router,
  ) { }

  

  ngOnInit() {
  
    this.participantes = [];
    this.profesorId = this.sesion.DameProfesor().id;
    this.juegoSeleccionado = this.sesion.DameJuego();
    this.puntos = Array (this.juegoSeleccionado.Conceptos.length).fill (0);
    this.respuestas = this.juegoSeleccionado.Respuestas;
    if (this.respuestas === undefined) {
      this.respuestas = [];
      this.datos = [];
      this.numeroParticipantes = 0;
      this.numeroRespuestas = 0;
    } else {
      this.numeroParticipantes = this.respuestas.length;
      this.numeroRespuestas = this.respuestas.length;
    }
    this.PrepararTabla();

    console.log ('tengo juego');
    this.comServer.EsperoNickNames()
    .subscribe((nick) => {
        this.numeroParticipantes++;
        console.log ('se ha conectado ' + nick);
        this.participantes.push ({
          nickName: nick,
          contestado: false
        });
    });


    this.comServer.EsperoRespuestasVotacionRapida()
    .subscribe((respuesta) => {
        this.respuestas.push (respuesta);
        this.numeroRespuestas++;
        // tslint:disable-next-line:no-shadowed-variable
        let i;
        for (i = 0; i < respuesta.votos.length; i++) {
          const index = this.datos.findIndex (entrada => entrada.concepto === respuesta.votos[i].c );
          this.datos [index].puntos =  this.datos [index].puntos + respuesta.votos[i].puntos;
        }
        this.datos.sort((a, b) => b.puntos - a.puntos);

        this.participantes.filter (participante => participante.nickName === respuesta.nick)[0].contestado = true;
    });
  }
  
  PrepararTabla() {
    // preparamos la tabla para guardar los votos
    this.datos = [];
    let i;
    for (i = 0; i < this.juegoSeleccionado.Conceptos.length; i++) {
      this.datos.push ({
        concepto:  this.juegoSeleccionado.Conceptos[i],
        puntos: 0
      });
    }
    this.respuestas.forEach (respuesta => {
      for (i = 0; i < respuesta.votos.length; i++) {
        const index = this.datos.findIndex (entrada => entrada.concepto === respuesta.votos[i].c );
        this.datos [index].puntos =  this.datos [index].puntos + respuesta.votos[i].puntos ;
      }
    });
    this.datos.sort((a, b) => b.puntos - a.puntos);

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

  Eliminar() {

    this.alertCtrl.create({
      header: '¿Seguro que quieres eliminar este juego rápido?',
      buttons: [
                {
                  text: 'SI',
                  handler: async () => {
                    this.peticionesAPI.BorraJuegoDeVotacionRapida (this.juegoSeleccionado.id)
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



//    // Esta función se ejecuta cuando movemos a los conceptos de sitio
//    reorderItems(event) {
//     const itemMove = this.juegoSeleccionado.Conceptos.splice(event.detail.from, 1)[0];
//     this.juegoSeleccionado.Conceptos.splice(event.detail.to, 0, itemMove);
//     event.detail.complete();
//  }

//  Incrementar(i) {
//   if (this.puntosARepartir > 0) {
//     this.conceptosConPuntos[i].puntos++;
//     this.puntosARepartir--;
//   }
// }
// Decrementar(i) {
//   if ( this.conceptosConPuntos[i].puntos > 0) {
//     this.conceptosConPuntos[i].puntos--;
//     this.puntosARepartir++;
//   }
// }

 
//  async EnviarVotacion() {
//   console.log ('voy a enviar la votacion');
//   this.misVotos = [];
//   if (this.juegoSeleccionado.ModoReparto !== 'Reparto libre') {
//     for (let i = 0; i < this.juegoSeleccionado.Puntos.length; i++) {
//       this.misVotos.push ({
//         c: this.juegoSeleccionado.Conceptos[i],
//         puntos: this.juegoSeleccionado.Puntos[i]
//       });
//     }
//   } else {
//     this.misVotos = this.conceptosConPuntos;
//   }

//   this.comServer.Emitir ('respuestaVotacionRapida',
//     { nick: this.nickName,
//       votos: this.misVotos
//     }
//   );
//   const confirm = await this.alertCtrl.create({
//     header: 'Votacion enviada con éxito',
//     message: 'Gracias por participar',
//     buttons: [
//         {
//         text: 'OK',
//         role: 'cancel',
//         handler: () => {
//         }
//       }
//     ]
//   });
//   await confirm.present();
//   // tslint:disable-next-line:only-arrow-functions
//   this.misVotos = this.misVotos.sort(function(a, b) {
//     return b.puntos - a.puntos;
//   });
//   this.haVotado = true;

//   // Ahora voy a guardar la votación en el juego para que no se pierde si el dash no
//   // está ahora esperando votaciones.
//   // Pero primero tengo que traer de nuevo el juego por si ha habido otras votaciones 
//   // desde que lo traje al inicio
//   this.peticionesAPI.DameJuegoDeVotacionRapida (this.juegoSeleccionado.Clave)
//   .subscribe (juego => {
//     juego[0].Respuestas.push (
//       { nick: this.nickName,
//       votos: this.misVotos
//     });
//     this.peticionesAPI.ModificarJuegoVotacionRapida (juego[0]).subscribe();
//   });
// }

// Cerrar() {
//   this.comServer.DesconectarJuegoRapido();
//   this.route.navigateByUrl('/home');
// }


}
