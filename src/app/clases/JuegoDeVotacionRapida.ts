
export class JuegoDeVotacionRapida {

    NombreJuego: string;
    Tipo: string;
    Clave: string;
    ModoReparto: string;
    id: number;
    profesorId: number;
    Conceptos: string[];
    Puntos: number[];
    Respuestas: any;

    // tslint:disable-next-line:max-line-length
    constructor(NombreJuego?: string, Tipo?: string, Clave?: string, ModoReparto?: string,
                profesorId?: number,  Conceptos?: string[], Puntos?: number[]) {
        this.NombreJuego = NombreJuego;
        this.Tipo = Tipo;
        this.ModoReparto = ModoReparto;
        this.profesorId = profesorId;
        this.Clave = Clave;
        this.Conceptos = Conceptos;
        this.Puntos = Puntos;
        this.Respuestas = [];
    }
}
