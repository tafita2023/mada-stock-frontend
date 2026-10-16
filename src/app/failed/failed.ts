import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-failed',
  standalone: true,
  templateUrl: './failed.html',
  styleUrls: ['./failed.css']
})
export class FailedComponent {

  constructor(private router: Router) {}

  goToCart(): void {
    this.router.navigate(['/panier']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}