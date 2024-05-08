import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginWindowComponent } from 'src/app/features/user/components/login-window/login-window.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { ThemeService } from 'src/app/shared/services/theme.service';
import { DialogControlService } from 'src/app/shared/services/dialog-control.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass']
})
export class NavbarComponent implements OnInit {

  theme: string = 'lara-light-indigo';

  private _isLogin: boolean | undefined;

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private auth: AuthService,
    private dialogService: DialogControlService,
  ) { }

  ngOnInit(): void {
    this.theme = this.themeService.getCurrentTheme();
    this.auth.loginStatus.subscribe(update => {
      this._isLogin = update;
    })
  }

  get isLogin() {
    return this._isLogin;
  }

  selectedButton: string = ''; // Variable to keep track of the selected button

  // Method to handle button click events
  onButtonClick(button: string) {
    this.selectedButton = button;
    if (button === 'home') {
      this.router.navigate(['home']);
    }
    
    if (this._isLogin) {
      if (button === 'liked') {
        this.router.navigate(['liked']);
      }
      if (button === 'profile') {
        this.router.navigate(['profile']);
      }
      if (button === 'settings') {
        this.router.navigate(['settings']);
      }
    } else {
      if (button === 'login') {
        this.dialogService.openPopUp(LoginWindowComponent);
      }
    }

  }

}