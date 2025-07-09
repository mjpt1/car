const db = require('../../config/db');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR_RELATIVE = 'uploads/driver_documents'; // Relative to project root for storing in DB

const applyToBecomeDriver = async (userId, applicationData) => {
  // Check if user is already a driver
  const { rows: existingDriver } = await db.query('SELECT id FROM drivers WHERE user_id = $1', [userId]);
  if (existingDriver.length > 0) {
    throw new Error('User has already applied or is already a driver.');
  }

  const vehicleDetails = applicationData.vehicle_details || null;

  const { rows: newDriver } = await db.query(
    'INSERT INTO drivers (user_id, vehicle_details, status) VALUES ($1, $2, $3) RETURNING id, user_id, status, created_at',
    [userId, vehicleDetails, 'pending_approval']
  );
  return newDriver[0];
};

const getDriverProfile = async (userId) => {
  const { rows: driverProfile } = await db.query(
    `SELECT d.id as driver_id, d.user_id, d.status as driver_status, d.vehicle_details,
            u.phone_number, u.first_name, u.last_name, u.email
     FROM drivers d
     JOIN users u ON d.user_id = u.id
     WHERE d.user_id = $1`,
    [userId]
  );
  if (driverProfile.length === 0) {
    throw new Error('Driver profile not found. User may not be a driver or application pending.');
  }
  return driverProfile[0];
};

const getDriverIdByUserId = async (userId) => {
    const { rows } = await db.query('SELECT id FROM drivers WHERE user_id = $1', [userId]);
    if (rows.length === 0) {
        return null; // Or throw an error if driver context is strictly required
    }
    return rows[0].id;
};

const uploadDriverDocument = async (userId, documentType, file) => {
  const driverId = await getDriverIdByUserId(userId);
  if (!driverId) {
    // Clean up uploaded file if driver record doesn't exist or user isn't a driver
    if (file && file.path) fs.unlinkSync(file.path);
    throw new Error('User is not registered as a driver or driver application not found.');
  }

  if (!file) {
    throw new Error('No file uploaded.');
  }

  const filePathInDb = path.join(UPLOAD_DIR_RELATIVE, file.filename).replace(/\\/g, "/");


  // Check if a document of this type already exists, if so, update it (or handle as per requirements)
  const { rows: existingDocument } = await db.query(
    'SELECT id, file_path FROM driver_documents WHERE driver_id = $1 AND document_type = $2',
    [driverId, documentType]
  );

  let savedDocument;
  if (existingDocument.length > 0) {
    // Update existing document
    const oldFilePath = existingDocument[0].file_path;
    const fullOldPath = path.join(__dirname, '..', '..', '..', oldFilePath); // Adjust path to be absolute

    const { rows: updatedDoc } = await db.query(
      `UPDATE driver_documents
       SET file_path = $1, file_name = $2, mime_type = $3, status = 'pending_review', uploaded_at = NOW(), reviewed_at = NULL, review_notes = NULL
       WHERE id = $4 RETURNING *`,
      [filePathInDb, file.originalname, file.mimetype, existingDocument[0].id]
    );
    savedDocument = updatedDoc[0];

    // Delete the old file after updating the record
    if (fs.existsSync(fullOldPath) && oldFilePath !== filePathInDb) {
      try {
        fs.unlinkSync(fullOldPath);
      } catch (err) {
        console.error(`Failed to delete old document file: ${fullOldPath}`, err);
        // Potentially log this error but don't fail the whole operation
      }
    }
  } else {
    // Insert new document
    const { rows: newDoc } = await db.query(
      `INSERT INTO driver_documents (driver_id, document_type, file_path, file_name, mime_type, status)
       VALUES ($1, $2, $3, $4, $5, 'pending_review') RETURNING *`,
      [driverId, documentType, filePathInDb, file.originalname, file.mimetype]
    );
    savedDocument = newDoc[0];
  }

  return savedDocument;
};

const getDriverDocuments = async (userId) => {
  const driverId = await getDriverIdByUserId(userId);
  if (!driverId) {
    throw new Error('User is not registered as a driver.');
  }

  const { rows } = await db.query(
    'SELECT id, document_type, file_name, mime_type, status, uploaded_at, reviewed_at, review_notes FROM driver_documents WHERE driver_id = $1 ORDER BY uploaded_at DESC',
    [driverId]
  );
  return rows;
};


// TODO: Service for admin to review/approve/reject documents
// TODO: Service for admin to approve/reject driver application

module.exports = {
  applyToBecomeDriver,
  getDriverProfile,
  uploadDriverDocument,
  getDriverDocuments,
  getDriverIdByUserId, // Exporting for potential use in controller or other services
};
