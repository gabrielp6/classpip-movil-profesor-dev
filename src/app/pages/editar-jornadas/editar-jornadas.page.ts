import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Location } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Alumno, Juego, Jornada, TablaJornadas, AlumnoJuegoDeCompeticionLiga, TablaAlumnoJuegoDeCompeticion } from '../../clases/index';
import { SesionService, PeticionesAPIService, CalculosService } from '../../services/index';

@Component({
  selector: 'app-editar-jornadas',
  templateUrl: './editar-jornadas.page.html',
  styleUrls: ['./editar-jornadas.page.scss'],
})
export class EditarJornadasPage implements OnInit {

  /* Estructura necesaria para determinar que filas son las que se han seleccionado */
  selection = new SelectionModel<any>(true, []);
    // Juego De CompeticionLiga seleccionado
  juegoSeleccionado: Juego;
  numeroTotalJornadas: number;
  jornadasTabla: Jornada[];
  jornadas: Jornada[];
  dataSource: any;
  myForm: FormGroup;
  NuevaFechaFormGroup: FormGroup;
  IDJornada: number;
  isDisabled: Boolean = true;
  botonTablaDesactivado = true;
  JornadaSeleccionadaId: number;
  seleccionados: boolean[];
  JornadasCompeticion: TablaJornadas[] = [];
  NuevaFecha: Date;

  displayedColumnsJornada: string[] = ['select', 'NumeroDeJornada', 'Fecha', 'CriterioGanador'];

  constructor(    
    
    public sesion: SesionService,
    public location: Location,
    public calculos: CalculosService,
    public peticionesAPI: PeticionesAPIService,
    private _formBuilder: FormBuilder) {}

  ngOnInit() {
    const datos = this.sesion.DameDatosJornadas();
    this.jornadas = datos.jornadas;
    this.juegoSeleccionado = this.sesion.DameJuego();
    this.dataSource = new MatTableDataSource (this.jornadas);
    
    this.myForm = this._formBuilder.group({
      CriterioGanador: ['', Validators.required],
      picker: ['', Validators.required],
    });

  }


  IsAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  MasterToggle() {

    if (this.IsAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }

  }

  ActualizarBotonTabla() {
    let NuevaFecha: Date;
    NuevaFecha = this.myForm.value.picker;
    let NuevoCriterio: string;
    NuevoCriterio = this.myForm.value.CriterioGanador;
    if ((this.selection.selected.length === 0) || ( NuevaFecha === undefined) || ( NuevoCriterio === undefined)) {
      this.botonTablaDesactivado = true;
    } else {
      this.botonTablaDesactivado = false;
    }
  }

  onChangeEvent(e): void {

    this.NuevaFecha = e.target.value;
    let NuevoCriterio: string;
    NuevoCriterio = this.myForm.value.CriterioGanador;
    if ((this.selection.selected.length === 0) || ( this.NuevaFecha === undefined) || ( NuevoCriterio === undefined)) {
      this.botonTablaDesactivado = true;
    } else {
      this.botonTablaDesactivado = false;
    }

  }

  EditarJornada() {
    let NuevoCriterio: string;
    NuevoCriterio = this.myForm.value.CriterioGanador;
    for ( let i = 0; i < this.dataSource.data.length; i++) {

      if (this.selection.isSelected(this.dataSource.data[i]))  {
        this.IDJornada = this.jornadas[i].id;
        this.jornadas[i] = new Jornada (this.NuevaFecha, NuevoCriterio, this.jornadas[i].JuegoDeCompeticionLigaId);
        this.peticionesAPI.ModificarJornada (this.jornadas[i], this.IDJornada)
        .subscribe(JornadaCreada => {
          this.jornadas[i] = JornadaCreada;
        });
        console.log('Jornada Modificada');
        this.JornadasCompeticion[i].CriterioGanador = this.jornadas[i].CriterioGanador;
        this.JornadasCompeticion[i].Fecha = this.jornadas[i].Fecha;
        this.JornadasCompeticion[i].NumeroDeJornada = i + 1;
      }
    }
    this.dataSource = new MatTableDataSource (this.JornadasCompeticion);
    this.selection.clear();
    this.botonTablaDesactivado = true;
  }

  BotonDesactivado() {
    let NuevaFecha: Date;
    NuevaFecha = this.myForm.value.picker;
    let NuevoCriterio: string;
    NuevoCriterio = this.myForm.value.CriterioGanador;

    if (NuevaFecha !== undefined && NuevoCriterio !== undefined ) {
      console.log('hay algo, disabled');
      this.isDisabled = false;
    } else {
      console.log('no hay nada');
      this.isDisabled = true;
    }
  }

  ActualizarBoton() {
    if (this.selection.selected.length === 0) {
      this.isDisabled = true;
    } else {
      this.isDisabled = false;
    }
  }

  Disabled() {

      if (this.seleccionados.filter(res => res === true)[0] !== undefined) {
        this.BotonDesactivado();
      } else {
        this.isDisabled = true;
      }

  }

}
