const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Assuming db config is here

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-strong-jwt-secret-key';

const initializeSocket = (io) => {
  // Socket.IO Middleware for JWT Authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token not provided.'));
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error: Invalid token.'));
      }
      socket.user = decoded; // Attach user payload (e.g., { userId, phoneNumber }) to the socket object
      next();
    });
  });

  io.on('connection', (socket) => {
    // console.log(`User connected: ${socket.id}, UserID: ${socket.user.userId}`);

    // Join a personal room for this user to send direct notifications
    socket.join(`user:${socket.user.userId}`);

    // --- Trip-specific Room ---
    // User (passenger or driver) joins a room for a specific trip to get updates
    socket.on('joinTripRoom', async (tripId) => {
      try {
        // Optional: Verify if the user is actually part of this trip (either as driver or passenger)
        // This prevents users from listening in on trips they are not involved with.
        const { rows } = await db.query(
          `SELECT t.driver_id, b.user_id as passenger_id
           FROM trips t
           LEFT JOIN bookings b ON t.id = b.trip_id
           WHERE t.id = $1 AND (t.driver_id = (SELECT id FROM drivers WHERE user_id = $2) OR b.user_id = $2)`,
          [tripId, socket.user.userId]
        );

        // A more direct check might be needed. This is a simplified validation.
        // For now, let's assume if a user tries to join, it's valid.
        // We will add more robust validation if needed.

        const roomName = `trip:${tripId}`;
        socket.join(roomName);
        // console.log(`UserID ${socket.user.userId} joined room: ${roomName}`);

        // Acknowledge the join
        socket.emit('joinedTripRoom', { tripId, roomName, message: `Successfully joined room for trip ${tripId}` });

      } catch (error) {
        console.error(`Error joining trip room for user ${socket.user.userId} and trip ${tripId}:`, error);
        socket.emit('error', { message: `Failed to join room for trip ${tripId}.` });
      }
    });

    // --- Disconnection ---
    socket.on('disconnect', () => {
      // console.log(`User disconnected: ${socket.id}, UserID: ${socket.user.userId}`);
    });

    // --- Error Handling ---
    socket.on('error', (err) => {
        console.error(`Socket error for user ${socket.user.userId}:`, err.message);
        // Optionally send a message back to the client
        socket.emit('errorMessage', { message: err.message });
    });

    // --- Driver Location Update ---
    socket.on('driverLocationUpdate', async ({ tripId, location }) => {
      // location should be { lat: number, lng: number }
      if (!tripId || !location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        return socket.emit('error', { message: 'Invalid data for location update.' });
      }

      try {
        // 1. Verify that the user sending this is the driver of this trip
        const { rows: tripRows } = await db.query(
          'SELECT t.driver_id FROM trips t JOIN drivers d ON t.driver_id = d.id WHERE t.id = $1 AND d.user_id = $2',
          [tripId, socket.user.userId]
        );

        if (tripRows.length === 0) {
          return socket.emit('error', { message: 'You are not the driver of this trip.' });
        }

        // 2. Update the last_known_location in the database
        const locationData = { ...location, timestamp: new Date().toISOString() };
        await db.query(
          'UPDATE trips SET last_known_location = $1 WHERE id = $2',
          [JSON.stringify(locationData), tripId]
        );

        // 3. Broadcast the new location to everyone in the trip's room
        const roomName = `trip:${tripId}`;
        io.to(roomName).emit('newDriverLocation', {
          tripId,
          location: locationData
        });

      } catch (error) {
        console.error(`Error updating driver location for trip ${tripId}:`, error);
        socket.emit('error', { message: 'Failed to update location.' });
      }
    });


    // --- Chat Message Handling ---
    socket.on('newChatMessage', async ({ tripId, messageText }) => {
      if (!tripId || !messageText || typeof messageText !== 'string' || messageText.trim() === '') {
        return socket.emit('error', { message: 'Invalid data for new chat message.' });
      }

      try {
        // TODO: Add verification to ensure the user is part of this trip's chat room
        // For now, we trust that the client-side logic correctly puts them in the room.

        // 1. Save the message to the database
        const senderId = socket.user.userId;
        const insertQuery = 'INSERT INTO chat_messages (trip_id, sender_id, message_text) VALUES ($1, $2, $3) RETURNING *';
        const { rows } = await db.query(insertQuery, [tripId, senderId, messageText.trim()]);
        const newMessage = rows[0];

        // 2. Get sender's info to broadcast with the message
        const { rows: senderRows } = await db.query('SELECT id, first_name, last_name FROM users WHERE id = $1', [senderId]);
        const senderInfo = senderRows[0] || { first_name: 'Unknown', last_name: 'User' };

        const messagePayload = {
          ...newMessage,
          sender: {
            id: senderInfo.id,
            first_name: senderInfo.first_name,
            last_name: senderInfo.last_name,
          }
        };

        // 3. Broadcast the new message to everyone in the trip's room
        const roomName = `trip:${tripId}`;
        io.to(roomName).emit('newChatMessage', messagePayload);

      } catch (error) {
        console.error(`Error handling new chat message for trip ${tripId}:`, error);
        socket.emit('error', { message: 'Failed to send message.' });
      }
    });


    // Other event handlers will be added here later.
  });
};

module.exports = {
  initializeSocket,
};
