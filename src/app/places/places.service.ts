import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { strict } from "assert";
import { stringify } from "querystring";
import { BehaviorSubject, Observable, of } from "rxjs";
import { delay, tap, map, take, switchMap } from "rxjs/operators";
import { AuthService } from "../auth/auth.service";
import { PlaceLocation } from "./location.model";
import { Place } from "./place.model";

interface PlaceData {
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  from: string;
  to: string;
  userId: string;
  location: PlaceLocation;
}

@Injectable({
  providedIn: "root",
})
export class PlacesService {
  constructor(private authService: AuthService, private http: HttpClient) {}

  // BehaviorSubject 代表：當第一次取用時候，會立即給最新的值，而不用等到 next() 呼叫
  private _places = new BehaviorSubject<Place[]>([]);

  get places() {
    return this._places.asObservable();
  }

  fetchPlaces() {
    // { [key: string] ...} 當 json 格式是： { 'key': 'value' } 時候，
    // 我們不知道 key 的欄位名稱，可以使用 [key: string] 方式指定欄位名稱為： key
    return this.http
      .get<{ [key: string]: PlaceData }>("https://localhost:5001/offeredPlaces")
      .pipe(
        map((resData) => {
          const places = [];
          for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
              places.push(
                new Place(
                  key,
                  resData[key].title,
                  resData[key].description,
                  resData[key].imageUrl,
                  resData[key].price,
                  new Date(resData[key].from),
                  new Date(resData[key].to),
                  resData[key].userId,
                  resData[key].location
                )
              );
            }
          }
          return places;
        }),
        tap((places) => this._places.next(places))
      );
  }

  /**
   * Get Place Observable
   * @param id place id
   */
  getPlace(id: string): Observable<Place> {
    return this.http
      .get<PlaceData>(`https://localhost:5001/offeredPlaces/${id}`)
      .pipe(
        map((placeData) => {
          return new Place(
            id,
            placeData.title,
            placeData.description,
            placeData.imageUrl,
            placeData.price,
            new Date(placeData.from),
            new Date(placeData.to),
            placeData.userId,
            placeData.location
          );
        })
      );

    // return this.places.pipe(
    //   take(1), // 只取出最新 list，並且不再監聽
    //   // 將最新的 List 轉換成單一 Place，並且保持 observable 的型態
    //   map((places) => {
    //     return { ...places.find((p) => p.id === id) };
    //   })
    // );
  }

  uploadImage(
    image: File
  ): Observable<{ imageUrl: string; ImagePath: string }> {
    // FormData: Key-value pair for Http request
    const uploadData = new FormData();
    uploadData.append("image", image);

    // WebApi is not implemented yet!
    return this.http.post<{ imageUrl: string; ImagePath: string }>(
      "https://localhost:5001/offeredPlaces/storeImage",
      uploadData
    );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date,
    location: PlaceLocation,
    imageUrl: string // replace fixed image, not implemented yet
  ): Observable<Place[]> {
    let generatedId: string;
    let newPlace: Place;
    return this.authService.userId.pipe(
      take(1),
      switchMap((userId) => {
        if (!userId) {
          throw new Error("Found no user");
        }
        newPlace = new Place(
          Math.random().toString(),
          title,
          description,
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Paris_Night.jpg/1024px-Paris_Night.jpg",
          price,
          dateFrom,
          dateTo,
          userId,
          location
        );
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

        // 加入 http client, POST 回覆的 Object: {name: string}
        return this.http.post<{ name: string }>(
          "https://localhost:5001/offeredPlaces",
          {
            ...newPlace,
            id: null,
          }
        );
      }),
      // SwitchMap 的目的，在於將前面的回傳值，轉製成另外一個回傳值
      // 這裡在 ＰＯＳＴ 的回傳是 object，但我們要回覆給 client 端的是 PLACES array
      // 另外注意因為原先寫的是 RETURN HTTP，而這裡透過 SWITCHMAP 轉換成 THIS.PLACES
      // 因此最終的回傳值是舊的 this.places
      // 此外差異 switchMap: return observable & map: return non-observable
      switchMap((resData) => {
        generatedId = resData.name;
        // 最終回傳值
        return this.places;
      }),
      take(1),
      tap((places) => {
        newPlace.id = generatedId;
        // 這裡不是透過回傳值告訴 client，而是當 client 有明確的指定監聽程式時候，才會更新
        this._places.next(places.concat(newPlace));
      })
    );

    // 因為要提供 loading controller 判斷是否完成載入，
    // 因此改為回傳 observable
    // return this.places.pipe(take(1),
    //   // 延遲一秒再執行回傳
    //   delay(1000),
    //   // tap 代表不會幫我們做認資料的變換，也不會影響整個 RxJS 資料流方向，某種程度的意思是「什麼都不影響」
    //   tap(places => this._places.next(places.concat(newPlace))));
  }

  updatePlace(
    placeId: string,
    title: string,
    description: string
  ): Observable<Place> {
    let updatedPlaces: Place[];

    // 這裡的傳回值是在 swithMap 中定義
    // 這裏其實只是為了呼叫 http.put 但透過 pipe 可以定義更多的操作
    // 例如
    //  tap 用來通知 this.places 已經有異動發生
    //  take 明定只需要處理一次
    //  switchMap 則用來轉換 Place[] -> Place object 並且用來回傳
    return this.places.pipe(
      take(1),
      // 這裡有一個隱藏的bug，因為 edit-offer 來源是 offers，因此 updatePlace 會嘗試
      // 更新 places list，但如果此時是 page reload 的狀態，此時可能尚未進行 fetchPlaces
      // 因此 places list is emtpy
      // 解決方式就是要先進行 fetchPlaces
      switchMap((places) => {
        if (!places || places.length <= 0) {
          // 必須要回傳 observable<Place[]>，否則下一個 switchMap 無法運作
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId,
          oldPlace.location
        );

        // return http put result to client
        return this.http.put<Place>(
          `https://localhost:5001/offeredPlaces/${placeId}`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }
}

// 改用 Webapi backend
// private _places = new BehaviorSubject<Place[]>([
//   new Place(
//     "p1",
//     "Manhattan Mansion",
//     "In the heart of New York City.",
//     "https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200",
//     149.99,
//     new Date("2019-01-01"),
//     new Date("2019-12-31"),
//     "abc"
//   ),
//   new Place(
//     "p2",
//     "L'Amour Toujours",
//     "A romantic place in Paris!",
//     "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Paris_Night.jpg/1024px-Paris_Night.jpg",
//     189.99,
//     new Date("2019-01-01"),
//     new Date("2019-12-31"),
//     "xyz"
//   ),
//   new Place(
//     "p3",
//     "The Foggy Palace",
//     "Not your average city trip!",
//     "https://upload.wikimedia.org/wikipedia/commons/0/01/San_Francisco_with_two_bridges_and_the_fog.jpg",
//     99.99,
//     new Date("2019-01-01"),
//     new Date("2019-12-31"),
//     "abc"
//   ),
// ]);
