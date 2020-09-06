import { Component, OnInit } from '@angular/core';
import { PlacesService } from '../places.service';
import { Place } from '../place.model';
import { IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit {

  constructor(private placesService: PlacesService, private router: Router) { }

  offers: Place[];
  ngOnInit() {
    this.offers = this.placesService.places;
  }

  onEditOffer(offerId: string, itemSlide: IonItemSliding) {
    itemSlide.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);
  }
}
