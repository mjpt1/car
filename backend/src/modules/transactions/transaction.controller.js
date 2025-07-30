const transactionService = require('./transaction.service');

const handleListUserTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const filters = req.query;
    const result = await transactionService.listUserTransactions(userId, filters);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve transactions.', details: error.message });
  }
};

// This will be used in the admin module, but the logic resides here.
const handleListAllTransactions = async (req, res) => {
    try {
        const filters = req.query;
        const result = await transactionService.listAllTransactions(filters);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve all transactions.', details: error.message });
    }
}

module.exports = {
  handleListUserTransactions,
  handleListAllTransactions,
};
