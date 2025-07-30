const { z } = require('zod');

const createArticleSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required."),
    content: z.string().optional(),
    excerpt: z.string().optional(),
    cover_image_url: z.string().url().optional().or(z.literal('')),
    status: z.enum(['draft', 'published']),
    categoryIds: z.array(z.number().int()).optional(),
    tagIds: z.array(z.number().int()).optional(),
  }),
});

const updateArticleSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    content: z.string().optional(),
    excerpt: z.string().optional(),
    cover_image_url: z.string().url().optional().or(z.literal('')),
    status: z.enum(['draft', 'published']).optional(),
    categoryIds: z.array(z.number().int()).optional(),
    tagIds: z.array(z.number().int()).optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update.",
  }),
});

module.exports = {
  createArticleSchema,
  updateArticleSchema,
};
