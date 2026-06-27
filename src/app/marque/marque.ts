import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-marque',
  templateUrl: './marque.html',
  styleUrls: ['./marque.css']
})
export class MarqueComponent implements OnInit, OnDestroy {
  logos = [
    { id: 1, name: '#', url: '/Axl.png', color: '#F62440', },
    { id: 2, name: '#', url: '/DeadRabbit.png', color: '#00A4EF', },
    { id: 3, name: '#', url: '/FighterFuel.png', color: '#112E81', },
    { id: 4, name: '#', url: '/GeekVape.png', color: '#FF9900', },
    { id: 5, name: '#', url: '/TattooVape.png', color: '#1877F2', },
    { id: 6, name: '#', url: '/Tjuice.png', color: '#1DA1F2', },
    { id: 7, name: '#', url: '/VapeSauce.png', color: '#0A66C2', },
    { id: 8, name: '#', url: '/Voopoo.png', color: '#E4405F', },
    { id: 9, name: '#', url: '/VostVape.png', color: '#E4405F', }

  ];

  currentIndex = 0;
  itemsToShow = 4;
  isTransitioning = false;
  private autoPlayInterval: any;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.updateItemsToShow();
      window.addEventListener('resize', () => this.updateItemsToShow());
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      window.removeEventListener('resize', () => this.updateItemsToShow());
    }
  }

  updateItemsToShow(): void {
    if (!this.isBrowser) return;
    
    const width = window.innerWidth;
    if (width < 480) {
      this.itemsToShow = 1;
    } else if (width < 768) {
      this.itemsToShow = 2;
    } else if (width < 1024) {
      this.itemsToShow = 3;
    } else {
      this.itemsToShow = 4;
    }
  }

  get totalSlides(): number {
    return Math.ceil(this.logos.length / this.itemsToShow);
  }

  getSlideWidth(): number {
    return 100 / this.itemsToShow;
  }

  nextSlide(): void {
    if (!this.isTransitioning && this.currentIndex < this.totalSlides - 1) {
      this.isTransitioning = true;
      this.currentIndex++;
      setTimeout(() => {
        this.isTransitioning = false;
      }, 500);
    }
  }

  prevSlide(): void {
    if (!this.isTransitioning && this.currentIndex > 0) {
      this.isTransitioning = true;
      this.currentIndex--;
      setTimeout(() => {
        this.isTransitioning = false;
      }, 500);
    }
  }

  goToSlide(index: number): void {
    if (!this.isTransitioning && index !== this.currentIndex && index >= 0 && index < this.totalSlides) {
      this.isTransitioning = true;
      this.currentIndex = index;
      setTimeout(() => {
        this.isTransitioning = false;
      }, 500);
    }
  }

  startAutoPlay(): void {
    if (!this.isBrowser) return;
    
    this.autoPlayInterval = setInterval(() => {
      if (this.currentIndex < this.totalSlides - 1) {
        this.nextSlide();
      } else {
        this.currentIndex = 0;
      }
    }, 4000);
  }
}