const driverService = require('./driver.service');
const { uploadDriverDocument, handleMulterError } = require('../../middleware/multer.config');

const handleApplyToBecomeDriver = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    const userId = req.user.userId;
    const applicationData = req.body;

    const newDriverApplication = await driverService.applyToBecomeDriver(userId, applicationData);
    res.status(201).json({ message: 'Application submitted successfully. Awaiting approval.', application: newDriverApplication });
  } catch (error) {
    if (error.message.includes('already applied')) {
        return res.status(409).json({ message: error.message }); // Conflict
    }
    res.status(500).json({ message: 'Failed to submit driver application.', details: error.message });
  }
};

const handleGetDriverProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    const userId = req.user.userId; // Or req.params.userId if admin is fetching
    const profile = await driverService.getDriverProfile(userId);
    res.status(200).json(profile);
  } catch (error) {
    if (error.message.includes('Driver profile not found')) {
        return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to retrieve driver profile.', details: error.message });
  }
};

const handleUploadDriverDocument = async (req, res, next) => {
  // This controller uses a chain of middleware: authenticateToken -> upload.single -> validation -> this handler
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    const userId = req.user.userId;
    const { document_type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'Document file is required.' });
    }
    if (!document_type) {
        // Should be caught by validation, but good to double check
        return res.status(400).json({ message: 'Document type is required.' });
    }

    const savedDocument = await driverService.uploadDriverDocument(userId, document_type, file);
    res.status(201).json({ message: `Document '${document_type}' uploaded successfully. Awaiting review.`, document: savedDocument });
  } catch (error) {
     if (error.message.includes('User is not registered as a driver')) {
        return res.status(403).json({ message: error.message }); // Forbidden
    }
    if (error.message.includes('No file uploaded')) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to upload document.', details: error.message });
  }
};

const handleGetDriverDocuments = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    const userId = req.user.userId;
    const documents = await driverService.getDriverDocuments(userId);
    res.status(200).json(documents);
  } catch (error) {
    if (error.message.includes('User is not registered as a driver')) {
        return res.status(403).json({ message: error.message }); // Forbidden
    }
    res.status(500).json({ message: 'Failed to retrieve documents.', details: error.message });
  }
};

module.exports = {
  handleApplyToBecomeDriver,
  handleGetDriverProfile,
  handleUploadDriverDocument,
  handleGetDriverDocuments,
  // Exporting multer middleware components to be used in routes
  uploadMiddleware: uploadDriverDocument,
  multerErrorHandlerMiddleware: handleMulterError
};
