import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  constructor(private authService: AuthService, private router: Router,
    private loadingCtrl: LoadingController) { }

  isLoading = false;
  ngOnInit() {
  }

  async onLogin() {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'loggin in...',
      keyboardClose: true
    });
    await loading.present();
    
    // minic loading http request
    setTimeout(() => this.DoLogin(), 1500);
  }

  DoLogin() {
    console.log('Do login...');
    this.authService.login();
    this.isLoading = false;    
    this.loadingCtrl.dismiss();
    this.router.navigateByUrl('/places/tabs/discover');
  }

}
