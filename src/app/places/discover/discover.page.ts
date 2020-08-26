import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

import { PlacesService } from '../places.service';
import { Place } from '../place.model';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit {

  constructor(private placeService: PlacesService, private menuCtrl: MenuController) { }
  
  loadedPlaces: Place[];

  ngOnInit() {
    this.loadedPlaces = this.placeService.places;
  }

  /* 
   * 透過 MenuController 開啟 side drawer
   * m1: menuId，如果只有一個，也可不傳入參數
   */
  onOpenMenu() {
    this.menuCtrl.toggle('m1');
  }
}
