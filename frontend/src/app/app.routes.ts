import { Routes } from '@angular/router';
import { CatalogComponent } from './features/catalog/catalog.component';
import { LoginComponent } from './features/auth/login.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: CatalogComponent
  },
  {
    path: 'katalog',
    component: CatalogComponent
  },
  {
    path: 'auth/login',
    component: LoginComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
