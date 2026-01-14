import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ToastMessagesComponent } from '../toast-messages/toast-messages';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog';
import { PotionService } from '../../services/potion';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    ToastMessagesComponent,
    ConfirmationDialogComponent
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
