import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { JuegoCuestionarioRapidoPage } from './juego-cuestionario-rapido.page';
import {NgxEchartsModule} from 'ngx-echarts';

import * as echarts from 'echarts';

const routes: Routes = [
  {
    path: '',
    component: JuegoCuestionarioRapidoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    NgxEchartsModule.forRoot({echarts})
  ],
  declarations: [JuegoCuestionarioRapidoPage]
})
export class JuegoCuestionarioRapidoPageModule {}
