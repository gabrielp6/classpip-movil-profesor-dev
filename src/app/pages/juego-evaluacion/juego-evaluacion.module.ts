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
import {MatDividerModule} from '@angular/material/divider';
import {MatBadgeModule} from '@angular/material/badge';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { IonicModule } from '@ionic/angular';
import { JuegoEvaluacionPage } from './juego-evaluacion.page';
import { EvaluacionDialogoComponent } from '../../../components/evaluacion-dialogo/evaluacion-dialogo.component';
import{ EvaluacionBorrarDialogoComponent } from '../../../components/evaluacion-borrar-dialogo/evaluacion-borrar-dialogo.component';


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
    MatDividerModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatCardModule,
    RouterModule.forChild(routes)
  ],
  declarations: [JuegoEvaluacionPage,
  EvaluacionDialogoComponent, EvaluacionBorrarDialogoComponent],
  entryComponents: [EvaluacionDialogoComponent, EvaluacionBorrarDialogoComponent]
  
})

export class JuegoEvaluacionPageModule {}
