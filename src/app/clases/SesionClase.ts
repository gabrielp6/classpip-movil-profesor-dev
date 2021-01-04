export class SesionClase {
  Dia: string;
  Hora: string;
  Descripcion: string;
  id: number;
  grupoId: number;
  Asistencia: any[];

  constructor(Dia?: string, Hora?: string,  Descripcion?: string, Asistencia?: any[]) {

    this.Dia = Dia;
    this.Hora = Hora;
    this.Descripcion = Descripcion;
    this.Asistencia = Asistencia;
  }

}
