const userService = require('./user.service');

const getMyProfile = async (req, res, next) => {
  try {
    // req.user is populated by the authenticateToken middleware
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    const userId = req.user.userId;
    const userProfile = await userService.getUserProfile(userId);
    res.status(200).json(userProfile);
  } catch (error) {
    // console.error('Get Profile Error:', error);
    if (error.message === 'User not found.') {
        return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to retrieve user profile.', details: error.message });
    // next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    const userId = req.user.userId;
    const profileData = req.body;

    // Ensure at least one field is being updated (though validation schema should also catch this)
    if (Object.keys(profileData).length === 0) {
        return res.status(400).json({ message: 'No update data provided.' });
    }

    const updatedProfile = await userService.updateUserProfile(userId, profileData);
    res.status(200).json({ message: 'Profile updated successfully.', user: updatedProfile });
  } catch (error) {
    // console.error('Update Profile Error:', error);
     if (error.message === 'User not found.') {
        return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Email address is already in use by another account.') {
        return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    res.status(500).json({ message: 'Failed to update user profile.', details: error.message });
    // next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
};
