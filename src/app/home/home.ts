import { Component } from '@angular/core';
import { Hero } from '../hero/hero';
import { Product } from '../product/product';
@Component({
  selector: 'app-home',
  imports: [Hero, Product],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
