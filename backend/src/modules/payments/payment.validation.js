const { z } = require('zod');

const paymentRequestSchema = z.object({
  body: z.object({
    booking_id: z.number().int().positive("Booking ID is required."),
    gateway: z.string().min(1, "Gateway name is required.").default('mock_gateway'),
    // amount should be fetched from booking_id on the backend to prevent tampering
  }),
});

const verifyPaymentSchema = z.object({
  query: z.object({
    transaction_id: z.string().min(1, "Transaction ID is required."),
    status: z.enum(['success', 'failure']), // Status from our mock gateway
    // Real gateways have more complex params like authority, refId, etc.
  }),
});


module.exports = {
  paymentRequestSchema,
  verifyPaymentSchema,
};
