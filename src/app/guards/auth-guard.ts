import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../components/services/auth-service';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  if (!isPlatformBrowser(platformId)) {
    return true;
  }
  
  // Côté client uniquement
  const token = localStorage.getItem('token');
  
  
  if (token && token !== 'undefined' && token !== 'null' && token.length > 0) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};