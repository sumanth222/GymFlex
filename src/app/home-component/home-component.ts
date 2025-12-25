import { CommonModule } from '@angular/common';
import { Component, NgZone, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { logEvent } from '../logger';
// import { GymService } from '../../services/gym.service';


// Simple state union for the home screen
type HomeState = 'loading' | 'success' | 'empty' | 'error';


@Component({
selector: 'app-home',
templateUrl: './home-component.html',
styleUrls: ['./home-component.scss'],
imports: [CommonModule, FormsModule],
encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
gyms: any[] = [];
state: HomeState = 'loading';
errorMessage = '';
cities: string[] = [];
selectedCity: string = 'All';

categories: string[] = ['Nearby', 'Budget', 'Premium', 'Popular'];
selectedCategory: string = 'Nearby';

searchTerm: string = '';
gymsOriginal: any[] = [];

selectedLocality: string | null = null;

localities: string[] = []; // will populate dynamically

constructor(private router: Router, private firestore: Firestore, private ngZone: NgZone) {}


ngOnInit(): void {
    this.loadGyms();
    logEvent(this.firestore, {
      page: 'Home',
      action: 'page_view',
      gymId: '0'
    });
}


async loadGyms(): Promise<void> {
  this.state = 'loading';
  this.errorMessage = '';

  try {
    const ref = collection(this.firestore, 'gyms');
    const snapshot = await getDocs(ref);

    const result: any[] = [];

    snapshot.forEach(doc => {
      const gym = doc.data();

      if(gym['list']){
        result.push({
          id: doc.id,
          ...gym,

          // If distance is not stored, keep placeholder for now
          distanceKm: gym['distanceKm'] ?? 2.0,

          // If rating doesn't exist yet 
          rating: gym['rating'] ?? 4.5,
          ratingCount: gym['ratingCount'] ?? 20
        });
      }
    });

    if (result.length === 0) {
      this.gyms = [];
      this.state = 'empty';
      return;
    }

    // Extract unique cities
    this.cities = Array.from(new Set(result.map((g: any) => g.city)));
    this.cities.unshift('All');

    // Save original list
    this.gymsOriginal = result;

    // Default sorting: Nearby
    this.sortCreatedBy(result);

    // Set final list
    this.gyms = result;

    this.ngZone.run(() => {
        this.state = 'success';
    })
  } catch (err) {
    console.error('Failed to load gyms', err);
    this.state = 'error';
    this.errorMessage = 'Something went wrong while loading gyms.';
  }
}


sortNearby(list: any[]) {
  this.gyms = list.sort((a, b) => a.distanceKm - b.distanceKm);
}

sortCreatedBy(list: any[]) {
  this.gyms = list.sort((a, b) => b.createdAt - a.createdAt);
}

selectCity(city: string) {

  let list = [...this.gymsOriginal];

  this.selectedCity = city;
  this.applyFilters();
  this.selectedCity = city;
  this.selectedLocality = null;

  const gymsInCity = list.filter(g => g.city === city);
  const uniqueLocs = [...new Set(gymsInCity.map(g => g.locality))];

  this.localities = uniqueLocs;
  this.gyms = gymsInCity;   // initial filter just by city
}

selectLocality(loc: string) {

  let list = [...this.gymsOriginal];

  this.selectedLocality = loc;
  this.gyms = list.filter(
    g => g.city === this.selectedCity && g.locality === loc
  );
}


selectCategory(cat: string) {
  this.selectedCategory = cat;
  this.applyFilters();
}

applyFilters() {
  let list = [...this.gymsOriginal]; // Keep original data in a separate array

  // City
  if (this.selectedCity !== 'All') {
    list = list.filter(g => g.city === this.selectedCity);
  }

  // Search
  if (this.searchTerm.trim().length > 0) {
    const s = this.searchTerm.toLowerCase();
    list = list.filter(g =>
      g.name.toLowerCase().includes(s) ||
      g.address.toLowerCase().includes(s)
    );
  }

  // Category
  switch (this.selectedCategory) {
    case 'Nearby':
      list.sort((a, b) => a.distanceKm - b.distanceKm);
      break;

    case 'Budget':
      list.sort((a, b) => a.price - b.price);
      break;

    case 'Premium':
      list.sort((a, b) => b.price - a.price);
      break;

    case 'Popular':
      list.sort((a, b) => b.rating - a.rating);
      break;
  }

  this.gyms = list;
  this.state = list.length ? 'success' : 'empty';
  
}

retry(): void {
    this.loadGyms();
}


trackByGymId(index: number, gym: any): string {
    return gym.id;
}


goToGym(gymId: string): void {
  this.router.navigate(['/gym', gymId]);
}

goToOwner(){
  this.router.navigate(['/owner'])
}
}