import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-offer-bookings',
  templateUrl: './offer-bookings.page.html',
  styleUrls: ['./offer-bookings.page.scss'],
})
export class OfferBookingsPage implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute, 
    private navCtrl: NavController, private placesService: PlacesService) { }

  placeSub: Subscription;
  place: Place;
  ngOnInit() {
    // 這裡不需要使用 ionic 的 ionViewWillEnter()
    // 主要原因是因為 paramMap observer 會因為傳入的參數不同而啟發呼叫
    // 因此就算是 cached 的頁面也會觸發
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }

      this.placeSub = this.placesService.getPlace(paramMap.get('placeId')).subscribe(place => this.place = place);
    });
  }

  ngOnDestroy() {
    if (this.placeSub){
      this.placeSub.unsubscribe();
    }
  }
}
