import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';

import { PlacesService } from '../places.service';
import { Place } from '../place.model';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {

  constructor(private placeService: PlacesService, private menuCtrl: MenuController) { }
  
  loadedPlaces: Place[];
  listLoadedPlaces: Place[];
  loadedSubject: Subscription;
  ngOnInit() {
    this.loadedSubject = this.placeService.places.subscribe(places => {
      this.loadedPlaces = places
      this.listLoadedPlaces = places.slice(1);
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
    console.log(event.detail);
  }

  ngOnDestroy(): void {
    if (this.loadedSubject) {
      this.loadedSubject.unsubscribe();
    }
  }
}
