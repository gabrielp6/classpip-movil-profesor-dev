export class TablaAlumnoJuegoDeVotacionTodosAUno {

  posicion: number;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  nota: number;
  id: number; // AlumnoId
  votado: boolean;
  votosRecibidos: number;
  conceptos: number[];


  constructor(posicion?: number, nombre?: string, primerApellido?: string, segundoApellido?: string,
              nota?: number, id?: number) {

    this.posicion = posicion;
    this.nombre = nombre;
    this.primerApellido = primerApellido;
    this.segundoApellido = segundoApellido;
    this.votosRecibidos = 0;
    this.id = id;
    this.votado = false;
    this.nota = nota;
  }
}
