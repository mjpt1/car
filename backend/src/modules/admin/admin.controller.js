const adminService = require('./admin.service');

const handleListUsers = async (req, res) => {
  try {
    const filters = req.query; // { search, page, limit }
    const result = await adminService.listUsers(filters);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve users.', details: error.message });
  }
};

const handleListDrivers = async (req, res) => {
  try {
    const filters = req.query; // { status, page, limit }
    const result = await adminService.listDrivers(filters);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve drivers.', details: error.message });
  }
};

const handleGetDriverDetails = async (req, res) => {
    try {
        const { driverId } = req.params;
        const driverDetails = await adminService.getDriverDetailsForAdmin(parseInt(driverId, 10));
        res.status(200).json(driverDetails);
    } catch(error) {
        if (error.message === 'Driver not found.') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to get driver details.', details: error.message });
    }
};

const handleUpdateDriverStatus = async (req, res) => {
    try {
        const { driverId } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'
        const updatedDriver = await adminService.updateDriverStatus(parseInt(driverId, 10), status);
        res.status(200).json({ message: `Driver status updated to ${status}.`, driver: updatedDriver });
    } catch(error) {
        if (error.message === 'Driver not found.' || error.message === 'Invalid status provided.') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to update driver status.', details: error.message });
    }
};

const handleUpdateDocumentStatus = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { status, review_notes } = req.body;
        const updatedDocument = await adminService.updateDocumentStatus(parseInt(documentId, 10), status, review_notes);
        res.status(200).json({ message: `Document status updated to ${status}.`, document: updatedDocument });
    } catch(error) {
         if (error.message === 'Document not found.' || error.message === 'Invalid status provided.') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to update document status.', details: error.message });
    }
};

module.exports = {
  handleListUsers,
  handleListDrivers,
  handleGetDriverDetails,
  handleUpdateDriverStatus,
  handleUpdateDocumentStatus,
};
