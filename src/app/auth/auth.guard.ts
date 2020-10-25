import { Injectable } from "@angular/core";
import { UrlTree, CanLoad, Route, Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { switchMap, take, tap } from "rxjs/operators";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanLoad {
  // 重點：因為頁面都是 lazy loading，因此不能使用 CanActivate，因為頁面載入前已經確認
  // 使用 CanLoad 就會再載入頁面時候，進行判斷，此時才是正確的時機

  constructor(private authService: AuthService, private router: Router) {}

  canLoad(
    route: Route,
    segments: import("@angular/router").UrlSegment[]
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    // 為了避免 client 端（routing module）因為 subscription 引發多次的 trigger
    // 使用 take(1) 可以代表一次性的 trigger，後續異動就不會引發
    return this.authService.userIsAuthenticated.pipe(
      switchMap(isAuthenticate => {
        if (!isAuthenticate) {
          return this.authService.autoLogin();
        } else {
          return of(isAuthenticate);
        }
      }),
      take(1),
      tap(isAuthenticate => {
        if (!isAuthenticate) {
          this.router.navigateByUrl("/auth");
        }
      })
    );
  }
}
