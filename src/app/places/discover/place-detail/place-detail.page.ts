import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NavController,
  ModalController,
  ActionSheetController, LoadingController, AlertController
} from "@ionic/angular";
import { PlacesService } from "../../places.service";
import { Place } from "../../place.model";
import { CreateBookingComponent } from "../../../bookings/create-booking/create-booking.component";
import { Subscription } from "rxjs";
import { BookingService } from "src/app/bookings/booking.service";
import { AuthService } from 'src/app/auth/auth.service';
import { MapModalComponent } from 'src/app/shared/map-modal/map-modal.component';

@Component({
  selector: "app-place-detail",
  templateUrl: "./place-detail.page.html",
  styleUrls: ["./place-detail.page.scss"],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  place: Place;
  isLoading = false;
  isBookable = false;
  placeSubscription: Subscription;
  ngOnInit() {
    this.route.paramMap.subscribe(
      (paramMap) => {
        if (!paramMap.has("placeId")) {
          this.navCtrl.navigateBack("/places/tabs/discover");
          return;
        }
        this.isLoading = true;
        this.placeSubscription = this.placesService
          .getPlace(paramMap.get("placeId"))
          .subscribe(
            (place) => {
              this.place = place;
              this.isBookable = place.userId !== this.authService.userId;
              this.isLoading = false;
            },
            async (error) => {
              console.log('into error handler');
              const alert = await this.alertCtrl.create({
                header: 'An error occurs!',
                message: 'Place could not be fetched, please try again',
                buttons: [{
                  text: 'Ok',
                  handler: () => {
                    this.router.navigate(['/places/tabs/discover']);
                  }
                }]
              });
              await alert.present();
            });
      });
  }

  async onBookPlace() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: "選擇一個指令",
      buttons: [
        {
          text: "Select Date",
          handler: () => this.openBookingModal("select"),
        },
        {
          text: "Random Date",
          handler: () => this.openBookingModal("random"),
        },
        {
          text: "Cancel",
          role: "cancel", // always on the bottom place
        },
      ],
    });

    await actionSheet.present();
  }

  async openBookingModal(mode: "select" | "random") {
    console.log(mode);

    const modal = await this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: {
        selectedPlace: this.place,
        selectedMode: mode,
      },
    });

    await modal.present();

    //以下兩種方式都可以達成
    const { data, role } = await modal.onDidDismiss();
    console.log(data);
    if (role === "confirm") {
      const loading = await this.loadingCtrl.create({message: 'Booking place...'});
      await loading.present();

      const bookingData = data.bookingData;
      this.bookingService.addBooking(this.place.id, this.place.title, this.place.imageUrl,
        bookingData.firstName, bookingData.lastName, bookingData.guestNumber, bookingData.startDate, bookingData.endDate)
        .subscribe(() => {
          loading.dismiss();
        });
    }

    // const result  = await modal.onDidDismiss();
    // console.log(result.data, result.role);

    /* 控制 navigation 機制 */
    // Angular 預設的控制 navigation 機制
    // this.router.navigateByUrl('/places/tabs/discover');

    // **** 比較好的方案 ****
    // Ionic 的 NavController 同樣可以控制（也是使用 Angular 的 router 機制）
    // 主要目的在於手機的 backward & forward 有不同的動畫狀態
    // this.navCtrl.navigateBack('/places/tabs/discover');

    // 因 Ionic 使用 page cache 儲存瀏覽過的頁面，因此也可以使用 POP 方式將舊的頁面傳上
    // 但這個會有一個大問題就是如果 refresh 頁面後， cache 會被清除，因此就不會有預期的反應
    // this.navCtrl.pop();
  }

  async onShowFullMap() {
    const modal = await this.modalCtrl.create({
      component: MapModalComponent,
      componentProps: {
        center: {lat: this.place.location.lat, lng: this.place.location.lng},
        selectable: false,
        closeButtonText: '結束',
        title: this.place.location.address
      }
    });
    await modal.present();

  }

  ngOnDestroy() {
    if (this.placeSubscription) {
      this.placeSubscription.unsubscribe();
    }
  }
}
