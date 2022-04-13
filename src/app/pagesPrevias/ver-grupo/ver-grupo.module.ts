import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import {MatExpansionModule} from '@angular/material/expansion';

import { IonicModule } from '@ionic/angular';

import { VerGrupoPage } from './ver-grupo.page';
import {NgxEchartsModule} from 'ngx-echarts';

import * as echarts from 'echarts';


const routes: Routes = [
  {
    path: '',
    component: VerGrupoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatExpansionModule,
    RouterModule.forChild(routes),
    NgxEchartsModule.forRoot({echarts})
  ],
  declarations: [VerGrupoPage]
})
export class VerGrupoPageModule {}
