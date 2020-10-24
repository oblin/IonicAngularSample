import { getLocaleDateFormat } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { tap, take, switchMap, first, map } from "rxjs/operators";
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

  /**
   * 新增 booking 物件，但回傳的目前的 booking list 
   * 不包含新的 list，新的 list 需要對 bookings.subscription 
   */
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
    let generatedId;
    let newBooking: Booking;
    // 因為這是使用者登入的資料，因此我們不需要後續的變化（使用者的變化只在進入這個 function 時候取得即可），
    // 如果不用 take(1) 則每次變化就會引發subscribe
    // 這裡的目的只在於當作一般的函數呼叫取出值而已
    return this.authService.userId.pipe(
      take(1),
      // 因為 userId 需要進行訂閱，但要回傳 booking id
      // 因此使用 switchMap 轉換
      switchMap((userId) => {
        if (!userId) {
          return;
        }
        newBooking = new Booking(
          Math.random().toString(),
          placeId,
          userId,
          placeTitle,
          placeImage,
          firstName,
          lastName,
          bookedFrom,
          bookedTo,
          guestNumber
        );
        // 傳回 new book 的 id 
        return this.http.post<{ name: string }>(
          "https://localhost:5001/booking",
          {
            ...newBooking,
            id: null,
          }
        );
      }),
      switchMap((resData) => {
        // 前面的 post 取得回傳的 id (resData.name)
        generatedId = resData.name;
        // 回傳目前的 booking list (不包含新的 book)
        // 這個也是最終的回傳值，因為後面使用的是 tap()
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
    return this.http.delete(`https://localhost:5001/booking/${bookingId}`).pipe(
      switchMap(() => {
        // 這裡的目的在於提供 LOCAL BOOKING LIST，非 SERVER 的內容
        return this.bookings;
      }),
      take(1), // 只處理一次後，就結束 SUBSCRIBE
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
        tap((bookings) => {
          this._bookings.next(bookings);
        })
      );
  }
}
