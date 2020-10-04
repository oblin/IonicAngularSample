import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { delay, tap, map, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Place } from './place.model';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  constructor(private authService: AuthService) { }

  // BehaviorSubject 代表：當第一次取用時候，會立即給最新的值，而不用等到 next() 呼叫
  private _places = new BehaviorSubject<Place[]>([
    new Place(
      'p1',
      'Manhattan Mansion',
      'In the heart of New York City.',
      'https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200',
      149.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'abc'
    ),
    new Place(
      'p2',
      "L'Amour Toujours",
      'A romantic place in Paris!',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Paris_Night.jpg/1024px-Paris_Night.jpg',
      189.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'xyz'
    ),
    new Place(
      'p3',
      'The Foggy Palace',
      'Not your average city trip!',
      'https://upload.wikimedia.org/wikipedia/commons/0/01/San_Francisco_with_two_bridges_and_the_fog.jpg',
      99.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'abc'
    )
  ]);

  get places() {
    return this._places.asObservable();
  }

  /**
   * Get Place Observable
   * @param id place id
   */
  getPlace(id: string): Observable<Place> {
    return this.places.pipe(
      take(1),      // 只取出最新 list，並且不再監聽
      // 將最新的 List 轉換成單一 Place，並且保持 observable 的型態
      map(places => {
        return {...places.find(p => p.id === id)};
      }));
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
    const newPlace = new Place(Math.random().toString(), title, description, 
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Paris_Night.jpg/1024px-Paris_Night.jpg',
    price, dateFrom, dateTo, this.authService.userId);

    // take: When you are interested in only the first emission, you want to use take
    //       代表只發送一次 this.places 的變化，因為 places 是 subject，正常而言每一次的 next 都會觸動 subscribe
    //       因此透過 take 只允許一次，並且立即結束 subscribe
    //       因此，在這個範例中， take 1 代表回傳原始的 places，而非 places.concat 的結果（因為這是第二次）
    //       換言之，這樣的寫法就代表再 subscribe 中，不會知道最終結果，反而是需要監聽 this._places 的服務才會知道
    //       另外一個優勢在於使用 take 1 只會確保一次的訂閱，因此也不需要進行 unsubscribe 動作
    // this.places.pipe(take(1)).subscribe(places => { 
    //   // places: 因為是 behavior subject，因此這裡代表最新的值
    //   // places.concat(newPlace): javascript list 串接，並回傳最終 list
    //   // 使用 next 通知所有 subscribe，
    //   this._places.next(places.concat(newPlace));
    // });

    // 因為要提供 loading controller 判斷是否完成載入，
    // 因此改為回傳 observable
    return this.places.pipe(take(1), 
      // 延遲一秒再執行回傳
      delay(1000),
      // tap 代表不會幫我們做認資料的變換，也不會影響整個 RxJS 資料流方向，某種程度的意思是「什麼都不影響」
      tap(places => this._places.next(places.concat(newPlace))));
  }

  updatePlace(placeId: string, title: string, description: string){
    return this.places.pipe(take(1), delay(1000),
      tap(places => {
        const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
        const updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id, title, description, oldPlace.imageUrl, oldPlace.price, oldPlace.availableFrom, oldPlace.availableTo, oldPlace.userId
        );
        this._places.next(updatedPlaces);
      }));
  }
}
