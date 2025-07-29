const ratingService = require('./rating.service');

const handleCreateRating = async (req, res) => {
  try {
    const raterUserId = req.user.userId;
    const ratingData = req.body;

    const result = await ratingService.createRating(raterUserId, ratingData);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create Rating Error:', error);
    if (error.message.startsWith('Forbidden') || error.message.startsWith('Cannot rate') || error.message === "You cannot rate yourself.") {
      return res.status(403).json({ message: error.message });
    }
     if (error.message === 'Trip not found.') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to submit rating.', details: error.message });
  }
};

module.exports = {
  handleCreateRating,
};
