import { Injectable, signal } from '@angular/core';
import { ToastMessage } from '../models/potion.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messagesSignal = signal<ToastMessage[]>([]);

  readonly messages = this.messagesSignal.asReadonly();

  show(severity: ToastMessage['severity'], summary: string, detail: string, life: number = 3000): void {
    const message: ToastMessage = { severity, summary, detail, life };

    this.messagesSignal.update(messages => [...messages, message]);

    setTimeout(() => {
      this.removeMessage(message);
    }, life);
  }

  success(summary: string, detail: string): void {
    this.show('success', summary, detail);
  }

  error(summary: string, detail: string): void {
    this.show('error', summary, detail);
  }

  info(summary: string, detail: string): void {
    this.show('info', summary, detail);
  }

  warn(summary: string, detail: string): void {
    this.show('warn', summary, detail);
  }

  removeMessage(message: ToastMessage): void {
    this.messagesSignal.update(messages =>
      messages.filter(m => m !== message)
    );
  }

  clear(): void {
    this.messagesSignal.set([]);
  }
}
