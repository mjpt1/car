const { z } = require('zod');

const createBookingSchema = z.object({
  body: z.object({
    trip_id: z.number().int().positive("Trip ID must be a positive integer."),
    seat_ids: z.array(z.number().int().positive("Each Seat ID must be a positive integer."))
                 .min(1, "At least one seat must be selected for booking."),
    // Optional: If client sends seat_numbers instead of seat_ids
    // seat_numbers: z.array(z.string().min(1)).min(1).optional(),
    // notes: z.string().optional(), // Any notes for the booking by the user
  }),
});

// No specific validation schema needed for getMyBookings as it takes no body/query params other than userId from token.

module.exports = {
  createBookingSchema,
};
