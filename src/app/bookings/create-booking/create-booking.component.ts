import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Place } from 'src/app/places/place.model';
import { ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  @ViewChild('f', {static: true}) form: NgForm;
  @Input() selectedPlace: Place;
  @Input() selectedMode: 'select' | 'random';
  startDate: string; endDate: string;
  ngOnInit() {
    const availableFrom = new Date(this.selectedPlace.availableFrom);
    const availableTo = new Date(this.selectedPlace.availableTo);

    if (this.selectedMode === 'random') {
      // 如果是 random，就是用開始日期與結束日期減七天（因為還有結束日期，因此多七天間隔）
      // 這裡作法就是透過 millisecond 換算日期
      this.startDate = new Date(
        availableFrom.getTime() + 
        Math.random() * 
        (availableTo.getTime() - 7 * 24 * 60 * 60 * 1000 
          - availableFrom.getTime())).toISOString();

        this.endDate = new Date(
          new Date(this.startDate).getTime() + 
          Math.random() * 
          (new Date(this.startDate).getTime() + 6 * 24 * 60 * 60 * 1000 
            - new Date(this.startDate).getTime())
          ).toISOString();
    }
  }

  onBookPlace() {
    if (!this.form.valid || !this.datesValid) {
      return;
    }

    // 由 place-detail.component 呼叫的 modal form，因此在此確認並回傳數值
    this.modalCtrl.dismiss({
      bookingData: {
        firstName: this.form.value['first-name'],
        lastName: this.form.value['last-name'],
        guestNumber: +this.form.value['guest-number'],
        startDate: new Date(this.form.value['date-from']),
        endDate: new Date(this.form.value['date-to'])
      }},
      'confirm');
  }

  onCancel() {
    // 呼叫 dismiss 可以回傳的項目， data: null, role: 'cancel' 
    // 其中 role 只是用來給 host 辨識是哪一個回傳名稱
    // 第三個參數是 id，當 host 呼叫時候，可以指定 id，這裡就可以透過 id 辨識要回傳給哪一個 host
    this.modalCtrl.dismiss(null, 'cancel');
  }

  datesValid(): boolean {
    const startDate = new Date(this.form.value['date-from']);
    const endDate = new Date(this.form.value['date-to']);
    return endDate > startDate;
  }
}
