import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlacesService } from '../places.service';
import { Place } from '../place.model';
import { IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {

  constructor(private placesService: PlacesService, private router: Router) { }

  offers: Place[];
  private placeSubject: Subscription;
  
  ngOnInit() {
    // 使用自定義的 subject，永遠要記得 un-subscribe
    // 每次資料有更新時候就會改變
    this.placeSubject = 
      this.placesService.places.subscribe(places => this.offers = places);
  }

  isLoading = false;
  ionViewWillEnter() {
    this.isLoading = true;
    // 當進入 view 時，會再進行呼叫 fetchPlaces，
    // 其中最後就會透過         tap(places => this._places.next(places))
    // 觸發 subject 去讀取資料（也就是在 ngOnInit 中的 subscribe ）
    this.placesService.fetchPlaces().subscribe(
      () => this.isLoading = false,
      error => console.log(error)
    );
  }

  onEditOffer(offerId: string, itemSlide: IonItemSliding) {
    itemSlide.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);
  }

  ngOnDestroy() {
    if (this.placeSubject){      
      this.placeSubject.unsubscribe();
    }
  }
}
