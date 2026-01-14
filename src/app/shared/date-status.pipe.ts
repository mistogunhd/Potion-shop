import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateStatus',
  standalone: true
})
export class DateStatusPipe implements PipeTransform {
  transform(date: Date | string): string {
    const now = new Date();
    const readyDate = new Date(date);

    if (readyDate < now) {
      return 'date-danger';
    } else if (readyDate.getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000) {
      return 'date-warning';
    }
    return 'date-normal';
  }
}
