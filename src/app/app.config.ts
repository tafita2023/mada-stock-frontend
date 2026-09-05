import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay, withNoIncrementalHydration } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth-interceptor';
import { providePrimeNG } from 'primeng/config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), 
    provideClientHydration(withEventReplay(), withNoIncrementalHydration()),
    provideHttpClient(withXhr(), withInterceptorsFromDi()),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};
