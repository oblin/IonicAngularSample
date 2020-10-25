import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Plugins } from "@capacitor/core";
import { BehaviorSubject, from, Observable, of } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";
import { User } from "./user.model";

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;
  expiresIn: string; // by second ex: 3600 -> 1 hour
  registered?: boolean;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(private http: HttpClient) {}

  /**
   * Auto login 的使用方式最好的地方就是在 auth.guard 中
   * 通過判斷 isAuthentication 時候，使用 autoLogin 簡化使用者登入的流程
   */
  autoLogin() {
    /**
     * from & of 差異在於：
     * 1. from: 回傳一個個數值
     * 2. of: 一次全部回傳
     * */
    return from(Plugins.Storage.get({ key: "authData" })).pipe(
      map((storedData) => {
        if (!storedData || !storedData.value) {
          return null;
        }
        const parsedData = JSON.parse(storedData.value) as {
          token: string;
          userId: string;
          email: string;
          tokenExpirationDate: string;
        };
        const expirationTime = new Date(parsedData.tokenExpirationDate);
        if (expirationTime <= new Date()) {
          return null;
        }
        const user = new User(
          parsedData.userId,
          parsedData.email,
          parsedData.token,
          expirationTime
        );
        return user;
      }),
      tap((user) => {
        if (user) {
          this._user.next(user);
        }
      }),
      // map，更关注于数值的转换，也就是说，他只会通过你之前的值去生成一个新的值
      // 這裡不能用 switchMap 因為 switchMap 是會結束前一個 observable 並產生新的 observable
      // 一般都是應用在 http 的轉換數值中
      map(user => {
        return !!user;
      })
    );
  }

  // 使用 BehaviorSubject 的原因在於 User 可能會因為登出、expired 等因素
  // 由合法變成非合法
  private _user = new BehaviorSubject<User>(null);

  get userIsAuthenticated(): Observable<boolean> {
    // ex: user.token = null -> !user.token = true -> !!user.token = false
    return this._user.asObservable().pipe(
      map((user) => {
        if (user) {
          return !!user.token;
        } else {
          return false;
        }
      })
    );
  }

  // 使用 subscription 的最大優勢在於隨時取得的一定是最新的資料
  get userId(): Observable<string> {
    return this._user.asObservable().pipe(
      map((user) => {
        if (user) {
          return user.id;
        }
        return null;
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponseData> {
    return this.http
      .post<AuthResponseData>("https://localhost:5001/Account/login", {
        email: email,
        password: password,
      })
      .pipe(
        // bind(this): pipe 會將 response data 傳入 tap, 因此 this 代表 response data
        tap((resData) => {
          this.setUserData(resData);
          // 因為後台是 fake 的內容，為了簡化使用 kind 記錄錯誤訊息，而非正常提供錯誤的 http
          // 因此特別轉換成錯誤訊息（記錄在 localId 中）
          if (resData.kind == "error") {
            throw new Error(resData.localId);
          }
        })
      );
  }

  logout() {
    this._user.next(null);
    // 登出時候只需要移除這個值即可，因為 auth.guard 判斷storage沒有數值就會轉到登入頁面
    Plugins.Storage.remove({key: 'authData'});
  }

  /**
   * 當使用者沒有帳號時候，可以線上註冊
   * 因為不需要這個功能，因此直接假設一個 token 回傳
   */
  signup(email: string, password: string): Observable<AuthResponseData> {
    const token: AuthResponseData = {
      kind: "jwt",
      idToken: "AAAA",
      email: "test@example.com",
      refreshToken: "Refresh_Token",
      localId: "Id",
      expiresIn: "3600",
    };
    return of(token);
  }

  private setUserData(userData: AuthResponseData) {
    const expirationTime = new Date(
      new Date().getTime() + +userData.expiresIn * 1000 // second -> millisecond
    );
    this._user.next(
      new User(
        userData.localId,
        userData.email,
        userData.idToken,
        expirationTime
      )
    );
    // 將使用者登入資料儲存到本機
    this.storeAuthData(
      userData.localId,
      userData.idToken,
      userData.email,
      expirationTime.toISOString()
    );
  }

  /**
   * 使用 Capacitor Storage: https://capacitorjs.com/docs/apis/storage
   * 之所以不使用 browser window.localStorage 的原因是因為有些手機系統會不定時清理
   * 而 Capacitor storage 則會儲存到手機內
   * 但這個僅限於簡單的 key-values，如果要高速或者複雜的資料結構，建議採用 SQLlite
   */
  private storeAuthData(
    userId: string,
    token: string,
    email: string,
    tokenExpirationDate: string
  ) {
    const data = JSON.stringify({
      userId: userId,
      token: token,
      email: email,
      tokenExpirationDate: tokenExpirationDate,
    });
    Plugins.Storage.set({ key: "authData", value: data });
  }
}
