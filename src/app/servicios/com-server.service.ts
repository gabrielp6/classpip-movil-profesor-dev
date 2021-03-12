import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Alumno, AlumnoJuegoDeCompeticionFormulaUno, Profesor } from '../clases/index';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComServerService {
  profesorId: number;
 
  constructor(private servidor: Socket) { }
  Conectar(profesorId: number) {
    this.servidor.connect();
    this.servidor.emit ('conectarDash', profesorId);
  }
  Desconectar(profesorId: number) {
    this.servidor.emit('desconectarDash', profesorId);
    this.servidor.disconnect();
  }

  Emitir(mensaje: string, informacion: any) {
    this.servidor.emit(mensaje, { profesorId: this.profesorId, info: informacion});
  }

  EnviarNick(profesorId: number, nick: string) {
    // Como el alumno no se ha conectado por la via normal, no tenemos guardado el identificador
    // del profesor. Por eso lo tenemos que recibir como parámetro
    this.servidor.connect();
    this.profesorId = profesorId;
    console.log ('envio nick: ' + nick);
    console.log (this.servidor);
    // tslint:disable-next-line:object-literal-shorthand
    this.servidor.emit('nickNameJuegoRapido', { profesorId: this.profesorId, info: nick});
  }

  EnviarNickYRegistrar(profesorId: number, nick: string, clave: string) {
    // Como el alumno no se ha conectado por la via normal, no tenemos guardado el identificador
    // del profesor. Por eso lo tenemos que recibir como parámetro.
    // Ademas, hay que registrar al alumno para que reciba notificaciones en este juego rapido
    this.servidor.connect();
    this.profesorId = profesorId;
    // tslint:disable-next-line:object-literal-shorthand
    this.servidor.emit('nickNameJuegoRapidoYRegistro', { profesorId: this.profesorId, info: nick, c: clave});
  }


  DesconectarJuegoRapido() {
    this.servidor.disconnect();
  }

  DesconectarJuegoCogerTurnoRapido(clave: string) {
    this.servidor.emit('desconectarJuegoCogerTurno', clave);
    this.servidor.disconnect();
  }


  public EsperarNotificaciones(): any {
    return Observable.create((observer) => {
        this.servidor.on('notificacion', (mensaje) => {
            console.log ('llega notificacion: ' + mensaje);
            observer.next(mensaje);
        });
    });
  }

  public EsperoTurnosCogidos(): any  {
    return Observable.create((observer) => {
        this.servidor.on('turnoCogido', (turno) => {
            console.log ('han cogido un turno');
            console.log (turno);
            observer.next(turno);
        });
    });
  }

  public EsperoTurnosNuevos(): any  {
    return Observable.create((observer) => {
        this.servidor.on('turnoNuevo', (turno) => {
            observer.next(turno);
        });
    });
  }
  public RecordarContrasena(profesor: Profesor) {
    console.log ('dentro del servicio para recordar contraseña');
    // Me conecto momentaneamente para enviarle al alumno la contraseña que debe enviar por email
    this.servidor.connect();
    this.servidor.emit ('recordarPassword' , {email: profesor.email, nombre: profesor.NombreUsuario, contrasena: profesor.Password});
    // Me desconecto
    this.servidor.disconnect();
  }
  public EsperoRespuestasJuegoDeCuestionario (): any {
    return Observable.create((observer) => {
        this.servidor.on('respuestaJuegoDeCuestionario', (respuesta) => {
            console.log ('Respuesta cuestionaro ' + respuesta);
            observer.next(respuesta);
        });
    });
  }

  
  public EsperoNickNames(): any  {
    console.log ('Espero nicknames');
    return Observable.create((observer) => {
        this.servidor.on('nickNameJuegoRapido', (nick) => {
            console.log ('recibo nick: ' + nick);
            observer.next(nick);
        });
    });
  }

  public EsperoRespuestasEncuestaRapida(): any  {
    return Observable.create((observer) => {
        this.servidor.on('respuestaEncuestaRapida', (respuesta) => {
            console.log ('respuesta en comserver');
            console.log (respuesta);
            observer.next(respuesta);
        });
    });
  }

  public EsperoTurnos(): any  {
    return Observable.create((observer) => {
        this.servidor.on('turnoElegido', (info) => {
            console.log ('ya tengo respuesta');
            console.log (info);
            observer.next(info);
        });
    });
  }

  public NotificarTurnoCogido(claveJuego: string, turnoElegido: any) {
    this.servidor.emit ('notificacionTurnoCogido' , {clave: claveJuego, turno: turnoElegido});

  }

  
  public NotificarTurnoNuevo(claveJuego: string, turnoNuevo: any) {
    this.servidor.emit ('notificacionTurnoNuevo' , {clave: claveJuego, turno: turnoNuevo});

  }

  
  public EsperoRespuestasVotacionRapida(): any  {
    return Observable.create((observer) => {
        this.servidor.on('respuestaVotacionRapida', (respuesta) => {
            console.log ('ya tengo votacion');
            console.log (respuesta);
            observer.next(respuesta);
        });
    });
  }

  public EsperoRespuestasCuestionarioRapido(): any  {
    return Observable.create((observer) => {
        this.servidor.on('respuestaCuestionarioRapido', (respuesta) => {
            console.log ('ya tengo respuesta');
            console.log (respuesta);
            observer.next(respuesta);
        });
    });
  }

  public EsperoVotacion(): any {
    return Observable.create((observer) => {
        this.servidor.on('notificarVotacion', (votacion) => {
            console.log ('llega notificacion');
            observer.next(votacion);
        });
    });
  }

  public EsperoVotaciones(): any  {
    return Observable.create((observer) => {
        this.servidor.on('notificarVotaciones', (votacion) => {
            console.log ('llega notificacion');
            observer.next(votacion);
        });
    });
  }
  public Espero(): any  {
    return Observable.create((observer) => {
        this.servidor.on('confirmacionPreparadoParaKahoot', (nick) => {
          console.log ('recibo nick: ' + nick);
          observer.next(nick);
        });
    });
  }

  public EsperoConfirmacionPreparadoKahoot(): any {
    return Observable.create((observer) => {
      this.servidor.on('confirmacionPreparadoParaKahoot', (nick) => {
          console.log ('recibo nick: ' + nick);
          observer.next(nick);
      });
    });
  }

  
  public NotificarLanzarSiguientePregunta(claveJuego: string, info: any) {
    this.servidor.emit ('lanzarSiguientePregunta' , {clave: claveJuego, opcionesDesordenadas: info});

  }

  public NotificarResultadoFinalKahoot(claveJuego: string, res: any) {
    this.servidor.emit ('resultadoFinalKahoot' , {clave: claveJuego, resultado: res});

  }
  public EsperoRespuestasCuestionarioKahootRapido(): any  {
    return Observable.create((observer) => {
        this.servidor.on('respuestaAlumnoKahootRapido', (respuesta) => {
            console.log ('recibo respuesta kahoot ');
            console.log (respuesta);
            observer.next(respuesta);
        });
    });
  }




}


