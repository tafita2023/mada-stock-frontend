import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification';

export interface Message {
  id: number;
  nom: string;
  email: string;
  message: string;
  status: number;
  created_at: string;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class NotificationComponents implements OnInit {

  messages: Message[] = [];

  selectedMessage: Message | null = null;

  loading = true;

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  // Charger les messages
  loadMessages(): void {

    this.notificationService.getMessages()
      .subscribe({

        next: (data: any) => {

          this.messages = data;
          this.loading = false;

          setTimeout(() => {
            this.cdr.detectChanges();
          });

        },

        error: (error) => {

          console.error(
            'Erreur chargement messages :',
            error
          );

          this.loading = false;

          setTimeout(() => {
            this.cdr.detectChanges();
          });

        }

      });

  }

  // Ouvrir le popup
  openMessage(message: Message): void {

    this.selectedMessage = message;

    if (message.status === 1) {

      this.notificationService.markAsRead(message.id)
        .subscribe({

          next: () => {

            message.status = 0;

            this.cdr.detectChanges();

          },

          error: (error) => {

            console.error(
              'Erreur marquage comme lu :',
              error
            );

          }

        });
    }
  }

  // Fermer le popup
  closeMessage(): void {

    this.selectedMessage = null;

  }

    // Effacer un message
    deleteMessage(id: number): void {

      if (!confirm('Voulez-vous supprimer ce message ?')) {
        return;
      }
    
      this.notificationService.deleteMessage(id)
        .subscribe({
    
          next: () => {
    
            // Retirer le message de la liste après suppression
            this.messages = this.messages.filter(
              message => message.id !== id
            );
    
            // Fermer le popup si le message supprimé était ouvert
            if (this.selectedMessage?.id === id) {
              this.selectedMessage = null;
            }
    
          },
    
          error: (error) => {
    
            console.error(
              'Erreur suppression message :',
              error
            );
    
          }
    
        });
    
    }
}