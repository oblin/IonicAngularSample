import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-places',
  templateUrl: './places.page.html',
  styleUrls: ['./places.page.scss'],
})
export class PlacesPage implements OnInit {

  constructor() { }

  tabPosition: string = 'top';
  ngOnInit() {
      if (window.innerWidth < 768)
        this.tabPosition = 'bottom';
  }
}
