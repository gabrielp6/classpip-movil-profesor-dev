import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SeleccionarCromoPage } from './seleccionar-cromo.page';

const routes: Routes = [
  {
    path: '',
    component: SeleccionarCromoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SeleccionarCromoPage]
})
export class SeleccionarCromoPageModule {}
