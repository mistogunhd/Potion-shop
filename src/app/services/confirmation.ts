import { Injectable, signal } from '@angular/core';

export interface ConfirmationOptions {
  message: string;
  header?: string;
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private confirmationSignal = signal<{
    visible: boolean;
    options: ConfirmationOptions;
    acceptCallback?: () => void;
    rejectCallback?: () => void;
  }>({
    visible: false,
    options: {
      message: '',
      header: 'Подтверждение',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Да',
      rejectLabel: 'Нет'
    }
  });

  readonly confirmationState = this.confirmationSignal.asReadonly();

  confirm(options: ConfirmationOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationSignal.set({
        visible: true,
        options: {
          header: 'Подтверждение',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Да',
          rejectLabel: 'Нет',
          ...options
        },
        acceptCallback: () => {
          this.hide();
          resolve(true);
        },
        rejectCallback: () => {
          this.hide();
          resolve(false);
        }
      });
    });
  }

  hide(): void {
    this.confirmationSignal.update(state => ({
      ...state,
      visible: false
    }));
  }
}
