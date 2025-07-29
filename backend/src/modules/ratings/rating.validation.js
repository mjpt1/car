const { z } = require('zod');

const createRatingSchema = z.object({
  body: z.object({
    trip_id: z.number().int().positive("Trip ID is required."),
    // rated_user_id is implicitly the driver of the trip for now.
    // In a more complex system, you might rate passengers too.
    rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
    comment: z.string().max(1000, "Comment cannot exceed 1000 characters.").optional(),
  }),
});

module.exports = {
  createRatingSchema,
};
