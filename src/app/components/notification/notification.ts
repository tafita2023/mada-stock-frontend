import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Inject,
  PLATFORM_ID
} from '@angular/core';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NotificationService } from '../services/notification';

export interface Message {
  id: number;
  nom: string;
  email: string;
  message: string;
  telephone: string;
  status: number;
  created_at: string;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class NotificationComponents implements OnInit {

  messages: Message[] = [];
  paginatedMessages: Message[] = [];

  itemsPerPage = 10;

  selectedMessage: Message | null = null;

  loading = true;

  private isBrowser: boolean;

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {

    // Ne jamais appeler l'API protégée pendant le SSR
    if (this.isBrowser) {
      this.loadMessages();
    } else {
      this.loading = false;
    }
  }

  loadMessages(): void {

    this.loading = true;

    this.notificationService.getMessages().subscribe({

      next: (data: any) => {

        console.log('✅ Messages reçus :', data);

        this.messages = Array.isArray(data)
          ? data
          : data?.data ?? [];

        this.itemsPerPage = 10;

        this.updatePagination();

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error('❌ ERREUR COMPLETE :', error);
        console.error('❌ STATUS :', error.status);
        console.error('❌ ERROR :', error.error);

        this.messages = [];
        this.paginatedMessages = [];

        this.loading = false;

        this.cdr.detectChanges();
      }
    });
  }

  formatPhone(phone: string | number): string {

    const value = String(phone).replace(/\D/g, '');

    if (value.length !== 10) {
      return String(phone);
    }

    return `${value.substring(0, 3)} ${value.substring(3, 5)} ${value.substring(5, 8)} ${value.substring(8, 10)}`;
  }

  updatePagination(): void {

    this.paginatedMessages = this.messages.slice(
      0,
      this.itemsPerPage
    );
  }

  loadMoreMessages(): void {

    this.itemsPerPage += 10;

    this.updatePagination();
  }

  loadLessMessages(): void {

    this.itemsPerPage = 10;

    this.updatePagination();
  }

  hasMoreMessages(): boolean {

    return this.paginatedMessages.length < this.messages.length;
  }

  openMessage(message: Message): void {

    this.selectedMessage = message;

    if (Number(message.status) === 1) {

      this.notificationService
        .markAsRead(message.id)
        .subscribe({

          next: () => {

            message.status = 0;

            this.notificationService.decrementUnreadCount();

            this.cdr.detectChanges();
          },

          error: (error) => {

            console.error(
              '❌ Erreur marquage comme lu :',
              error
            );
          }
        });
    }
  }

  closeMessage(): void {

    this.selectedMessage = null;
  }

  deleteMessage(id: number): void {

    if (!confirm('Voulez-vous supprimer ce message ?')) {
      return;
    }

    this.notificationService
      .deleteMessage(id)
      .subscribe({

        next: () => {

          this.messages = this.messages.filter(
            message => message.id !== id
          );

          this.updatePagination();

          if (this.selectedMessage?.id === id) {
            this.selectedMessage = null;
          }

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            '❌ Erreur suppression message :',
            error
          );
        }
      });
  }
}