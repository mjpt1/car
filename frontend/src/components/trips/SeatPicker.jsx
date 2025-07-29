'use client';

import React from 'react';
import { CheckCircle, XCircle, User, Users, Ban, HelpCircle } from 'lucide-react'; // Example icons

// Define seat statuses and their visual representation
const SEAT_STATUS_CONFIG = {
  available: { label: 'آزاد', color: 'bg-green-500 hover:bg-green-600',textColor: 'text-white', icon: null, selectable: true },
  booked: { label: 'رزرو شده', color: 'bg-red-500', textColor: 'text-white', icon: <XCircle size={14}/>, selectable: false },
  selected: { label: 'انتخاب شما', color: 'bg-blue-500 hover:bg-blue-600', textColor: 'text-white', icon: <CheckCircle size={14}/>, selectable: true },
  locked: { label: 'در حال رزرو', color: 'bg-yellow-500', textColor: 'text-black', icon: <Clock size={14}/>, selectable: false }, // For other users
  unavailable: { label: 'غیرقابل انتخاب', color: 'bg-gray-400', textColor: 'text-white', icon: <Ban size={14}/>, selectable: false },
  reserved_female: { label: 'ویژه بانوان', color: 'bg-pink-400 hover:bg-pink-500', textColor: 'text-white', icon: <User size={14}/>, selectable: true }, // Assuming User icon for female
  reserved_male: { label: 'ویژه آقایان', color: 'bg-sky-400 hover:bg-sky-500', textColor: 'text-white', icon: <User size={14}/>, selectable: true }, // Assuming User icon for male
  // Add more statuses like 'disabled_by_layout' if needed
};

const Seat = ({ seatData, seatLayoutConfig, onClick, isSelected }) => {
  if (!seatData && !seatLayoutConfig) return <div className="w-10 h-10 m-1"></div>; // Empty space for aisles or gaps

  let statusKey = 'unavailable'; // Default for seats not in trip.seats (e.g. disabled by layout)
  let seatNumberDisplay = '';
  let currentSeatConfig = SEAT_STATUS_CONFIG.unavailable;
  let isActuallySelectable = false;

  if (seatData) { // Seat exists in the trip's seat list
    statusKey = seatData.status;
    seatNumberDisplay = seatData.seat_number;
    if (isSelected) {
      currentSeatConfig = SEAT_STATUS_CONFIG.selected;
    } else {
      currentSeatConfig = SEAT_STATUS_CONFIG[statusKey] || SEAT_STATUS_CONFIG.unavailable;
    }
    isActuallySelectable = currentSeatConfig.selectable;
  } else if (seatLayoutConfig) { // Seat is part of layout but not in trip.seats (e.g. explicitly disabled)
    seatNumberDisplay = seatLayoutConfig.id; // Assuming seatLayoutConfig has an 'id' like "A1"
    // Determine if it's a 'special' seat defined in layout but not yet in trip.seats
    // This part needs careful handling based on how 'disabled_seats' and 'special_seats' are structured
    // For now, if not in seatData, it's 'unavailable' unless layout says otherwise explicitly.
    // If seatLayoutConfig.type is 'female_only' and it's not booked, it should be selectable.
    if (seatLayoutConfig.type && SEAT_STATUS_CONFIG[`reserved_${seatLayoutConfig.type}`]) {
        currentSeatConfig = SEAT_STATUS_CONFIG[`reserved_${seatLayoutConfig.type}`];
        isActuallySelectable = currentSeatConfig.selectable; // It's a special type, but available
    } else {
        currentSeatConfig = SEAT_STATUS_CONFIG.unavailable; // e.g. truly disabled seat
        isActuallySelectable = false;
    }
  }


  const handleClick = () => {
    if (isActuallySelectable && onClick && seatData) { // Only allow click if seatData exists (meaning it's a real seat of the trip)
      onClick(seatData);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isActuallySelectable}
      className={`w-10 h-10 m-1 rounded flex flex-col items-center justify-center text-xs font-medium transition-all duration-150 ease-in-out
                  ${currentSeatConfig.color} ${currentSeatConfig.textColor}
                  ${isActuallySelectable ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}
                  focus:outline-none focus:ring-2 focus:ring-offset-1 ${isActuallySelectable ? `focus:ring-indigo-400` : 'focus:ring-gray-400'}`}
      title={`${seatNumberDisplay} - ${currentSeatConfig.label}`}
    >
      <span className="block">{seatNumberDisplay}</span>
      {currentSeatConfig.icon && <span className="mt-0.5">{currentSeatConfig.icon}</span>}
    </button>
  );
};


const SeatPicker = ({ tripDetails, selectedSeats, onSeatSelect }) => {
  if (!tripDetails || !tripDetails.driver_seat_layout || !tripDetails.seats) {
    return <p className="text-center text-red-500">اطلاعات چیدمان صندلی‌ها موجود نیست.</p>;
  }

  const layout = tripDetails.driver_seat_layout; // e.g., { rows: 10, cols: 4, aisles_after_cols: [2], disabled_seats: ["E1"], special_seats: {"A1": "female_only"} }
  const tripSeatsMap = new Map(tripDetails.seats.map(s => [s.seat_number, s]));

  // A simple grid rendering. More complex layouts (like 2-1, buses with doors, etc.) need more sophisticated logic.
  const renderGrid = () => {
    const grid = [];
    let seatCounter = 0; // In case your seat_numbers are not A1, A2 style.
    for (let r = 0; r < (layout.rows || 0); r++) {
      const rowSeats = [];
      for (let c = 0; c < (layout.cols || 0); c++) {
        const seatId = `${String.fromCharCode(65 + r)}${c + 1}`; // Generates "A1", "A2", ...

        let seatDataForThisPosition = tripSeatsMap.get(seatId);
        let seatLayoutConfigForThisPosition = null;

        if (layout.disabled_seats && layout.disabled_seats.includes(seatId)) {
            // If seat is in disabled_seats list, it's not available, even if it somehow ended up in tripSeatsMap
            seatDataForThisPosition = null; // Treat as non-existent for trip
            seatLayoutConfigForThisPosition = { id: seatId, type: 'disabled' }; // Mark as disabled for Seat component
        } else if (layout.special_seats && layout.special_seats[seatId]) {
            // If it's a special seat from layout (e.g. female_only)
            // And it's NOT already in tripSeatsMap (meaning it's not booked or anything)
            // Then we might need to pass this special type info to Seat component
            if (!seatDataForThisPosition) {
                 seatLayoutConfigForThisPosition = { id: seatId, type: layout.special_seats[seatId] };
            }
        }


        rowSeats.push(
          <Seat
            key={seatId}
            seatData={seatDataForThisPosition} // from trip.seats (has status, price, etc.)
            seatLayoutConfig={seatLayoutConfigForThisPosition} // from vehicle.seat_layout (has type like female_only, or is disabled)
            onClick={onSeatSelect}
            isSelected={selectedSeats.some(s => s.id === seatDataForThisPosition?.id)}
          />
        );

        // Handle aisles: if layout.aisles_after_cols exists and current col is an aisle position
        if (layout.aisles_after_cols && layout.aisles_after_cols.includes(c + 1) && (c + 1 < layout.cols)) {
          rowSeats.push(<div key={`aisle-${r}-${c}`} className="w-6 h-10 m-1"></div>); // Aisle spacer
        }
      }
      grid.push(<div key={`row-${r}`} className="flex justify-center">{rowSeats}</div>);
    }
    return grid;
  };

  const legendItems = Object.entries(SEAT_STATUS_CONFIG).map(([key, config]) => ({
    key, ...config
  }));


  return (
    <div className="p-4 border rounded-lg bg-gray-50 shadow">
      <h3 className="text-lg font-semibold mb-4 text-center">انتخاب صندلی</h3>
      <div className="flex justify-center mb-2">
        <p className="text-sm px-3 py-1 bg-gray-200 rounded-md">جلو خودرو (راننده)</p>
      </div>
      <div className="seat-grid-container overflow-x-auto py-2">
        {renderGrid()}
      </div>
       <div className="mt-6 pt-4 border-t">
        <h4 className="text-md font-semibold mb-3 text-center">راهنمای صندلی‌ها</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
          {legendItems.map(item => (
            <div key={item.key} className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className={`w-5 h-5 rounded ${item.color} flex items-center justify-center ${item.textColor}`}>
                {item.icon || <HelpCircle size={10}/>}
              </div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeatPicker;
