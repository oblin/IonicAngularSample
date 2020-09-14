import { Component, OnInit } from '@angular/core';
import { Place } from '../../place.model';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { PlacesService } from '../../places.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit {

  constructor(private route: ActivatedRoute, 
    private navCtrl: NavController, private placesService: PlacesService) { }

  place: Place;
  form: FormGroup;
  ngOnInit() {
    // 這裡不需要使用 ionic 的 ionViewWillEnter()
    // 主要原因是因為 paramMap observer 會因為傳入的參數不同而啟發呼叫
    // 因此就算是 cached 的頁面也會觸發
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }

      this.place = this.placesService.getPlace(paramMap.get('placeId'));
      this.form = new FormGroup({
        title: new FormControl(this.place.title, {updateOn: 'blur', validators: [Validators.required]}),
        description: new FormControl(this.place.description, {updateOn: 'blur', validators: [Validators.required, Validators.maxLength(180)]})  
      });
    });
  }

  onUpdateOffer() {
    if (!this.form.valid) {
      return;
    }

    console.log(this.form);
  }
}
