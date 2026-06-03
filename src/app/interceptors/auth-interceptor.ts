import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../components/services/auth-service';

import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 1. Récupérer le token depuis localStorage
    const token = this.authService.getToken();
    
    // 2. Cloner la requête et ajouter le token dans le header Authorization
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    // 3. Logger pour debug (optionnel)
    console.log('Requête interceptée:', authReq.url);
    console.log('Headers:', authReq.headers);
    
    // 4. Gérer les erreurs de la requête
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si erreur 401 (non authentifié)
        if (error.status === 401) {
          console.log('Erreur 401 - Non authentifié');
          this.authService.clearStorage();
          this.router.navigate(['/login']);
        }
        
        // Si erreur 403 (non autorisé)
        if (error.status === 403) {
          console.log('Erreur 403 - Accès non autorisé');
          // Optionnel : afficher un message à l'utilisateur
          alert('Vous n\'avez pas les droits nécessaires pour cette action');
        }
        
        return throwError(() => error);
      })
    );
  }
}