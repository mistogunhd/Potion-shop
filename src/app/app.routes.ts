import { Routes } from '@angular/router';
import {PotionsTableComponent} from './components/potions-table/potions-table';
import {PotionFormComponent} from './components/potion-form/potion-form';

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
    component: PotionFormComponent,
    title: 'Создание зелья'
  },
  {
    path: '**',
    redirectTo: 'orders'
  }
];
