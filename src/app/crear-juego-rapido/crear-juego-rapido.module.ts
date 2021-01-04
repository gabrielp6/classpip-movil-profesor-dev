import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { MatStepperModule } from '@angular/material/stepper';

import { CrearJuegoRapidoPage } from './crear-juego-rapido.page';

const routes: Routes = [
  {
    path: '',
    component: CrearJuegoRapidoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatStepperModule,
    RouterModule.forChild(routes)
  ],
  declarations: [CrearJuegoRapidoPage]
})
export class CrearJuegoRapidoPageModule {}
