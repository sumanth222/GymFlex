import { Component } from '@angular/core';
import { Router, RouterOutlet } from "@angular/router";
import { FooterComponent } from "./footer/footer";


@Component({
selector: 'app-root',
templateUrl: './app.html',
styleUrls: ['./app.scss'],
imports: [RouterOutlet, FooterComponent]
})
export class AppComponent {
title = 'GymFlex';

  constructor(private router: Router){

  }

  goHome() {
    this.router.navigate(['/home']);
  }
}