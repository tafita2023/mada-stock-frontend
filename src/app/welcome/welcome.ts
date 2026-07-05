import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
})
export class WelcomeComponent implements OnInit {

  showWelcomePopup = false;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    const alreadyShown = sessionStorage.getItem('welcomeShown');

    if (!alreadyShown) {
      this.showWelcomePopup = true;
      sessionStorage.setItem('welcomeShown', 'true');
    }
  }

  accept() {
    this.showWelcomePopup = false;
  }

  decline() {
    window.location.href = 'about:blank';
  }
}