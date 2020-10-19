import { HttpClient } from "@angular/common/http";
import { Component, EventEmitter, OnInit, Output, Input } from "@angular/core";
import { ActionSheetController, AlertController, ModalController } from "@ionic/angular";
import { map, switchMap } from 'rxjs/operators';
import { Plugins, Capacitor, Geolocation } from '@capacitor/core';

import { MapModalComponent } from "../../map-modal/map-modal.component";
import { environment } from "../../../../environments/environment";
import { of } from 'rxjs';
import { PlaceLocation, Coordinates } from 'src/app/places/location.model';

/**
 * 使用在 new-offer.page.ts，透過 OUTPUT locationPicker emit 最終的結果
 */
@Component({
  selector: "app-location-picker",
  templateUrl: "./location-picker.component.html",
  styleUrls: ["./location-picker.component.scss"],
})
export class LocationPickerComponent implements OnInit {
  constructor(private modalCtrl: ModalController, private http: HttpClient,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController) {}

  ngOnInit() {}

  @Output() locationPicker = new EventEmitter<PlaceLocation>();
  // 用來處理 selectedImage 當存檔後，再次被新增未被清除的問題
  @Input() showPreview = false;
  selectedLocationImage: string;
  isLoading = false;
  async onPickLocation() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Please Choose', buttons: [
        { text: 'Auto-Locate', handler: () => {
          this.locateUser(); 
        }},
        { text: 'Pick on Map', handler: async () => {
          await this.openMap();
        }},
        { text: 'Cancel', role: 'cancel'},
      ]
    });
    await actionSheet.present();
  }

  private async locateUser () {
    // 拼字必須要正確
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      await this.showErrorAlert();
      return;
    }
    this.isLoading = true;
    try {
      const position = await Geolocation.getCurrentPosition();
      var coordinates: Coordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      this.createPlace(coordinates.lat, coordinates.lng);
      this.isLoading = false;
    } catch (e) {
      await this.showErrorAlert();
    }
  }

  private async showErrorAlert() {
    await this.alertCtrl.create({
      header: 'Geo location can not be fetched',
      message: 'Place use Pickup on Map',
      buttons: ['OK']
    });
  }

  private async openMap() {
    const modal = await this.modalCtrl.create({ component: MapModalComponent });
    await modal.present();
    const modalData = await modal.onDidDismiss();
    if (modalData.data) {
      this.isLoading = true;
      this.createPlace(modalData.data.lat, modalData.data.lng);
      // 除了地址之外，也要取得地址對應的街景圖，因此改用 SWITCHMAP 取得不同的 OBSERVABLE
      // .subscribe((address) => {
      //   console.log(address);
      // });
    }
  }

  private createPlace(lat: number, lng: number) {
    const pickedLocation: PlaceLocation = {
      lat: lat,
      lng: lng,
      address: null,
      staticMapImageUrl: null
    };

    this.getAddress(lat, lng)
      .pipe(
        switchMap((address: string) => {
          pickedLocation.address = address;
          return of(this.getMapImageUrl(pickedLocation.lat, pickedLocation.lng, 13));
        }))
      .subscribe(staticMapImageUrl => {
        pickedLocation.staticMapImageUrl = staticMapImageUrl;
        this.selectedLocationImage = staticMapImageUrl;
        this.isLoading = false;
        this.locationPicker.emit(pickedLocation);
      });
  }

  /**
   * 查詢 GOOGLE Geocoding API：座標轉換地址
   * 必須要先啟用 GOECODING API 服務（跟 GOOGLE JAVASCRIPT API 不同）
   * https://developers.google.com/maps/documentation/geocoding/start
   */
  private getAddress(lat: number, lng: number) {
    return this.http
      .get<any>(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googleMapsAPIKey}`)
      .pipe(
        map(geoData => {
          // console.log(geoData); // 會回傳許多地址，但實際上只需要一個
          if (!geoData || !geoData.results || geoData.results.length === 0) {
            return null;
          }
          return geoData.results[0].formatted_address;
        }));
  }

  /**
   * 取回座標地圖的圖像（ＩＭＡＧＥ）的 URL
   * 這裡不需要使用 HTTP REQUEST，因為畫面預計就是用這個網址
   * Map static API doc: https://developers.google.com/maps/documentation/maps-static/overview
   * @param lat 
   * @param lng 
   * @param zoom 
   */
  private getMapImageUrl(lat: number, lng: number, zoom: number) {
    // 排版問題，必須要齊頭，不然網址會有空白
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}
&zoom=${zoom}
&size=500x300
&maptype=roadmap
&markers=color:red
%7Clabel:Place
%7C${lat},${lng}
&key=${environment.googleMapsAPIKey}`;
  }
}
