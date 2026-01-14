import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static minDate(minDate: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const selectedDate = new Date(control.value);
      const min = new Date(minDate);

      return selectedDate >= min ? null : { minDate: { required: minDate } };
    };
  }

  static maxDate(maxDate: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const selectedDate = new Date(control.value);
      const max = new Date(maxDate);

      return selectedDate <= max ? null : { maxDate: { required: maxDate } };
    };
  }

  static atLeastThreeIngredients(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!Array.isArray(control.value)) return { minIngredients: { required: 3 } };
      return control.value.length >= 3 ? null : { minIngredients: { required: 3, actual: control.value.length } };
    };
  }

  static positiveNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined) return null;
      const num = parseFloat(control.value);
      return num > 0 ? null : { positiveNumber: true };
    };
  }

  static notEmptyString(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.trim().length === 0) {
        return { notEmptyString: true };
      }
      return null;
    };
  }
}
