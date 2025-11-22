// Owner Login Component – FINAL FIX

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import { Auth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, User } from '@angular/fire/auth';

import { Firestore, doc, getDoc, setDoc, serverTimestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-owner-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-login.html',
  styleUrls: ['./owner-login.scss']
})
export class OwnerLoginComponent implements AfterViewInit {

  step: 'phone' | 'otp' = 'phone';

  phone = '';
  otp = '';

  isSending = false;
  isVerifying = false;
  error = '';

  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;

  constructor(
    private auth: Auth,        // ✔ Use only AngularFire Auth
    private firestore: Firestore,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    this.setupRecaptcha();
  }

  private setupRecaptcha(): void {
    try {

      this.recaptchaVerifier = new RecaptchaVerifier(
        this.auth,                       // ✔ First argument MUST be AngularFire Auth
        'recaptcha-container',           // ✔ Recaptcha div ID
        { size: 'invisible' }            // ✔ Works fine in dev
      );

    } catch (err) {
      console.error('FAILED TO INIT RECAPTCHA', err);
    }
  }

  async sendOtp(): Promise<void> {
    this.error = '';

    if (!this.phone || this.phone.length !== 10) {
      this.error = 'Enter a valid 10-digit phone number.';
      return;
    }

    if (!this.recaptchaVerifier) {
      this.setupRecaptcha();
      return;
    }

    const fullPhone = `+91${this.phone}`;
    this.isSending = true;

    try {
      this.confirmationResult = await signInWithPhoneNumber(
        this.auth,                 // ✔ Use SAME auth instance
        fullPhone,
        this.recaptchaVerifier
      );

      this.step = 'otp';

    } catch (err: any) {
      console.error(err);
      this.error = err?.message || 'Failed to send OTP.';
      this.setupRecaptcha();
    } finally {
      this.isSending = false;
    }
  }

  async verifyOtp(): Promise<void> {
    this.error = '';

    if (!this.otp || this.otp.length !== 6) {
      this.error = 'Enter the 6-digit OTP.';
      return;
    }

    if (!this.confirmationResult) {
      this.error = 'OTP expired. Try again.';
      this.step = 'phone';
      return;
    }

    this.isVerifying = true;

    try {
      const cred = await this.confirmationResult.confirm(this.otp);
      await this.upsertOwner(cred.user);
      this.router.navigate(['/owner']);

    } catch (err: any) {
      console.error(err);
      this.error = 'Invalid OTP.';
    } finally {
      this.isVerifying = false;
    }
  }

  async resendOtp(): Promise<void> {
    await this.sendOtp();
  }

  private async upsertOwner(user: User): Promise<void> {
    const uid = user.uid;
    const ref = doc(this.firestore, 'owners', uid);

    const baseData = {
      phoneNumber: user.phoneNumber,
      updatedAt: serverTimestamp()
    };

    const snap = await getDoc(ref);

    if (snap.exists()) {
      await setDoc(ref, baseData, { merge: true });
    } else {
      await setDoc(ref, {
        ...baseData,
        createdAt: serverTimestamp(),
        status: 'active'
      });
    }
  }
}