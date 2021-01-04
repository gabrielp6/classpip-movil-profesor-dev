export class TablaAlumnoJuegoDeVotacionUnoATodos {

  posicion: number;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  puntos: number;
  id: number; // AlumnoId
  votado: boolean;
  incremento: number;

  constructor(posicion?: number, nombre?: string, primerApellido?: string, segundoApellido?: string,
              puntos?: number, id?: number) {

    this.posicion = posicion;
    this.nombre = nombre;
    this.primerApellido = primerApellido;
    this.segundoApellido = segundoApellido;
    this.puntos = puntos;
    this.id = id;
    this.votado = false;
    this.incremento = 0;
  }
}
