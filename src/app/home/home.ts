import { Component } from '@angular/core';
import { Hero } from '../hero/hero';
import { ProductsComponent } from '../product/product';

@Component({
  selector: 'app-home',
  imports: [Hero, ProductsComponent],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
