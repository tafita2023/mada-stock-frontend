import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [Navbar, RouterOutlet, Footer],
  templateUrl: './layout.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './layout.css',
})
export class LayoutClient {

}
