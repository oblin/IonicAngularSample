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
    this.placeSubject = 
      this.placesService.places.subscribe(places => this.offers = places);
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
