export class AsistenciaClase {
  matriculaId: number;
  sesionClaseId: number;
  id: number;
  Hora: string;

  constructor(matriculaId?: number, sesionClaseId?: number, Hora?: string) {

    this.matriculaId = matriculaId;
    this.sesionClaseId = sesionClaseId;
    this.Hora = Hora;
  }
}
