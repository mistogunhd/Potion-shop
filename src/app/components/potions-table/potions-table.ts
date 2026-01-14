import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PotionService } from '../../services/potion';
import { MessageService } from '../../services/message';
import { ConfirmationService } from '../../services/confirmation';
import { PotionOrder } from '../../models/potion.model';
import {DateStatusPipe} from '../../shared/date-status.pipe';

@Component({
  selector: 'app-potions-table',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe, DateStatusPipe],
  templateUrl: './potions-table.html',
  styleUrls: ['./potions-table.scss']
})
export class PotionsTableComponent implements OnInit {
  private potionService = inject(PotionService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  orders = this.potionService.orders;
  totalOrders = this.potionService.totalOrders;
  totalRevenue = this.potionService.totalRevenue;

  isLoading = signal(false);
  searchTerm = signal('');
  statusFilter = signal('all');
  deliveryFilter = signal('all');
  selectedOrder = signal<PotionOrder | null>(null);
  currentPage = signal(1);

  readonly pageSize = 10;
  readonly deliveryMethods = this.potionService.deliveryMethods;

  filteredOrders = computed(() => {
    let result = this.orders();
    const search = this.searchTerm();
    const status = this.statusFilter();
    const delivery = this.deliveryFilter();

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(order =>
        order.customer.toLowerCase().includes(term) ||
        order.potionNumber.toLowerCase().includes(term) ||
        order.deliveryAddress.toLowerCase().includes(term)
      );
    }

    if (status !== 'all') {
      const now = new Date();
      result = result.filter(order => {
        switch (status) {
          case 'active':
            return order.readyDate > now;
          case 'completed':
            return order.readyDate <= now;
          case 'overdue':
            return order.readyDate < now &&
              new Date(order.readyDate.getTime() + 7 * 24 * 60 * 60 * 1000) < now;
          default:
            return true;
        }
      });
    }

    if (delivery !== 'all') {
      result = result.filter(order => order.deliveryMethod === delivery);
    }

    return result;
  });

  activeOrders = computed(() => {
    const now = new Date();
    return this.orders().filter(order => order.readyDate > now).length;
  });

  ngOnInit(): void {
    this.refreshOrders();
  }

  refreshOrders(): void {
    this.isLoading.set(true);

    setTimeout(() => {
      this.isLoading.set(false);
    }, 500);
  }

  onSearchChange(): void {
    this.currentPage.set(1);
  }

  onFilterChange(): void {
    this.currentPage.set(1);
  }

  getDateClass(date: Date): string {
    const now = new Date();
    const readyDate = new Date(date);

    if (readyDate < now) {
      return 'date-danger';
    } else if (readyDate.getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000) {
      return 'date-warning';
    }
    return 'date-normal';
  }

  getDeliveryBadgeClass(method: string): string {
    switch (method) {
      case 'Сова': return 'delivery-badge-owl';
      case 'Дракон': return 'delivery-badge-dragon';
      case 'Портал': return 'delivery-badge-portal';
      case 'Метла': return 'delivery-badge-broom';
      default: return '';
    }
  }

  getDeliveryIcon(method: string): string {
    switch (method) {
      case 'Сова': return 'pi pi-send';
      case 'Дракон': return 'pi pi-fire';
      case 'Портал': return 'pi pi-globe';
      case 'Метла': return 'pi pi-arrow-up-right';
      default: return 'pi pi-truck';
    }
  }

  async viewOrder(order: PotionOrder): Promise<void> {
    this.selectedOrder.set(order);
  }

  async deleteOrder(order: PotionOrder): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      message: `Вы уверены, что хотите удалить заказ ${order.potionNumber}?`,
      header: 'Удаление заказа',
      acceptLabel: 'Удалить',
      rejectLabel: 'Отмена'
    });

    if (confirmed) {
      this.potionService.deleteOrder(order.id);
      this.messageService.success(
        'Удалено',
        `Заказ ${order.potionNumber} успешно удален`
      );
    }
  }

  goToCreateOrder(): void {
    this.router.navigate(['/create']);
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.filteredOrders().length / this.pageSize);
    const pages: number[] = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return pages;
  }

  getPageButtonClass(page: number): string {
    const baseClass = 'page-button';
    return page === this.currentPage()
      ? `${baseClass} page-button-active`
      : baseClass;
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() * this.pageSize < this.filteredOrders().length) {
      this.currentPage.update(page => page + 1);
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  get selectedOrderData(): PotionOrder | null {
    return this.selectedOrder();
  }

  protected readonly Math = Math;
}

