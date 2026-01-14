import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfirmationService } from '../../services/confirmation';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="state().visible"
         class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">

      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 animate-scale-in">

        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <div *ngIf="state().options.icon"
                 [class]="getIconClasses()"
                 class="flex-shrink-0">
              <i [class]="state().options.icon"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900">
              {{ state().options.header }}
            </h3>
          </div>
        </div>

        <div class="p-6">
          <p class="text-gray-700 leading-relaxed">
            {{ state().options.message }}
          </p>
        </div>

        <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button (click)="onReject()"
                  class="px-5 py-2.5 border border-gray-300 rounded-lg font-medium
                         text-gray-700 hover:bg-gray-50 focus:outline-none
                         focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
                         transition duration-200">
            {{ state().options.rejectLabel }}
          </button>

          <button (click)="onAccept()"
                  class="px-5 py-2.5 bg-primary-600 text-white rounded-lg font-medium
                         hover:bg-primary-700 focus:outline-none
                         focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                         transition duration-200">
            {{ state().options.acceptLabel }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-scale-in {
      animation: scaleIn 0.2s ease-out;
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `]
})
export class ConfirmationDialogComponent {
  private confirmationService = inject(ConfirmationService);

  state = this.confirmationService.confirmationState;

  onAccept(): void {
    if (this.state().acceptCallback) {
      this.state().acceptCallback!();
    }
  }

  onReject(): void {
    if (this.state().rejectCallback) {
      this.state().rejectCallback!();
    }
  }

  getIconClasses(): string {
    return 'w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600';
  }
}
