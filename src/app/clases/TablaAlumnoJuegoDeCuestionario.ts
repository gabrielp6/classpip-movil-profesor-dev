export class TablaAlumnoJuegoDeCuestionario {

    nombre: string;
    primerApellido: string;
    segundoApellido: string;
    nota: number;
    contestado: boolean;
    tiempoEmpleado: number;
    id: number;

    constructor(nombre?: string, primerApellido?: string, segundoApellido?: string,
                nota?: number, contestado?: boolean, id?: number, tiempoEmpleado?: number) {

      this.nombre = nombre;
      this.primerApellido = primerApellido;
      this.segundoApellido = segundoApellido;
      this.nota = nota;
      this.contestado = contestado;
      this.id = id;
      this.tiempoEmpleado = tiempoEmpleado;
    }
  }
