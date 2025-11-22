import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import 'zone.js';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

bootstrapApplication(AppComponent, {
  providers: [
    provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyCOv-NGMhx3lL9Fzit9F9u_o_HN8w-fDi8",
      authDomain: "gymflex-37de0.firebaseapp.com",
      projectId: "gymflex-37de0",
      storageBucket: "gymflex-37de0.firebasestorage.app",
      messagingSenderId: "312335842722",
      appId: "1:312335842722:web:11be23cdc5046be21206fb",
      measurementId: "G-RCRFTQQHYG"
    })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideClientHydration(),
    provideRouter(routes)
  ]
});