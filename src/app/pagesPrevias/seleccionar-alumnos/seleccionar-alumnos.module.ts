import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SeleccionarAlumnosPage } from './seleccionar-alumnos.page';

const routes: Routes = [
  {
    path: '',
    component: SeleccionarAlumnosPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SeleccionarAlumnosPage]
})
export class SeleccionarAlumnosPageModule {}
