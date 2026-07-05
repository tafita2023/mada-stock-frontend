import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../components/services/auth-service';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  private isBrowser: boolean;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;
    
    // Vérifier si on est dans le navigateur avant d'accéder à localStorage
    if (this.isBrowser) {
      const token = localStorage.getItem('token');
      
      if (token && token !== 'undefined' && token !== 'null') {
        authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Interceptor - Token ajouté à la requête');
      } else {
        console.log('Interceptor - Pas de token');
      }
    } else {
      console.log('Interceptor - Côté serveur, pas de token');
    }
  
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
    
        const isLoginRequest = req.url.includes('/login');
    
        if (error.status === 401 && this.isBrowser && !isLoginRequest) {
          console.log('Interceptor - Erreur 401, déconnexion');
    
          localStorage.clear();
          this.router.navigate(['/login']);
        }
    
        return throwError(() => error);
      })
    );
  }
}