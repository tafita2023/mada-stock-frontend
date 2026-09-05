import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeroComponent } from '../hero/hero';
import { AboutComponent } from '../about/about';
import { MarqueComponent } from '../marque/marque';
import { WelcomeComponent } from '../welcome/welcome';
import { NicotineComponents } from '../nicotine/nicotine';

@Component({
  selector: 'app-home',
  imports: [WelcomeComponent, HeroComponent, AboutComponent, MarqueComponent, NicotineComponents],
  standalone: true,
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.css',
})
export class Home {

}
