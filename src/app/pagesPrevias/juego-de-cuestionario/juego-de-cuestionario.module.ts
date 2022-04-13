import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { JuegoDeCuestionarioPage } from './juego-de-cuestionario.page';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule, MatRadioModule } from '@angular/material';
import {MatExpansionModule} from '@angular/material/expansion';
import {NgxEchartsModule} from 'ngx-echarts';

import * as echarts from 'echarts';

//import * as echarts from './../custom-echarts';

const routes: Routes = [
  {
    path: '',
    component: JuegoDeCuestionarioPage
  }
];

@NgModule({
  imports: [
    MatStepperModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    FormsModule,
    IonicModule,
    MatExpansionModule,
    RouterModule.forChild(routes),
    NgxEchartsModule.forRoot({echarts})
  ],
  declarations: [JuegoDeCuestionarioPage]
})
export class JuegoDeCuestionarioPageModule {}
