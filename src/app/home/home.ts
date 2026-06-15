import { Component } from '@angular/core';
import { Hero } from '../hero/hero';
import { ProductsComponent } from '../product/product';
import { MaterielsComponent } from '../materiel/materiel';

@Component({
  selector: 'app-home',
  imports: [Hero, ProductsComponent, MaterielsComponent],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
