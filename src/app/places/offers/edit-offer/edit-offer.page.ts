import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute, private router: Router,
    private navCtrl: NavController, private placesService: PlacesService,
    private loadingCtrl: LoadingController, private alertCtrl: AlertController) { }

  isLoading = false
  placeId: string;
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
      this.placeId = paramMap.get('placeId');
      this.isLoading = true;
      this.placeSub = this.placesService.getPlace(paramMap.get('placeId')).subscribe(
        place => {
          this.place = place;
          this.form = new FormGroup({
            title: new FormControl(this.place.title, {updateOn: 'blur', validators: [Validators.required]}),
            description: new FormControl(this.place.description, {updateOn: 'blur', validators: [Validators.required, Validators.maxLength(180)]})  
          });

          this.isLoading = false;
        },
        async (error) => {
          const alert = await this.alertCtrl.create({
            header: 'An error occurs!',
            message: 'Place could not be fetched, please try again',
            buttons: [{
              text: 'Ok',
              handler: () => {
                this.router.navigate(['/places/tabs/offers']);
              }
            }]
          });
          await alert.present();
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
      .subscribe(returnData => {
        console.log("onUpdateOffer->updatePlace: return data: ", returnData);
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
