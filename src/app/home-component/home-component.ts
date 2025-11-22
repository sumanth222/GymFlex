import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
// import { GymService } from '../../services/gym.service';


// Simple state union for the home screen
type HomeState = 'loading' | 'success' | 'empty' | 'error';


@Component({
selector: 'app-home',
templateUrl: './home-component.html',
styleUrls: ['./home-component.scss'],
imports: [CommonModule],
encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
gyms: any[] = [];
state: HomeState = 'loading';
errorMessage = '';


constructor( private router: Router) {}


ngOnInit(): void {
this.loadGyms();
}


loadGyms(): void {
this.state = 'loading';
this.errorMessage = '';


try {
// Simulate async fetch for now; replace with Firestore/HTTP later
setTimeout(() => {
const result: any = [{
  id: "gym_iron_flex_01",
  name: "Iron Flex Fitness Studio",
  address: "4th Cross, HSR Layout, Sector 6, Bangalore",
  city: "Bangalore",
  coordinates: {
    lat: 12.912345,
    lng: 77.641234
  },
  price: 199,              // Day pass price
  openingTime: "5:00 AM",
  closingTime: "10:00 PM",
  isOpenNow: true,         // For dynamic status display
  distanceKm: 1.3,         // Precomputed or calculated on client
  rating: 4.6,
  ratingCount: 128,
  images: [
    "https://images.unsplash.com/photo-1554284126-aa88f22d8b74"
    ],
  facilities: [
    "Strength Area",
    "Cardio Zone",
    "Free Weights",
    "Locker Room",
    "Showers"
  ],
  equipment: [
    "Treadmills",
    "Ellipticals",
    "Chest Press",
    "Lat Pulldown",
    "Dumbbells up to 40kg",
    "Squat Rack"
  ],
  tags: ["Premium", "Clean", "Trainer Available"],
  lastUpdated: Date.now(),

  // Owner side (for payouts)
  owner: {
    id: "owner_001",
    name: "Rahul Verma",
    phone: "+91 9876543210",
    upiId: "rahulv@ybl",
  }
},
{
  id: "gym_corex_02",
  name: "CoreX Fitness Club",
  address: "17th Main Road, Koramangala 5th Block, Bangalore",
  city: "Bangalore",
  coordinates: {
    lat: 12.935842,
    lng: 77.616889
  },
  price: 149,               // Day pass price
  openingTime: "6:00 AM",
  closingTime: "11:00 PM",
  isOpenNow: true,
  distanceKm: 2.1,
  rating: 4.3,
  ratingCount: 86,

  images: [
    "https://images.unsplash.com/photo-1558611848-73f7eb4001a1",
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155"
  ],

  facilities: [
    "Strength Area",
    "Cardio Zone",
    "CrossFit Rig",
    "Locker Room"
  ],

  equipment: [
    "Bench Press",
    "Deadlift Platform",
    "Dumbbells up to 45kg",
    "Rower Machine",
    "Squat Rack"
  ],

  tags: ["Popular", "Spacious", "Great Trainers"],

  lastUpdated: Date.now(),

  owner: {
    id: "owner_002",
    name: "Sanjay Menon",
    phone: "+91 9812345678",
    upiId: "corexfitness@ybl"
  }
}
];

if (!result || result.length === 0) {
this.gyms = [];
this.state = 'empty';
} else {
this.gyms = result;
this.state = 'success';
}
}, 400);
} catch (err) {
console.error('Failed to load gyms', err);
this.state = 'error';
this.errorMessage = 'Something went wrong while loading gyms.';
}
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
}