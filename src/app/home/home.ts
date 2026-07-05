import { Component } from '@angular/core';
import { HeroComponent } from '../hero/hero';
import { AboutComponent } from '../about/about';
import { MarqueComponent } from '../marque/marque';
import { WelcomeComponent } from '../welcome/welcome';

@Component({
  selector: 'app-home',
  imports: [WelcomeComponent, HeroComponent, AboutComponent, MarqueComponent],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
