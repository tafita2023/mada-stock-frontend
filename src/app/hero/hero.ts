import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule,CarouselModule],
  templateUrl: './hero.html',
  styleUrls: ['./hero.css']
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  items = [1, 2, 3, 4, 5];

  private intervalId: ReturnType<typeof setInterval> | undefined;

  @ViewChild('nextButton')
  nextButton!: ElementRef<HTMLButtonElement>;

  ngAfterViewInit(): void {

    this.intervalId = setInterval(() => {

      this.nextButton.nativeElement.click();

    }, 5000);

  }

  ngOnDestroy(): void {

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

  }
}