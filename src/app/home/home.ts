import { Component } from '@angular/core';
import { HeroComponent } from '../hero/hero';
import { AboutComponent } from '../about/about';
import { MarqueComponent } from '../marque/marque';

@Component({
  selector: 'app-home',
  imports: [HeroComponent, AboutComponent, MarqueComponent],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
