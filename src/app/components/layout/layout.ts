import { Component } from '@angular/core';
import { Header } from "../header/header";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [Header],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {

}
