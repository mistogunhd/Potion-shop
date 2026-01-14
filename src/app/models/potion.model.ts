export interface Ingredient {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export enum DeliveryMethod {
  OWL = 'Сова',
  DRAGON = 'Дракон',
  PORTAL = 'Портал',
  BROOM = 'Метла'
}

export enum PaymentMethod {
  GOLD = 'Золото',
  CRYSTAL = 'Кристаллы',
  BARTER = 'Бартер',
  PROMISE = 'Обещание'
}

export interface PotionOrder {
  id: string;
  potionNumber: string;
  customer: string;
  orderDate: Date;
  readyDate: Date;
  deliveryAddress: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  ingredients: Ingredient[];
  totalCost: number;
}

export interface AvailableIngredient {
  id: number;
  name: string;
  description: string;
  unit: string;
  pricePerUnit: number;
  category: 'plant' | 'animal' | 'mineral' | 'magical';
}

export interface ToastMessage {
  severity: 'success' | 'error' | 'info' | 'warn';
  summary: string;
  detail: string;
  life?: number;
}
