import { Component } from '@angular/core';
import { Router, RouterOutlet } from "@angular/router";


@Component({
selector: 'app-root',
templateUrl: './app.html',
styleUrls: ['./app.scss'],
imports: [RouterOutlet]
})
export class AppComponent {
title = 'GymFlex';

  constructor(private router: Router){

  }

  goHome(){
    this.router.navigate(['/home']);
  }
}