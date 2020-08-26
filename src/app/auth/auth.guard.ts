import { Injectable } from '@angular/core';
import { UrlTree, CanLoad, Route, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  // 重點：因為頁面都是 lazy loading，因此不能使用 CanActivate，因為頁面載入前已經確認
  // 使用 CanLoad 就會再載入頁面時候，進行判斷，此時才是正確的時機

  constructor(private authService: AuthService, private router: Router) {}

  canLoad(route: Route, segments: import("@angular/router").UrlSegment[]): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    if (!this.authService.userIsAuthenticated) {
      this.router.navigateByUrl('/auth');
    }

    return this.authService.userIsAuthenticated;
  }
}
