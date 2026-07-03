import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './App';
import { routes } from './app.routes';

console.log('Bootstrapping SMAT application...');

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    provideAnimations()
  ]
}).then(() => {
  console.log('SMAT application bootstrapped successfully!');
}).catch(err => {
  console.error('SMAT application bootstrap failed:', err);
});
