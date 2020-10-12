import { Component, OnDestroy, OnInit } from "@angular/core";
import { IonItemSliding, LoadingController } from "@ionic/angular";

import { BookingService } from "./booking.service";
import { Booking } from "./booking.model";
import { Subscription } from 'rxjs';

@Component({
  selector: "app-bookings",
  templateUrl: "./bookings.page.html",
  styleUrls: ["./bookings.page.scss"],
})
export class BookingsPage implements OnInit, OnDestroy {
  constructor(private bookingService: BookingService,
    private loadingCtl: LoadingController) {}

  bookingSub: Subscription;
  loadedBookings: Booking[];
  ngOnInit() {
    this.bookingSub = this.bookingService.bookings.subscribe(
      bookings => {
        console.log('booking.page: ', bookings);
        this.loadedBookings = bookings;
      });
  }

  isLoading = false;
  ionViewWillEnter() {
    this.isLoading = true;
    this.bookingService.fetchBookings().subscribe(() => {
      this.isLoading = false;
    });
  }

  async onDeleteBooking(bookingId: string, slidingEl: IonItemSliding) {
    slidingEl.close();
    const loading = await this.loadingCtl.create({message: 'Canceling...'});
    await loading.present();
    this.bookingService.cancelBooking(bookingId).subscribe(() => loading.dismiss());
  }

  ngOnDestroy(): void {
    if (this.bookingSub){
      this.bookingSub.unsubscribe();
    }
  }
}
