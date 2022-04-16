import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MisJuegosRapidosPage } from './mis-juegos-rapidos.page';

const routes: Routes = [
  {
    path: '',
    component: MisJuegosRapidosPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MisJuegosRapidosPage]
})
export class MisJuegosRapidosPageModule {}
