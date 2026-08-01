import { 
  Component, 
  HostListener, 
  Inject, 
  PLATFORM_ID, 
  OnInit,
  AfterViewInit
} from '@angular/core';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../services/auth-service'; 
import { environment } from '../../../environments/environment';
import { NotificationService } from '../services/notification';


// Interface Message
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
  styleUrls: ['./header.css']
})
export class Header implements OnInit {

  user: any = null;

  sidebarOpen = true;

  unreadCount = 0;

  private isBrowser: boolean;

  diys = [
    { name: 'Bases', route:'diy/bases' },
    { name: 'Arômes concentré', route:'diy/aromes' },
    { name: 'Packs', route:'diy/packs' },
    { name: 'Divers', route:'diy/divers' },
  ];

  isDiyOpen = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {

    this.isBrowser = isPlatformBrowser(this.platformId);

    // Actualisation du badge après navigation
    this.router.events.subscribe(event => {

      if (event instanceof NavigationEnd) {

        this.loadUnreadMessages();

      }

    });

  }

  ngOnInit(): void {

    if (this.isBrowser) {
  
      this.user = this.authService.getUser();
  
      setTimeout(() => {
        this.checkScreenSize();
      });
  
    }
  
    this.loadUnreadMessages();
  
  }


  loadUnreadMessages(): void {

    this.notificationService.getMessages()
      .subscribe({
  
        next: (response: any) => {
  
          const messages: Message[] = Array.isArray(response)
            ? response
            : response?.data ?? [];
  
  
          this.unreadCount = messages.filter(
            (message: Message) => message.status === 1
          ).length;
  
  
          console.log(
            'Nombre de messages non lus :',
            this.unreadCount
          );
  
        },
  
  
        error: (error) => {
  
          console.error(
            'Erreur chargement notifications :',
            error
          );
  
          this.unreadCount = 0;
  
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

    if (this.isBrowser) {

      this.checkScreenSize();

    }

  }



  checkScreenSize(): void {

    if (!this.isBrowser) {
      return;
    }


    this.sidebarOpen = window.innerWidth > 768;

  }



  closeSidebarOnMobile(): void {

    if (this.isBrowser && window.innerWidth <= 768) {

      this.sidebarOpen = false;
      this.isDiyOpen = false;

    }

  }



  logout(): void {

    this.authService.logout()
      .subscribe({

        next: () => {},

        error: () => {}

      });

  }



  getImageUrl(image?: string): string {

    return image
      ? `${environment.storageUrl}/${image}`
      : 'assets/nothing.png';

  }

}