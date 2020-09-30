import { Component, OnDestroy, OnInit } from '@angular/core';
import { Place } from '../../place.model';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { PlacesService } from '../../places.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute, private router: Router,
    private navCtrl: NavController, private placesService: PlacesService,
    private loadingCtrl: LoadingController) { }

  placeSub: Subscription;
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

      this.placeSub = this.placesService.getPlace(paramMap.get('placeId')).subscribe(place => this.place = place);
      this.form = new FormGroup({
        title: new FormControl(this.place.title, {updateOn: 'blur', validators: [Validators.required]}),
        description: new FormControl(this.place.description, {updateOn: 'blur', validators: [Validators.required, Validators.maxLength(180)]})  
      });
    });
  }

  async onUpdateOffer() {
    if (!this.form.valid) {
      return;
    }
    const loading = await this.loadingCtrl.create({message: 'Updating place...'});
    await loading.present();

    this.placesService.updatePlace(this.place.id, this.form.value.title, this.form.value.description)
      .subscribe(() => {
        loading.dismiss();
        this.form.reset();
        this.router.navigate(['/places/tabs/offers']);
      });
  }

  ngOnDestroy() {
    if (this.placeSub){
      this.placeSub.unsubscribe();
    }
  }
}
