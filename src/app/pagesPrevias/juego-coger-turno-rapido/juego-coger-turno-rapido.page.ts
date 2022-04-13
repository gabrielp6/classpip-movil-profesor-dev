import { Component, OnInit , ViewChild} from '@angular/core';
import { PeticionesAPIService, SesionService } from '../../services/index';
import { CalculosService, ComServerService } from '../../services';
import { NavController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { IonSlides } from '@ionic/angular';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-juego-coger-turno-rapido',
  templateUrl: './juego-coger-turno-rapido.page.html',
  styleUrls: ['./juego-coger-turno-rapido.page.scss'],
})
export class JuegoCogerTurnoRapidoPage implements OnInit {

  juegoSeleccionado: any;
  nickName: string;
  listaOpciones: any [];

  participantes: any[];
  profesorId: number;
  numeroParticipantes: number;

  disablePrevBtn = true;
  disableNextBtn = false;



  @ViewChild(IonSlides, { static: false }) slides: IonSlides;

  constructor(
    public navCtrl: NavController,
    private sesion: SesionService,
    private peticionesAPI: PeticionesAPIService,
    private alertCtrl: AlertController,
    private comServer: ComServerService,
    private route: Router,
    private datePipe: DatePipe
  ) { }


  ngOnInit() {
    this.participantes = [];
    console.log ('tengo juego');
    this.profesorId = this.sesion.DameProfesor().id;
    this.juegoSeleccionado = this.sesion.DameJuego();
    // tslint:disable-next-line:only-arrow-functions
    this.juegoSeleccionado.Turnos = this.juegoSeleccionado.Turnos.sort(function(a, b) {

      if (a.dia < b.dia) {
          return -1;
      } else if (a.dia > b.dia) {
          return 1;
      } else if (a.hora < b.hora) {
          return -1;
      } else if ( a.hora > b.hora) {
          return 1;
      } else {
        return 0;
      }
    });

    console.log ('tengo juego');
    this.comServer.EsperoNickNames()
    .subscribe((nick) => {
        console.log ('se ha conectado ' + nick);
        this.participantes.push ({
          nickName: nick,
          contestado: false
        });
    });
    this.comServer.EsperoTurnos()
    .subscribe((info) => {
        if (info.turno.dia !== '*') {
          // tslint:disable-next-line:max-line-length
          this.juegoSeleccionado.Turnos.filter (turno => (turno.dia === info.turno.dia) && (turno.hora === info.turno.hora))[0].persona = info.nick;
          this.comServer.NotificarTurnoCogido (this.juegoSeleccionado.Clave, info.turno );
        } else {
          this.juegoSeleccionado.Turnos.push ( {
            dia: info.turno.dia,
            hora: info.turno.hora,
            persona: info.nick
          });
        }

        // tslint:disable-next-line:only-arrow-functions
        this.juegoSeleccionado.Turnos = this.juegoSeleccionado.Turnos.sort(function(a, b) {

          if (a.dia < b.dia) {
            return -1;
          } else if (a.dia > b.dia) {
            return 1;
          } else if (a.hora < b.hora) {
            return -1;
          } else if ( a.hora > b.hora) {
            return 1;
          } else {
            return 0;
          }
        });
        console.log ('turnos preparados');
        console.log (this.juegoSeleccionado.Turnos);

        this.participantes.filter (participante => participante.nickName === info.nick)[0].contestado = true;
        this.peticionesAPI.ModificarJuegoDeCogerTurnoRapido (this.juegoSeleccionado).subscribe();
    });

  }


  EliminarTurno(turnoEliminado) {
    const dia = this.datePipe.transform(turnoEliminado.dia, 'dd-MM-yyyy');
    this.alertCtrl.create({
      header: '¿Seguro que quieres eliminar este turno ya asignado?',
      // tslint:disable-next-line:max-line-length
      message: '<strong>dia:  </strong>' + dia + '<br><strong>hora: </strong> ' + turnoEliminado.hora + '<br><strong>persona: </strong> ' + turnoEliminado.persona,
      buttons: [
                {
                  text: 'OK',
                  handler: async () => {
                    // tslint:disable-next-line:max-line-length
                    this.juegoSeleccionado.Turnos = this.juegoSeleccionado.Turnos.filter (turno => (turno.dia !== turnoEliminado.dia) || (turno.hora !== turnoEliminado.hora || (turnoEliminado.dia === '*') && (turnoEliminado.persona !== turno.persona)));
                    // tslint:disable-next-line:only-arrow-functions
                    this.juegoSeleccionado.Turnos = this.juegoSeleccionado.Turnos.sort(function(a, b) {

                      if (a.dia < b.dia) {
                        return -1;
                      } else if (a.dia > b.dia) {
                        return 1;
                      } else if (a.hora < b.hora) {
                        return -1;
                      } else if ( a.hora > b.hora) {
                        return 1;
                      } else {
                        return 0;
                      }
                    });


                    // no es que se haya cogido. Se ha eliminado. Pero esto ya vale para que los clientes
                    // lo eliminen de sus listas.
                    this.comServer.NotificarTurnoCogido (this.juegoSeleccionado.Clave, turnoEliminado );
                    this.peticionesAPI.ModificarJuegoDeCogerTurnoRapido (this.juegoSeleccionado).subscribe();
                  }
                }, {
                text: 'Cancelar'
                }
              ]
    }).then (res => res.present());
  }


  AgregarTurno(nuevoTurno) {
    const turno = nuevoTurno.toString();
    const diaElegido = turno.split('T')[0];
    const horaElegida = turno.split('T')[1];
    const turnoNuevo = {
      dia: diaElegido,
      hora: horaElegida,
      persona: undefined
    };

    this.juegoSeleccionado.Turnos.push (turnoNuevo);
    this.peticionesAPI.ModificarJuegoDeCogerTurnoRapido (this.juegoSeleccionado).subscribe();


    // tslint:disable-next-line:only-arrow-functions
    this.juegoSeleccionado.Turnos = this.juegoSeleccionado.Turnos.sort(function(a, b) {

        if (a.dia < b.dia) {
          return -1;
        } else if (a.dia > b.dia) {
          return 1;
        } else if (a.hora < b.hora) {
          return -1;
        } else if ( a.hora > b.hora) {
          return 1;
        } else {
          return 0;
        }
    });

    this.comServer.NotificarTurnoNuevo (this.juegoSeleccionado.Clave, turnoNuevo );
    document.getElementById('inputDateTime').style.display = 'none';
  }
 

  MostrarInput() {
    document.getElementById('inputDateTime').style.display = 'block';
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
                    this.peticionesAPI.BorraJuegoDeCogerTurnoRapido (this.juegoSeleccionado.id)
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



}
