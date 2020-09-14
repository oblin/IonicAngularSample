import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  constructor(private authService: AuthService, private router: Router,
    private loadingCtrl: LoadingController) { }

  isLoading = false;
  isLogin = true;
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

  onSwithcAuthMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      console.log('form is valid');
      return;
    }

    const email = form.value.email;
    const password = form.value.password;
    console.log('login email & password', email, password);

    if (this.isLogin) {
      // Send a request to login server;
    } else {
      // Send a request to signup server;
    }
  }
}
