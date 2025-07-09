const db = require('../../config/db');

const getUserProfile = async (userId) => {
  const { rows } = await db.query(
    'SELECT id, phone_number, first_name, last_name, email, created_at, updated_at FROM users WHERE id = $1',
    [userId]
  );
  if (rows.length === 0) {
    throw new Error('User not found.');
  }
  return rows[0];
};

const updateUserProfile = async (userId, profileData) => {
  const { first_name, last_name, email } = profileData;

  // Check if email is already taken by another user
  if (email) {
    const { rows: emailCheck } = await db.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, userId]
    );
    if (emailCheck.length > 0) {
      throw new Error('Email address is already in use by another account.');
    }
  }

  // Build the update query dynamically based on provided fields
  const fieldsToUpdate = [];
  const values = [];
  let queryIndex = 1;

  if (first_name !== undefined) {
    fieldsToUpdate.push(`first_name = $${queryIndex++}`);
    values.push(first_name);
  }
  if (last_name !== undefined) {
    fieldsToUpdate.push(`last_name = $${queryIndex++}`);
    values.push(last_name);
  }
  if (email !== undefined) {
    fieldsToUpdate.push(`email = $${queryIndex++}`);
    values.push(email);
  }

  if (fieldsToUpdate.length === 0) {
    // Should be caught by validation, but good to have a fallback
    return getUserProfile(userId); // Return current profile if no fields to update
  }

  values.push(userId); // For the WHERE clause

  const updateQuery = `UPDATE users SET ${fieldsToUpdate.join(', ')}, updated_at = NOW() WHERE id = $${queryIndex} RETURNING id, phone_number, first_name, last_name, email, created_at, updated_at`;

  const { rows } = await db.query(updateQuery, values);
  if (rows.length === 0) {
    throw new Error('Failed to update user profile.'); // Should not happen if user exists
  }
  return rows[0];
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};
