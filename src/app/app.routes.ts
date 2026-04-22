import { Routes } from '@angular/router';

import { PotionsTableComponent } from './components/potions-table/potions-table';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'orders',
    pathMatch: 'full'
  },
  {
    path: 'orders',
    component: PotionsTableComponent,
    title: 'Заказы зелий'
  },
  {
    path: 'create',
    loadComponent: () => import('./components/potion-form/potion-form')
      .then(m => m.PotionFormComponent),
    title: 'Создание зелья'
  },
  {
    path: '**',
    redirectTo: 'orders'
  }
];
