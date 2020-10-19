import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Plugins, Capacitor, CameraSource, CameraResultType } from '@capacitor/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {

  constructor(private platform: Platform) { }

  usePicker = false;  // 預設使用檔案上傳
  ngOnInit() {
    console.log('Mobile?: ', this.platform.is('mobile'));
    console.log('Hybrid?: ', this.platform.is('hybrid'));
    console.log('iOS?: ', this.platform.is('ios'));
    console.log('android?: ', this.platform.is('android'));
    console.log('desktop?: ', this.platform.is('desktop'));
    
    /**
     * 上面的測試顯示重點： 在瀏覽器中設定 MOBILE VIEW 也會導致
     * this.platform.is('mobile') = true
     * this.platform.is('hybrid') = false （但使用手機模擬器時候就是 true
     * 但我們在溜覽器上是無法顯示拍照的ＵＩ，因此設定 usePicker 用來指定瀏覽器固定上傳圖片
     */
    if ((this.platform.is('mobile') && !this.platform.is('hybrid'))
      || this.platform.is('desktop')) {
        this.usePicker = true;
      }
  }

  // 回傳 BASE64 字串或者 檔案
  @Output() imagePick = new EventEmitter<string | File>();
  // 存取ＤＯＭ ELEMENT 在程式中指定操作方式
  @ViewChild('filePicker') filePickerRef: ElementRef<HTMLInputElement>;
  // 用來處理 selectedImage 當存檔後，再次被新增未被清除的問題
  // 使用 Input 的目的在於要從 parent form 判斷是否要顯示（form.location or form.image）
  // ex:  <app-location-picker [showPreview]="form.get('location').value"></app-location-picker>
  @Input() showPreview = false;
  selectedImage: string;
  async onPickImage() {
    if (!Capacitor.isPluginAvailable('Camera')) {
      this.filePickerRef.nativeElement.click();
      return;
    }

    try {
      // Camera API: https://capacitorjs.com/docs/apis/camera
      const image = await Plugins.Camera.getPhoto({
        quality: 50,
        source: CameraSource.Prompt, // 詢問拍照或者從照片挑選
        correctOrientation: true,
        // height: 320,  // 使用兩個參數可能會破壞影像比例 
        width: 400,
        resultType: CameraResultType.DataUrl
      });

      /**
       * 搭配 resultType: CameraResultType.Base64
       * this.selectedImage = image.base64String;
       * 但實際使用後，沒有圖示，要用 DATA URL
       */      
      this.selectedImage = image.dataUrl;
      this.imagePick.emit(image.dataUrl);
    } catch(e) {
      console.log(e);
      if (this.usePicker) {
        this.filePickerRef.nativeElement.click();
      }
    }
  }

  onFileChosen(event: Event) {
    // console.log(event);
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if (!pickedFile) {
      return;
    }

    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result.toString();
      this.selectedImage = dataUrl;
      // 已經是檔案就不在另外轉換 BASE64，直接回傳
      this.imagePick.emit(pickedFile);
    };
    fr.readAsDataURL(pickedFile);
  }
}
