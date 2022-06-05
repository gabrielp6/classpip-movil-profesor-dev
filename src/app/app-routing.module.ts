import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)},
  { path: 'inici', loadChildren: './pages/inici/inici.module#IniciPageModule' },
  { path: 'juego-seleccionado', loadChildren: './pagesPrevias/juego-seleccionado/juego-seleccionado.module#JuegoSeleccionadoPageModule' },
  { path: 'cromos-amostrar', loadChildren: './pagesPrevias/cromos-amostrar/cromos-amostrar.module#CromosAMostrarPageModule' },
  { path: 'mi-perfil', loadChildren: './pagesPrevias/mi-perfil/mi-perfil.module#MiPerfilPageModule' },
  { path: 'mis-grupos', loadChildren: './pagesPrevias/mis-grupos/mis-grupos.module#MisGruposPageModule' },
  { path: 'mis-juegos-inactivos', loadChildren: './pagesPrevias/mis-juegos-inactivos/mis-juegos-inactivos.module#MisJuegosInactivosPageModule' },
  { path: 'intercambiar-cromos', loadChildren: './pagesPrevias/intercambiar-cromos/intercambiar-cromos.module#IntercambiarCromosPageModule' },
  { path: 'juegos-inactivos', loadChildren: './pagesPrevias/juegos-inactivos/juegos-inactivos.module#JuegosInactivosPageModule' },
  { path: 'slides', loadChildren: './slides/slides.module#SlidesPageModule' },
  { path: 'tabs', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'mis-colecciones', loadChildren: './pagesPrevias/mis-colecciones/mis-colecciones.module#MisColeccionesPageModule' },
  { path: 'juego-de-cuestionario', loadChildren: './pagesPrevias/juego-de-cuestionario/juego-de-cuestionario.module#JuegoDeCuestionarioPageModule' },
  { path: 'juego-competicion-liga', loadChildren: './pages/juego-competicion-liga/juego-competicion-liga.module#JuegoCompeticionLigaPageModule' },
  { path: 'informacion-jornadas', loadChildren: './pages/informacion-jornadas/informacion-jornadas.module#InformacionJornadasPageModule' },
  { path: 'juego-colleccion', loadChildren: './pagesPrevias/juego-colleccion/juego-colleccion.module#JuegoColleccionPageModule' },
  { path: 'juego-avatar', loadChildren: './pagesPrevias/juego-avatar/juego-avatar.module#JuegoAvatarPageModule' },
  { path: 'avatar-editor', loadChildren: './pagesPrevias/avatar-editor/avatar-editor.module#AvatarEditorPageModule' },
  
  { path: 'juego-puntos', loadChildren: './pagesPrevias/juego-puntos/juego-puntos.module#JuegoPuntosPageModule' },
  { path: 'album-alumno', loadChildren: './pagesPrevias/album-alumno/album-alumno.module#AlbumAlumnoPageModule' },

  { path: 'juego-de-geocaching', loadChildren: './pagesPrevias/juego-de-geocaching/juego-de-geocaching.module#JuegoDeGeocachingPageModule' },
  { path: 'modal', loadChildren: './modal/modal.module#ModalPageModule' },
  { path: 'ver-avatares-grupo', loadChildren: './pagesPrevias/ver-avatares-grupo/ver-avatares-grupo.module#VerAvataresGrupoPageModule' },
  // tslint:disable-next-line:max-line-length
  { path: 'juego-votacion-uno-atodos', loadChildren: './pagesPrevias/juego-votacion-uno-atodos/juego-votacion-uno-atodos.module#JuegoVotacionUnoATodosPageModule' },
  // tslint:disable-next-line:max-line-length
  { path: 'juego-votacion-todos-auno', loadChildren: './pagesPrevias/juego-votacion-todos-auno/juego-votacion-todos-auno.module#JuegoVotacionTodosAUnoPageModule' },
  // tslint:disable-next-line:max-line-length
  { path: 'juego-cuestionario-satisfaccion', loadChildren: './pages/juego-cuestionario-satisfaccion/juego-cuestionario-satisfaccion.module#JuegoCuestionarioSatisfaccionPageModule' },
  { path: 'juego-votacion-rapida', loadChildren: './pagesPrevias/juego-votacion-rapida/juego-votacion-rapida.module#JuegoVotacionRapidaPageModule' },
  { path: 'mis-juegos-inactivos', loadChildren: './pagesPrevias/mis-juegos-inactivos/mis-juegos-inactivos.module#MisJuegosInactivosPageModule' },
  // tslint:disable-next-line:max-line-length
  { path: 'juego-coger-turno-rapido', loadChildren: './pagesPrevias/juego-coger-turno-rapido/juego-coger-turno-rapido.module#JuegoCogerTurnoRapidoPageModule' },
  
 
  // tslint:disable-next-line:max-line-length
  { path: 'ver-coleccion', loadChildren: './pagesPrevias/ver-coleccion/ver-coleccion.module#VerColeccionPageModule' },
  { path: 'seleccionar-cromo', loadChildren: './pagesPrevias/seleccionar-cromo/seleccionar-cromo.module#SeleccionarCromoPageModule' },
  { path: 'seleccionar-alumnos', loadChildren: './pagesPrevias/seleccionar-alumnos/seleccionar-alumnos.module#SeleccionarAlumnosPageModule' },
  { path: 'avatar-alumno', loadChildren: './pagesPrevias/avatar-alumno/avatar-alumno.module#AvatarAlumnoPageModule' },
  { path: 'crear-juego-rapido', loadChildren: './pagesPrevias/crear-juego-rapido/crear-juego-rapido.module#CrearJuegoRapidoPageModule' },
  { path: 'ver-grupo', loadChildren: './pagesPrevias/ver-grupo/ver-grupo.module#VerGrupoPageModule' },
  { path: 'mis-juegos-rapidos', loadChildren: './pagesPrevias/mis-juegos-rapidos/mis-juegos-rapidos.module#MisJuegosRapidosPageModule' },
  { path: 'juego-encuesta-rapida', loadChildren: './pagesPrevias/juego-encuesta-rapida/juego-encuesta-rapida.module#JuegoEncuestaRapidaPageModule' },
  { path: 'juego-cuestionario-rapido', loadChildren: './pagesPrevias/juego-cuestionario-rapido/juego-cuestionario-rapido.module#JuegoCuestionarioRapidoPageModule' },
  { path: 'editar-jornadas', loadChildren: './pages/editar-jornadas/editar-jornadas.module#EditarJornadasPageModule' },
  { path: 'control-de-trabajo', loadChildren: './pages/control-de-trabajo/control-de-trabajo.module#ControlDeTrabajoPageModule' },


  





];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }


