import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { ToastMessagesComponent } from './components/toast-messages/toast-messages';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ToastMessagesComponent,
    ConfirmationDialogComponent,
    Footer,
    Header
  ],
  templateUrl: 'app.html',
  styles: [`
    .wrapper {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  `]
})
export class App {
}
