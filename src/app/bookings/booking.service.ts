import { getLocaleDateFormat } from '@angular/common';
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { tap, take, delay } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Booking } from "./booking.model";

@Injectable({
  providedIn: "root",
})
export class BookingService {

  constructor(private authService: AuthService) { }

  _booking = new BehaviorSubject<Booking[]>([]);

  get bookings(): Observable<Booking[]> {
    return this._booking.asObservable();
  }

  addBooking(placeId: string, placeTitle: string, placeImage: string, firstName: string,
    lastName: string, guestNumber: number, bookedFrom: Date, bookedTo: Date) {
    const newBooking = new Booking(Math.random().toString(), placeId,
      this.authService.userId, placeTitle, placeImage, firstName, lastName, bookedFrom, bookedTo, guestNumber);

    return this.bookings.pipe(take(1), delay(1000),
      tap(bookings => this._booking.next(bookings.concat(newBooking))));
  }

  cancelBooking(bookingId: string) {
    return this.bookings.pipe(take(1),
      delay(1000), tap(bookings => 
        this._booking.next(bookings.filter(b => b.id !== bookingId))));
  }
}
