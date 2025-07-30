const db = require('../../config/db');
const crypto = require('crypto'); // For generating unique transaction IDs

const requestPayment = async (userId, paymentData) => {
  const { booking_id, gateway } = paymentData;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get booking details to verify ownership and get the amount
    const { rows: bookingRows } = await client.query(
      'SELECT id, user_id, total_amount, status FROM bookings WHERE id = $1 FOR UPDATE',
      [booking_id]
    );

    if (bookingRows.length === 0) {
      throw new Error('Booking not found.');
    }
    const booking = bookingRows[0];

    if (booking.user_id !== userId) {
      throw new Error('Forbidden: You do not own this booking.');
    }
    if (booking.status !== 'pending_payment') {
      throw new Error(`Booking is not awaiting payment. Current status: ${booking.status}`);
    }

    // 2. Create a new transaction record
    const description = `Payment for booking #${booking_id}`;
    const insertTxQuery = `
      INSERT INTO transactions (user_id, booking_id, amount, type, status, gateway, description)
      VALUES ($1, $2, $3, 'booking_payment', 'pending', $4, $5)
      RETURNING id;
    `;
    const { rows: txRows } = await client.query(insertTxQuery, [
      userId,
      booking_id,
      booking.total_amount,
      gateway,
      description,
    ]);
    const transactionId = txRows[0].id;

    // 3. Simulate redirecting to a payment gateway
    // In a real scenario, you would call the gateway's API here to get a payment URL.
    // For our mock gateway, we construct the URL ourselves.
    const frontendCallbackUrl = process.env.FRONTEND_CALLBACK_URL || 'http://localhost:3000/payment/callback';

    // We'll pass the internal transaction ID to the "gateway" so it can send it back to us.
    const paymentUrl = `${frontendCallbackUrl}?transaction_id=${transactionId}`;

    // We'll also add mock buttons for success and failure to the callback page URL for easy testing.
    const mockPaymentPageUrl = `${paymentUrl}&mock=true`; // This tells our callback page to show test buttons.


    await client.query('COMMIT');

    return {
      payment_url: mockPaymentPageUrl, // In a real app, this would be the actual gateway URL
      transaction_id: transactionId,
      message: 'Payment request created. Redirecting to gateway...',
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error requesting payment:', error);
     if (error.message.startsWith('Forbidden') || error.message.startsWith('Booking')) {
        throw error;
    }
    throw new Error('Failed to create payment request.');
  } finally {
    client.release();
  }
};


const verifyPayment = async (verificationData) => {
    const { transaction_id, status } = verificationData;

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Find the transaction
        const { rows: txRows } = await client.query(
            'SELECT id, booking_id, status FROM transactions WHERE id = $1 FOR UPDATE',
            [transaction_id]
        );
        if (txRows.length === 0) {
            throw new Error('Transaction not found.');
        }
        const transaction = txRows[0];
        if (transaction.status !== 'pending') {
            throw new Error(`Transaction has already been processed. Status: ${transaction.status}`);
        }

        // 2. Update transaction and booking based on payment status
        if (status === 'success') {
            const mockGatewayTxId = `mock-tx-${crypto.randomBytes(16).toString('hex')}`;
            // Update transaction to 'completed'
            await client.query(
                "UPDATE transactions SET status = 'completed', gateway_transaction_id = $1 WHERE id = $2",
                [mockGatewayTxId, transaction_id]
            );
            // Update booking to 'confirmed'
            await client.query(
                "UPDATE bookings SET status = 'confirmed' WHERE id = $1",
                [transaction.booking_id]
            );

            // TODO: Trigger notification for successful payment

            await client.query('COMMIT');
            return { success: true, message: 'Payment successful and booking confirmed.', bookingId: transaction.booking_id };
        } else { // status === 'failure'
            // Update transaction to 'failed'
            await client.query(
                "UPDATE transactions SET status = 'failed' WHERE id = $1",
                [transaction_id]
            );
            // The booking remains 'pending_payment'. Seats are not released yet.
            // A cleanup job could later cancel bookings that remain pending for too long.

            await client.query('COMMIT');
            return { success: false, message: 'Payment failed. Please try again.', bookingId: transaction.booking_id };
        }

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error verifying payment:', error);
        if (error.message.startsWith('Transaction')) {
            throw error;
        }
        throw new Error('Failed to verify payment.');
    } finally {
        client.release();
    }
};


module.exports = {
  requestPayment,
  verifyPayment,
};
