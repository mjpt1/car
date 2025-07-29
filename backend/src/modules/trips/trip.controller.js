const tripService = require('./trip.service');

const handleCreateTrip = async (req, res) => {
  try {
    // Assuming req.user.role === 'admin' is checked by a middleware
    const tripData = req.body;
    const newTrip = await tripService.createTrip(tripData);
    res.status(201).json({ message: 'Trip created successfully.', trip: newTrip });
  } catch (error) {
    console.error('Create Trip Error:', error);
    if (error.message.includes('not found') || error.message.includes('not defined')) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create trip.', details: error.message });
  }
};

const handleSearchTrips = async (req, res) => {
  try {
    const queryParams = req.query; // Contains origin, destination, date
    const trips = await tripService.searchTrips(queryParams);
    if (trips.length === 0) {
        return res.status(200).json({ message: 'No trips found matching your criteria.', trips: [] });
    }
    res.status(200).json(trips);
  } catch (error) {
    console.error('Search Trips Error:', error);
    res.status(500).json({ message: 'Failed to search for trips.', details: error.message });
  }
};

const handleGetTripDetails = async (req, res) => {
  try {
    const { tripId } = req.params;
    const tripDetails = await tripService.getTripDetails(parseInt(tripId, 10));
    res.status(200).json(tripDetails);
  } catch (error) {
    console.error('Get Trip Details Error:', error);
    if (error.message === 'Trip not found.') {
        return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to get trip details.', details: error.message });
  }
};

module.exports = {
  handleCreateTrip,
  handleSearchTrips,
  handleGetTripDetails,
};
