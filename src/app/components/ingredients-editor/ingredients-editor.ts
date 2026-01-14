import { Component, forwardRef, inject, input, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormControl
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Ingredient } from '../../models/potion.model';
import { PotionService } from '../../services/potion';
import { CustomValidators } from '../../shared/validators';

@Component({
  selector: 'app-ingredients-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: 'ingredients-editor.html',
  styles: [`
    :host {
      display: block;
    }

    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      opacity: 1;
      margin: 0;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IngredientsEditorComponent),
      multi: true
    }
  ]
})
export class IngredientsEditorComponent implements ControlValueAccessor, OnInit {
  private potionService = inject(PotionService);
  private fb = inject(FormBuilder);

  private destroy$ = new Subject<void>();

  readonly availableIngredients = input(this.potionService.availableIngredients);

  ingredientsForm!: FormGroup;
  disabled = false;

  private onChange: (value: Ingredient[]) => void = () => {};
  private onTouched: () => void = () => {};

  usedIngredientIds = signal<number[]>([]);
  totalCost = signal<number>(0);

  ingredientMap = computed(() => {
    const ingredients = this.availableIngredients();
    return new Map(ingredients.map(ing => [ing.id, ing]));
  });

  validationMessages = computed(() => {
    const ingredientCount = this.ingredients.controls.length;
    const missingCount = 3 - ingredientCount;
    const isValid = ingredientCount >= 3;

    return {
      isValid,
      message: missingCount > 0 ? `Добавьте ещё ${missingCount} ингредиента` : '',
      canRemove: ingredientCount > 3
    };
  });

  ingredientDescriptions = computed(() => {
    const descriptions = new Map<number, string>();
    this.availableIngredients().forEach(ingredient => {
      if (ingredient.description) {
        descriptions.set(ingredient.id, ingredient.description);
      }
    });
    return descriptions;
  });

  ngOnInit(): void {
    this.initializeForm();

    if (this.ingredients.length === 0) {
      this.addIngredient();
      this.addIngredient();
      this.addIngredient();
    }

    this.ingredientsForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateUsedIngredients();
        this.updateTotalCost();
        this.updateValue();
      });
  }

  private initializeForm(): void {
    this.ingredientsForm = this.fb.group({
      ingredients: this.fb.array([], CustomValidators.atLeastThreeIngredients())
    });
  }

  get ingredients(): FormArray {
    return this.ingredientsForm.get('ingredients') as FormArray;
  }

  addIngredient(): void {
    const ingredientGroup = this.fb.group({
      id: [null, CustomValidators.notEmptyString()],
      name: [''],
      quantity: [1, [CustomValidators.positiveNumber()]],
      unitPrice: [0],
      totalPrice: [0]
    });

    const quantityControl = ingredientGroup.get('quantity') as FormControl<number | null>;
    quantityControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.calculateTotal(ingredientGroup));

    const unitPriceControl = ingredientGroup.get('unitPrice') as FormControl<number | null>;
    unitPriceControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.calculateTotal(ingredientGroup));

    this.ingredients.push(ingredientGroup);
  }

  removeIngredient(index: number): void {
    if (this.ingredients.length > 3) {
      this.ingredients.removeAt(index);
      this.updateValue();
    }
  }

  onIngredientChange(index: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const ingredientId = parseInt(select.value);
    const ingredient = this.ingredientMap().get(ingredientId);

    if (ingredient) {
      const ingredientGroup = this.ingredients.at(index) as FormGroup;
      ingredientGroup.patchValue({
        name: ingredient.name,
        unitPrice: ingredient.pricePerUnit
      }, { emitEvent: false });

      this.calculateTotal(ingredientGroup);
    }
  }

  calculateTotal(ingredientGroup: FormGroup): void {
    const quantity = ingredientGroup.get('quantity')?.value || 0;
    const unitPrice = ingredientGroup.get('unitPrice')?.value || 0;
    const totalPrice = this.potionService.calculateIngredientTotal(quantity, unitPrice);

    ingredientGroup.patchValue({
      totalPrice: totalPrice
    }, { emitEvent: false });
  }

  private updateTotalCost(): void {
    const total = this.ingredients.controls.reduce((acc, control) => {
      return acc + (control.get('totalPrice')?.value || 0);
    }, 0);

    this.totalCost.set(total);
  }

  private updateUsedIngredients(): void {
    const usedIds = this.ingredients.controls
      .map(control => control.get('id')?.value)
      .filter(id => id !== null && id !== '')
      .map(id => parseInt(id));

    this.usedIngredientIds.set(usedIds);
  }

  writeValue(value: Ingredient[]): void {
    this.ingredients.clear();

    if (value && Array.isArray(value)) {
      value.forEach(ingredient => {
        const ingredientGroup = this.fb.group({
          id: [ingredient.id, CustomValidators.notEmptyString()],
          name: [ingredient.name],
          quantity: [ingredient.quantity, [CustomValidators.positiveNumber()]],
          unitPrice: [ingredient.unitPrice],
          totalPrice: [ingredient.totalPrice]
        });

        const quantityControl = ingredientGroup.get('quantity') as FormControl<number | null>;
        quantityControl.valueChanges
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => this.calculateTotal(ingredientGroup));

        const unitPriceControl = ingredientGroup.get('unitPrice') as FormControl<number | null>;
        unitPriceControl.valueChanges
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => this.calculateTotal(ingredientGroup));

        this.ingredients.push(ingredientGroup);
      });
    }

    if (this.ingredients.length === 0) {
      this.addIngredient();
      this.addIngredient();
      this.addIngredient();
    }

    this.updateTotalCost();
  }

  registerOnChange(fn: (value: Ingredient[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.ingredientsForm.disable();
    } else {
      this.ingredientsForm.enable();
    }
  }

  private updateValue(): void {
    if (this.ingredientsForm.valid) {
      const ingredientsValue = this.ingredients.value.map((ing: any) => ({
        ...ing,
        id: parseInt(ing.id),
        totalPrice: parseFloat(ing.totalPrice.toFixed(2))
      }));
      this.onChange(ingredientsValue);
      this.onTouched();
    } else {
      this.onChange([]);
    }
  }
}

