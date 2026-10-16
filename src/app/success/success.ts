import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success',
  standalone: true,
  templateUrl: './success.html',
  styleUrls: ['./success.css']
})
export class SuccessComponent {

  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/']);
  }

  goToOrders(): void {
    this.router.navigate(['/commandes']);
  }
}