import {
  Component,
  OnInit,
  HostListener,
  PLATFORM_ID,
  Inject,
  ChangeDetectionStrategy
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-marque',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule
  ],
  templateUrl: './marque.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./marque.css']
})
export class MarqueComponent implements OnInit {

  slidesPerPage = 4;

  private isBrowser: boolean;

  logos = [
    { id: 1, name: '#', url: '/Axl.png' },
    { id: 2, name: '#', url: '/DeadRabbit.png' },
    { id: 3, name: '#', url: '/FighterFuel.png' },
    { id: 4, name: '#', url: '/GeekVape.png' },
    { id: 5, name: '#', url: '/TattooVape.png' },
    { id: 6, name: '#', url: '/Tjuice.png' },
    { id: 7, name: '#', url: '/VapeSauce.png' },
    { id: 8, name: '#', url: '/Voopoo.png' },
    { id: 9, name: '#', url: '/VostVape.png' }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.updateSlidesPerPage();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.isBrowser) {
      return;
    }

    this.updateSlidesPerPage();
  }

  private updateSlidesPerPage(): void {

    if (!this.isBrowser) {
      return;
    }

    const width = window.innerWidth;

    if (width <= 480) {
      this.slidesPerPage = 1.5;
    } else if (width <= 768) {
      this.slidesPerPage = 2;
    } else {
      this.slidesPerPage = 4;
    }
  }
}