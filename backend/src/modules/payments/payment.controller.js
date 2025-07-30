const paymentService = require('./payment.service');

const handlePaymentRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const paymentData = req.body; // { booking_id, gateway }

    const result = await paymentService.requestPayment(userId, paymentData);
    res.status(200).json(result);
  } catch (error) {
    console.error('Payment Request Error:', error);
    if (error.message.startsWith('Forbidden') || error.message.startsWith('Booking')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create payment request.', details: error.message });
  }
};

const handlePaymentVerification = async (req, res) => {
  try {
    const verificationData = req.query; // { transaction_id, status }

    // In a real app, you would also verify the request source (e.g., IP, signature from gateway)
    const result = await paymentService.verifyPayment(verificationData);

    // Redirect user to a frontend page with the result
    const frontendResultUrl = process.env.FRONTEND_RESULT_URL || 'http://localhost:3000/payment/result';
    const redirectUrl = `${frontendResultUrl}?success=${result.success}&message=${encodeURIComponent(result.message)}&bookingId=${result.bookingId}`;

    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Payment Verification Error:', error);
    const frontendResultUrl = process.env.FRONTEND_RESULT_URL || 'http://localhost:3000/payment/result';
    const redirectUrl = `${frontendResultUrl}?success=false&message=${encodeURIComponent(error.message)}`;
    res.redirect(redirectUrl);
  }
};

module.exports = {
  handlePaymentRequest,
  handlePaymentVerification,
};
