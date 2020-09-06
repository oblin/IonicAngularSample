import { Component, OnInit } from '@angular/core';
import { IonItemSliding } from '@ionic/angular';

import { BookingService } from './booking.service';
import { Booking } from './booking.modal';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit {

  constructor(private bookingService: BookingService) { }

  loadedBookings: Booking[];
  ngOnInit() {
    this.loadedBookings = this.bookingService.bookings;
  }

  onDeleteBooking(bookingId: string,itemSlide: IonItemSliding) {
    itemSlide.close();
    // delete booking id
  }
}
