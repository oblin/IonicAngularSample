import { getLocaleDateFormat } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { tap, take, delay, switchMap, first, map } from "rxjs/operators";
import { AuthService } from "../auth/auth.service";
import { Booking } from "./booking.model";

interface BookingData {
  placeId: string;
  userId: string;
  placeTitle: string;
  placeImage: string;
  firstName: string;
  lastName: string;
  bookedFrom: string;
  bookedTo: string;
  guestNumber: number;
}

@Injectable({
  providedIn: "root",
})
export class BookingService {
  constructor(private authService: AuthService, private http: HttpClient) {}

  _bookings = new BehaviorSubject<Booking[]>([]);

  get bookings(): Observable<Booking[]> {
    return this._bookings.asObservable();
  }

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    bookedFrom: Date,
    bookedTo: Date
  ): Observable<Booking[]> {
    const newBooking = new Booking(
      Math.random().toString(),
      placeId,
      this.authService.userId,
      placeTitle,
      placeImage,
      firstName,
      lastName,
      bookedFrom,
      bookedTo,
      guestNumber
    );

    let generatedId;
    return this.http
      .post<{ name: string }>("https://localhost:5001/booking", {
        ...newBooking,
        id: null,
      })
      .pipe(
        switchMap((restData) => {
          generatedId = restData.name;
          return this.bookings;
        }),
        // 這個 take(1) 非常重要，否則 subscribe client 會一直等待 switchMap 中的 list 的變化
        // take(1),
        // 也可以使用 first，其中差異在於：如果沒有內容 first 會出錯誤，但 take 1 不會
        first(),
        tap((bookings) => {
          newBooking.id = generatedId;
          this._bookings.next(bookings.concat(newBooking));
        })
      );
  }

  cancelBooking(bookingId: string) {
    return this.http.delete(`https://localhost:5001/booking/${bookingId}`)
      .pipe(
        switchMap(() => {
          // 這裡的目的在於提供 LOCAL BOOKING LIST，非 SERVER 的內容
          return this.bookings;
        }), 
        take(1),  // 只處理一次後，就結束 SUBSCRIBE
        tap((bookings) =>
          // 取得上方的 SWITCHMAP 的 BOOKINGS LIST，並且移除特定的內容
          this._bookings.next(bookings.filter((b) => b.id !== bookingId))
        )
      );
  }

  fetchBookings(): Observable<Booking[]> {
    return this.http
      .get<{ [key: string]: BookingData }>(
        `https://localhost:5001/booking?userId=${this.authService.userId}`
      )
      .pipe(
        map((bookingData) => {
          const bookings = [];
          for (const key in bookingData) {
            if (bookingData.hasOwnProperty(key)) {
              bookings.push(
                new Booking(
                  key,
                  bookingData[key].placeId,
                  bookingData[key].userId,
                  bookingData[key].placeTitle,
                  bookingData[key].placeImage,
                  bookingData[key].firstName,
                  bookingData[key].lastName,
                  new Date(bookingData[key].bookedFrom),
                  new Date(bookingData[key].bookedTo),
                  bookingData[key].guestNumber
                )
              );
            }
          }
          return bookings;
        }),
        tap(bookings => {
          this._bookings.next(bookings);
        })
      );
  }
}
