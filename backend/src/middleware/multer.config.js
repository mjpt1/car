const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define allowed mime types for documents
const ALLOWED_MIME_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
};

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'driver_documents'); // Resolve path relative to project root

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const userId = req.user.userId; // Assuming user is authenticated
    const documentType = req.body.document_type || 'unknown_type';
    const extension = ALLOWED_MIME_TYPES[file.mimetype] || path.extname(file.originalname).substring(1);
    // Sanitize document_type to be filename-friendly
    const safeDocumentType = documentType.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
    const fileName = `user_${userId}_${safeDocumentType}_${Date.now()}.${extension}`;
    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5 MB limit
  }
});

// Middleware to handle multer errors specifically
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File is too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: `Multer error: ${err.message}` });
  } else if (err) {
    // This could be the 'Invalid file type' error from fileFilter
    return res.status(400).json({ message: err.message });
  }
  next();
};


module.exports = {
    uploadDriverDocument: upload.single('document'), // 'document' is the field name in the form-data
    handleMulterError
};
