import { Component } from '@angular/core';
import { Hero } from '../hero/hero';
import { Product } from '../product/product';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-home',
  imports: [Header,Hero, Product, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
