import { Injectable } from '@angular/core';
import { Booking } from './booking.modal';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  _booking: Booking[] = [
    {
      id: 'xyz',
      placeId: "p1",
      placeTitle: "Mansion Mahatton",
      guestNumber: 2,
      userId: 'abc'
    }
  ];

  get bookings() {
    return [...this._booking];
  }
}
