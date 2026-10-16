
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  inject
} from '@angular/core';

import {
  Router,
  RouterOutlet,
  NavigationEnd
} from '@angular/router';

import { filter, Subscription } from 'rxjs';

import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [Navbar, RouterOutlet, Footer],
  templateUrl: './layout.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './layout.css',
})
export class LayoutClient implements OnInit, OnDestroy {

  private router = inject(Router);
  private routerSubscription?: Subscription;

  showLayout = true;

  ngOnInit(): void {
    this.updateLayout(this.router.url);

    this.routerSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(event => {
        const navigation = event as NavigationEnd;
        this.updateLayout(navigation.urlAfterRedirects);
      });
  }

  private updateLayout(url: string): void {
    const path = url.split('?')[0].split('#')[0];

    this.showLayout = ![
      '/succes',
      '/failed'
    ].includes(path);
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }
}
