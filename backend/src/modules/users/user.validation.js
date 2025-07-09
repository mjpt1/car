const { z } = require('zod');

const updateUserProfileSchema = z.object({
  body: z.object({
    first_name: z.string().min(1, "First name cannot be empty.").max(100).optional(),
    last_name: z.string().min(1, "Last name cannot be empty.").max(100).optional(),
    email: z.string().email("Invalid email address.").optional(),
    // Add other fields as needed, e.g., profile_picture_url
  }).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update.",
  }),
});

module.exports = {
  updateUserProfileSchema,
};
