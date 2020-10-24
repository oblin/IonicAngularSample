import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

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

  ionViewWillEnter() {
    // 因為一開始沒有 fetchPlaces 就不會到後端 webapi 取出資料，因此每一個都需要再次讀取
    // 這個可以跟 offer.page.ts 兩者進行優化
    this.placeService.fetchPlaces().subscribe();
  }

  /* 
   * 透過 MenuController 開啟 side drawer
   * m1: menuId，如果只有一個，也可不傳入參數
   */
  onOpenMenu() {
    this.menuCtrl.toggle('m1');
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      if (event.detail.value === 'all') {
        this.relevantPlaces = this.loadedPlaces;
      } else {
        this.relevantPlaces = this.loadedPlaces.filter(place => 
          place.userId == userId);
      }
      this.listLoadedPlaces = this.relevantPlaces.slice(1);
    });
  }

  ngOnDestroy(): void {
    if (this.loadedSubject) {
      this.loadedSubject.unsubscribe();
    }
  }
}
