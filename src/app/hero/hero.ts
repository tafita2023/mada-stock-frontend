import { Component, AfterViewInit, ElementRef, ViewChild, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.html',
  styleUrls: ['./hero.css']
})
export class HeroComponent implements OnInit, OnDestroy {
  images: string[] = [
    '/TattooVape.png',
    '/FighterFuel.png',
    '/VapeSauce.png',
  ];

  currentSlide = 0;

  private intervalId: any;

  ngOnInit(): void {
    this.startAutoSlide();
  }

  startAutoSlide(): void {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 3000); // 3 secondes
  }

  nextSlide(): void {
    this.currentSlide++;

    if (this.currentSlide >= this.images.length) {
      this.currentSlide = 0;
    }
  }

  previousSlide(): void {
    this.currentSlide--;

    if (this.currentSlide < 0) {
      this.currentSlide = this.images.length - 1;
    }
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}