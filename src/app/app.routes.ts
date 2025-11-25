import { Routes } from '@angular/router';
import { GymDetailComponent } from './gym-detail/gym-detail';
import { HomeComponent } from './home-component/home-component';
import { AppComponent } from './app';
import { CheckoutComponent } from './checkout-component/checkout-component';
import { ConfirmationComponent } from './confirmation-component/confirmation-component';
import { OwnerLoginComponent } from './owner-login/owner-login';
import { OwnerDashboardComponent } from './owner-dashboard/owner-dashboard';
import { AddGymComponent } from './add-gym/add-gym';
import { EditGymComponent } from './edit-gym/edit-gym';
import { OwnerQrScannerComponent } from './owner-qr-scanner/owner-qr-scanner';
import { AboutComponent } from './about/about';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'gym/:id', component: GymDetailComponent },
  { path: 'checkout/:id', component: CheckoutComponent },
  { path: 'confirmation', component: ConfirmationComponent },

  // OWNER ROUTES - PUT SPECIFIC FIRST
  { path: 'owner/login', component: OwnerLoginComponent },
  { path: 'owner/add-gym', component: AddGymComponent },
  { path: 'owner/edit-gym/:id', component: EditGymComponent},
  { path: 'owner/scan/:gymId', component: OwnerQrScannerComponent},

  { path: 'about', component: AboutComponent },

  // MUST be last among owner routes
  { path: 'owner', component: OwnerDashboardComponent },
];