import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, deleteObject, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-edit-gym',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-gym.html',
  styleUrls: ['./edit-gym.scss']
})
export class EditGymComponent implements OnInit {

  gymId!: string;

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

  loading = true;
  saving = false;

  selectedNewFiles: File[] = [];

  placeholderImg =
    "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore,
    private storage: Storage,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.gymId = this.route.snapshot.paramMap.get('id')!;
    this.loadGym();
  }

  async loadGym() {
    this.loading = true;

    const gymDocRef = doc(this.firestore, 'gyms', this.gymId);
    const snapshot = await getDoc(gymDocRef);

    if (!snapshot.exists()) {
      alert("Gym not found!");
      this.router.navigate(['/owner/dashboard']);
      return;
    }

    this.gym = snapshot.data();

    this.ngZone.run(() => {
      this.loading = false;
    })
  }

  handleNewImages(event: any) {
    this.selectedNewFiles = Array.from(event.target.files);
  }

  async removeExistingImage(url: string) {
    const confirmDelete = confirm("Remove this image?");
    if (!confirmDelete) return;

    try {
      const path = url.split("/o/")[1].split("?")[0].replace("%2F", "/");
      const imgRef = ref(this.storage, path);

      await deleteObject(imgRef);

      this.gym.images = this.gym.images.filter((img: string) => img !== url);
    } catch (err) {
      console.error("Error deleting image:", err);
    }
  }

  async uploadNewImages(): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (let file of this.selectedNewFiles) {
      const filePath = `gyms/${Date.now()}_${file.name}`;
      const fileRef = ref(this.storage, filePath);

      const snap = await uploadBytes(fileRef, file);
      const url = await getDownloadURL(snap.ref);

      uploadedUrls.push(url);
    }

    return uploadedUrls;
  }

  async updateGym() {
    this.saving = true;

    try {
      const uploadedUrls = await this.uploadNewImages();

      const finalImages = [...this.gym.images, ...uploadedUrls];

      const gymDocRef = doc(this.firestore, 'gyms', this.gymId);

      await updateDoc(gymDocRef, {
        ...this.gym,
        images: finalImages
      });

      alert("Gym updated successfully!");
      this.router.navigate(['/owner/dashboard']);
    }
    catch (err) {
      console.error("Update Error:", err);
      alert("Failed to update gym");
    }
    finally {
      this.saving = false;
    }
  }

  goBack() {
    this.router.navigate(['/owner']);
  }
}