import { Component, inject, OnInit, signal, DestroyRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import {of, tap, catchError, finalize, Subject} from 'rxjs';

import { PotionService } from '../../services/potion';
import { MessageService } from '../../services/message';
import { CustomValidators } from '../../shared/validators';
import { IngredientsEditorComponent } from '../ingredients-editor/ingredients-editor';
import { takeUntil } from 'rxjs/operators';
import {AvailableIngredient, DeliveryMethod, PaymentMethod} from '../../models/potion.model';


@Component({
  selector: 'app-potion-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IngredientsEditorComponent,
  ],
  templateUrl: 'potion-form.html',
  styles: [`
    .potion-form {
      @apply bg-white p-6 rounded-xl shadow-sm border border-gray-200;
    }

    .delivery-method-btn {
      @apply p-3 rounded-lg border font-medium text-center transition-all duration-200
             flex items-center justify-center;
    }

    .delivery-method-active {
      @apply border-2 border-primary-500 bg-primary-50 text-primary-700;
    }

    .delivery-method-inactive {
      @apply border-gray-300 bg-white text-gray-700 hover:bg-gray-50;
    }

    .payment-method-btn {
      @apply p-3 rounded-lg border font-medium text-center transition-all duration-200
             flex items-center justify-center;
    }

    .payment-method-active {
      @apply border-2 border-green-500 bg-green-50 text-green-700;
    }

    .payment-method-inactive {
      @apply border-gray-300 bg-white text-gray-700 hover:bg-gray-50;
    }
  `]
})
export class PotionFormComponent implements OnInit {
  private potionService = inject(PotionService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  private destroy$ = new Subject<void>()

  potionForm!: FormGroup;
  isSubmitting = signal<boolean>(false);

  deliveryMethods: string[] = this.potionService.deliveryMethods;
  paymentMethods: string[] = this.potionService.paymentMethods;
  availableIngredients: AvailableIngredient[] = this.potionService.availableIngredients;

  selectedDeliveryMethod = signal<string | null>(null);
  selectedPaymentMethod = signal<string | null>(null);

  deliveryMethodClasses = computed(() => {
    const selectedMethod = this.selectedDeliveryMethod();
    return this.deliveryMethods.reduce((acc, method) => {
      acc[method] = {
        'delivery-method-btn': true,
        'delivery-method-active': selectedMethod === method,
        'delivery-method-inactive': selectedMethod !== method
      };
      return acc;
    }, {} as Record<string, any>);
  });

  paymentMethodClasses = computed(() => {
    const selectedMethod = this.selectedPaymentMethod();
    return this.paymentMethods.reduce((acc, method) => {
      acc[method] = {
        'payment-method-btn': true,
        'payment-method-active': selectedMethod === method,
        'payment-method-inactive': selectedMethod !== method
      };
      return acc;
    }, {} as Record<string, any>);
  });

  minDate!: Date;
  tomorrow!: Date;
  maxDate!: Date;
  maxReadyDate!: Date;

  ngOnInit(): void {
    this.initializeDates();
    this.initializeForm();
    this.setupDateValidation();
    this.setupFormValueChanges();
  }

  private initializeDates(): void {
    this.minDate = new Date();
    this.tomorrow = new Date();
    this.tomorrow.setDate(this.tomorrow.getDate() + 1);
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() + 1);
    this.maxReadyDate = new Date();
    this.maxReadyDate.setFullYear(this.maxReadyDate.getFullYear() + 1);
  }

  private initializeForm(): void {
    this.potionForm = this.fb.group({
      potionNumber: [
        this.potionService.generatePotionNumber(),
        [Validators.required, CustomValidators.notEmptyString()]
      ],
      customer: [
        '',
        [Validators.required, Validators.minLength(2)]
      ],
      orderDate: [
        new Date(),
        [Validators.required, CustomValidators.minDate(this.minDate)]
      ],
      readyDate: [
        this.tomorrow,
        [Validators.required, CustomValidators.minDate(this.tomorrow)]
      ],
      deliveryAddress: [
        '',
        [Validators.required, Validators.minLength(5)]
      ],
      deliveryMethod: [
        null,
        Validators.required
      ],
      paymentMethod: [
        null,
        Validators.required
      ],
      ingredients: [
        [],
        [Validators.required, CustomValidators.atLeastThreeIngredients()]
      ]
    });
  }

  private setupDateValidation(): void {
    const orderDateControl = this.potionForm.get('orderDate') as FormControl<Date | string | null>;
    orderDateControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const orderDate = this.potionForm.get('orderDate')?.value;
        if (orderDate) {
          const minReadyDate = new Date(orderDate);
          minReadyDate.setDate(minReadyDate.getDate() + 1);
          this.potionForm.get('readyDate')?.setValidators([
            Validators.required,
            CustomValidators.minDate(minReadyDate)
          ]);
          this.potionForm.get('readyDate')?.updateValueAndValidity();
        }
      });
  }

  private setupFormValueChanges(): void {
    const deliveryMethodControl = this.potionForm.get('deliveryMethod') as FormControl<DeliveryMethod | null>;
    deliveryMethodControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: string | null) => {
        this.selectedDeliveryMethod.set(value);
      });

    const paymentMethodControl = this.potionForm.get('paymentMethod') as FormControl<PaymentMethod | null>;
    paymentMethodControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: string | null) => {
        this.selectedPaymentMethod.set(value);
      });
  }

  selectDeliveryMethod(method: string): void {
    this.potionForm.patchValue({ deliveryMethod: method });
  }

  selectPaymentMethod(method: string): void {
    this.potionForm.patchValue({ paymentMethod: method });
  }

  onSubmit(): void {
    if (this.potionForm.invalid) {
      this.markFormGroupTouched(this.potionForm);
      this.messageService.error(
        'Ошибка',
        'Пожалуйста, заполните все обязательные поля корректно'
      );
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.potionForm.value;
    const orderDate = new Date(formValue.orderDate);
    const readyDate = new Date(formValue.readyDate);

    of(this.potionService.addOrder({
      ...formValue,
      orderDate,
      readyDate
    }))
      .pipe(
        tap(newOrder => {
          this.messageService.success(
            'Зелье создано!',
            `Заказ ${newOrder.potionNumber} успешно добавлен`
          );
          this.resetForm();
        }),
        catchError(error => {
          this.messageService.error(
            'Ошибка',
            'Не удалось создать заказ. Пожалуйста, попробуйте снова.'
          );
          return of(null);
        }),
        finalize(() => {
          this.isSubmitting.set(false);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  resetForm(): void {
    this.potionForm.reset({
      potionNumber: this.potionService.generatePotionNumber(),
      orderDate: new Date(),
      readyDate: this.tomorrow,
      ingredients: []
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control as any);
      }
    });
  }
}

