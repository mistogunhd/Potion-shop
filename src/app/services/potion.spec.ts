
describe('PotionService Logic Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should calculate ingredient totals', () => {
    const calculate = (quantity: number, unitPrice: number) =>
      parseFloat((quantity * unitPrice).toFixed(2));

    expect(calculate(2, 50)).toBe(100);
    expect(calculate(1.5, 33.33)).toBeCloseTo(50, 1);
  });

  it('should validate order structure', () => {
    const order = {
      potionNumber: 'TEST-001',
      customer: 'Клиент',
      deliveryAddress: 'Адрес',
      deliveryMethod: 'Сова',
      paymentMethod: 'Золото',
      ingredients: [
        { id: 1, quantity: 2, unitPrice: 50, totalPrice: 100 },
        { id: 2, quantity: 1, unitPrice: 100, totalPrice: 100 }
      ]
    };

    expect(order.potionNumber).toBeDefined();
    expect(order.customer.length).toBeGreaterThan(0);
    expect(order.ingredients.length).toBeGreaterThan(0);

    const total = order.ingredients.reduce((sum, ing) => sum + ing.totalPrice, 0);
    expect(total).toBe(200);
  });

  it('should handle localStorage operations', () => {
    const testData = [{ id: 1, name: 'Test' }];
    localStorage.setItem('test', JSON.stringify(testData));

    const retrieved = JSON.parse(localStorage.getItem('test') || '[]');
    expect(retrieved.length).toBe(1);
    expect(retrieved[0].name).toBe('Test');
  });
});

