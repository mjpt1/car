'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet library itself
import { useSocket } from '../../contexts/SocketContext';

// Fix for default icon issue with Webpack
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
//   iconUrl: require('leaflet/dist/images/marker-icon.png'),
//   shadowUrl: require('leaflet/dist/images/shadow.png'),
// });

// A simpler fix for the icon without requiring image loaders in next.config.js
const defaultIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const driverIcon = new L.Icon({
    iconUrl: '/car-icon.svg', // Assuming you will add a car icon in your public folder
    iconSize: [35, 35],
    iconAnchor: [17, 35],
});


const LiveTripMap = ({ tripDetails }) => {
  const socket = useSocket();
  const [driverLocation, setDriverLocation] = useState(tripDetails.last_known_location || null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Join the trip room when component mounts and socket is ready
    if (socket && tripDetails?.id) {
      socket.emit('joinTripRoom', tripDetails.id);

      socket.on('joinedTripRoom', (data) => {
        console.log('Successfully joined room:', data);
      });

      // Listen for new driver locations
      const handleNewLocation = (data) => {
        if (data.tripId === tripDetails.id) {
          console.log('New location received:', data.location);
          setDriverLocation(data.location);
          // Optional: pan the map to the new location
          if (mapRef.current) {
            mapRef.current.panTo([data.location.lat, data.location.lng]);
          }
        }
      };

      socket.on('newDriverLocation', handleNewLocation);

      // Cleanup on unmount
      return () => {
        console.log('Leaving trip room...');
        // socket.emit('leaveTripRoom', tripDetails.id); // Good practice to implement this on server
        socket.off('newDriverLocation', handleNewLocation);
        socket.off('joinedTripRoom');
      };
    }
  }, [socket, tripDetails?.id]);

  if (!tripDetails) {
    return <div>در حال بارگذاری اطلاعات نقشه...</div>;
  }

  // Use a default center if no location is known yet. (e.g., origin location)
  // For simplicity, using a fixed default. In a real app, use trip origin/destination.
  const mapCenter = driverLocation
    ? [driverLocation.lat, driverLocation.lng]
    : [35.6892, 51.3890]; // Default to Tehran if no location is available

  return (
    <MapContainer center={mapCenter} zoom={13} style={{ height: '400px', width: '100%' }} ref={mapRef}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Example: Marker for Origin and Destination */}
      {/* In a real app, you would geocode origin/destination names to lat/lng */}
      {/* <Marker position={[35.7, 51.4]} icon={defaultIcon}>
        <Popup>مبدا: {tripDetails.origin_location}</Popup>
      </Marker>
      <Marker position={[32.6, 51.6]} icon={defaultIcon}>
        <Popup>مقصد: {tripDetails.destination_location}</Popup>
      </Marker> */}

      {driverLocation && (
        <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
          <Popup>
            موقعیت فعلی راننده <br />
            آخرین به‌روزرسانی: {new Date(driverLocation.timestamp).toLocaleTimeString('fa-IR')}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default LiveTripMap;
