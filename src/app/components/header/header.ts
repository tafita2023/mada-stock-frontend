import { Component, HostListener, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service'; 
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterOutlet, RouterLinkWithHref],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit {
  user: any = null;
  sidebarOpen = true;
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  
  ngOnInit() {
    
    if (this.isBrowser) {
      this.checkScreenSize();

      this.user = this.authService.getUser();
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.isBrowser) {
      this.checkScreenSize();
    }
  }

  checkScreenSize() {
    if (this.isBrowser) {
      if (window.innerWidth <= 768) {
        this.sidebarOpen = false;
      } else {
        this.sidebarOpen = true;
      }
    }
  }

  closeSidebarOnMobile(): void {
    if (window.innerWidth <= 768) {
      this.sidebarOpen = false;
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
      },
      error: () => {
      }
    });
  }

  getImageUrl(image?: string): string {
    return image
      ? `${environment.storageUrl}/${image}`
      : 'assets/nothing.png';
  }

}