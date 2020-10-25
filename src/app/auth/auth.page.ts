import { Component, OnInit } from "@angular/core";
import { AlertController, LoadingController } from "@ionic/angular";
import { Router } from "@angular/router";
import { NgForm } from "@angular/forms";
import { Observable } from 'rxjs';

import { AuthResponseData, AuthService } from "./auth.service";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.page.html",
  styleUrls: ["./auth.page.scss"],
})
export class AuthPage implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  isLogin = true;
  ngOnInit() {}

  async authenticate(email: string, password: string) {
    const loading = await this.loadingCtrl.create({
      message: "logging in...",
      keyboardClose: true,
    });
    await loading.present();

    let authObservable: Observable<AuthResponseData>;
    if (this.isLogin) {
      authObservable = this.authService.login(email, password);
    } else {
      authObservable = this.authService.signup(email, password);
    }
    authObservable.subscribe((resData) => {
      loading.dismiss();
      this.router.navigateByUrl("/places/tabs/discover");
    }, error => {
      console.log('Signup Error: ', error);
      this.showAlert(JSON.stringify(error));
      loading.dismiss();
    });
  }

  onSwithcAuthMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      console.log("form is valid");
      return;
    }

    const email = form.value.email;
    const password = form.value.password;
    this.authenticate(email, password);
  }

  private async showAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Authentication Failed!',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }
}
