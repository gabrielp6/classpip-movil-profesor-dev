import { Component, OnInit,ViewChild } from '@angular/core';
import { NgModule } from '@angular/core';
import { PeticionesAPIService} from '../../services/index';
import { CalculosService } from '../../services/calculos.service';
import { SesionService} from '../../services/sesion.service';
import { Grupo, Alumno, Equipo, AlumnoJuegoDeVotacionTodosAUno, Profesor } from '../../clases/index';
import * as URL from '../../URLs/urls';
import {MatAccordion} from '@angular/material/expansion';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mis-grupos',
  templateUrl: './mis-grupos.page.html',
  styleUrls: ['./mis-grupos.page.scss'],
})
export class MisGruposPage implements OnInit {
  @ViewChild('accordion', {static: false}) accordion: MatAccordion;

  listaGrupos: Grupo[];
  profesor: Profesor;
  
  listaGruposYEquipos: any [];
  Tipo: string;
  equiposDelAlumno: Equipo[];
  equipoElegido: Equipo;
  alumnosEquipo: Alumno[];

  constructor(
    private peticionesAPI: PeticionesAPIService,
    private sesion: SesionService,
    private calculos: CalculosService,
    private route: Router,
  ) { }

  ngOnInit() {

      this.profesor = this.sesion.DameProfesor();
      // CUANDO INICIEMOS EL COMPONENTE NOS LISTARÁ LOS GRUPOS DEL PROFESOR QUE RECUPERAMOS EL ID DE LA URL
      this.GruposDelProfesor();
  }
  
  GruposDelProfesor() {
      console.log ('Busco grupos del profesor');
      this.peticionesAPI.DameGruposProfesor(this.profesor.id)
      .subscribe(res => {
        if (res[0] !== undefined) {
          this.listaGrupos = res;
        } else {
          this.listaGrupos = undefined;
        }
      });
  }

  SeleccionaGrupo (grupo: Grupo) {
    console.log ('Grupo seleccionado');
    console.log (grupo);
    this.sesion.TomaGrupo (grupo);
    
    this.route.navigateByUrl('ver-grupo');

  }
   
  ionViewWillEnter (){
    this.Tipo = "Alumnos";
  }
  SeleccionarLogo($event) {
  
    console.log ('Cambio logo del equipo');
    console.log (this.equiposDelAlumno);
    const imagen = $event.target.files[0];
    const formData = new FormData();
    formData.append(imagen.name, imagen);
    this.peticionesAPI.PonLogoEquipo(formData)
    .subscribe (() => {
      this.equipoElegido.FotoEquipo = URL.LogosEquipos + imagen.name;
      this.peticionesAPI.ModificaEquipo (this.equipoElegido).subscribe();
     });
  }

  CambiarLogo(equipo: Equipo){
    console.log ('voy a cambiar el logo del equipo');
    console.log (equipo);
    this.equipoElegido = equipo;
    if (equipo.FotoEquipo !== undefined) {
      // primero borro el logo si tiene
      // la foto viene con toda la URL y solo quiero el nombre del fichero
      // para borrarlo, que viene al final
      const url = equipo.FotoEquipo.split ('/');
      const imagen = url[url.length - 1];

      this.peticionesAPI.BorraLogoEquipo (imagen).subscribe ();
    }

    document.getElementById('inputLogo').click();
  }

  QuitarLogo(equipo: Equipo) {
    // la foto viene con toda la URL y solo quiero el nombre del fichero
    // para borrarlo, que viene al final
    const url = equipo.FotoEquipo.split ('/');
    const imagen = url[url.length - 1];

    this.peticionesAPI.BorraLogoEquipo (imagen).subscribe ();
    equipo.FotoEquipo = undefined;
    console.log ('voy a modificar el equipo');
    console.log (equipo);
    this.peticionesAPI.ModificaEquipo (equipo)
    .subscribe(e => console.log (e));


  }
  EsMiEquipo(equipo: Equipo) {
    return this.equiposDelAlumno.some (e => e.id === equipo.id);
  }
  TraeAlumnosEquipo(equipo) {
    console.log ('voy a traer los alumnos del equipo');
    console.log (equipo);
    this.peticionesAPI.DameAlumnosEquipo (equipo.id)
    .subscribe (alumnos => this.alumnosEquipo = alumnos);
    this.accordion.closeAll();
  }
}
