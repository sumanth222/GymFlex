import { Firestore, collection, addDoc } from '@angular/fire/firestore';

export async function logEvent(
  firestore: Firestore,
  data: {
    page: string;
    action: string;
    gymId?: string;
    bookingId?: string;
    extra?: any;
  }
) {
  try {
    await addDoc(collection(firestore, 'logs'), {
      ...data,
      timestamp: Date.now()
    });
  } catch (err) {
    // intentionally silent – logging should never break UX
    console.error('Log failed', err);
  }
}