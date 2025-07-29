const { z } = require('zod');

const createTripSchema = z.object({
  body: z.object({
    origin_location: z.string().min(1, "Origin location is required."),
    destination_location: z.string().min(1, "Destination location is required."),
    departure_time: z.string().datetime({ message: "Invalid departure time format. ISO 8601 expected." }),
    estimated_arrival_time: z.string().datetime({ message: "Invalid estimated arrival time format. ISO 8601 expected." }),
    driver_id: z.number().int().positive("Driver ID must be a positive integer."),
    base_seat_price: z.number().positive("Base seat price must be a positive number."),
    notes: z.string().optional(),
    // available_seats will be calculated based on driver's vehicle seat_layout
  }).refine(data => new Date(data.estimated_arrival_time) > new Date(data.departure_time), {
    message: "Estimated arrival time must be after departure time.",
    path: ["estimated_arrival_time"],
  }),
});

const searchTripsSchema = z.object({
  query: z.object({
    origin: z.string().min(1, "Origin is required for search."),
    destination: z.string().min(1, "Destination is required for search."),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."), // Validating date format
    passengers: z.number().int().min(1).optional().default(1), // Number of passengers, default 1
    // Add other filters like time_range, sort_by, etc. later if needed
  }),
});

module.exports = {
  createTripSchema,
  searchTripsSchema,
};
