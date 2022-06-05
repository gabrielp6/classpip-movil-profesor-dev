import { Injectable } from '@angular/core';
import { SesionService, PeticionesAPIService } from './index';
import { HttpClient } from '@angular/common/http';
import { Http, ResponseContentType } from '@angular/http';
// tslint:disable-next-line:max-line-length
import {
  // tslint:disable-next-line:max-line-length
  Grupo, Equipo, Juego, Alumno, Nivel, TablaAlumnoJuegoDePuntos, TablaHistorialPuntosAlumno, AlumnoJuegoDePuntos, TablaEquipoJuegoDePuntos, HistorialPuntosAlumno,
  HistorialPuntosEquipo, EquipoJuegoDePuntos, TablaHistorialPuntosEquipo, AlumnoJuegoDeColeccion, AlumnoJuegoDeCompeticionLiga, Album,
  EquipoJuegoDeColeccion, AlbumEquipo, Cromo, Jornada, MiAlumnoAMostrarJuegoDePuntos, MiEquipoAMostrarJuegoDePuntos,
  // tslint:disable-next-line:max-line-length
  EnfrentamientoLiga, TablaAlumnoJuegoDeCompeticion, EquipoJuegoDeCompeticionLiga, InformacionPartidosLiga, TablaJornadas, TablaEquipoJuegoDeCompeticion, AlumnoJuegoDeCompeticionFormulaUno,
  EquipoJuegoDeCompeticionFormulaUno, TablaClasificacionJornada, AlumnoJuegoDeGeocaching, Escenario, MiAlumnoAMostrarJuegoDeGeocaching, PuntoGeolocalizable, Pregunta, TablaAlumnoJuegoDeCuestionario, SesionClase, AlumnoJuegoDeVotacionUnoATodos, TablaAlumnoJuegoDeVotacionUnoATodos, AlumnoJuegoDeVotacionTodosAUno, JuegoDeVotacionTodosAUno, TablaAlumnoJuegoDeVotacionTodosAUno
} from '../clases/index';
// import { MatTableDataSource } from '@angular/material/table';
// import { MiAlumnoAMostrarJuegoDePuntos } from '../clases/MiAlumnoAMostrarJuegoDePuntos';
import { Observable, observable } from 'rxjs';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { stringify } from 'querystring';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { MiAlumnoAMostrarJuegoDeCuestionario } from '../clases/MiAlumnoAMostrarJuegoDeCuestionario';
import { AlumnoJuegoDeCuestionario } from '../clases/AlumnoJuegoDeCuestionario';
import * as URL from '../URLs/urls';

@Injectable({
  providedIn: 'root'
})
export class CalculosService {

  juegosDePuntosActivos: Juego[] = [];
  juegosDePuntosInactivos: Juego[] = [];
  juegosDeColeccionActivos: Juego[] = [];
  juegosDeColeccionInactivos: Juego[] = [];
  juegosDeCompeticionActivos: Juego[] = [];
  juegosDeCompeticionInactivos: Juego[] = [];
  todosLosJuegosActivos: Juego[] = [];
  todosLosJuegosInactivos: Juego[] = [];
  ListaJuegosSeleccionadoActivo: Juego[];
  ListaJuegosSeleccionadoInactivo: Juego[];
  informacionPartidos: InformacionPartidosLiga[];
  equipos: Equipo[] = [];
  puntos: number;
  MiImagenCromo: string;
  constructor(
    private sesion: SesionService,
    private peticionesAPI: PeticionesAPIService,
    public https: Http
  ) {
  }


  // ESTA FUNCIÓN BORRARÁ EL GRUPO DE ID QUE PASEMOS DEL PROFESOR CON ID QUE PASEMOS Y VOLVERÁ A LA PÁGINA DE LISTAR
  // ACTUALIZANDO LA TABLA
  public EliminarGrupo() {

    this.peticionesAPI.BorraGrupo(
      this.sesion.DameProfesor().id,
      this.sesion.DameGrupo().id)
      .subscribe(() => {

        this.EliminarMatriculas();

        // Ahora elimino el grupo de la lista de grupos para que desaparezca de la pantalla al regresar
        let lista = this.sesion.DameListaGrupos();
        lista = lista.filter(g => g.id !== this.sesion.DameGrupo().id);
        this.sesion.TomaListaGrupos(lista);
      });
  }

  // ESTA FUNCIÓN RECUPERA TODAS LAS MATRICULAS DEL GRUPO QUE VAMOS A BORRAR Y DESPUÉS LAS BORRA. ESTO LO HACEMOS PARA NO
  // DEJAR MATRICULAS QUE NO NOS SIRVEN EN LA BASE DE DATOS
  private EliminarMatriculas() {

    // Pido las matrículas correspondientes al grupo que voy a borrar
    this.peticionesAPI.DameMatriculasGrupo(this.sesion.DameGrupo().id)
      .subscribe(matriculas => {
        if (matriculas[0] !== undefined) {

          // Una vez recibo las matriculas del grupo, las voy borrando una a una
          // tslint:disable-next-line:prefer-for-of
          for (let i = 0; i < matriculas.length; i++) {
            this.peticionesAPI.BorraMatricula(matriculas[i].id)
              .subscribe(() => {
                console.log('matricula borrada correctamente');
              });
          }
        } else {
          console.log('no hay matriculas');
        }

      });
  }

  public DameJuegosAlumno(AlumnoId: number): any {
    const Observables = new Observable(obs => {
      const JuegosActivos: any[] = [];
      const JuegosInactivos: any[] = [];
      this.peticionesAPI.DameJuegoDePuntosAlumno(AlumnoId)
      .subscribe( lista => {
          for (let i = 0; i < (lista.length); i++) {
            if (lista[i].JuegoActivo === true) {
              JuegosActivos.push(lista[i]);
            } else {
              JuegosInactivos.push(lista[i]);
            }
          }
          this.peticionesAPI.DameJuegoDeColeccionesAlumno(AlumnoId)
          // tslint:disable-next-line:no-shadowed-variable
          .subscribe( lista => {
              for (let i = 0; i < (lista.length); i++) {
                if (lista[i].JuegoActivo === true) {
                  JuegosActivos.push(lista[i]);
                } else {
                  JuegosInactivos.push(lista[i]);
                }
              }
              this.peticionesAPI.DameJuegoDeGeocachingAlumno(AlumnoId)

              // tslint:disable-next-line:no-shadowed-variable
              .subscribe( lista => {
                for (let i = 0; i < (lista.length); i++) {
                    if (lista[i].JuegoActivo === true) {
                      lista[i].Tipo = 'Juego De Geocaching';
                      JuegosActivos.push(lista[i]);
                    } else if (lista[i].JuegoTerminado === true) {
                      lista[i].Tipo = 'Juego De Geocaching';
                      JuegosInactivos.push(lista[i]);
                    }
                  }
                this.peticionesAPI.DameJuegoDeCompeticionF1Alumno(AlumnoId)
                // tslint:disable-next-line:no-shadowed-variable
                .subscribe( lista => {
                  for (let i = 0; i < (lista.length); i++) {
                    if (lista[i].JuegoActivo === true) {
                      JuegosActivos.push(lista[i]);
                    } else {
                      JuegosInactivos.push(lista[i]);
                    }
                  }
                  this.peticionesAPI.DameJuegoDeCompeticionLigaAlumno(AlumnoId)
                  // tslint:disable-next-line:no-shadowed-variable
                  .subscribe( lista => {
                      for (let i = 0; i < (lista.length); i++) {
                        if (lista[i].JuegoActivo === true) {
                          JuegosActivos.push(lista[i]);
                        } else {
                          JuegosInactivos.push(lista[i]);
                        }
                      }

                      this.peticionesAPI.DameJuegoDeCuestionarioAlumno(AlumnoId)
                      // tslint:disable-next-line:no-shadowed-variable
                      .subscribe( lista => {
                          for (let i = 0; i < (lista.length); i++) {
                            if (lista[i].JuegoActivo === true) {
                              // Esto lo hago porque la lista que viene de la API es de objetos de tipo JuegoDeCuestionario
                              // que no tienen el campo tipo de juego. Tengo que añadirselo yo.
                              lista[i].Tipo = 'Juego De Cuestionario';
                              JuegosActivos.push(lista[i]);
                            } else if (lista[i].JuegoTerminado === true) {
                              lista[i].Tipo = 'Juego De Cuestionario';
                              JuegosInactivos.push(lista[i]);
                            }
                          }

                          this.peticionesAPI.DameJuegoDeAvatarAlumno(AlumnoId)
                          // tslint:disable-next-line:no-shadowed-variable
                          .subscribe( lista => {
                              for (let i = 0; i < (lista.length); i++) {
                                if (lista[i].JuegoActivo === true) {
                                  JuegosActivos.push(lista[i]);
                                } else {
                                  JuegosInactivos.push(lista[i]);
                                }
                              }
                              this.peticionesAPI.DameJuegosDeVotacionUnoATodosAlumno(AlumnoId)
                              // tslint:disable-next-line:no-shadowed-variable
                              .subscribe( lista => {
                                  for (let i = 0; i < (lista.length); i++) {
                                    if (lista[i].JuegoActivo === true) {
                                      JuegosActivos.push(lista[i]);
                                    } else {
                                      JuegosInactivos.push(lista[i]);
                                    }
                                  }
                                  this.peticionesAPI.DameJuegosDeVotacionTodosAUnoAlumno(AlumnoId)
                                  // tslint:disable-next-line:no-shadowed-variable
                                  .subscribe( lista => {
                                      for (let i = 0; i < (lista.length); i++) {
                                        if (lista[i].JuegoActivo === true) {
                                          JuegosActivos.push(lista[i]);
                                        } else {
                                          JuegosInactivos.push(lista[i]);
                                        }
                                      }
                                      this.peticionesAPI.DameJuegosDeCuestiinarioSatisfaccionAlumno(AlumnoId)
                                      // tslint:disable-next-line:no-shadowed-variable
                                      .subscribe( lista => {
                                          for (let i = 0; i < (lista.length); i++) {
                                            if (lista[i].JuegoActivo === true) {
                                              JuegosActivos.push(lista[i]);
                                            } else {
                                              JuegosInactivos.push(lista[i]);
                                            }
                                          }

                                          this.peticionesAPI.DameEquiposDelAlumno(AlumnoId)
                                          // tslint:disable-next-line:no-shadowed-variable
                                          .subscribe( lista => {
                                          this.equipos = lista;
                                          if (this.equipos.length === 0) {
                                            // No hay equipos. Ya puedo retornar las listas de juegos
                                            const MisObservables = { activos: JuegosActivos, inactivos: JuegosInactivos };
                                            obs.next(MisObservables);
                                          } else {
                                            let cont = 0;
                                            for (let i = 0; i < (this.equipos.length); i++) {
                                              this.peticionesAPI.DameJuegoDePuntosEquipo(this.equipos[i].id)
                                              // tslint:disable-next-line:no-shadowed-variable
                                              .subscribe( lista => {
                                                  for (let j = 0; j < (lista.length); j++) {
                                                    if (lista[j].JuegoActivo === true) {
                                                      JuegosActivos.push(lista[j]);
                                                    } else {
                                                      JuegosInactivos.push(lista[j]);
                                                    }
                                                  }
                                                  this.peticionesAPI.DameJuegoDeColeccionEquipo(this.equipos[i].id)
                                                  // tslint:disable-next-line:no-shadowed-variable
                                                  .subscribe( lista => {
                                                      for (let j = 0; j < (lista.length); j++) {
                                                        if (lista[j].JuegoActivo === true) {
                                                          JuegosActivos.push(lista[j]);
                                                        } else {
                                                          JuegosInactivos.push(lista[j]);
                                                        }
                                                      }
                                                      this.peticionesAPI.DameJuegoDeCompeticionF1Equipo(this.equipos[i].id)
                                                      // tslint:disable-next-line:no-shadowed-variable
                                                      .subscribe( lista => {
                                                          for (let j = 0; j < (lista.length); j++) {
                                                            if (lista[j].JuegoActivo === true) {
                                                              JuegosActivos.push(lista[j]);
                                                            } else {
                                                              JuegosInactivos.push(lista[j]);
                                                            }
                                                          }
                                                          this.peticionesAPI.DameJuegoDeCompeticionLigaEquipo(this.equipos[i].id)
                                                          // tslint:disable-next-line:no-shadowed-variable
                                                          .subscribe( lista => {
                                                              for (let j = 0; j < (lista.length); j++) {
                                                                if (lista[j].JuegoActivo === true) {
                                                                  JuegosActivos.push(lista[j]);
                                                                } else {
                                                                  JuegosInactivos.push(lista[j]);
                                                                }
                                                            }


                                                        // vemos si hemos acabado de recogar los juegos de todos los equipos
                                                              cont = cont + 1;
                                                              if (cont === this.equipos.length) {
                                                              const MisObservables = { activos: JuegosActivos, inactivos: JuegosInactivos };
                                                              obs.next(MisObservables);
                                                        }

                                                }); // juegos de liga del equipo
                                            }); // juegos de F1 del equipo
                                          }); // juegos de coleccion del equipo
                                      }); // juegos de puntos del equipo
                                   } // fin bucle for equipos
                                  } // else de la pregunta de si hay equipos
                                }); // equipos del alumno
                              }); // juegos de cuestionario de satisfaccion
                            }); // juegos de votacion todos a uno
                            }); // juegos de votacion uno a todos
                          });  // juegos de avatar
                      }); // juegos de cuestionario

                  }); // juegos de competicion Liga
                }); // Juegos de Competicion F1

              }); // juegos de geocaching

          }); // juegos de colección
      }); // juegos de puntos
    }); // observable
    return Observables;
  }

  public DameAlumnosJuegoPuntos(juegoId: number) {
    let InformacionAlumno: MiAlumnoAMostrarJuegoDePuntos[] = [];
    this.peticionesAPI.DameAlumnosJuegoDePuntos(juegoId).subscribe(
      listaAlumnos => {
        for (let i = 0; i < (listaAlumnos.length); i++) {
          const MiAlumno = new MiAlumnoAMostrarJuegoDePuntos();
          MiAlumno.Nombre = listaAlumnos[i].Nombre;
          MiAlumno.PrimerApellido = listaAlumnos[i].PrimerApellido;
          MiAlumno.ImagenPerfil = listaAlumnos[i].ImagenPerfil;
          this.peticionesAPI.DameInscripcionAlumnoJuegoDePuntos(listaAlumnos[i].id, juegoId).subscribe(
            Inscripcion => {
              MiAlumno.PuntosTotalesAlumno = Inscripcion[0].PuntosTotalesAlumno;
              MiAlumno.alumnoId = Inscripcion[0].alumnoId;
              MiAlumno.id = Inscripcion[0].id;
              MiAlumno.juegoDePuntosId = Inscripcion[0].juegoDePuntosId;
              MiAlumno.nivelId = Inscripcion[0].nivelId;
            });
          InformacionAlumno.push(MiAlumno);
        }
        // tslint:disable-next-line:only-arrow-functions
        InformacionAlumno = InformacionAlumno.sort(function(obj1, obj2) {
          return obj2.PuntosTotalesAlumno - obj1.PuntosTotalesAlumno;
        });
      });
    return InformacionAlumno;
  }

  public DameAlumnosJuegoDeCuestionario(juegoId: number): MiAlumnoAMostrarJuegoDeCuestionario[] {
    let InformacionAlumno: MiAlumnoAMostrarJuegoDeCuestionario[] = [];
    this.peticionesAPI.DameAlumnosJuegoDeCuestionario(juegoId).subscribe(
      listaAlumnos => {
        for (let i = 0; i < (listaAlumnos.length); i++) {
          const MiAlumno = new MiAlumnoAMostrarJuegoDeCuestionario();
          MiAlumno.Nombre = listaAlumnos[i].Nombre;
          MiAlumno.PrimerApellido = listaAlumnos[i].PrimerApellido;
          MiAlumno.ImagenPerfil = listaAlumnos[i].ImagenPerfil;
          this.peticionesAPI.DameInscripcionAlumnoJuegoDeCuestionario(listaAlumnos[i].id, juegoId).subscribe(
            Inscripcion => {
              MiAlumno.Nota = Inscripcion[0].Nota;
              MiAlumno.alumnoId = Inscripcion[0].alumnoId;
              MiAlumno.id = Inscripcion[0].id;
              MiAlumno.juegoDeCuestionarioId = Inscripcion[0].juegoDeCuestionarioId;
            });
          InformacionAlumno.push(MiAlumno);
        }
        InformacionAlumno = InformacionAlumno.sort((a, b) => {
          return b.Nota - a.Nota;
        });
      });
    return InformacionAlumno;
  }

  public DameListaAlumnosJuegoCuestionarioOrdenada(juegoDeCuestionarioId: number): MiAlumnoAMostrarJuegoDeCuestionario[] {
    const InformacionAlumno: MiAlumnoAMostrarJuegoDeCuestionario[] = [];
    let Inscripciones: AlumnoJuegoDeCuestionario[] = [];
    this.peticionesAPI.ListaInscripcionesAlumnosJuegoDeCuestionario(juegoDeCuestionarioId).subscribe(res => {
      Inscripciones = res;
      Inscripciones = Inscripciones.sort(function(a, b) {
        return b.Nota - a.Nota;
      });
      for (let i = 0; i < (Inscripciones.length); i++) {
        const MiAlumno = new MiAlumnoAMostrarJuegoDeCuestionario();
        MiAlumno.Nota = Inscripciones[i].Nota;
        MiAlumno.alumnoId = Inscripciones[i].alumnoId;
        MiAlumno.id = Inscripciones[i].id;
        MiAlumno.juegoDeCuestionarioId = Inscripciones[i].juegoDeCuestionarioId;
        this.peticionesAPI.DameAlumnoConId(MiAlumno.alumnoId)
          .subscribe(res => {
            MiAlumno.Nombre = res.Nombre;
            MiAlumno.PrimerApellido = res.PrimerApellido;
            MiAlumno.ImagenPerfil = res.ImagenPerfil;
          });
        InformacionAlumno.push(MiAlumno);
      }
    });
    return InformacionAlumno;
  }

  public RegalaCromoAlumnos(cromo: Cromo, alumnoDestinatarioId: number, alumnoQueRegalaId: number, juegoSeleccionado: Juego) {

    // No entiendo muy bien por qué esta petición devuelve un vector de inscripciones y no una sola.
    // por eso indexo la inscripcion con [0]
    // Lo mismo pasa al pedir los cromos del alumno (DameAlbumAlumno)
    this.peticionesAPI.DameInscripcionAlumnoJuegoDeColeccion(juegoSeleccionado.id, alumnoDestinatarioId)
    .subscribe( inscripcion => this.peticionesAPI.AsignarCromoAlumno(new Album(inscripcion[0].id, cromo.id)).subscribe()
    );
    this.peticionesAPI.DameInscripcionAlumnoJuegoDeColeccion(juegoSeleccionado.id, alumnoQueRegalaId)
    .subscribe( inscripcion => this.peticionesAPI.DameAlbumAlumno(cromo.id, inscripcion[0].id)
    .subscribe( album => this.peticionesAPI.BorrarAlbumAlumno(album[0].id).subscribe()));
  }

  public RegalaCromoEquipos(cromo: Cromo, equipoDestinatarioId: number, equipoQueRegalaId: number, juegoSeleccionado: Juego) {

    // No entiendo muy bien por qué esta petición devuelve un vector de inscripciones y no una sola.
    // por eso indexo la inscripcion con [0]
    // Lo mismo pasa al pedir los cromos del equipo (DameAlbumEquipo)
    this.peticionesAPI.DameInscripcionEquipoJuegoDeColeccion(juegoSeleccionado.id, equipoDestinatarioId)
    .subscribe( inscripcion => this.peticionesAPI.AsignarCromoEquipo(new AlbumEquipo(inscripcion[0].id, cromo.id)).subscribe()
    );
    this.peticionesAPI.DameInscripcionEquipoJuegoDeColeccion(juegoSeleccionado.id, equipoQueRegalaId)
    .subscribe( inscripcion => this.peticionesAPI.DameAlbumEquipo(cromo.id, inscripcion[0].id)
    .subscribe( album => this.peticionesAPI.BorrarAlbumEquipo(album[0].id).subscribe()));
  }


  public RegalaCromoAlumnoEquipo(cromo: Cromo, alumnoDestinatarioId: number, alumnoQueRegalaId: number, juegoSeleccionado: Juego) {
    // Es un juego en equipo pero asignación individual. Por tanto hay que quitar el cromo de los albunes de los equipos
    this.DameEquipoAlumnoEnJuegoDeColeccion (alumnoDestinatarioId, juegoSeleccionado.id)
    .subscribe ( equipoDestinatorio => {
      this.DameEquipoAlumnoEnJuegoDeColeccion (alumnoQueRegalaId, juegoSeleccionado.id)
      .subscribe ( equipoDeAlumnoQueRegala => {
        this.RegalaCromoEquipos (cromo, equipoDestinatorio.id, equipoDeAlumnoQueRegala.id, juegoSeleccionado);
      });
    });
  }

  public DameEquiposJuegoPuntos(juegoId: number) {
    const InformacionEquipo: MiEquipoAMostrarJuegoDePuntos[] = [];
    this.peticionesAPI.DameEquiposJuegoDePuntos(juegoId).subscribe(
      listaEquipos => {
        for (let i = 0; i < (listaEquipos.length); i++) {
          const MiEquipo = new MiEquipoAMostrarJuegoDePuntos();
          MiEquipo.Nombre = listaEquipos[i].Nombre;
          MiEquipo.FotoEquipo = listaEquipos[i].FotoEquipo;
          MiEquipo.grupoId = listaEquipos[i].grupoId;
          MiEquipo.id = listaEquipos[i].id;
          this.peticionesAPI.DameInscripcionEquipoJuegoDePuntos(juegoId, MiEquipo.id).subscribe(
            EquipoDelJuego => {
              MiEquipo.PuntosTotalesEquipo = EquipoDelJuego[0].PuntosTotalesEquipo;
              MiEquipo.juegoDePuntosId = EquipoDelJuego[0].juegoDePuntosId;
            });
          InformacionEquipo.push(MiEquipo);
        }
      });
    return InformacionEquipo;
  }

  public DameAlumnosJuegoDeColecciones(juegoDeColeccionId: number) {
    const alumnosObservables = new Observable(obs => {
    const Alumnos: Alumno[] = [];
    this.peticionesAPI.DameInscripcionesAlumnoJuegoDeColeccion(juegoDeColeccionId).subscribe(
      ListaAlumnosJuegoColeccion => {
        let cont = 0;
        for (let i = 0; i < (ListaAlumnosJuegoColeccion.length); i++) {
          this.peticionesAPI.DameNombreAlumnoJuegoColeccion(ListaAlumnosJuegoColeccion[i].id).subscribe(
            MiAlumno => {
              Alumnos.push(MiAlumno);
              cont++;
              if (cont === ListaAlumnosJuegoColeccion.length) {
                // ya tengo todos los nombres
                obs.next(Alumnos);

              }
            });
        }
      });
    });
    return alumnosObservables;
  }


  public VisualizarLosCromosDelante(listaCromos: any[]) {
    const imagenesCromo: string[] = [];
    for (let i = 0; i < listaCromos.length; i++ ) {
      if (listaCromos[i].cromo.ImagenDelante !== undefined) {
        this.https.get(URL.ImagenesCromo + listaCromos[i].cromo.ImagenDelante,
      
        //this.https.get('http://localhost:3000/api/imagenes/ImagenCromo/download/' + listaCromos[i].cromo.ImagenDelante,
          { responseType: ResponseContentType.Blob }).subscribe(
            response => {
              const blob = new Blob([response.blob()], { type: 'image/jpg' });
              const reader = new FileReader();
              reader.addEventListener('load', () => {
                imagenesCromo[i] = reader.result.toString();
              }, false);
              if (blob) {
                reader.readAsDataURL(blob);
              }
            });
      }
    }
    return imagenesCromo;
  }
  public VisualizarLosCromosDetras(listaCromos: any[]) {
    const imagenesCromo: string[] = [];
    for (let i = 0; i < (listaCromos.length); i++) {
      if (listaCromos[i].cromo.ImagenDetras !== undefined) {
        this.https.get(URL.ImagenesCromo + listaCromos[i].cromo.ImagenDetras,
      
        //this.https.get('http://localhost:3000/api/imagenes/ImagenCromo/download/' + listaCromos[i].cromo.ImagenDetras,
          { responseType: ResponseContentType.Blob }).subscribe(
            response => {
              const blob = new Blob([response.blob()], { type: 'image/jpg' });
              const reader = new FileReader();
              reader.addEventListener('load', () => {
                imagenesCromo[i] = reader.result.toString();
              }, false);
              if (blob) {
                reader.readAsDataURL(blob);
              }
            });
      }
    }
    return imagenesCromo;
  }


  public DameImagenCromo(cromo: any) {
    if (cromo.cromo.Imagen !== undefined) {
      this.https.get(URL.ImagenesCromo + cromo.cromo.Imagen,
    
    //  this.https.get('http://localhost:3000/api/imagenes/ImagenCromo/download/' + cromo.cromo.Imagen,
        { responseType: ResponseContentType.Blob }).subscribe(
          response => {
            const blob = new Blob([response.blob()], { type: 'image/jpg' });
            const reader = new FileReader();
            reader.addEventListener('load', () => {
              this.MiImagenCromo = reader.result.toString();
            }, false);
            if (blob) {
              reader.readAsDataURL(blob);
            }
          });
    }
    return this.MiImagenCromo;
  }


  public VisualizarImagenAlumno(MiImagen: string) {
    const ImagenAlumno: string[] = [];
    if (MiImagen !== undefined) {
      this.https.get(URL.ImagenesAlumno + MiImagen,
   
     // this.https.get('http://localhost:3000/api/imagenes/ImagenAlumno/download/' + MiImagen,
        { responseType: ResponseContentType.Blob }).subscribe(
          response => {
            const blob = new Blob([response.blob()], { type: 'image/jpg' });
            const reader = new FileReader();
            reader.addEventListener('load', () => {
              ImagenAlumno[0] = reader.result.toString();
            }, false);
            if (blob) {
              reader.readAsDataURL(blob);
            }
          });
    }
    return ImagenAlumno;
  }


  public DameLosGruposYLosAlumnos(listaGrupos: Grupo[]): any {
    const observableGruposYAlumnos = new Observable(obs => {
        const listaGruposYAlumnos: any[] = [];
        let cont = 0;
        for (let i = 0; i < (listaGrupos.length); i++) {
          this.peticionesAPI.DameAlumnosGrupo(listaGrupos[i].id).subscribe(
            MisAlumnos => {
              listaGruposYAlumnos.push({ Grupo: listaGrupos[i].Descripcion, Alumnos: MisAlumnos });
              cont++;
              if (cont === listaGrupos.length) {
                obs.next (listaGruposYAlumnos);
              }
            });
        }
    });
    return observableGruposYAlumnos;
  }

  public DameLosGruposYLosEquipos(listaGrupos: Grupo[]): any {
    const observableGruposYEquipos = new Observable(obs => {
      const listaGruposYEquipos: any[] = [];
      let cont = 0;
      for (let i = 0; i < (listaGrupos.length); i++) {
        this.peticionesAPI.DameEquiposDelGrupo(listaGrupos[i].id).subscribe(
          MisEquipos => {
            listaGruposYEquipos.push({ Grupo: listaGrupos[i].Descripcion, Equipo: MisEquipos });
            cont++;
            if (cont === listaGrupos.length) {
              obs.next (listaGruposYEquipos);
            }
          }
        );
      }
    });
    return observableGruposYEquipos;
  }

  public DameHistorialMisPuntos(juegoId: number, alumnoId: number): any {
    // const HistorialPuntos: any [] = [];
    const Observables = new Observable(obs => {
      const EsteAlumnoJDP: any[] = [];
      const HistorialPuntos: any[] = [];
      this.peticionesAPI.DameInscripcionAlumnoJuegoDePuntos(alumnoId, juegoId).subscribe(
        MiAlumnoJuegoDePuntos => {
          EsteAlumnoJDP.push(MiAlumnoJuegoDePuntos[0].PuntosTotalesAlumno);
          this.peticionesAPI.DamePuntosJuegoDePuntos(juegoId).subscribe(
            TipoDePuntos => {
              // tslint:disable-next-line:prefer-for-of
              for (let i = 0; i < TipoDePuntos.length; i++) {
                this.peticionesAPI.DameHistorialDeUnPunto(MiAlumnoJuegoDePuntos[0].id, TipoDePuntos[i].id).subscribe(
                  HistorialDeUnPunto => {
                    this.puntos = 0;
                    // tslint:disable-next-line:prefer-for-of
                    for (let j = 0; j < HistorialDeUnPunto.length; j++) {
                      this.puntos = this.puntos + HistorialDeUnPunto[j].ValorPunto;
                    }
                    HistorialPuntos.push({ Nombre: TipoDePuntos[i].Nombre, Puntos: this.puntos });
                  });
              }
            }
          );
        }
      );
      const MisObservables = { AlumnoJDP: EsteAlumnoJDP, Historial: HistorialPuntos };
      obs.next(MisObservables);
    });
    return Observables;
  }

  public DameHistorialPuntosMiEquipo(alumnoId: number, juegoDePuntosId: number) {
    const HistorialPuntosMiEquipo: any[] = [];
    this.peticionesAPI.DameEquipoAlumnoJuegoDePuntos(alumnoId).subscribe(
      MiEquipo => {
        this.peticionesAPI.DameInscripcionEquipoJuegoDePuntos(juegoDePuntosId, MiEquipo[0].id).subscribe(
          MiEquipoJuegoDePuntos => {
            this.peticionesAPI.DamePuntosJuegoDePuntos(juegoDePuntosId).subscribe(
              TipoDePuntos => {
                // tslint:disable-next-line:prefer-for-of
                for (let i = 0; i < TipoDePuntos.length; i++) {
                  this.peticionesAPI.DameHistorialDeUnPuntoEquipo(MiEquipoJuegoDePuntos[0].id, TipoDePuntos[i].id).subscribe(
                    HistorialDePunto => {
                      this.puntos = 0;
                      // tslint:disable-next-line:prefer-for-of
                      for (let j = 0; j < HistorialDePunto.length; j++) {
                        this.puntos = this.puntos + HistorialDePunto[j].ValorPunto;
                      }
                      HistorialPuntosMiEquipo.push({ Nombre: TipoDePuntos[i].Nombre, Puntos: this.puntos });
                    });
                }
              });
          });
      });
    return HistorialPuntosMiEquipo;
  }

  public PrepararTablaRankingEquipoLiga(listaEquiposOrdenadaPorPuntos: EquipoJuegoDeCompeticionLiga[],
                                        equiposDelJuego: Equipo[], jornadasDelJuego: Jornada[],
                                        enfrentamientosDelJuego: EnfrentamientoLiga[][]): TablaEquipoJuegoDeCompeticion[] {
    const rankingJuegoDeCompeticion: TablaEquipoJuegoDeCompeticion[] = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < listaEquiposOrdenadaPorPuntos.length; i++) {
      let equipo: Equipo;
      const EquipoId = listaEquiposOrdenadaPorPuntos[i].EquipoId;
      equipo = equiposDelJuego.filter(res => res.id === EquipoId)[0];
      rankingJuegoDeCompeticion[i] = new TablaEquipoJuegoDeCompeticion(i + 1, equipo.Nombre,
        listaEquiposOrdenadaPorPuntos[i].PuntosTotalesEquipo, EquipoId);
    }
    const individual = false;
    const informacionPartidos = this.ObtenerInformaciónPartidos(listaEquiposOrdenadaPorPuntos, jornadasDelJuego,
      individual, enfrentamientosDelJuego);
    const rankingJuegoDeCompeticionFinal = this.RellenarTablaEquipoJuegoDeCompeticion(rankingJuegoDeCompeticion, informacionPartidos);
    return rankingJuegoDeCompeticionFinal;
  }

  public RellenarTablaEquipoJuegoDeCompeticion(rankingJuegoDeCompeticion: TablaEquipoJuegoDeCompeticion[],
                                               informacionPartidos: InformacionPartidosLiga[]): TablaEquipoJuegoDeCompeticion[] {
    for (let cont = 0; cont < rankingJuegoDeCompeticion.length; cont++) {
      rankingJuegoDeCompeticion[cont].partidosTotales = informacionPartidos[cont].partidosTotales;
      rankingJuegoDeCompeticion[cont].partidosJugados = informacionPartidos[cont].partidosJugados;
      rankingJuegoDeCompeticion[cont].partidosGanados = informacionPartidos[cont].partidosGanados;
      rankingJuegoDeCompeticion[cont].partidosEmpatados = informacionPartidos[cont].partidosEmpatados;
      rankingJuegoDeCompeticion[cont].partidosPerdidos = informacionPartidos[cont].partidosPerdidos;
    }
    return rankingJuegoDeCompeticion;
  }

  public PrepararTablaRankingIndividual(listaAlumnosOrdenadaPorPuntos,
                                        alumnosDelJuego,
                                        nivelesDelJuego): any {

    const rankingJuegoDePuntos: any[] = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < listaAlumnosOrdenadaPorPuntos.length; i++) {
      let alumno: Alumno;
      let nivel: Nivel;
      const alumnoId = listaAlumnosOrdenadaPorPuntos[i].alumnoId;
      const nivelId = listaAlumnosOrdenadaPorPuntos[i].nivelId;
      alumno = alumnosDelJuego.filter(res => res.id === alumnoId)[0];

      if (listaAlumnosOrdenadaPorPuntos[i].nivelId !== undefined) {
        nivel = nivelesDelJuego.filter(res => res.id === nivelId)[0];
      }

      if (nivel !== undefined) {
        rankingJuegoDePuntos[i] = new TablaAlumnoJuegoDePuntos(i + 1, alumno.id, alumno.Nombre, alumno.PrimerApellido, alumno.SegundoApellido,
          listaAlumnosOrdenadaPorPuntos[i].PuntosTotalesAlumno, nivel.Nombre);

      } else {
        rankingJuegoDePuntos[i] = new TablaAlumnoJuegoDePuntos(i + 1, alumno.id, alumno.Nombre, alumno.PrimerApellido, alumno.SegundoApellido,
          listaAlumnosOrdenadaPorPuntos[i].PuntosTotalesAlumno);
      }
    }

    return (rankingJuegoDePuntos);

  }


  public DameRankingPuntoSeleccionadoEquipos(
    listaEquiposOrdenadaPorPuntos: any,
    equiposDelJuego: any,
    nivelesDelJuego: any,
    puntoSeleccionadoId: any
  ): any {

    const rankingObservable = new Observable(obs => {

      let rankingEquiposJuegoDePuntos: any[] = [];
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < listaEquiposOrdenadaPorPuntos.length; i++) {

        let equipo: Equipo;
        let nivel: Nivel;
        // Busca equipo
        equipo = equiposDelJuego.filter(res => res.id === listaEquiposOrdenadaPorPuntos[i].equipoId)[0];

        if (listaEquiposOrdenadaPorPuntos[i].nivelId !== undefined) {
          nivel = nivelesDelJuego.filter(res => res.id === listaEquiposOrdenadaPorPuntos[i].nivelId)[0];
        }

        this.peticionesAPI.DameHistorialDeUnPuntoEquipo(listaEquiposOrdenadaPorPuntos[i].id, puntoSeleccionadoId)
          .subscribe(historial => {

            let puntos = 0;
            // tslint:disable-next-line:prefer-for-of
            for (let j = 0; j < historial.length; j++) {
              puntos = puntos + historial[j].ValorPunto;
            }


            if (nivel !== undefined) {
              rankingEquiposJuegoDePuntos[i] = new TablaEquipoJuegoDePuntos(i + 1, equipo.Nombre, equipo.id,
                puntos, nivel.Nombre);
            } else {
              rankingEquiposJuegoDePuntos[i] = new TablaEquipoJuegoDePuntos(i + 1, equipo.Nombre, equipo.id,
                puntos);
            }

            if (i === listaEquiposOrdenadaPorPuntos.length - 1) {
              // tslint:disable-next-line:only-arrow-functions
              rankingEquiposJuegoDePuntos = rankingEquiposJuegoDePuntos.sort(function(obj1, obj2) {
                return obj2.puntos - obj1.puntos;
              });
              obs.next(rankingEquiposJuegoDePuntos);
            }
          });
      }
    });
    return rankingObservable;
  }

  public DameRankingPuntoSeleccionadoAlumnos(
    listaAlumnosOrdenadaPorPuntos: any,
    alumnosDelJuego: any,
    nivelesDelJuego: any,
    puntoSeleccionadoId: any): any {
    const rankingObservable = new Observable(obs => {

      let rankingJuegoDePuntos: any[] = [];

      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < listaAlumnosOrdenadaPorPuntos.length; i++) {

        let alumno: Alumno;
        let nivel: Nivel;

        // Busco al alumno
        alumno = alumnosDelJuego.filter(res => res.id === listaAlumnosOrdenadaPorPuntos[i].alumnoId)[0];

        if (listaAlumnosOrdenadaPorPuntos[i].nivelId !== undefined) {
          // Busco el nivel
          nivel = nivelesDelJuego.filter(res => res.id === listaAlumnosOrdenadaPorPuntos[i].nivelId)[0];
        }

        this.peticionesAPI.DameHistorialDeUnPunto(listaAlumnosOrdenadaPorPuntos[i].id, puntoSeleccionadoId)
          .subscribe(historial => {
            let puntos = 0;
            // tslint:disable-next-line:prefer-for-of
            for (let j = 0; j < historial.length; j++) {
              puntos = puntos + historial[j].ValorPunto;
            }

            if (nivel !== undefined) {
              // tslint:disable-next-line:max-line-length
              rankingJuegoDePuntos[i] = new TablaAlumnoJuegoDePuntos(i + 1, alumno.id, alumno.Nombre, alumno.PrimerApellido, alumno.SegundoApellido,
                puntos, nivel.Nombre);
            } else {
              // tslint:disable-next-line:max-line-length
              rankingJuegoDePuntos[i] = new TablaAlumnoJuegoDePuntos(i + 1, alumno.id, alumno.Nombre, alumno.PrimerApellido, alumno.SegundoApellido,
                puntos);
            }

            if (i === listaAlumnosOrdenadaPorPuntos.length - 1) {
              // tslint:disable-next-line:only-arrow-functions
              rankingJuegoDePuntos = rankingJuegoDePuntos.sort(function(obj1, obj2) {
                return obj2.puntos - obj1.puntos;
              });
              obs.next(rankingJuegoDePuntos);
            }

          });
      }
    });
    return rankingObservable;
  }

  // ESTA FUNCIÓN NOS DA DOS LISTA, UNA CON LOS ALUMNOS DEL GRUPO CON EQUIPO Y
  // OTRA CON LOS QUE NO TIENEN EQUIPO
  public DameListasAlumnosConYSinEquipo(equipo: Equipo, alumnosGrupo: Alumno[]): any {
    const listasObservables = new Observable(obs => {
      this.peticionesAPI.DameAsignacionesEquipoDelGrupo(equipo.grupoId)
        .subscribe(asignaciones => {
          let asignacionesEquipo: any[];
          const alumnosConEquipo: Alumno[] = [];
          const alumnosSinEquipo: Alumno[] = [];

          if (asignaciones[0] !== undefined) {
            // cuando recibimos las asignaciones las metemos en su lista
            asignacionesEquipo = asignaciones;
          }
          // Ahora preparamos dos listas, una de alumnos con equipo y otra de alumnos sin equipo
          // tslint:disable-next-line:prefer-for-of
          for (let i = 0; i < alumnosGrupo.length; i++) {

            // PRIMERO MIRAMOS SI HAY ALGUNA ASIGNACIÓN HECHA EN ESTE GRUPO O NO. SI NO HAY NINGUNA ASIGNACIÓN A NINGÚN EQUIPO HECHA
            // SIGNIFICA QUE TODOS LOS ALUMNOS DEL GRUPO PUEDEN METERSE EN CUALQUIER EQUIPO. SERÍA ILÓGICO BUSCAR EN ALGO VACÍO
            if (asignacionesEquipo != null) {
              // EN CASO DE TENER ASIGNADO UN EQUIPO (TRUE) LO INCLUIMOS EN LA LISTA DE ALUMNOS CON EQUIPO
              if (asignacionesEquipo.filter(res => res.alumnoId === alumnosGrupo[i].id)[0] !== undefined) {
                alumnosConEquipo.push(alumnosGrupo[i]);
                // SI NO ESTA ASIGNADO TODAVIDA A NINGÚN EQUIPO, LO PONEMOS EN LA LISTA DE ALUMNOS SIN EQUIPO
              } else {
                alumnosSinEquipo.push(alumnosGrupo[i]);
              }
              // SI NO HAY NINGUNA ASIGNACIÓN HECHA SIGNIFICA QUE TODOS LOS ALUMNOS DEL GRUPO ESTAN SIN EQUIPO
            } else {
              alumnosSinEquipo.push(alumnosGrupo[i]);
            }
          }
          const resultado = { con: alumnosConEquipo, sin: alumnosSinEquipo };
          obs.next(resultado);
        });
    });
    return listasObservables;
  }


  public DameSiguienteNivel(nivelesDelJuego: Nivel[], nivel: Nivel): Nivel {
    // Retorna el nivel siguiente al que me dan, o undefined si el que me dan es el máximo
    const pos = nivelesDelJuego.indexOf(nivel);
    if (pos === nivelesDelJuego.length - 1) {
      return undefined;
    } else {
      return nivelesDelJuego[pos + 1];
    }
  }

  private DameNivelId(nivelesDelJuego: Nivel[], puntos: number): number {
    let i = 0;
    let encontrado = false;
    while ((i < nivelesDelJuego.length) && !encontrado) {
      if (nivelesDelJuego[i].PuntosAlcanzar > puntos) {
        encontrado = true;
      } else {
        i = i + 1;
      }
    }
    if (!encontrado) {
      // Tiene el nivel máximo
      return nivelesDelJuego[nivelesDelJuego.length - 1].id;
    } else if (i > 0) {
      return nivelesDelJuego[i - 1].id;
    } else {
      return undefined;
    }
  }

  // // Me da la posición que ocupa en el vector de niveles
  // private DameNivelPos( nivelesDelJuego: Nivel[], puntos: number): number {
  //   let i = 0;
  //   let encontrado = false;
  //   while ((i < nivelesDelJuego.length) && !encontrado) {
  //     if (nivelesDelJuego[i].PuntosAlcanzar > puntos) {
  //           encontrado = true;
  //           console.log ('encontrado');
  //     } else {
  //           i = i + 1;
  //     }
  //   }
  //   if (!encontrado) {
  //     console.log ('no encontrado');
  //     // Tiene el nivel máximo
  //     return nivelesDelJuego.length - 1;
  //   } else if (i > 0) {
  //     return i - 1;
  //   } else {
  //     return undefined;
  //   }
  // }


  public BorrarPunto(punto: TablaHistorialPuntosAlumno, alumnoJuegoDePuntos: any,
                     nivelesDelJuego: Nivel[]) {

    alumnoJuegoDePuntos.PuntosTotalesAlumno = alumnoJuegoDePuntos.PuntosTotalesAlumno - punto.valorPunto;
    if (nivelesDelJuego !== undefined) {
      // calculamos el nuevo nivel
      const nivelId = this.DameNivelId(nivelesDelJuego, alumnoJuegoDePuntos.PuntosTotalesAlumno);
      alumnoJuegoDePuntos.nivelId = nivelId;
    }
    this.peticionesAPI.PonPuntosJuegoDePuntos(alumnoJuegoDePuntos, alumnoJuegoDePuntos.id).
      subscribe();
    this.peticionesAPI.BorrarPuntosAlumno(punto.historialId).subscribe();
  }

  //  console.log ('EN calculos ' + alumnoSeleccionado.id);
  //  console.log ('EN calculos ' + alumnoJuegoDePuntos);
  //  const resultadoObservable = new Observable ( obs => {

  //   console.log(punto);
  //   this.peticionesAPI.BorrarPuntosAlumno(punto.historialId).subscribe();

  //   // Buscamos los nuevos puntos
  //   let nuevosPuntos: number;
  //   nuevosPuntos = (Number(alumnoJuegoDePuntos.PuntosTotalesAlumno) - Number(punto.valorPunto));
  //   console.log(nuevosPuntos);
  //   alumnoJuegoDePuntos.PuntosTotalesAlumno = nuevosPuntos;
  //   console.log('Borro los puntos y miro que puntos totales tengo');

  //   // Comprobamos si subimos de nivel o no
  //   // tslint:disable-next-line:curly
  //   if (nivel !== undefined) {
  //     if (nuevosPuntos < nivel.PuntosAlcanzar) {
  //       if (nivel !== undefined) {
  //         console.log('Voy a bajar de nivel');
  //         siguienteNivel = nivel;
  //         nivel = this.DameNivelAnterior(nivelesDelJuego, nivel.id);
  //       }

  //     } else {
  //       console.log('mantengo el nivel');
  //     }
  //   }
  //   console.log ('EN calculos ' + alumnoJuegoDePuntos);

  //   console.log('Voy a editar la base de datos y actualizar la tabla');
  //   if (nivel !== undefined) {
  //     this.peticionesAPI.PonPuntosJuegoDePuntos( new AlumnoJuegoDePuntos(alumnoSeleccionado.id, juegoSeleccionado.id,
  //       nuevosPuntos, nivel.id), alumnoJuegoDePuntos.id).subscribe(res => {
  //         console.log(res);
  //        // alumnoJuegoDePuntos = res;
  //         console.log ('EN calculos 1 ' + alumnoJuegoDePuntos);
  //         const resultado = {alumno: alumnoJuegoDePuntos, n: nivel, sn: siguienteNivel};
  //         obs.next (resultado);
  //    //     this.MostrarHistorialSeleccionado();
  //       });
  //   } else {
  //     this.peticionesAPI.PonPuntosJuegoDePuntos( new AlumnoJuegoDePuntos(alumnoSeleccionado.id, juegoSeleccionado.id,
  //       nuevosPuntos), alumnoJuegoDePuntos.id).subscribe(res => {
  //         console.log(res);
  //         console.log ('EN calculos 2 ' + alumnoJuegoDePuntos);
  //         const resultado = {alumno: alumnoJuegoDePuntos, n: nivel, sn: siguienteNivel};
  //         obs.next (resultado);
  //         //MostrarHistorialSeleccionado();
  //       });
  //   }
  //  });
  //  return resultadoObservable;

  // }

  public BorrarPuntoEquipo(punto: TablaHistorialPuntosEquipo, equipoJuegoDePuntos: any,
                           nivelesDelJuego: Nivel[]) {

    equipoJuegoDePuntos.PuntosTotalesEquipo = equipoJuegoDePuntos.PuntosTotalesEquipo - punto.valorPunto;
    if (nivelesDelJuego !== undefined) {
      // calculamos el nuevo nivel
      const nivelId = this.DameNivelId(nivelesDelJuego, equipoJuegoDePuntos.PuntosTotalesEquipo);
      equipoJuegoDePuntos.nivelId = nivelId;
    }
    this.peticionesAPI.PonPuntosEquiposJuegoDePuntos(equipoJuegoDePuntos, equipoJuegoDePuntos.id).
      subscribe();
    this.peticionesAPI.BorraPuntosEquipo(punto.historialId).subscribe();
  }

  // public BorrarPuntoEquipo2(
  //     equipoJuegoDePuntos: any,
  //     punto: TablaHistorialPuntosEquipo,
  //     nivel: any,
  //     siguienteNivel: any,
  //     juegoSeleccionado: any,
  //     equipoSeleccionado: any,
  //     nivelesDelJuego: any,
  //     ): any {
  //   const resultadoObservable = new Observable ( obs => {

  //     console.log(punto);

  //     // Buscamos los nuevos puntos
  //     let nuevosPuntos: number;
  //     nuevosPuntos = (Number(equipoJuegoDePuntos.PuntosTotalesEquipo) - Number(punto.valorPunto));
  //     console.log(nuevosPuntos);
  //     equipoJuegoDePuntos.PuntosTotalesEquipo = nuevosPuntos;

  //     this.peticionesAPI.BorraPuntosEquipo(punto.historialId).subscribe();



  //     console.log('Borro los puntos y miro que puntos totales tengo');

  //     // Comprobamos si subimos de nivel o no
  //     // tslint:disable-next-line:curly
  //     if (nivel !== undefined) {
  //       if (nuevosPuntos < nivel.PuntosAlcanzar) {
  //         if (nivel !== undefined) {
  //           console.log('Voy a bajar de nivel');
  //           siguienteNivel = nivel;
  //           nivel = this.DameNivelAnterior(nivelesDelJuego, nivel.id);
  //         }

  //       } else {
  //         console.log('mantengo el nivel');
  //       }
  //     }

  //     console.log('Voy a editar la base de datos y actualizar la tabla');
  //     if (nivel !== undefined) {
  //       this.peticionesAPI.PonPuntosEquiposJuegoDePuntos( new EquipoJuegoDePuntos(equipoSeleccionado.id,
  //         juegoSeleccionado.id, nuevosPuntos, nivel.id), equipoJuegoDePuntos.id).subscribe(res => {
  //           console.log(res);
  //           const resultado = {equipo: res, n: nivel, sn: siguienteNivel};
  //           obs.next (resultado);

  //         });
  //     } else {
  //       this.peticionesAPI.PonPuntosEquiposJuegoDePuntos( new EquipoJuegoDePuntos(equipoSeleccionado.id,
  //         juegoSeleccionado.id, nuevosPuntos), equipoJuegoDePuntos.id).subscribe(res => {
  //           console.log(res);
  //           const resultado = {equipo: res, n: nivel, sn: siguienteNivel};
  //           obs.next (resultado);
  //         });
  //     }
  //   });
  //   return resultadoObservable;

  // }



  // public DameNivelAnteriorRRRRRRR(nivelesDelJuego: any, nivelId: number): Nivel {

  //   // tslint:disable-next-line:no-inferrable-types
  //   let encontrado: boolean = false;
  //   let i = 0;
  //   while ((i < nivelesDelJuego.length) && (encontrado === false)) {

  //     if (nivelesDelJuego[i].id === nivelId) {
  //       encontrado = true;
  //     }
  //     i = i + 1;
  //   }
  //   if (i >= 2) {
  //     return nivelesDelJuego[i - 2];
  //     console.log('punto plata o mas');
  //   } else {
  //     return undefined;
  //     console.log('punto bronce');
  //   }

  // }
  // public PorcentajeEquipo(

  //   nivel: any,
  //   equipoJuegoDePuntos: any,
  //   nivelesDelJuego: any,
  //   siguienteNivel

  // ): number {

  //   let porcentaje: number;
  //   if (nivel !== undefined) {
  //     // Si no estoy en el útlimo nivel, busco el porcentaje. Sino el porcentaje es 1.
  //     if (equipoJuegoDePuntos.nivelId !== nivelesDelJuego[nivelesDelJuego.length - 1].id) {
  //       porcentaje = (equipoJuegoDePuntos.PuntosTotalesEquipo - nivel.PuntosAlcanzar) /
  //       (siguienteNivel.PuntosAlcanzar - nivel.PuntosAlcanzar);

  //     } else {
  //       porcentaje = 1;
  //     }

  //   } else {
  //     porcentaje = (equipoJuegoDePuntos.PuntosTotalesEquipo - 0) / (siguienteNivel.PuntosAlcanzar - 0);
  //   }

  //   return porcentaje;
  // }

  // public Porcentaje(nivel: any, siguienteNivel: any, alumnoJuegoDePuntos: any, nivelesDelJuego: any): number {

  //   let porcentaje: number;

  //   if (nivel !== undefined) {
  //     // Si no estoy en el útlimo nivel, busco el porcentaje. Sino el porcentaje es 1.
  //     if (alumnoJuegoDePuntos.nivelId !== nivelesDelJuego[nivelesDelJuego.length - 1].id) {
  //       porcentaje = (alumnoJuegoDePuntos.PuntosTotalesAlumno - nivel.PuntosAlcanzar) /
  //       (siguienteNivel.PuntosAlcanzar - nivel.PuntosAlcanzar);
  //       console.log('no estoy en el ultimo nivel');

  //     } else {
  //       porcentaje = 1;
  //     }

  //   } else {
  //     console.log('El sigueinte nivel es el primero');

  //     porcentaje = (alumnoJuegoDePuntos.PuntosTotalesAlumno - 0) / (siguienteNivel.PuntosAlcanzar - 0);
  //   }

  //   return porcentaje;
  // }

  // ESTA FUNCION DEVUELVE DOS LISTAS
  // NO ME GUSTA PORQUE LA DE RANKING INDIVIDUAL DEVUELVE SOLO UNA
  // HAY QUE PENSAR COMO SIMPLIFICAR ESTO DE LAS LISTAS Y LOS RANKINGS
  public PrepararTablaRankingEquipos(
    listaEquiposOrdenadaPorPuntos: any,
    equiposDelJuego: any,
    nivelesDelJuego: any,

  ): any {
    const rankingEquiposJuegoDePuntos: any[] = [];
    // const rankingEquiposJuegoDePuntosTotal: any [] = [];
    for (let i = 0; i < listaEquiposOrdenadaPorPuntos.length; i++) {
      let equipo: Equipo;
      let nivel: Nivel;
      equipo = equiposDelJuego.filter(res => res.id === listaEquiposOrdenadaPorPuntos[i].equipoId)[0];

      if (listaEquiposOrdenadaPorPuntos[i].nivelId !== undefined) {
        nivel = nivelesDelJuego.filter(res => res.id === listaEquiposOrdenadaPorPuntos[i].nivelId)[0];
      }

      if (nivel !== undefined) {
        rankingEquiposJuegoDePuntos[i] = new TablaEquipoJuegoDePuntos(i + 1, equipo.Nombre, equipo.id,
          listaEquiposOrdenadaPorPuntos[i].PuntosTotalesEquipo, nivel.Nombre);

        // rankingEquiposJuegoDePuntosTotal[i] = new TablaEquipoJuegoDePuntos (i + 1, equipo.Nombre, equipo.id,
        //     listaEquiposOrdenadaPorPuntos[i].PuntosTotalesEquipo, nivel.Nombre);
      } else {
        rankingEquiposJuegoDePuntos[i] = new TablaEquipoJuegoDePuntos(i + 1, equipo.Nombre, equipo.id,
          listaEquiposOrdenadaPorPuntos[i].PuntosTotalesEquipo);

        // rankingEquiposJuegoDePuntosTotal[i] = new TablaEquipoJuegoDePuntos (i + 1, equipo.Nombre, equipo.id,
        //     listaEquiposOrdenadaPorPuntos[i].PuntosTotalesEquipo);
      }
    }

    // const resultado = {
    //                       ranking: rankingEquiposJuegoDePuntos,
    //                       rankingTotal: rankingEquiposJuegoDePuntosTotal
    // };
    return rankingEquiposJuegoDePuntos;
  }


  public AsignarPuntosAlumno(
    alumno: AlumnoJuegoDePuntos,
    nivelesDelJuego: Nivel[],
    puntosNuevos: any,
    puntoSeleccionadoId: any,
  ) {
        alumno.PuntosTotalesAlumno = alumno.PuntosTotalesAlumno + puntosNuevos;
        if (nivelesDelJuego.length > 0 ) {
          const nivelId = this.DameNivelId (nivelesDelJuego, alumno.PuntosTotalesAlumno );
          alumno.nivelId = nivelId;
        }
        this.peticionesAPI.PonPuntosJuegoDePuntos(alumno, alumno.id).
        subscribe ();
        const fechaAsignacionPunto = new Date();
        const fechaString = fechaAsignacionPunto.toLocaleDateString() + '  ' + fechaAsignacionPunto.toLocaleTimeString();
        // tslint:disable-next-line:max-line-length
        this.peticionesAPI.PonHistorialPuntosAlumno(new HistorialPuntosAlumno (puntosNuevos, puntoSeleccionadoId, alumno.id, fechaString))
            // tslint:disable-next-line:no-shadowed-variable
        .subscribe(res => console.log(res));
  }


  public AsignarPuntosEquipo(
    equipo: EquipoJuegoDePuntos,
    nivelesDelJuego: Nivel[],
    puntosNuevos: any,
    puntoSeleccionadoId: any,
  ) {

    equipo.PuntosTotalesEquipo = equipo.PuntosTotalesEquipo + puntosNuevos;
    if (nivelesDelJuego !== undefined) {
      const nivelId = this.DameNivelId(nivelesDelJuego, equipo.PuntosTotalesEquipo);
      equipo.nivelId = nivelId;
    }
    this.peticionesAPI.PonPuntosEquiposJuegoDePuntos(equipo, equipo.id).
      subscribe();
    const fechaAsignacionPunto = new Date();
    const fechaString = fechaAsignacionPunto.toLocaleDateString() + '  ' + fechaAsignacionPunto.toLocaleTimeString();
    // tslint:disable-next-line:max-line-length
    this.peticionesAPI.PonHistorialPuntosEquipo(new HistorialPuntosEquipo(puntosNuevos, puntoSeleccionadoId, equipo.id, fechaString))
      // tslint:disable-next-line:no-shadowed-variable
      .subscribe(res => console.log(res));
  }


  public PreparaHistorialEquipo(equipoJuegoDePuntos: any, tiposPuntosDelJuego: any, ):
    any {
    const historialObservable = new Observable(obs => {

      let historial = [];

      this.peticionesAPI.DameHistorialPuntosEquipo(equipoJuegoDePuntos.id)
        .subscribe(his => {

          if (his[0] !== null) {
            for (let i = 0; i < his.length; i++) {
              const punto = tiposPuntosDelJuego.filter(res => res.id === his[i].puntoId)[0];

              historial[i] = new TablaHistorialPuntosEquipo(punto.Nombre,
                punto.Descripcion, his[i].ValorPunto, his[i].fecha,
                his[i].equipoJuegoDePuntosId, his[i].id, his[i].puntoId);
            }
          } else {
            historial = undefined;
          }
          historial = historial.filter(res => res.nombre !== '');
          obs.next(historial);
        });
    });
    return historialObservable;
  }

  public PreparaHistorialAlumno(alumnoJuegoDePuntos: any, tiposPuntosDelJuego: any, ):
    any {
    const historialObservable = new Observable(obs => {

      let historial = [];

      this.peticionesAPI.DameHistorialPuntosAlumno(alumnoJuegoDePuntos.id)
        .subscribe(his => {

          if (his[0] !== null) {
            for (let i = 0; i < his.length; i++) {
              const punto = tiposPuntosDelJuego.filter(res => res.id === his[i].puntoId)[0];

              historial[i] = new TablaHistorialPuntosAlumno(punto.Nombre,
                punto.Descripcion, his[i].ValorPunto, his[i].fecha,
                his[i].alumnoJuegoDePuntosId, his[i].id, his[i].puntoId);
            }
          } else {
            historial = undefined;
          }
          historial = historial.filter(res => res.nombre !== '');
          obs.next(historial);
        });
    });
    return historialObservable;
  }

  public Prueba(profesorId): any {
    const gruposObservable = new Observable(obs => {
      this.peticionesAPI.DameGruposProfesor(profesorId)
        .subscribe(res => {
          if (res[0] !== undefined) {
            obs.next(res.slice(0, 2));
          } else {
            obs.next(undefined);
          }
        });
    });
    return gruposObservable;
  }


  private randomIndex(
    probabilities: number[],
    randomGenerator: () => number = Math.random): number {

    // get the cumulative distribution function
    let acc = 0;
    const cdf = probabilities
      .map(v => acc += v) // running total [4,7,9,10]
      .map(v => v / acc); // normalize to max 1 [0.4,0.7,0.9,1]

    // pick a random number between 0 and 1
    const randomNumber = randomGenerator();

    // find the first index of cdf where it exceeds randomNumber
    // (findIndex() is in ES2015+)
    return cdf.findIndex(p => randomNumber < p);
  }

  public AsignarCromosAleatoriosAlumno(
    alumno: Alumno,
    inscripcionesAlumnos: any,
    numeroCromosRandom: number,
    probabilidadCromos: any,
    cromosColeccion: any,

  ) {
    let alumnoJuegoDeColeccion: AlumnoJuegoDeColeccion;
    alumnoJuegoDeColeccion = inscripcionesAlumnos.filter(res => res.alumnoId === alumno.id)[0];

    // tslint:disable-next-line:prefer-const
    // let hits = this.probabilidadCromos.map(x => 0);


    for (let k = 0; k < numeroCromosRandom; k++) {

      const indexCromo = this.randomIndex(probabilidadCromos);
      // hits[this.indexCromo]++;


      this.peticionesAPI.AsignarCromoAlumno(new Album(alumnoJuegoDeColeccion.id,
        cromosColeccion[indexCromo].id)).subscribe(res => {

          // this.selection.clear();
          // this.selectionEquipos.clear();
          // this.isDisabled = true;
          // this.seleccionados = Array(this.alumnosDelJuego.length).fill(false);
        });
    }

  }

  public AsignarCromosAleatoriosEquipo(
    equipo: Equipo,
    inscripcionesEquipos: any,
    numeroCromosRandom: number,
    probabilidadCromos: any,
    cromosColeccion: any
  ) {
    let equipoJuegoDeColeccion: EquipoJuegoDeColeccion;
    equipoJuegoDeColeccion = inscripcionesEquipos.filter(res => res.equipoId === equipo.id)[0];

    for (let k = 0; k < numeroCromosRandom; k++) {

      const indexCromo = this.randomIndex(probabilidadCromos);

      this.peticionesAPI.AsignarCromoEquipo(new AlbumEquipo(equipoJuegoDeColeccion.id,
        cromosColeccion[indexCromo].id)).subscribe(res => {
        });
    }

  }

  // Esta función recibe una lista de cromos en la que puede haber repetidos
  // y geneera otra en la que cada cromo aparece una sola vez y se le asocia el número
  // de veces que aparece reperido en la lista de entrada
  GeneraListaSinRepetidos(listaCromos: Cromo[]): any[] {
    const listaCromosSinRepetidos: any[] = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < listaCromos.length; i++) {
      const n = listaCromos.filter(cromo => cromo.Nombre === listaCromos[i].Nombre).length;
      if (listaCromosSinRepetidos.filter(res => res.cromo.Nombre === listaCromos[i].Nombre).length === 0) {
        listaCromosSinRepetidos.push({ rep: n, cromo: listaCromos[i] });
      }
    }
    return listaCromosSinRepetidos;
  }

  DameCromosQueNoTengo(MisCromos: Cromo[], TodosLosCromos: Cromo[]): any[] {
    const CromosQueNoTengo: any[] = [];
    // tslint:disable-next-line:no-shadowed-variable
    let Cromo: Cromo;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < TodosLosCromos.length; i++) {
      Cromo = MisCromos.filter(res => res.id === TodosLosCromos[i].id)[0];
      if (Cromo === undefined) {
        CromosQueNoTengo.push({ rep: 0, cromo: TodosLosCromos[i] });
      }
    }
    return CromosQueNoTengo;
  }

  /* competicion liga */

  public PrepararTablaRankingIndividualLigaMiAlumno(listaAlumnosOrdenadaPorPuntos: AlumnoJuegoDeCompeticionLiga[],
                                                    alumnosDelJuego: Alumno[], jornadasDelJuego: Jornada[],
                                                    enfrentamientosDelJuego: EnfrentamientoLiga[][], miAlumnoid: number): TablaAlumnoJuegoDeCompeticion[] {
    const rankingJuegoDeCompeticion: TablaAlumnoJuegoDeCompeticion[] = [];
    let informacionAlumno: TablaAlumnoJuegoDeCompeticion[];
    // tslint:disable-next-line:prefer-for-oF
    for (let i = 0; i < listaAlumnosOrdenadaPorPuntos.length; i++) {
      let alumno: Alumno;
      const alumnoId = listaAlumnosOrdenadaPorPuntos[i].AlumnoId;
      alumno = alumnosDelJuego.filter(res => res.id === alumnoId)[0];
      rankingJuegoDeCompeticion[i] = new TablaAlumnoJuegoDeCompeticion(i + 1, alumno.Nombre, alumno.PrimerApellido, alumno.SegundoApellido,
        listaAlumnosOrdenadaPorPuntos[i].PuntosTotalesAlumno, alumnoId);
    }
    const individual = true;
    const informacionPartidos = this.ObtenerInformaciónPartidos(listaAlumnosOrdenadaPorPuntos, jornadasDelJuego,
      individual, enfrentamientosDelJuego);
    const rankingJuegoDeCompeticionFinal = this.RellenarTablaAlumnoJuegoDeCompeticion(rankingJuegoDeCompeticion, informacionPartidos);
    for (let i = 0; i < rankingJuegoDeCompeticionFinal.length; i++) {
      if (rankingJuegoDeCompeticionFinal[i].id === miAlumnoid) {
        informacionAlumno[0] = rankingJuegoDeCompeticionFinal[i];
      }
    }
    return informacionAlumno;
  }

  public PrepararTablaRankingIndividualLiga(listaAlumnosOrdenadaPorPuntos: AlumnoJuegoDeCompeticionLiga[],
                                            alumnosDelJuego: Alumno[], jornadasDelJuego: Jornada[],
                                            enfrentamientosDelJuego: EnfrentamientoLiga[][]): TablaAlumnoJuegoDeCompeticion[] {
    const rankingJuegoDeCompeticion: TablaAlumnoJuegoDeCompeticion[] = [];
    // tslint:disable-next-line:prefer-for-oF
    for (let i = 0; i < listaAlumnosOrdenadaPorPuntos.length; i++) {
      let alumno: Alumno;
      const alumnoId = listaAlumnosOrdenadaPorPuntos[i].AlumnoId;
      alumno = alumnosDelJuego.filter(res => res.id === alumnoId)[0];
      rankingJuegoDeCompeticion[i] = new TablaAlumnoJuegoDeCompeticion(i + 1, alumno.Nombre, alumno.PrimerApellido, alumno.SegundoApellido,
        listaAlumnosOrdenadaPorPuntos[i].PuntosTotalesAlumno, alumnoId);
    }
    const individual = true;
    const informacionPartidos = this.ObtenerInformaciónPartidos(listaAlumnosOrdenadaPorPuntos, jornadasDelJuego,
      individual, enfrentamientosDelJuego);
    const rankingJuegoDeCompeticionFinal = this.RellenarTablaAlumnoJuegoDeCompeticion(rankingJuegoDeCompeticion, informacionPartidos);
    return rankingJuegoDeCompeticionFinal;
  }

  public RellenarTablaAlumnoJuegoDeCompeticion(rankingJuegoDeCompeticion: TablaAlumnoJuegoDeCompeticion[],
                                               informacionPartidos: InformacionPartidosLiga[]): TablaAlumnoJuegoDeCompeticion[] {
    for (let cont = 0; cont < rankingJuegoDeCompeticion.length; cont++) {
      rankingJuegoDeCompeticion[cont].partidosTotales = informacionPartidos[cont].partidosTotales;
      rankingJuegoDeCompeticion[cont].partidosJugados = informacionPartidos[cont].partidosJugados;
      rankingJuegoDeCompeticion[cont].partidosGanados = informacionPartidos[cont].partidosGanados;
      rankingJuegoDeCompeticion[cont].partidosEmpatados = informacionPartidos[cont].partidosEmpatados;
      rankingJuegoDeCompeticion[cont].partidosPerdidos = informacionPartidos[cont].partidosPerdidos;
    }
    return rankingJuegoDeCompeticion;
  }

  public ObtenerInformaciónPartidos(listaParticipantesOrdenadaPorPuntos, jornadasDelJuego: Jornada[], individual: boolean,
                                    enfrentamientosDelJuego: Array<Array<EnfrentamientoLiga>>): InformacionPartidosLiga[] {
    this.informacionPartidos = [];
    const listaInformacionPartidos: InformacionPartidosLiga[] = [];
    const listaEnfrentamientosDelJuego: EnfrentamientoLiga[] = this.ObtenerListaEnfrentamientosDelJuego(jornadasDelJuego,
      enfrentamientosDelJuego);
    if (individual === false) {
      // tslint:disable-next-line:prefer-for-of
      for (let equipo = 0; equipo < listaParticipantesOrdenadaPorPuntos.length; equipo++) {
        const informacionPartido = new InformacionPartidosLiga(listaParticipantesOrdenadaPorPuntos[equipo].EquipoId, 0, 0, 0, 0, 0);
        informacionPartido.partidosTotales = this.CalcularPartidosTotales(listaEnfrentamientosDelJuego,
          listaParticipantesOrdenadaPorPuntos, equipo, individual);
        informacionPartido.partidosJugados = this.CalcularPartidosJugados(listaEnfrentamientosDelJuego,
          listaParticipantesOrdenadaPorPuntos, equipo, individual);
        informacionPartido.partidosGanados = this.CalcularPartidosGanados(listaEnfrentamientosDelJuego,
          listaParticipantesOrdenadaPorPuntos, equipo, individual);
        informacionPartido.partidosEmpatados = this.CalcularPartidosEmpatados(listaEnfrentamientosDelJuego,
          listaParticipantesOrdenadaPorPuntos, equipo, individual);
        informacionPartido.partidosPerdidos = this.CalcularPartidosPerdidos(listaEnfrentamientosDelJuego,
          listaParticipantesOrdenadaPorPuntos, equipo, individual);
        listaInformacionPartidos.push(informacionPartido);
      }
    } else if (individual === true) {
      // tslint:disable-next-line:prefer-for-of
      for (let alumno = 0; alumno < listaParticipantesOrdenadaPorPuntos.length; alumno++) {
        const informacionPartido = new InformacionPartidosLiga(listaParticipantesOrdenadaPorPuntos[alumno].AlumnoId, 0, 0, 0, 0, 0);
        informacionPartido.partidosTotales = this.CalcularPartidosTotales(listaEnfrentamientosDelJuego,
          listaParticipantesOrdenadaPorPuntos, alumno, individual);
        informacionPartido.partidosJugados = this.CalcularPartidosJugados(listaEnfrentamientosDelJuego,
          listaParticipantesOrdenadaPorPuntos, alumno, individual);
        informacionPartido.partidosGanados = this.CalcularPartidosGanados(listaEnfrentamientosDelJuego,
          listaParticipantesOrdenadaPorPuntos, alumno, individual);
        informacionPartido.partidosEmpatados = this.CalcularPartidosEmpatados(listaEnfrentamientosDelJuego,
          listaParticipantesOrdenadaPorPuntos, alumno, individual);
        informacionPartido.partidosPerdidos = this.CalcularPartidosPerdidos(listaEnfrentamientosDelJuego,
          listaParticipantesOrdenadaPorPuntos, alumno, individual);
        listaInformacionPartidos.push(informacionPartido);
      }
    }
    return listaInformacionPartidos;
  }

  public ObtenerListaEnfrentamientosDelJuego(jornadasDelJuego: Jornada[], enfrentamientosDelJuego: EnfrentamientoLiga[][]) {
    const listaEnfrentamientosDelJuego: EnfrentamientoLiga[] = [];
    for (let jornada = 0; jornada < jornadasDelJuego.length; jornada++) {
      // tslint:disable-next-line:prefer-for-of
      for (let enfrentamiento = 0; enfrentamiento < enfrentamientosDelJuego[jornada].length; enfrentamiento++) {
        listaEnfrentamientosDelJuego.push(enfrentamientosDelJuego[jornada][enfrentamiento]);
      }
    }
    return listaEnfrentamientosDelJuego;
  }

  public CalcularPartidosTotales(listaEnfrentamientosDelJuego: EnfrentamientoLiga[],
                                 listaParticipantesOrdenadaPorPuntos, participante: number, individual): number {
    let partidosTotales = 0;
    if (individual === false) {
      // tslint:disable-next-line:prefer-for-of
      for (let contEnfrentamiento = 0; contEnfrentamiento < listaEnfrentamientosDelJuego.length; contEnfrentamiento++) {
        if (listaParticipantesOrdenadaPorPuntos[participante].EquipoId === listaEnfrentamientosDelJuego[contEnfrentamiento].JugadorUno ||
          listaParticipantesOrdenadaPorPuntos[participante].EquipoId === listaEnfrentamientosDelJuego[contEnfrentamiento].JugadorDos) {
          partidosTotales++;
        }
      }
    } else if (individual === true) {
      // tslint:disable-next-line:prefer-for-of
      for (let contEnfrentamiento = 0; contEnfrentamiento < listaEnfrentamientosDelJuego.length; contEnfrentamiento++) {
        if (listaParticipantesOrdenadaPorPuntos[participante].AlumnoId === listaEnfrentamientosDelJuego[contEnfrentamiento].JugadorUno ||
          listaParticipantesOrdenadaPorPuntos[participante].AlumnoId === listaEnfrentamientosDelJuego[contEnfrentamiento].JugadorDos) {
          partidosTotales++;
        }
      }
    }
    return partidosTotales;
  }

  public CalcularPartidosJugados(listaEnfrentamientosDelJuego: EnfrentamientoLiga[],
                                 listaParticipantesOrdenadaPorPuntos, participante: number, individual): number {
    let partidosJugados = 0;
    if (individual === false) {
      // tslint:disable-next-line:prefer-for-of
      for (let contEnfrentamiento = 0; contEnfrentamiento < listaEnfrentamientosDelJuego.length; contEnfrentamiento++) {
        if (listaParticipantesOrdenadaPorPuntos[participante].EquipoId === listaEnfrentamientosDelJuego[contEnfrentamiento].JugadorUno ||
          listaParticipantesOrdenadaPorPuntos[participante].EquipoId === listaEnfrentamientosDelJuego[contEnfrentamiento].JugadorDos) {

          if (listaEnfrentamientosDelJuego[contEnfrentamiento].Ganador !== undefined) {
            partidosJugados++;
          }
        }
      }
    } else if (individual === true) {
      // tslint:disable-next-line:prefer-for-of
      for (let contEnfrentamiento = 0; contEnfrentamiento < listaEnfrentamientosDelJuego.length; contEnfrentamiento++) {
        if (listaParticipantesOrdenadaPorPuntos[participante].AlumnoId === listaEnfrentamientosDelJuego[contEnfrentamiento].JugadorUno ||
          listaParticipantesOrdenadaPorPuntos[participante].AlumnoId === listaEnfrentamientosDelJuego[contEnfrentamiento].JugadorDos) {

          if (listaEnfrentamientosDelJuego[contEnfrentamiento].Ganador !== undefined) {
            partidosJugados++;
          }
        }
      }
    }
    return partidosJugados;
  }

  public CalcularPartidosGanados(listaEnfrentamientosDelJuego: EnfrentamientoLiga[],
                                 listaEquiposOrdenadaPorPuntos, participante: number, individual): number {
    let partidosGanados = 0;
    if (individual === false) {
      // tslint:disable-next-line:prefer-for-of
      for (let contEnfrentamiento = 0; contEnfrentamiento < listaEnfrentamientosDelJuego.length; contEnfrentamiento++) {
        if (listaEquiposOrdenadaPorPuntos[participante].EquipoId === listaEnfrentamientosDelJuego[contEnfrentamiento].JugadorUno ||
          listaEquiposOrdenadaPorPuntos[participante].EquipoId === listaEnfrentamientosDelJuego[contEnfrentamiento].JugadorDos) {

          if (listaEquiposOrdenadaPorPuntos[participante].EquipoId === listaEnfrentamientosDelJuego[contEnfrentamiento].Ganador) {
            partidosGanados++;
          }
        }
      }
    } else if (individual === true) {
      // tslint:disable-next-line:prefer-for-of
      for (let contEnfrentamiento = 0; contEnfrentamiento < listaEnfrentamientosDelJuego.length; contEnfrentamiento++) {
        if (listaEquiposOrdenadaPorPuntos[participante].AlumnoId === listaEnfrentamientosDelJuego[contEnfrentamiento].JugadorUno ||
          listaEquiposOrdenadaPorPuntos[participante].AlumnoId === listaEnfrentamientosDelJuego[contEnfrentamiento].JugadorDos) {

          if (listaEquiposOrdenadaPorPuntos[participante].AlumnoId === listaEnfrentamientosDelJuego[contEnfrentamiento].Ganador) {
            partidosGanados++;
          }
        }
      }
    }
    return partidosGanados;
  }

  public CalcularPartidosEmpatados(listaEnfrentamientosDelJuego: EnfrentamientoLiga[],
                                   listaParticipantesOrdenadaPorPuntos,
                                   participante: number, individual): number {
    let partidosEmpatados = 0;
    if (individual === false) {
      // tslint:disable-next-line:prefer-for-of
      for (let contEnfrentamiento = 0; contEnfrentamiento < listaEnfrentamientosDelJuego.length; contEnfrentamiento++) {
        if (listaParticipantesOrdenadaPorPuntos[participante].EquipoId === listaEnfrentamientosDelJuego[contEnfrentamiento].JugadorUno ||
          listaParticipantesOrdenadaPorPuntos[participante].EquipoId === listaEnfrentamientosDelJuego[contEnfrentamiento].JugadorDos) {

          if (listaEnfrentamientosDelJuego[contEnfrentamiento].Ganador === 0) {
            partidosEmpatados++;
          }
        }
      }
    } else if (individual === true) {
      // tslint:disable-next-line:prefer-for-of
      for (let contEnfrentamiento = 0; contEnfrentamiento < listaEnfrentamientosDelJuego.length; contEnfrentamiento++) {
        if (listaParticipantesOrdenadaPorPuntos[participante].AlumnoId === listaEnfrentamientosDelJuego[contEnfrentamiento].JugadorUno ||
          listaParticipantesOrdenadaPorPuntos[participante].AlumnoId === listaEnfrentamientosDelJuego[contEnfrentamiento].JugadorDos) {

          if (listaEnfrentamientosDelJuego[contEnfrentamiento].Ganador === 0) {
            partidosEmpatados++;
          }
        }
      }
    }
    return partidosEmpatados;
  }

  public CalcularPartidosPerdidos(listaEnfrentamientosDelJuego: EnfrentamientoLiga[],
                                  listaParticipantesOrdenadaPorPuntos, contEquipo: number, individual): number {
    let partidosPerdidos = 0;
    if (individual === false) {
      // tslint:disable-next-line:prefer-for-of
      for (let contEnfrentamiento = 0; contEnfrentamiento < listaEnfrentamientosDelJuego.length; contEnfrentamiento++) {
        if (listaParticipantesOrdenadaPorPuntos[contEquipo].EquipoId === listaEnfrentamientosDelJuego[contEnfrentamiento].JugadorUno ||
          listaParticipantesOrdenadaPorPuntos[contEquipo].EquipoId === listaEnfrentamientosDelJuego[contEnfrentamiento].JugadorDos) {

          if ((listaEnfrentamientosDelJuego[contEnfrentamiento].Ganador !== 0 &&
            listaEnfrentamientosDelJuego[contEnfrentamiento].Ganador !== undefined) &&
            listaEnfrentamientosDelJuego[contEnfrentamiento].Ganador !== listaParticipantesOrdenadaPorPuntos[contEquipo].EquipoId) {
            partidosPerdidos++;
          }
        }
      }
    } else if (individual === true) {
      // tslint:disable-next-line:prefer-for-of
      for (let contEnfrentamiento = 0; contEnfrentamiento < listaEnfrentamientosDelJuego.length; contEnfrentamiento++) {
        if (listaParticipantesOrdenadaPorPuntos[contEquipo].AlumnoId === listaEnfrentamientosDelJuego[contEnfrentamiento].JugadorUno ||
          listaParticipantesOrdenadaPorPuntos[contEquipo].AlumnoId === listaEnfrentamientosDelJuego[contEnfrentamiento].JugadorDos) {

          if ((listaEnfrentamientosDelJuego[contEnfrentamiento].Ganador !== 0 &&
            listaEnfrentamientosDelJuego[contEnfrentamiento].Ganador !== undefined) &&
            listaEnfrentamientosDelJuego[contEnfrentamiento].Ganador !== listaParticipantesOrdenadaPorPuntos[contEquipo].AlumnoId) {
            partidosPerdidos++;
          }
        }
      }
    }
    return partidosPerdidos;
  }

  public ConstruirTablaEnfrentamientos(EnfrentamientosJornadaSeleccionada: EnfrentamientoLiga[],
                                       listaAlumnosClasificacion: TablaAlumnoJuegoDeCompeticion[],
                                       listaEquiposClasificacion: TablaEquipoJuegoDeCompeticion[],
                                       juegoSeleccionado: Juego) {
    if (juegoSeleccionado.Modo === 'Individual') {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < EnfrentamientosJornadaSeleccionada.length; i++) {
        // tslint:disable-next-line:prefer-for-of
        for (let j = 0; j < listaAlumnosClasificacion.length; j++) {
          if (EnfrentamientosJornadaSeleccionada[i].JugadorUno === listaAlumnosClasificacion[j].id) {
            EnfrentamientosJornadaSeleccionada[i].nombreJugadorUno = listaAlumnosClasificacion[j].nombre + ' ' +
              listaAlumnosClasificacion[j].primerApellido + ' ' +
              listaAlumnosClasificacion[j].segundoApellido;
            if (EnfrentamientosJornadaSeleccionada[i].Ganador === listaAlumnosClasificacion[j].id) {
              EnfrentamientosJornadaSeleccionada[i].nombreGanador = listaAlumnosClasificacion[j].nombre + ' ' +
                listaAlumnosClasificacion[j].primerApellido + ' ' +
                listaAlumnosClasificacion[j].segundoApellido;
            } else if (EnfrentamientosJornadaSeleccionada[i].Ganador === 0) {
              EnfrentamientosJornadaSeleccionada[i].nombreGanador = 'Empate';
            } else if (EnfrentamientosJornadaSeleccionada[i].Ganador === undefined) {
              EnfrentamientosJornadaSeleccionada[i].nombreGanador = '-';
            }
          } else if (EnfrentamientosJornadaSeleccionada[i].JugadorDos === listaAlumnosClasificacion[j].id) {
            EnfrentamientosJornadaSeleccionada[i].nombreJugadorDos = listaAlumnosClasificacion[j].nombre + ' ' +
              listaAlumnosClasificacion[j].primerApellido + ' ' +
              listaAlumnosClasificacion[j].segundoApellido;
            if (EnfrentamientosJornadaSeleccionada[i].Ganador === listaAlumnosClasificacion[j].id) {
              EnfrentamientosJornadaSeleccionada[i].nombreGanador = listaAlumnosClasificacion[j].nombre + ' ' +
                listaAlumnosClasificacion[j].primerApellido + ' ' +
                listaAlumnosClasificacion[j].segundoApellido;
            } else if (EnfrentamientosJornadaSeleccionada[i].Ganador === 0) {
              EnfrentamientosJornadaSeleccionada[i].nombreGanador = 'Empate';
            } else if (EnfrentamientosJornadaSeleccionada[i].Ganador === undefined) {
              EnfrentamientosJornadaSeleccionada[i].nombreGanador = '-';
            }
          }
        }
      }

    } else {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < EnfrentamientosJornadaSeleccionada.length; i++) {
        // tslint:disable-next-line:prefer-for-of
        for (let j = 0; j < listaEquiposClasificacion.length; j++) {
          if (EnfrentamientosJornadaSeleccionada[i].JugadorUno === listaEquiposClasificacion[j].id) {
            EnfrentamientosJornadaSeleccionada[i].nombreJugadorUno = listaEquiposClasificacion[j].nombre;
            if (EnfrentamientosJornadaSeleccionada[i].Ganador === listaEquiposClasificacion[j].id) {
              EnfrentamientosJornadaSeleccionada[i].nombreGanador = listaEquiposClasificacion[j].nombre;
            } else if (EnfrentamientosJornadaSeleccionada[i].Ganador === 0) {
              EnfrentamientosJornadaSeleccionada[i].nombreGanador = 'Empate';
            } else if (EnfrentamientosJornadaSeleccionada[i].Ganador === undefined) {
              EnfrentamientosJornadaSeleccionada[i].nombreGanador = '-';
            }
          } else if (EnfrentamientosJornadaSeleccionada[i].JugadorDos === listaEquiposClasificacion[j].id) {
            EnfrentamientosJornadaSeleccionada[i].nombreJugadorDos = listaEquiposClasificacion[j].nombre;
            if (EnfrentamientosJornadaSeleccionada[i].Ganador === listaEquiposClasificacion[j].id) {
              EnfrentamientosJornadaSeleccionada[i].nombreGanador = listaEquiposClasificacion[j].nombre;
            } else if (EnfrentamientosJornadaSeleccionada[i].Ganador === 0) {
              EnfrentamientosJornadaSeleccionada[i].nombreGanador = 'Empate';
            } else if (EnfrentamientosJornadaSeleccionada[i].Ganador === undefined) {
              EnfrentamientosJornadaSeleccionada[i].nombreGanador = '-';
            }
          }
        }
      }
    }
    return EnfrentamientosJornadaSeleccionada;
  }

  public JornadaFinalizada(juegoSeleccionado: Juego, jornadaSeleccionada: TablaJornadas) {
    let jornadaFinalizada = false;
    if (jornadaSeleccionada.Disputada === true) {
      jornadaFinalizada = true;
    }
    return jornadaFinalizada;
  }

  public GenerarTablaJornadasLiga(juegoSeleccionado, jornadas, enfrentamientosJuego: EnfrentamientoLiga[][]) {
    const TablaJornada: TablaJornadas[] = [];
    for (let i = 0; i < jornadas.length; i++) {
      let jornada: Jornada;
      const jornadaId = jornadas[i].id;
      jornada = jornadas.filter(res => res.id === jornadaId)[0];
      const enfrentamientosJornada: EnfrentamientoLiga[] = [];
      enfrentamientosJuego[i].forEach(enfrentamientoDeLaJornada => {
        if (enfrentamientoDeLaJornada.JornadaDeCompeticionLigaId === jornadaId) {
          enfrentamientosJornada.push(enfrentamientoDeLaJornada);
        }
      });
      const Disputada: boolean = this.JornadaFinalizadaLiga(jornada, enfrentamientosJornada);
      TablaJornada[i] = new TablaJornadas(i + 1, jornada.Fecha, jornada.CriterioGanador, jornada.id, undefined, undefined, Disputada);
    }
    return TablaJornada;
  }

  public JornadaFinalizadaLiga(jornadaSeleccionada: Jornada, EnfrentamientosJornada: EnfrentamientoLiga[]) {
    let HayGanador = true;
    let jornadaFinalizada = true;
    if (jornadaSeleccionada.id === EnfrentamientosJornada[0].JornadaDeCompeticionLigaId) {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < EnfrentamientosJornada.length; i++) {
        if (EnfrentamientosJornada[i].Ganador === undefined) {
          HayGanador = false;
        }
      }
      if (HayGanador === false) {
        jornadaFinalizada = false;
      }
    }
    return jornadaFinalizada;
  }

  //////////////////////////////////////// JUEGO DE COMPETICIÓN FÓRUMULA UNO ///////////////////////////////////
  public PrepararTablaRankingIndividualFormulaUno(listaAlumnosOrdenadaPorPuntos: AlumnoJuegoDeCompeticionFormulaUno[],
                                                  alumnosDelJuego: Alumno[]): TablaAlumnoJuegoDeCompeticion[] {
    const rankingJuegoDeCompeticion: TablaAlumnoJuegoDeCompeticion[] = [];
    // tslint:disable-next-line:prefer-for-oF
    for (let i = 0; i < listaAlumnosOrdenadaPorPuntos.length; i++) {
      let alumno: Alumno;
      const alumnoId = listaAlumnosOrdenadaPorPuntos[i].AlumnoId;
      alumno = alumnosDelJuego.filter(res => res.id === alumnoId)[0];
      rankingJuegoDeCompeticion[i] = new TablaAlumnoJuegoDeCompeticion(i + 1, alumno.Nombre, alumno.PrimerApellido, alumno.SegundoApellido,
        listaAlumnosOrdenadaPorPuntos[i].PuntosTotalesAlumno, alumnoId);
    }
    return rankingJuegoDeCompeticion;
  }

  public PrepararTablaRankingEquipoFormulaUno(listaEquiposOrdenadaPorPuntos: EquipoJuegoDeCompeticionFormulaUno[],
                                              equiposDelJuego: Equipo[]) {
    const rankingJuegoDeCompeticion: TablaEquipoJuegoDeCompeticion[] = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < listaEquiposOrdenadaPorPuntos.length; i++) {
      let equipo: Equipo;
      const EquipoId = listaEquiposOrdenadaPorPuntos[i].EquipoId;
      equipo = equiposDelJuego.filter(res => res.id === EquipoId)[0];
      rankingJuegoDeCompeticion[i] = new TablaEquipoJuegoDeCompeticion(i + 1, equipo.Nombre,
        listaEquiposOrdenadaPorPuntos[i].PuntosTotalesEquipo, EquipoId);
    }
    return rankingJuegoDeCompeticion;
  }

  // Clasificación F1
  public ClasificacionJornada(juegoSeleccionado: Juego, alumnoJuegoDeCompeticionFormulaUno: TablaAlumnoJuegoDeCompeticion[],
                              equipoJuegoDeCompeticionFormulaUno: TablaEquipoJuegoDeCompeticion[], GanadoresFormulaUno: string[],
                              GanadoresFormulaUnoId: number[]) {
    const ParticipantesFormulaUno: string[] = [];
    const PuntosFormulaUno: number[] = [];
    const Posicion: number[] = [];
    const ParticipantesId: number[] = [];
    if (GanadoresFormulaUno !== undefined) {
      GanadoresFormulaUno.forEach(ganador => ParticipantesFormulaUno.push(ganador));
      juegoSeleccionado.Puntos.forEach(punto => {
        PuntosFormulaUno.push(punto);
      });
      // const PuntosFormulaUno: number[] = juegoSeleccionado.Puntos;
      if (juegoSeleccionado.Modo === 'Individual') {
        alumnoJuegoDeCompeticionFormulaUno.forEach(a => {
          const ParticipanteFormulaUno = a.nombre + ' ' + a.primerApellido + ' ' + a.segundoApellido;
          const ParticipanteId = a.id;
          const indexNoGanador = GanadoresFormulaUno.indexOf(ParticipanteFormulaUno);
          if (indexNoGanador === -1) {
            ParticipantesFormulaUno.push(ParticipanteFormulaUno);
            PuntosFormulaUno.push(0);
            ParticipantesId.push(ParticipanteId);
          }
        });
        for (let j = 0; j < ParticipantesFormulaUno.length; j++) {
          Posicion[j] = j + 1;
        }
      } else {
        equipoJuegoDeCompeticionFormulaUno.forEach(a => {
          const ParticipanteFormulaUno = a.nombre;
          const ParticipanteId = a.id;
          const indexNoGanador = GanadoresFormulaUno.indexOf(ParticipanteFormulaUno);
          if (indexNoGanador === -1) {
            ParticipantesFormulaUno.push(ParticipanteFormulaUno);
            PuntosFormulaUno.push(0);
            ParticipantesId.push(ParticipanteId);
          }
        });
        for (let j = 0; j < ParticipantesFormulaUno.length; j++) {
          Posicion[j] = j + 1;
        }
      }
    } else {
      if (juegoSeleccionado.Modo === 'Individual') {
        alumnoJuegoDeCompeticionFormulaUno.forEach(a => {
          const ParticipanteFormulaUno = a.nombre + ' ' + a.primerApellido + ' ' + a.segundoApellido;
          const ParticipanteId = a.id;
          ParticipantesFormulaUno.push(ParticipanteFormulaUno);
          PuntosFormulaUno.push(0);
          ParticipantesId.push(ParticipanteId);
        });
        for (let j = 0; j < ParticipantesFormulaUno.length; j++) {
          Posicion[j] = j + 1;
        }
      } else {
        equipoJuegoDeCompeticionFormulaUno.forEach(a => {
          const ParticipanteFormulaUno = a.nombre;
          const ParticipanteId = a.id;
          ParticipantesFormulaUno.push(ParticipanteFormulaUno);
          PuntosFormulaUno.push(0);
          ParticipantesId.push(ParticipanteId);
        });
        for (let j = 0; j < ParticipantesFormulaUno.length; j++) {
          Posicion[j] = j + 1;
        }
      }
    }
    const datosClasificaciónJornada = {
      participante: ParticipantesFormulaUno,
      puntos: PuntosFormulaUno,
      posicion: Posicion,
      participanteId: ParticipantesId
    };
    return datosClasificaciónJornada;
  }

  // Preparamos la tabla de la competicion f1
  public PrepararTablaRankingJornadaFormulaUno(datosClasificacionJornadaSeleccionada: {
    participante: string[];
    puntos: number[];
    posicion: number[];
    participanteId: number[]
  }) {
    const rankingJornadaFormulaUno: TablaClasificacionJornada[] = [];
    for (let i = 0; i < datosClasificacionJornadaSeleccionada.participante.length; i++) {
      rankingJornadaFormulaUno[i] = new TablaClasificacionJornada(datosClasificacionJornadaSeleccionada.participante[i],
        datosClasificacionJornadaSeleccionada.puntos[i],
        datosClasificacionJornadaSeleccionada.posicion[i],
        datosClasificacionJornadaSeleccionada.participanteId[i]);
    }
    return rankingJornadaFormulaUno;
  }

  public GenerarTablaJornadasF1(juegoSeleccionado, jornadas, alumnoJuegoDeCompeticionFormulaUno,
                                equipoJuegoDeCompeticionFormulaUno) {

    const TablaJornada: TablaJornadas[] = [];
    for (let i = 0; i < juegoSeleccionado.NumeroTotalJornadas; i++) {
      let jornada: Jornada;
      const jornadaId = jornadas[i].id;
      jornada = jornadas.filter(res => res.id === jornadaId)[0];

      if (juegoSeleccionado.Tipo === 'Juego De Competición Fórmula Uno') {

        if (jornada.Fecha === undefined && jornada.GanadoresFormulaUno === undefined) {
          const Disputada = false;
          TablaJornada[i] = new TablaJornadas(i + 1, jornada.Fecha, jornada.CriterioGanador, jornada.id, undefined, undefined, Disputada);

        } else if (jornada.Fecha === undefined && jornada.GanadoresFormulaUno !== undefined) {
          const GanadoresFormulaUno = this.ObtenerNombreGanadoresFormulaUno(juegoSeleccionado, jornada, alumnoJuegoDeCompeticionFormulaUno,
            equipoJuegoDeCompeticionFormulaUno);
          const Disputada = true;
          TablaJornada[i] = new TablaJornadas(i + 1, jornada.Fecha, jornada.CriterioGanador, jornada.id, GanadoresFormulaUno.nombre,
            GanadoresFormulaUno.id, Disputada);

        } else if (jornada.Fecha !== undefined && jornada.GanadoresFormulaUno === undefined) {
          const Disputada = false;
          TablaJornada[i] = new TablaJornadas(i + 1, jornada.Fecha, jornada.CriterioGanador, jornada.id,
            undefined, undefined, Disputada);

        } else {
          const GanadoresFormulaUno = this.ObtenerNombreGanadoresFormulaUno(juegoSeleccionado, jornada,
            alumnoJuegoDeCompeticionFormulaUno,
            equipoJuegoDeCompeticionFormulaUno);
          const Disputada = true;
          TablaJornada[i] = new TablaJornadas(i + 1, jornada.Fecha, jornada.CriterioGanador, jornada.id, GanadoresFormulaUno.nombre,
            GanadoresFormulaUno.id, Disputada);
        }
      }
    }
    return (TablaJornada);
  }

  public ObtenerNombreGanadoresFormulaUno(juegoSeleccionado: Juego, jornada, alumnoJuegoDeCompeticionFormulaUno,
                                          equipoJuegoDeCompeticionFormulaUno) {
    const GanadoresFormulaUno: {
      nombre: string[]
      id: number[]
    } = { nombre: [], id: [] };
    GanadoresFormulaUno.nombre = [];
    GanadoresFormulaUno.id = jornada.GanadoresFormulaUno;
    if (juegoSeleccionado.Modo === 'Individual') {
      for (let j = 0; j < GanadoresFormulaUno.id.length; j++) {
        // tslint:disable-next-line:prefer-for-of
        for (let k = 0; k < alumnoJuegoDeCompeticionFormulaUno.length; k++) {
          if (GanadoresFormulaUno.id[j] === alumnoJuegoDeCompeticionFormulaUno[k].id) {
            GanadoresFormulaUno.nombre[j] = alumnoJuegoDeCompeticionFormulaUno[k].nombre + ' '
              + alumnoJuegoDeCompeticionFormulaUno[k].primerApellido + ' '
              + alumnoJuegoDeCompeticionFormulaUno[k].segundoApellido;
          }
        }
      }
      return GanadoresFormulaUno;
    } else {
      for (let j = 0; j < GanadoresFormulaUno.id.length; j++) {
        // tslint:disable-next-line:prefer-for-of
        for (let k = 0; k < equipoJuegoDeCompeticionFormulaUno.length; k++) {
          if (GanadoresFormulaUno.id[j] === equipoJuegoDeCompeticionFormulaUno[k].id) {
            GanadoresFormulaUno.nombre[j] = equipoJuegoDeCompeticionFormulaUno[k].nombre;
          }
        }
      }
      return GanadoresFormulaUno;
    }
  }
  public DameAlumnosJuegoDeGeocaching(juegoId: number): MiAlumnoAMostrarJuegoDeGeocaching[] {
    let InformacionAlumno: MiAlumnoAMostrarJuegoDeGeocaching[] = [];
    this.peticionesAPI.DameAlumnosJuegoDeGeocaching(juegoId).subscribe(
      listaAlumnos => {
        for ( let i = 0; i < (listaAlumnos.length); i++) {
          const MiAlumno = new MiAlumnoAMostrarJuegoDeGeocaching();
          MiAlumno.Nombre = listaAlumnos[i].Nombre;
          MiAlumno.PrimerApellido = listaAlumnos[i].PrimerApellido;
          MiAlumno.ImagenPerfil = listaAlumnos[i].ImagenPerfil;
          this.peticionesAPI.DameInscripcionAlumnoJuegoDeGeocaching( listaAlumnos[i].id, juegoId).subscribe(
            Inscripcion => {
              MiAlumno.Puntuacion = Inscripcion[0].Puntuacion;

              MiAlumno.Etapa = Inscripcion[0].Etapa;

              MiAlumno.alumnoId = Inscripcion[0].alumnoId;
              MiAlumno.id = Inscripcion[0].id;
              MiAlumno.juegoDeGeocachingId = Inscripcion[0].juegoDeGeocachingId;
            });
          InformacionAlumno.push(MiAlumno);
        }

        InformacionAlumno = InformacionAlumno.sort((a, b) => {

          return b.Puntuacion - a.Puntuacion;
        });
    });
    return InformacionAlumno;
  }

  public DameListaAlumnosJuegoGeocachingOrdenada(juegoDeGeocachingId: number): MiAlumnoAMostrarJuegoDeGeocaching[] {

    const InformacionAlumno: MiAlumnoAMostrarJuegoDeGeocaching[] = [];

    let Inscripciones: AlumnoJuegoDeGeocaching[] = [];
    this.peticionesAPI.ListaInscripcionesAlumnosJuegoDeGeocaching(juegoDeGeocachingId).subscribe(res => {
      Inscripciones = res;
      Inscripciones = Inscripciones.sort(function(a, b) {
        return b.Puntuacion - a.Puntuacion;
      });
      for (let i = 0; i < (Inscripciones.length); i++) {
        const MiAlumno = new MiAlumnoAMostrarJuegoDeGeocaching();
        MiAlumno.Puntuacion = Inscripciones[i].Puntuacion;
        MiAlumno.Etapa = Inscripciones[i].Etapa;
        MiAlumno.alumnoId = Inscripciones[i].alumnoId;
        MiAlumno.id = Inscripciones[i].id;
        MiAlumno.juegoDeGeocachingId = Inscripciones[i].juegoDeGeocachingId;
        this.peticionesAPI.DameAlumnoConId (MiAlumno.alumnoId)
        .subscribe (res => {
          MiAlumno.Nombre = res.Nombre;
          MiAlumno.PrimerApellido = res.PrimerApellido;
          MiAlumno.ImagenPerfil = res.ImagenPerfil;
        });

        InformacionAlumno.push(MiAlumno);

      }
    });
    return InformacionAlumno;
  }

  public DamePreguntasJuegoDeGeocaching(PreguntasId: number[]): any {
    const preguntasObservable = new Observable(obs => {

      let contador = 0;
      const preguntas: Pregunta[] = [];
      for (let i = 0; i < (PreguntasId.length); i++) {
      this.peticionesAPI.DamePreguntas(PreguntasId[i])
      .subscribe (res => {
        preguntas.push(res);
        contador = contador + 1;
        if (contador ===  PreguntasId.length) {
          obs.next(preguntas);
        }
      });

    }
  });
    return preguntasObservable;
  }


  public DameEquipoAlumnoEnJuegoDeColeccion(alumnoId: number, juegoId: number): any {
    const equipoObservable = new Observable(obs => {
      // primero traigo los equipos que participan en el juego
      this.peticionesAPI.DameEquiposJuegoDeColeccion (juegoId)
      .subscribe (equiposJuego => {
        // ahora traigo los equipos a los que pertenece el alumno
        this.peticionesAPI.DameEquiposDelAlumno (alumnoId)
        .subscribe (equiposAlumno => {
          // ahora miro cual es el equipo que está en ambas listas
          const equipo = equiposAlumno.filter(e => equiposJuego.some(a => a.id === e.id))[0];
          obs.next (equipo);
        });

      });

    });
    return equipoObservable;
  }


  public DameListaJuegos(grupoID: number): any {
    const listasObservables = new Observable ( obs => {

      const juegosActivos: any[] = [];
      const juegosInactivos: any[] = [];
      const juegosPreparados: any[] = [];
      let juegos: any[];

      this.peticionesAPI.DameJuegoDePuntosGrupo(grupoID)
      .subscribe(juegosPuntos => {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < juegosPuntos.length; i++) {
          if (juegosPuntos[i].JuegoActivo === true) {
            juegosActivos.push(juegosPuntos[i]);
          } else {
            juegosInactivos.push(juegosPuntos[i]);
          }
        }
        // Ahora vamos apor por los juegos de colección
        this.peticionesAPI.DameJuegoDeColeccionGrupo(grupoID)
        .subscribe(juegosColeccion => {
          // tslint:disable-next-line:prefer-for-of
          for (let i = 0; i < juegosColeccion.length; i++) {
            if (juegosColeccion[i].JuegoActivo === true) {
              juegosActivos.push(juegosColeccion[i]);
            } else {
              juegosInactivos.push(juegosColeccion[i]);
            }
          }
          // Ahora vamos a por los juegos de competición
          this.peticionesAPI.DameJuegoDeCompeticionLigaGrupo(grupoID)
          .subscribe(juegosCompeticion => {
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < juegosCompeticion.length; i++) {
              if (juegosCompeticion[i].JuegoActivo === true) {
                juegosActivos.push(juegosCompeticion[i]);
              } else {
                juegosInactivos.push(juegosCompeticion[i]);
              }
            }
            // ahora toca los juegos de competicion de formula uno
            this.peticionesAPI.DameJuegoDeCompeticionFormulaUnoGrupo(grupoID)
            .subscribe(juegosCompeticionFormulaUno => {
              // tslint:disable-next-line:prefer-for-of
              for (let i = 0; i < juegosCompeticionFormulaUno.length; i++) {
                if (juegosCompeticionFormulaUno[i].JuegoActivo === true) {
                  juegosActivos.push(juegosCompeticionFormulaUno[i]);
                } else {
                  juegosInactivos.push(juegosCompeticionFormulaUno[i]);
                }
              }

              this.peticionesAPI.DameJuegoDeAvatarGrupo(grupoID)
              .subscribe(juegosAvatar => {
                // tslint:disable-next-line:prefer-for-of
                for (let i = 0; i < juegosAvatar.length; i++) {
                  if (juegosAvatar[i].JuegoActivo === true) {
                    juegosActivos.push(juegosAvatar[i]);
                  } else {
                    juegosInactivos.push(juegosAvatar[i]);
                  }
                }
                // Ahora recogemos los juegos de cuestionario
                this.peticionesAPI.DameJuegoDeCuestionario(grupoID)
                .subscribe(juegosCuestionario => {
                  // tslint:disable-next-line:prefer-for-of
                  for (let i = 0; i < juegosCuestionario.length; i++) {
                    if (juegosCuestionario[i].JuegoActivo === true) {
                      juegosCuestionario[i].Tipo = 'Juego De Cuestionario';
                      juegosActivos.push(juegosCuestionario[i]);
                    } else if (juegosCuestionario[i].JuegoTerminado === false && juegosCuestionario[i].JuegoActivo === false) {
                      juegosCuestionario[i].Tipo = 'Juego De Cuestionario';
                      juegosPreparados.push(juegosCuestionario[i]);
                    } else if (juegosCuestionario[i].JuegoTerminado === true) {
                      juegosCuestionario[i].Tipo = 'Juego De Cuestionario';
                      juegosInactivos.push(juegosCuestionario[i]);
                    }
                  }

                  this.peticionesAPI.DameJuegoDeGeocaching(grupoID)
                  .subscribe(juegosGeocaching => {
                    // tslint:disable-next-line:prefer-for-of
                    for (let i = 0; i < juegosGeocaching.length; i++) {
                      if (juegosGeocaching[i].JuegoActivo === true) {
                        juegosGeocaching[i].Tipo = 'Juego De Geocaching';
                        juegosActivos.push(juegosGeocaching[i]);
                      } else if (juegosGeocaching[i].JuegoTerminado === false && juegosGeocaching[i].JuegoActivo === false) {
                        juegosGeocaching[i].Tipo = 'Juego De Geocaching';
                        juegosPreparados.push(juegosGeocaching[i]);
                      } else if (juegosGeocaching[i].JuegoTerminado === true) {
                        juegosGeocaching[i].Tipo = 'Juego De Geocaching';
                        juegosInactivos.push(juegosGeocaching[i]);
                      }
                    }
                    this.peticionesAPI.DameJuegosDeVotacionUnoATodos(grupoID)
                      .subscribe(juegosVotacionUnoATodos => {
                      // tslint:disable-next-line:prefer-for-of
                      for (let i = 0; i < juegosVotacionUnoATodos.length; i++) {
                        if (juegosVotacionUnoATodos[i].JuegoActivo === true) {
                          juegosVotacionUnoATodos[i].Tipo = 'Juego De Votación Uno A Todos';
                          juegosActivos.push(juegosVotacionUnoATodos[i]);
                        } else {
                          juegosVotacionUnoATodos[i].Tipo = 'Juego De Votación Uno A Todos';
                          juegosInactivos.push(juegosVotacionUnoATodos[i]);
                        }
                      }
                      this.peticionesAPI.DameJuegosDeVotacionTodosAUno(grupoID)
                        .subscribe(juegosVotacioTodosAUno => {
                        // tslint:disable-next-line:prefer-for-of
                        for (let i = 0; i < juegosVotacioTodosAUno.length; i++) {
                          if (juegosVotacioTodosAUno[i].JuegoActivo === true) {
                            juegosVotacioTodosAUno[i].Tipo = 'Juego De Votación Todos A Uno';
                            juegosActivos.push(juegosVotacioTodosAUno[i]);
                          } else {
                            juegosVotacioTodosAUno[i].Tipo = 'Juego De Votación Todos A Uno';
                            juegosInactivos.push(juegosVotacioTodosAUno[i]);
                          }
                        }
                        this.peticionesAPI.DameJuegosDeCuestionarioSatisfaccion(grupoID)
                          .subscribe(juegosCuestionarioSatisfaccion => {
                          // tslint:disable-next-line:prefer-for-of
                          for (let i = 0; i < juegosCuestionarioSatisfaccion.length; i++) {
                            if (juegosCuestionarioSatisfaccion[i].JuegoActivo === true) {
                              juegosActivos.push(juegosCuestionarioSatisfaccion[i]);
                            } else {
                              juegosInactivos.push(juegosCuestionarioSatisfaccion[i]);
                            }
                          }
                        //Control de trabajo
                        this.peticionesAPI.DameJuegosDeControlDeTrabajoEnEquipo(grupoID)
                        .subscribe(juegosControlGrupo => {
                          // tslint:disable-next-line:prefer-for-of
                          for (let i = 0; i < juegosControlGrupo .length; i++) {
                            if (juegosControlGrupo [i].JuegoActivo === true) {
                              juegosActivos.push(juegosControlGrupo [i]);
                            } else {
                              juegosInactivos.push(juegosControlGrupo[i]);
                            }
                        }

                          const resultado = { activos: juegosActivos, inactivos: juegosInactivos, preparados: juegosPreparados};
                          obs.next (resultado);
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

    return listasObservables;
  }


  // tslint:disable-next-line:max-line-length
  public PrepararTablaRankingCuestionario(listaAlumnosOrdenadaPorPuntos: AlumnoJuegoDeCuestionario[], alumnosDelJuego: Alumno[]): TablaAlumnoJuegoDeCuestionario[] {
      const rankingJuegoDeCompeticion: TablaAlumnoJuegoDeCuestionario [] = [];
      // tslint:disable-next-line:prefer-for-oF
      for (let i = 0; i < listaAlumnosOrdenadaPorPuntos.length; i++) {
        let alumno: Alumno;
        const alumnoId = listaAlumnosOrdenadaPorPuntos[i].alumnoId;
        alumno = alumnosDelJuego.filter(res => res.id === alumnoId)[0];
        rankingJuegoDeCompeticion[i] = new TablaAlumnoJuegoDeCuestionario(alumno.Nombre, alumno.PrimerApellido, alumno.SegundoApellido,
        // tslint:disable-next-line:max-line-length
        listaAlumnosOrdenadaPorPuntos[i].Nota, listaAlumnosOrdenadaPorPuntos[i].Contestado, alumnoId, listaAlumnosOrdenadaPorPuntos[i].TiempoEmpleado);
      }
      return rankingJuegoDeCompeticion;
  }
  public JornadaF1TieneGanadores(jornadaId: number, jornadasDelJuego: Jornada[]) {
    let jornadaTieneGanadores = false;
    jornadasDelJuego.forEach(jornada => {
      if (jornada.id === Number(jornadaId) && jornada.GanadoresFormulaUno !== undefined) {
        jornadaTieneGanadores = true;
      }
    });
    return jornadaTieneGanadores;
  }

  public AsignarResultadosJornadaF1(juego: Juego, jornada: Jornada, participantesPuntuan: number[]) {

    const puntuacionesDelJuego = juego.Puntos;
    if (participantesPuntuan.length === puntuacionesDelJuego.length) {

      // Si la jornada no tenía ganadores (en principio tadas las jornadas que llegan a esta función es porque no tenían ganadores)
      // --> actualizar jornada con los ganadores seleccionados y actualizar puntos de los particupantes
      if (jornada.GanadoresFormulaUno === undefined) {

        // Actualizamos el ganador en JornadaDeCompeticionFormulaUno
        this.GuardarGanadorJornada(jornada, participantesPuntuan);

        // Actualizamos los puntos de los participantes
        for (let indexParticipantesPuntuan = 0; indexParticipantesPuntuan < participantesPuntuan.length; indexParticipantesPuntuan++) {

          this.ActualizarPuntosParticipantesJornada(juego, participantesPuntuan[indexParticipantesPuntuan],
                                                    puntuacionesDelJuego[indexParticipantesPuntuan]);
        }

      } else {  // el enfrentamiento tenía ganadores
        console.log('Esta jornada ya tiene ganadores asignados');
      }

      // // Mensaje sweetalert
      // const Mensaje = this.MensajeSweetalertF1();
    } else {
      console.log('Se ha producido algún error: participantesPuntuan.length !== puntuacionesDelJuego.length');
    }
  }

  GuardarGanadorJornada(jornada: Jornada, participantesPuntuan: number[]) {
    const jornadaActualizada: Jornada = jornada;
    jornadaActualizada.GanadoresFormulaUno = participantesPuntuan;
    this.peticionesAPI.PonGanadoresJornadasDeCompeticionFormulaUno(jornadaActualizada)
    .subscribe(res => {
      console.log(res);
    });
  }
  ActualizarPuntosParticipantesJornada(juego: Juego, participantePuntua: number, puntuacionDelParticipantePuntua: number) {

    if (juego.Modo === 'Individual') {
      let alumnoPuntua: AlumnoJuegoDeCompeticionFormulaUno;
      this.peticionesAPI.DameInscripcionesAlumnoJuegoDeCompeticionFormulaUno(juego.id)
      .subscribe(alumnosJuegoF1 => {
        alumnoPuntua = alumnosJuegoF1.filter(alumno => alumno.AlumnoId === participantePuntua)[0];
        alumnoPuntua.PuntosTotalesAlumno = alumnoPuntua.PuntosTotalesAlumno + puntuacionDelParticipantePuntua;
        this.peticionesAPI.PonPuntosAlumnoGanadorJornadasDeCompeticionFormulaUno(alumnoPuntua)
        .subscribe(res => console.log(res));
      });

    } else {
      let equipoPuntua: EquipoJuegoDeCompeticionFormulaUno;
      this.peticionesAPI.DameInscripcionesEquipoJuegoDeCompeticionFormulaUno(juego.id)
      .subscribe(equiposJuegoF1 => {
        equipoPuntua = equiposJuegoF1.filter(alumno => alumno.EquipoId === participantePuntua)[0];
        equipoPuntua.PuntosTotalesEquipo = equipoPuntua.PuntosTotalesEquipo + puntuacionDelParticipantePuntua;
        this.peticionesAPI.PonPuntosEquipoGanadorJornadasDeCompeticionFormulaUno(equipoPuntua)
        .subscribe(res => console.log(res));
      });
    }
  }

  // public EliminarSesionDeClase(sesion: SesionClase) {
  //   this.peticionesAPI.DameAsistenciasClase (sesion.id).
  //   subscribe (asistencias => {
  //     asistencias.forEach (asistencia => this.peticionesAPI.BorraAsistenciaClase (asistencia.id).subscribe());
  //   });
  //           // Ahora borro la sesión
  //   console.log ('Ahora borro la sesion de clase');
  //   this.peticionesAPI.BorraSesionClase(sesion.id)
  //   .subscribe();
  // }


  public DameJuegosRapidos(profesorId: number): any {
    const listasObservables = new Observable ( obs => {

      let juegosRapidos: any[] = [];
      this.peticionesAPI.DameJuegosDeEncuestaRapida(profesorId)
      .subscribe(juegos => {
        juegosRapidos = juegosRapidos.concat (juegos);
        this.peticionesAPI.DameJuegosDeVotacionRapida(profesorId)
        // tslint:disable-next-line:no-shadowed-variable
        .subscribe(juegos => {
          juegosRapidos = juegosRapidos.concat (juegos);
          this.peticionesAPI.DameJuegosDeCuestionarioRapido(profesorId)
          // tslint:disable-next-line:no-shadowed-variable
          .subscribe(juegos => {
            juegosRapidos = juegosRapidos.concat (juegos);
           // obs.next (juegosRapidos);
            this.peticionesAPI.DameJuegosDeCogerTurnoRapido(profesorId)
            // tslint:disable-next-line:no-shadowed-variable
            .subscribe(juegos => {
              juegosRapidos = juegosRapidos.concat (juegos);
              obs.next (juegosRapidos);
            });
          });
        });
      });
    });

    return listasObservables;
  }

  public PrepararTablaRankingIndividualVotacionUnoATodos(listaAlumnosOrdenadaPorPuntos: AlumnoJuegoDeVotacionUnoATodos[],
                                                         alumnosDelJuego: Alumno[]): TablaAlumnoJuegoDeVotacionUnoATodos[] {
    const rankingJuegoDeVotacion: TablaAlumnoJuegoDeVotacionUnoATodos [] = [];
    // tslint:disable-next-line:prefer-for-oF
    for (let i = 0; i < listaAlumnosOrdenadaPorPuntos.length; i++) {
      let alumno: Alumno;
      const alumnoId = listaAlumnosOrdenadaPorPuntos[i].alumnoId;
      alumno = alumnosDelJuego.filter(res => res.id === alumnoId)[0];
      // tslint:disable-next-line:max-line-length

      const elem = new TablaAlumnoJuegoDeVotacionUnoATodos(i + 1, alumno.Nombre, alumno.PrimerApellido, alumno.SegundoApellido,
      0, alumnoId);
      rankingJuegoDeVotacion[i] = elem;
    }

    // Ahora voy a ver qué alumnos ya han votado para acumular sus votos y marcarlos
    // como que ya han votado
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < listaAlumnosOrdenadaPorPuntos.length; i++) {
      if (listaAlumnosOrdenadaPorPuntos[i].Votos) {
        // Este alumno ya ha votado
        const alumno = listaAlumnosOrdenadaPorPuntos[i];
        // Asigno los puntos a los destinatorios
        // tslint:disable-next-line:prefer-for-of
        for (let j = 0; j < alumno.Votos.length; j++) {
          const votado = rankingJuegoDeVotacion.filter (al => al.id === alumno.Votos[j].alumnoId)[0];
          votado.puntos = votado.puntos + alumno.Votos[j].puntos;
        }
        // Marque que el alumno ya ha votado
        rankingJuegoDeVotacion.filter (al => al.id === alumno.alumnoId)[0].votado = true;
      }
    }

    return rankingJuegoDeVotacion;
}

public PrepararTablaRankingIndividualVotacionUnoATodosAcabado(listaAlumnosOrdenadaPorPuntos: AlumnoJuegoDeVotacionUnoATodos[],
         // tslint:disable-next-line:max-line-length
                                                              alumnosDelJuego: Alumno[]): TablaAlumnoJuegoDeVotacionUnoATodos[] {
  const rankingJuegoDeVotacion: TablaAlumnoJuegoDeVotacionUnoATodos [] = [];
  // tslint:disable-next-line:prefer-for-oF
  for (let i = 0; i < listaAlumnosOrdenadaPorPuntos.length; i++) {
    let alumno: Alumno;
    const alumnoId = listaAlumnosOrdenadaPorPuntos[i].alumnoId;
    alumno = alumnosDelJuego.filter(res => res.id === alumnoId)[0];
    // tslint:disable-next-line:max-line-length

    const elem = new TablaAlumnoJuegoDeVotacionUnoATodos(i + 1, alumno.Nombre, alumno.PrimerApellido, alumno.SegundoApellido,
    listaAlumnosOrdenadaPorPuntos[i].PuntosTotales, alumnoId);
    rankingJuegoDeVotacion[i] = elem;
  }

  return rankingJuegoDeVotacion;
}

  //////////////////////////////////////// JUEGO DE VOTACION  TODOS A UNO ///////////////////////////////////
public PrepararTablaRankingIndividualVotacionTodosAUno(listaAlumnosOrdenadaPorPuntos: AlumnoJuegoDeVotacionTodosAUno[],
    // tslint:disable-next-line:max-line-length
                                                       alumnosDelJuego: Alumno[], juego: JuegoDeVotacionTodosAUno): TablaAlumnoJuegoDeVotacionTodosAUno[] {
  const rankingJuegoDeVotacion: TablaAlumnoJuegoDeVotacionTodosAUno [] = [];
  // tslint:disable-next-line:prefer-for-oF
  for (let i = 0; i < listaAlumnosOrdenadaPorPuntos.length; i++) {
    let alumno: Alumno;
    const alumnoId = listaAlumnosOrdenadaPorPuntos[i].alumnoId;
    alumno = alumnosDelJuego.filter(res => res.id === alumnoId)[0];
    // tslint:disable-next-line:max-line-length

    const elem = new TablaAlumnoJuegoDeVotacionTodosAUno(i + 1, alumno.Nombre, alumno.PrimerApellido, alumno.SegundoApellido,
    0, alumnoId);
    if (listaAlumnosOrdenadaPorPuntos[i].VotosEmitidos.length === listaAlumnosOrdenadaPorPuntos.length - 1) {
      elem.votado = true;
    } else {
      elem.votado = false;
    }
    elem.conceptos = Array(juego.Conceptos.length).fill (0);
    rankingJuegoDeVotacion[i] = elem;
  }

  // Ahora para cada alumno voy a calcular los votos recibidos y la nota en cada uno de los conceptos, asi como su nota temporal

  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < listaAlumnosOrdenadaPorPuntos.length; i++) {
    if (listaAlumnosOrdenadaPorPuntos[i].VotosEmitidos) {
      // Este alumno ha emitido algunos votos
      listaAlumnosOrdenadaPorPuntos[i].VotosEmitidos.forEach (votoEmitido => {
        // busco al alumno que ha recibido estos votos
        // tslint:disable-next-line:no-shadowed-variable
        const alumnoVotado = rankingJuegoDeVotacion.filter (alumno => alumno.id === votoEmitido.alumnoId)[0];
        alumnoVotado.votosRecibidos++;
        // le asigno los votos que ha recibido para cada concepto
        for (let j = 0; j < votoEmitido.votos.length; j++) {
          alumnoVotado.conceptos[j] = alumnoVotado.conceptos[j] + votoEmitido.votos[j];
        }

      });
    }
  }

  // Para acabar calculo la nota parcial total  para cada alumno
  rankingJuegoDeVotacion.forEach (alumno => {

    if (alumno.votosRecibidos === 0) {
      alumno.nota = 0;
    } else {
      let nota = 0;
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < alumno.conceptos.length; i++) {
        nota = nota + (alumno.conceptos[i] * juego.Pesos[i]) / 100;
      }
      alumno.nota = nota / alumno.votosRecibidos;
    }
  });

  return rankingJuegoDeVotacion;
}

public PrepararTablaRankingIndividualVotacionTodosAUnoAcabado(listaAlumnosOrdenadaPorPuntos: AlumnoJuegoDeVotacionTodosAUno[],
// tslint:disable-next-line:max-line-length
                                                              alumnosDelJuego: Alumno[], juego: JuegoDeVotacionTodosAUno): TablaAlumnoJuegoDeVotacionTodosAUno[] {
  const rankingJuegoDeVotacion: TablaAlumnoJuegoDeVotacionTodosAUno [] = [];
  // tslint:disable-next-line:prefer-for-oF
  for (let i = 0; i < listaAlumnosOrdenadaPorPuntos.length; i++) {
    let alumno: Alumno;
    const alumnoId = listaAlumnosOrdenadaPorPuntos[i].alumnoId;
    alumno = alumnosDelJuego.filter(res => res.id === alumnoId)[0];
    // tslint:disable-next-line:max-line-length


    const elem = new TablaAlumnoJuegoDeVotacionTodosAUno(i + 1, alumno.Nombre, alumno.PrimerApellido, alumno.SegundoApellido,
    listaAlumnosOrdenadaPorPuntos[i].PuntosTotales, alumnoId);
    elem.conceptos = Array(juego.Conceptos.length).fill (0);
    rankingJuegoDeVotacion[i] = elem;
  }

  // Ahora para cada alumno voy a calcular los votos recibidos y la nota en cada uno de los conceptos

  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < listaAlumnosOrdenadaPorPuntos.length; i++) {
    if (listaAlumnosOrdenadaPorPuntos[i].VotosEmitidos) {
      // Este alumno ha emitido algunos votos
      listaAlumnosOrdenadaPorPuntos[i].VotosEmitidos.forEach (votoEmitido => {
        // busco al alumno que ha recibido estos votos
        // tslint:disable-next-line:no-shadowed-variable
        const alumnoVotado = rankingJuegoDeVotacion.filter (alumno => alumno.id === votoEmitido.alumnoId)[0];
        alumnoVotado.votosRecibidos++;
        // le asigno los votos que ha recibido para cada concepto
        for (let j = 0; j < votoEmitido.votos.length; j++) {
          alumnoVotado.conceptos[j] = alumnoVotado.conceptos[j] + votoEmitido.votos[j];
        }

      });
    }
  }

  return rankingJuegoDeVotacion;
}

public async EliminarJuegoControlDeTrabajoEnEquipo(juego: any) {

  const inscripciones = await this.peticionesAPI.DameInscripcionesAlumnosJuegoDeControlDeTrabajoEnEquipo (juego.id).toPromise();
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < inscripciones.length ; i++ ) {
    await this.peticionesAPI.BorrarInscripcionAlumnoJuegoDeControlDeTrabajoEnEquipo(inscripciones[i].id).toPromise();
  }
  await this.peticionesAPI.BorrarJuegoDeControlDeTrabajoEnEquipo (juego.id).toPromise();
}


}

