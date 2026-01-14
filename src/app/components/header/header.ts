import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { PotionService } from '../../services/potion';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './header.html',
  styles: [],
  standalone: true,
})
export class Header {
  private potionService = inject(PotionService);

  totalOrders = this.potionService.totalOrders;
  totalRevenue = this.potionService.totalRevenue;

}
