import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {MatDialogModule} from '@angular/material/dialog';


import { IonicModule } from '@ionic/angular';

import { JuegoEvaluacionPage } from './juego-evaluacion.page';

const routes: Routes = [
  {
    path: '',
    component: JuegoEvaluacionPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatTabsModule,
    MatDialogModule,
    RouterModule.forChild(routes)
  ],
  declarations: [JuegoEvaluacionPage]
})
export class JuegoEvaluacionPageModule {}
