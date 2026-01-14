import { Injectable, signal, computed } from '@angular/core';
import { PotionOrder, AvailableIngredient, DeliveryMethod, PaymentMethod, Ingredient } from '../models/potion.model';

@Injectable({
  providedIn: 'root'
})
export class PotionService {
  private readonly STORAGE_KEY = 'potion_shop_orders';

  private ordersSignal = signal<PotionOrder[]>(this.loadFromStorage());
  private nextIdSignal = signal<number>(1);

  readonly orders = computed(() => this.ordersSignal());
  readonly totalOrders = computed(() => this.ordersSignal().length);
  readonly totalRevenue = computed(() =>
    this.ordersSignal().reduce((sum, order) => sum + order.totalCost, 0)
  );

  readonly availableIngredients: AvailableIngredient[] = [
    { id: 1, name: 'Корень мандрагоры', description: 'Испускает крик при выкапывании', unit: 'гр', pricePerUnit: 50, category: 'plant' },
    { id: 2, name: 'Крыло летучей мыши', description: 'Высушенное и измельченное', unit: 'шт', pricePerUnit: 30, category: 'animal' },
    { id: 3, name: 'Чешуя дракона', description: 'Огнестойкая, редкая', unit: 'гр', pricePerUnit: 100, category: 'animal' },
    { id: 4, name: 'Слезы феникса', description: 'Обладает целительными свойствами', unit: 'мл', pricePerUnit: 200, category: 'magical' },
    { id: 5, name: 'Пыльца лунного цветка', description: 'Собирается только в полнолуние', unit: 'гр', pricePerUnit: 75, category: 'plant' },
    { id: 6, name: 'Кровь единорога', description: 'Серебристая, светящаяся', unit: 'мл', pricePerUnit: 500, category: 'magical' },
    { id: 7, name: 'Паутина призрачного паука', description: 'Невидима невооруженным глазом', unit: 'гр', pricePerUnit: 120, category: 'animal' },
    { id: 8, name: 'Коготь грифона', description: 'Острый как бритва', unit: 'шт', pricePerUnit: 80, category: 'animal' },
    { id: 9, name: 'Лунный камень', description: 'Светится в темноте', unit: 'гр', pricePerUnit: 150, category: 'mineral' },
    { id: 10, name: 'Перо сирены', description: 'Играет всеми цветами радуги', unit: 'шт', pricePerUnit: 90, category: 'magical' }
  ];

  readonly deliveryMethods = Object.values(DeliveryMethod);
  readonly paymentMethods = Object.values(PaymentMethod);

  constructor() {
    if (this.ordersSignal().length === 0) {
      this.initializeSampleData();
    }
  }

  addOrder(order: Omit<PotionOrder, 'id' | 'totalCost'>): PotionOrder {
    const totalCost = order.ingredients.reduce((sum, ing) => sum + ing.totalPrice, 0);
    const newOrder: PotionOrder = {
      ...order,
      id: `order_${Date.now()}_${this.nextIdSignal()}`,
      totalCost
    };

    this.ordersSignal.update(orders => [...orders, newOrder]);
    this.nextIdSignal.update(id => id + 1);
    this.saveToStorage();

    return newOrder;
  }

  deleteOrder(id: string): void {
    this.ordersSignal.update(orders =>
      orders.filter(order => order.id !== id)
    );
    this.saveToStorage();
  }

  generatePotionNumber(): string {
    const prefix = 'POT';
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${year}${month}-${sequence}`;
  }

  calculateIngredientTotal(quantity: number, unitPrice: number): number {
    return parseFloat((quantity * unitPrice).toFixed(2));
  }

  private loadFromStorage(): PotionOrder[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.map((order: any) => ({
          ...order,
          orderDate: new Date(order.orderDate),
          readyDate: new Date(order.readyDate)
        }));
      }
    } catch (error) {
      console.error('Error:', error);
    }
    return [];
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.ordersSignal()));
    } catch (error) {
      console.error('Error:', error);
    }
  }

  private initializeSampleData(): void {
    const sampleOrder: Omit<PotionOrder, 'id' | 'totalCost'> = {
      potionNumber: this.generatePotionNumber(),
      customer: 'Тестовое имя 1',
      orderDate: new Date('2024-01-14'),
      readyDate: new Date('2024-01-18'),
      deliveryAddress: 'Тестовая улица 1',
      deliveryMethod: DeliveryMethod.OWL,
      paymentMethod: PaymentMethod.GOLD,
      ingredients: [
        { id: 1, name: 'Корень мандрагоры', quantity: 2, unitPrice: 50, totalPrice: 100 },
        { id: 4, name: 'Слезы феникса', quantity: 1, unitPrice: 200, totalPrice: 200 },
        { id: 5, name: 'Пыльца лунного цветка', quantity: 3, unitPrice: 75, totalPrice: 225 }
      ]
    };

    this.addOrder(sampleOrder);
  }
}
