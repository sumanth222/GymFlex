const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { setGlobalOptions } = require('firebase-functions/v2');

// Optional but recommended
setGlobalOptions({ region: 'us-central1' });

/**
 * 🔔 Notify on NEW booking
 */
exports.notifyNewBooking = onDocumentCreated(
  {
    document: 'bookings/{bookingId}',
    secrets: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']
  },
  async (event) => {
    const booking = event.data.data();
    const bookingId = event.params.bookingId;

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    const message = `
        🏋️ New GymFlex Booking

        Gym: ${booking.gymName}
        Amount: ₹${booking.amount}
        Date: ${booking.date}
        Phone: ${booking.phone}
        Status: ${booking.status}

        Booking ID: ${bookingId}
            `.trim();

            const response = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message
            })
        }
        );

        const body = await response.text();

        console.log('Telegram status:', response.status);
        console.log('Telegram response:', body);

  }
);

/**
 * ✅ Notify when payment is CONFIRMED
 */
exports.notifyPaymentConfirmed = onDocumentUpdated(
  {
    document: 'bookings/{bookingId}',
    secrets: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']
  },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    if (
      before.status !== 'PAYMENT_CONFIRMED' &&
      after.status === 'PAYMENT_CONFIRMED'
    ) {
      const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

      const message = `
        ✅ Payment Confirmed

        Gym: ${after.gymName}
        Amount: ₹${after.amount}
        Booking ID: ${event.params.bookingId}
            `.trim();

      const response = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message
            })
        }
        );

        const body = await response.text();

        console.log('Telegram status:', response.status);
        console.log('Telegram response:', body);

    }
  }
);