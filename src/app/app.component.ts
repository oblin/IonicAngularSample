import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';
// Import plugins from capacitor
import { Capacitor, Plugins, StatusBarStyle } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,   // ionic platform specified components
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    console.log('Is Adroid? ', this.platform.is('android'));
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable('StatusBar')) {
        Plugins.StatusBar.setStyle({style: StatusBarStyle.Light});
      }
      this.statusBar.styleDefault();
      // splash screen 就是程式在啟動時候螢幕顯示的畫面
      // Capacitor 預設三秒鐘會移除，進入到正式的系統頁面
      // 但通常會比三秒更快，此時借可以透過 hide 隱藏 splash screen
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        Plugins.SplashScreen.hide();
      }
    });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigateByUrl('/auth');
  }
}
