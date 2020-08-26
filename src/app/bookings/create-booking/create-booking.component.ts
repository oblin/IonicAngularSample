import { Component, OnInit, Input } from '@angular/core';
import { Place } from 'src/app/places/place.model';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  @Input() selectedPlace: Place;

  ngOnInit() {}

  onBookPlace() {
    this.modalCtrl.dismiss({message: 'This is a dummy message'},
      'confirm');
  }

  onCancel() {
    // 呼叫 dismiss 可以回傳的項目， data: null, role: 'cancel' 
    // 其中 role 只是用來給 host 辨識是哪一個回傳名稱
    // 第三個參數是 id，當 host 呼叫時候，可以指定 id，這裡就可以透過 id 辨識要回傳給哪一個 host
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
