import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './components/services/auth-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.initializeAuthState();
  }
}
