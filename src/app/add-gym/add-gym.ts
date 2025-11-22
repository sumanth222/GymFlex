import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-add-gym',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-gym.html',
  styleUrls: ['./add-gym.scss']
})
export class AddGymComponent {

  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private router: Router
  ) {}

  isSubmitting = false;
  previewImages: string[] = [];
  selectedFiles: File[] = [];

  facilities = [
    "Locker Room", "Showers", "Steam Room", "AC", "Parking", "Trainer Available"
  ];

  equipmentList = [
    "Treadmill", "Dumbbells", "Bench Press", "Squat Rack", "Cable Machine", "Elliptical"
  ];

  gym: any = {
    name: '',
    address: '',
    city: '',
    openingTime: '',
    closingTime: '',
    price: '',
    facilities: [],
    equipment: [],
    images: [],
    status: 'pending'
  };

  goBack() {
    this.router.navigate(['/owner']);
  }

  toggleFacility(f: string) {
    const list = this.gym.facilities;
    list.includes(f) ? list.splice(list.indexOf(f), 1) : list.push(f);
  }

  toggleEquipment(e: string) {
    const list = this.gym.equipment;
    list.includes(e) ? list.splice(list.indexOf(e), 1) : list.push(e);
  }

  onImageSelect(event: any) {
    const files = [...event.target.files];

    files.forEach((file: File) => {
      this.selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = () => this.previewImages.push(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  async uploadImages(): Promise<string[]> {
    const urls: string[] = [];

    for (let file of this.selectedFiles) {
      const filePath = `gyms/${Date.now()}_${file.name}`;
      const fileRef = ref(this.storage, filePath);

      const snap = await uploadBytes(fileRef, file);
      const url = await getDownloadURL(snap.ref);

      urls.push(url);
    }

    return urls;
  }

  async submitGym() {
    this.isSubmitting = true;

    try {
      const ownerId = localStorage.getItem("owner_uid");
      if (!ownerId) throw new Error("Owner not logged in");

      const imageUrls = await this.uploadImages();

      const gymData = {
        ...this.gym,
        ownerId,
        images: imageUrls,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(this.firestore, 'gyms'), gymData);

      this.router.navigate(['/owner']);
    } catch (e) {
      console.error(e);
    }

    this.isSubmitting = false;
  }
}