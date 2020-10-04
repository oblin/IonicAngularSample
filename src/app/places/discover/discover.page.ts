import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';

import { PlacesService } from '../places.service';
import { Place } from '../place.model';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {

  constructor(private placeService: PlacesService, 
    private authService: AuthService,
    private menuCtrl: MenuController) { }
  
  loadedPlaces: Place[];
  listLoadedPlaces: Place[];
  relevantPlaces: Place[];
  loadedSubject: Subscription;
  ngOnInit() {
    this.loadedSubject = this.placeService.places.subscribe(places => {
      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
      this.listLoadedPlaces = this.relevantPlaces.slice(1);
    });
  }

  /* 
   * 透過 MenuController 開啟 side drawer
   * m1: menuId，如果只有一個，也可不傳入參數
   */
  onOpenMenu() {
    this.menuCtrl.toggle('m1');
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    if (event.detail.value === 'all') {
      this.relevantPlaces = this.loadedPlaces;
    } else {
      this.relevantPlaces = this.loadedPlaces.filter(place => 
        place.userId == this.authService.userId);
    }
    this.listLoadedPlaces = this.relevantPlaces.slice(1);
  }

  ngOnDestroy(): void {
    if (this.loadedSubject) {
      this.loadedSubject.unsubscribe();
    }
  }
}
