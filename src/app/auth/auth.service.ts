import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { map, tap } from "rxjs/operators";
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
        tap(resData => {
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
    this._user.next(new User(
      userData.localId,
      userData.email,
      userData.idToken,
      expirationTime
    ));
  }
}
