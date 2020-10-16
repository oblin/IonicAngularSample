import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private modalCtrl: ModalController, private renderer: Renderer2) { }

  ngOnInit() {}

  // 對應 HTML #map: <div class="map" #map></div>
  @ViewChild('map') mapElementRef: ElementRef;
  // 外部提供中央的座標
  @Input() center = { lat: 25.017168, lng: 121.469316 };
  @Input() selectable = true;
  @Input() closeButtonText = 'Cancel';
  @Input() title = "Pick Location";

  // 提供給 DESTROY 使用，避免 MEMORY LEAK
  clickListener: any;
  googleMaps: any;
  // 這裡使用 javascript 方式處理 google map DOM elements
  // 基本上是有 angular map componet: https://angular-maps.com/
  // 這裡示範使用 javscript 方式處理
  // 因為 javascript 必須要等待 View 載入，因此需要寫在 AfterViewInit life cycle 中
  ngAfterViewInit(): void {
    this.getGoogleMaps()
      .then(googleMaps => {
        const mapEl = this.mapElementRef.nativeElement;
        
        // google map api, 第一個參數是 html element，第二個則是起始的地圖位置
        const map = new googleMaps.Map(mapEl, {
          center: this.center,
          zoom: 16
        });

        this.googleMaps = googleMaps;
        // 當 google map object 已經載入後
        // 首先會觸發 idle event，我們監聽這個 event 只需要一次
        // 目的就是將 visible class 加入到 map element
        // 這樣 css 中的 .map.visible 設定才會觸發
        // 讓 google map 顯示
        this.googleMaps.event.addListenerOnce(map, 'idle', () => {
          this.renderer.addClass(mapEl, 'visible');
        });

        if (this.selectable) {
          // 允許使用者點選地點，因為設定 ADD LISTENER，必須要記得清除，否則會有 MEMORY LEAK
          // API doc: https://developers.google.com/maps/documentation/javascript/events
          this.clickListener = map.addListener('click', event => {
            const selectedCoords = { lat: event.latLng.lat(), lng: event.latLng.lng() };
            this.modalCtrl.dismiss(selectedCoords);
          });
        } else {
          // Not selected, create map marker
          const marker = new googleMaps.Marker({
            position: this.center,
            map: map,
            title: this.title
          });
          marker.setMap(map);
        }
      })
      .catch(err => {
        // 處理 reject case
        console.log(err);
      })
  }
  
  onCancel() {
    this.modalCtrl.dismiss();
  }

  /**
   * 這裡的邏輯就是要將 google map SDK 放入到頁面
   * 並且回傳 google map API 讓 angular 可以呼叫與使用
   * 這裡使用 Promise 的目的就是處理非同步流程
   * 因為載入 javascript 需要時間，透過 Promise 可以確保完成執行後再回傳
   */
  private getGoogleMaps(): Promise<any> {
    // 存取 browser window object，設定 as any 如此 Typescript 就不會有錯誤
    const win = window as any;
    // 因為 google SDK 會將 google object 放入到 window 下    
    const googleModule = win.google;  
    // 因此先檢查是否已經載入
    if (googleModule && googleModule.maps) {
      // 如果頁面 window 已經存在 google object 則不要再重複載入
      return Promise.resolve(googleModule.maps);  
    } else {
      // 第一次呼叫時候， google map SDK 一定不存在
      // 因此這裡就進行載入的動作
      return new Promise((resolve, reject) => {
        // 在 DOM 頁面建立 script tag，用來載入 javascript
        const script = document.createElement('script');
        // 設定 google map SDK 的載入連結
        script.src ='https://maps.googleapis.com/maps/api/js?key=AIzaSyDHIfnsc28bPmtj451vkwHGF0xBvBZ8QpY';
        script.async = true;
        script.defer = true;  // script source loading non-blocking way
        // 這裡非常重要，因為我們是使用 document body tag 的最後面載入 script
        // angular 只存在 app-root 中， <body><app-root></app-root></body> 
        // 因此設定 body 的最後面，不會影響到 angular 的 DOM 元件與操作
        document.body.appendChild(script);
        script.onload = () => {
          // 載入 javascript
          const loadedGoogleModule = win.google;
          // 因此透過這個變數檢查是否正確載入
          if (loadedGoogleModule && loadedGoogleModule.maps) {
            // 確認已經載入了，回傳 maps SDK
            resolve(loadedGoogleModule.maps);
          } else {
            // 當無法載入時候，回傳 reject 錯誤訊息
            reject('Google maps SDK not available.');
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.clickListener) {
      this.googleMaps.event.removeListener(this.clickListener);
    }
  }
}
