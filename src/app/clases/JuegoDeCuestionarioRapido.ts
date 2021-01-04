export class JuegoDeCuestionarioRapido {

    NombreJuego: string;
    Tipo: string;
    Clave: string;
    PuntuacionCorrecta: number;
    PuntuacionIncorrecta: number;
    TiempoLimite: number;
    Presentacion: string;
    JuegoActivo: boolean;
    JuegoTerminado: boolean;
    id: number;
    profesorId: number;
    cuestionarioId: number;
    Respuestas: any;

    // tslint:disable-next-line:max-line-length
    constructor(NombreJuego?: string, Tipo?: string,  Clave?: string, PuntuacionCorrecta?: number, PuntuacionIncorrecta?: number, Presentacion?: string, JuegoActivo?: boolean, JuegoTerminado?: boolean,
                profesorId?: number, cuestionarioId?: number,
                TiempoLimite?: number) {
        this.NombreJuego = NombreJuego;
        this.Tipo = Tipo;
        this.Clave = Clave;
        this.PuntuacionCorrecta = PuntuacionCorrecta;
        this.PuntuacionIncorrecta = PuntuacionIncorrecta;
        this.Presentacion = Presentacion;
        this.JuegoActivo = JuegoActivo;
        this.JuegoTerminado = JuegoTerminado;
        this.profesorId = profesorId;
        this.cuestionarioId = cuestionarioId;
        this.TiempoLimite = TiempoLimite;
        this.Respuestas = [];
    }
}
