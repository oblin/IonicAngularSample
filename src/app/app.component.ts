import { Component, OnDestroy, OnInit } from "@angular/core";

import { Platform } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { AuthService } from "./auth/auth.service";
import { Router } from "@angular/router";
// Import plugins from capacitor
import { AppState, Capacitor, Plugins, StatusBarStyle } from "@capacitor/core";
import { Subscription } from "rxjs";
import { stat } from "fs";
import { take } from "rxjs/operators";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private platform: Platform, // ionic platform specified components
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeApp();
  }

  private authSub: Subscription;
  private previousAuthState = false;
  ngOnInit(): void {
    // 監聽只要使用者有變化時候，就要進行處理
    this.authSub = this.authService.userIsAuthenticated.subscribe((isAuth) => {
      console.log("previousAuthState: ", this.previousAuthState);
      // 這裡會有一個問題，我們是透過 auth.guard 觸發 autoLogin
      // 判斷是否需要重新導入
      // 但 app.component 的 onInit 會是在 auth.guard 之前就觸發
      // 在此當下沒有觸發 autoLogin，當然 isAuth always false
      if (!isAuth && this.previousAuthState !== isAuth) {
        this.router.navigateByUrl("/auth");
      }
      // 使用 previousAuthState 用來記錄前一次的判斷
      // 這個做法有一點 tricky，主要概念如下：
      // 當page reload 時候， previousAuthState = false (因為第一次載入)
      // 但此時 isAuth = false （因為沒有進行 autoLogin)
      // 此時反而不會觸發 navigate
      // 因次就可以呼叫 auth.guard 用來執行 autologin
      // 之後，如果使用者有記錄在 storage 時，此時 isAuth = true
      // 也不會執行 navigate
      this.previousAuthState = isAuth;
    });

    // 監控如果程式是由 backgroud resume to foreground
    Plugins.App.addListener("appStateChange", this.checkAuthResume.bind(this));
  }

  initializeApp() {
    console.log("Is Adroid? ", this.platform.is("android"));
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable("StatusBar")) {
        Plugins.StatusBar.setStyle({ style: StatusBarStyle.Light });
      }
      this.statusBar.styleDefault();
      // splash screen 就是程式在啟動時候螢幕顯示的畫面
      // Capacitor 預設三秒鐘會移除，進入到正式的系統頁面
      // 但通常會比三秒更快，此時借可以透過 hide 隱藏 splash screen
      if (Capacitor.isPluginAvailable("SplashScreen")) {
        Plugins.SplashScreen.hide();
      }
    });
  }

  onLogout() {
    this.authService.logout();
    // 移除此段，改由 onInit 的 subscription 處理
    // this.router.navigateByUrl('/auth');
  }

  ngOnDestroy(): void {
    if (this.authSub) this.authSub.unsubscribe();
  }

  private checkAuthResume(state: AppState) {
    if (state.isActive) {
      this.authService
        .autoLogin()
        .pipe(take(1))
        .subscribe((success) => {
          if (!success) {
            this.onLogout();
          }
        });
    }
  }
}
