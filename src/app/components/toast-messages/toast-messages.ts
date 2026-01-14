import { Component, inject, OnDestroy, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MessageService } from '../../services/message';
import { ToastMessage } from '../../models/potion.model';

@Component({
  selector: 'app-toast-messages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-3 w-96 max-w-full">
      @for (message of messages(); track message.severity || message) {
        <div [class]="toastClasses()[message.severity]"
             class="p-4 rounded-lg shadow-lg border transform transition-all duration-300 animate-fade-in"
             role="alert">

          <div class="flex items-start">
            <div class="flex-shrink-0 mr-3">
              <i [class]="iconClasses()[message.severity]" class="text-lg"></i>
            </div>

            <div class="flex-1">
              <h4 class="font-semibold mb-1">{{ message.summary }}</h4>
              <p class="text-sm opacity-90">{{ message.detail }}</p>
            </div>

            <button (click)="remove(message)"
                    class="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 rounded">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class ToastMessagesComponent implements OnDestroy {
  private messageService = inject(MessageService);

  messages = this.messageService.messages;
  private timers = new Map<ToastMessage, any>();

  toastClasses = computed(() => {
    const baseClasses = 'border-l-4';

    return {
      'success': `${baseClasses} bg-green-50 border-green-500 text-green-800`,
      'error': `${baseClasses} bg-red-50 border-red-500 text-red-800`,
      'warn': `${baseClasses} bg-yellow-50 border-yellow-500 text-yellow-800`,
      'info': `${baseClasses} bg-blue-50 border-blue-500 text-blue-800`,
      'default': `${baseClasses} bg-gray-50 border-gray-500 text-gray-800`
    };
  });

  iconClasses = computed(() => {
    return {
      'success': 'pi pi-check-circle text-green-500',
      'error': 'pi pi-times-circle text-red-500',
      'warn': 'pi pi-exclamation-triangle text-yellow-500',
      'info': 'pi pi-info-circle text-blue-500',
      'default': 'pi pi-info-circle text-gray-500'
    };
  });

  private autoRemoveEffect = effect(() => {
    const currentMessages = this.messages();

    this.timers.forEach((timer, message) => {
      if (!currentMessages.includes(message)) {
        clearTimeout(timer);
        this.timers.delete(message);
      }
    });

    currentMessages.forEach(message => {
      if (!this.timers.has(message)) {
        const timer = setTimeout(() => {
          this.remove(message);
        }, message.life || 3000);

        this.timers.set(message, timer);
      }
    });
  });

  ngOnDestroy(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.autoRemoveEffect.destroy(); // Очищаем effect
  }

  remove(message: ToastMessage): void {
    const timer = this.timers.get(message);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(message);
    }
    this.messageService.removeMessage(message);
  }
}

