import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AsignarCromosSeleccionPage } from './asignar-cromos-seleccion.page';

const routes: Routes = [
  {
    path: '',
    component: AsignarCromosSeleccionPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AsignarCromosSeleccionPage]
})
export class AsignarCromosSeleccionPageModule {}
