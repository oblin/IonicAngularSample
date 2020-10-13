import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { LocationPickerComponent } from './pickers/location-picker/location-picker.component';
import { MapModalComponent } from './map-modal/map-modal.component';

@NgModule({
    declarations: [LocationPickerComponent, MapModalComponent],
    imports: [CommonModule, IonicModule],        // 讓 Decalrations components 可以使用 ngIf 等元件
    exports: [LocationPickerComponent, MapModalComponent],
    entryComponents: [MapModalComponent]
})
export class SharedModule{}