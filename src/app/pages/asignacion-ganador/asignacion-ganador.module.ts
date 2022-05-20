import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { AsignacionGanadorPage } from './asignacion-ganador.page';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatCheckboxModule } from '@angular/material/checkbox'; 
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';


const routes: Routes = [
  {
    path: '',
    component: AsignacionGanadorPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AsignacionGanadorPage]
})
export class AsignacionGanadorPageModule {}
