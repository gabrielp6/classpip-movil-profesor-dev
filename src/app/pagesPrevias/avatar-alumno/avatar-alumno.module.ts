import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AvatarAlumnoPage } from './avatar-alumno.page';

const routes: Routes = [
  {
    path: '',
    component: AvatarAlumnoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AvatarAlumnoPage]
})
export class AvatarAlumnoPageModule {}
