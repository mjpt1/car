const { z } = require('zod');

const applyToBecomeDriverSchema = z.object({
  body: z.object({
    // Basic info might be collected here, or taken from user's profile
    // For now, let's assume vehicle_details are optional at application time
    // and can be updated later.
    vehicle_details: z.object({
        model: z.string().min(1, "Vehicle model is required."),
        plate_number: z.string().min(1, "Plate number is required."),
        color: z.string().min(1, "Vehicle color is required."),
        // Add other vehicle specific fields if needed
    }).optional(),
  }),
});

const uploadDocumentSchema = z.object({
  // Validation for file properties (like mime type, size) will be handled by multer
  // and in the service/controller. Zod can validate other body fields if any.
  body: z.object({
    document_type: z.string().min(1, "Document type is required."),
    // e.g., "license", "vehicle_registration", "insurance"
  }),
  // file: z.any().refine(file => file && file.fieldname === 'document', { // This needs to be checked in controller with multer
  //   message: "Document file is required.",
  // }),
});

module.exports = {
  applyToBecomeDriverSchema,
  uploadDocumentSchema,
};
