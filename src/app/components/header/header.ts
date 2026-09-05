import {
  Component,
  HostListener,
  Inject,
  PLATFORM_ID,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  afterNextRender
} from '@angular/core';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  RouterOutlet,
  RouterLink
} from '@angular/router';

import { AuthService } from '../services/auth-service';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../services/notification';

import { Subscription } from 'rxjs';

export interface Message {
  id: number;
  nom: string;
  email: string;
  message: string;
  status: number;
  created_at: string;
}

@Component({
  selector: 'app-header',
  standalone: true,

  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink
  ],

  templateUrl: './header.html',

  changeDetection: ChangeDetectionStrategy.Eager,

  styleUrls: ['./header.css']
})
export class Header implements OnInit, OnDestroy {

  user: any = null;

  sidebarOpen = true;

  unreadCount = 0;

  private isBrowser: boolean;

  private unreadSubscription?: Subscription;

  diys = [
    {
      name: 'Bases',
      route: 'diy/bases'
    },
    {
      name: 'Arômes concentré',
      route: 'diy/aromes'
    },
    {
      name: 'Packs',
      route: 'diy/packs'
    },
    {
      name: 'Divers',
      route: 'diy/divers'
    }
  ];

  isDiyOpen = false;

  constructor(
    @Inject(PLATFORM_ID)
    private platformId: object,

    private authService: AuthService,

    private notificationService: NotificationService,

    private cdr: ChangeDetectorRef
  ) {

    this.isBrowser = isPlatformBrowser(this.platformId);

    afterNextRender(() => {

      if (!this.isBrowser) {
        return;
      }

      this.initializeBrowser();

    });
  }

  ngOnInit(): void {

    if (!this.isBrowser) {
      return;
    }

  }

  private initializeBrowser(): void {

    this.user = this.authService.getUser();

    this.checkScreenSize();

    this.unreadSubscription =
      this.notificationService.unreadCount$
        .subscribe(count => {

          this.unreadCount = count;

          this.cdr.markForCheck();

        });

    if (this.authService.isLoggedIn()) {

      this.loadUnreadMessages();

    } else {

      this.notificationService.setUnreadCount(0);

    }

  }

  ngOnDestroy(): void {

    this.unreadSubscription?.unsubscribe();

  }

  loadUnreadMessages(): void {

    if (!this.isBrowser) {
      return;
    }

    if (!this.authService.isLoggedIn()) {

      this.notificationService.setUnreadCount(0);

      return;
    }

    this.notificationService
      .getMessages()
      .subscribe({

        next: (response: any) => {

          const messages: Message[] =
            Array.isArray(response)
              ? response
              : response?.data ?? [];

          const count =
            messages.filter(
              (message: Message) =>
                Number(message.status) === 1
            ).length;

          this.notificationService.setUnreadCount(count);

        },

        error: (error) => {

          console.error(
            'Erreur chargement notifications :',
            error
          );

          this.notificationService.setUnreadCount(0);

        }

      });

  }

  toggleSidebar(): void {

    this.sidebarOpen = !this.sidebarOpen;

  }

  toggleDiyMenu(): void {

    this.isDiyOpen = !this.isDiyOpen;

  }

  @HostListener('window:resize')
  onResize(): void {

    if (!this.isBrowser) {
      return;
    }

    this.checkScreenSize();

  }

  checkScreenSize(): void {

    if (!this.isBrowser) {
      return;
    }

    this.sidebarOpen = window.innerWidth > 768;

  }

  closeSidebarOnMobile(): void {

    if (
      this.isBrowser &&
      window.innerWidth <= 768
    ) {

      this.sidebarOpen = false;

      this.isDiyOpen = false;

    }

  }

  logout(): void {

    this.authService
      .logout()
      .subscribe({

        next: () => {},

        error: () => {}

      });

  }

  getImageUrl(image?: string): string {

    if (!image) {
      return 'assets/nothing.png';
    }

    return `${environment.storageUrl}/${image}`;

  }

}