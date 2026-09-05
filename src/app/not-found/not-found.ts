import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./not-found.css']
})
export class NotFoundComponent {
  
  constructor(private location: Location) {}
  
  goBack(): void {
    this.location.back();
  }
}
