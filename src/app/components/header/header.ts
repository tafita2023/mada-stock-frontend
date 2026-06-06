import { Component, HostListener, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service'; 

@Component({
  selector: 'app-header',
  imports: [RouterOutlet, RouterLinkWithHref],
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

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.clearStorage();
        this.router.navigate(['/']);
      },
      error: () => {
        this.authService.clearStorage();
        this.router.navigate(['/']);
      }
    });
  }}