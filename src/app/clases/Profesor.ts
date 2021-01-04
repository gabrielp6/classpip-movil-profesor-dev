export class Profesor {
  Nombre: string;
  PrimerApellido: string;
  SegundoApellido: string;
  NombreUsuario: string;
  email: string;
  Password: string;
  ImagenPerfil: string;
  Identificador: string; // lo usan los alumnos para asociarse a este profesor al registrarse
  id: number;

  constructor(  Nombre?: string, PrimerApellido?: string, SegundoApellido?: string,
                NombreUsuario?: string, email?: string, Password?: string, ImagenPerfil?: string,
                Identificador?: string,
                id?: number) {

    this.Nombre = Nombre;
    this.PrimerApellido = PrimerApellido;
    this.SegundoApellido = SegundoApellido;
    this.NombreUsuario = NombreUsuario;
    this.email = email;
    this.Password = Password;
    this.ImagenPerfil = ImagenPerfil;
    this.Identificador = Identificador;
    this.id = id;
  }
}
