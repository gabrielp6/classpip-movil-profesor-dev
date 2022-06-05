import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table'
import {MatExpansionModule} from '@angular/material/expansion';
import { IonicModule } from '@ionic/angular';
import { ControlDeTrabajoPage } from './control-de-trabajo.page';
import { MatListModule } from '@angular/material/list';
import { ExpandableComponent2 } from '../../../components/expandable2/expandable2.component';

const routes: Routes = [
  {
    path: '',
    component: ControlDeTrabajoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    MatExpansionModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    MatTableModule,
    MatListModule,
  ],
  declarations: [ControlDeTrabajoPage, ExpandableComponent2]
})
export class ControlDeTrabajoPageModule {}
