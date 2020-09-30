import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {

  constructor(private placesService: PlacesService, private router: Router, private loadingCtrl: LoadingController) { }

  form: FormGroup;
  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {updateOn: 'blur', validators: [Validators.required]}),
      description: new FormControl(null, {updateOn: 'blur', validators: [Validators.required, Validators.maxLength(180)]}),
      price: new FormControl(null, {updateOn: 'blur', validators: [Validators.required, Validators.min(100)]}),
      dateFrom: new FormControl(null, {updateOn: 'blur', validators: [Validators.required]}),
      dateTo: new FormControl(null, {updateOn: 'blur', validators: [Validators.required]})
    })
  }

  async onCreateOffer() {
    console.log(this.form.valid);
    if (!this.form.valid){
      return;
    }
    
    const loading = await this.loadingCtrl.create({message: 'Creating Place...'});
    await loading.present();

    this.placesService.addPlace(this.form.value.title,
      this.form.value.description, this.form.value.price,
      new Date(this.form.value.dateFrom), new Date(this.form.value.dateTo))
      .subscribe(data => {
        console.log('take result: ', data);
        loading.dismiss();
        this.form.reset();
        this.router.navigate(['/places/tabs/offers']);
      });    
  }
}
