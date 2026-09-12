import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NicotineService } from '../homeService/nicotine';
import { environment } from '../../environments/environment';

export interface Nicotine {
  id: number;
  titre: string;
  description: string;
  image?: string;
}

@Component({
  imports: [CommonModule],
  selector: 'app-nicotine',
  styleUrls: ['./nicotine.css'],
  templateUrl: './nicotine.html',
})
export class NicotineComponents implements OnInit, OnDestroy {

  nicotines: Nicotine[] = [];
  isLoading = true;
  loadingError = false;
  selectedArticle: Nicotine | null = null;

  private subs = new Subscription(); 

  constructor( 
    private nicotineService: NicotineService, 
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void { 
    this.loadArticles(); 
  }

  ngOnDestroy(): void { 
    this.subs.unsubscribe();
  }

  loadArticles(): void {
    this.isLoading = true;
    this.loadingError = false;
  
    this.subs.add(
      this.nicotineService.getNicotines().subscribe({
        next: (res: any) => {
    
          const data = Array.isArray(res) ? res : res?.data;
  
          this.nicotines = Array.isArray(data)
            ? [...data].sort((a, b) => a.id - b.id)
            : [];
  
          console.log('ARTICLES :', this.nicotines);
          console.log('NOMBRE :', this.nicotines.length);
  
          this.isLoading = false;
          this.loadingError = false;
  
          // Force Angular à mettre à jour l'affichage
          this.cdr.detectChanges();
        },
  
        error: (error) => {
          console.error(
            'Erreur lors du chargement des articles :',
            error
          );
  
          this.nicotines = [];
          this.isLoading = false;
          this.loadingError = true;
  
          this.cdr.detectChanges();
        }
      })
    );
  }
  
  openArticle(article: Nicotine): void { 
    this.selectedArticle = article;
    document.body.style.overflow = 'hidden';
  }

  closeArticle(): void { 
    this.selectedArticle = null; 
    document.body.style.overflow = '';
  }

  formatDescription(description: string): string {
    return description
    .replace(/\.\s*/g, '.\n')
    .replace(/(^|\n)\s*([a-zà-ÿ])/g, (_, prefix, letter) => {
      return prefix + letter.toUpperCase();
    });
  }

  // ================= IMAGE =================
  getImageUrl(image: string | null | undefined): string {
    if (!image) return 'assets/no-image.png';
    return `${environment.storageUrl}/${image}`;
  }
  
}
