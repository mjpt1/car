'use client';

import React from 'react';
import { Armchair, X, Check, User, Ban } from 'lucide-react'; // Using a better icon for seats

// Define seat statuses and their visual representation based on 0.png
const SEAT_STATUS_CONFIG = {
  available: { label: 'آزاد', color: 'text-gray-400', iconColor: 'text-gray-300', selectable: true },
  booked: { label: 'رزرو شده', color: 'text-status-danger', iconColor: 'text-status-danger', selectable: false },
  selected: { label: 'انتخاب شما', color: 'text-brand-primary', iconColor: 'text-brand-primary', selectable: true },
  unavailable: { label: 'غیرقابل انتخاب', color: 'text-gray-300', iconColor: 'text-gray-300', selectable: false },
  reserved_female: { label: 'ویژه بانوان (آزاد)', color: 'text-pink-400', iconColor: 'text-pink-300', selectable: true },
  // Add more statuses if needed
};

const Seat = ({ seatData, isSelected, onClick }) => {
  // If seatData is null, it's an empty space (like an aisle or disabled seat)
  if (!seatData) {
    return <div className="w-12 h-12 m-1" />;
  }

  let statusKey = seatData.status;
  if (isSelected) {
    statusKey = 'selected';
  }

  const config = SEAT_STATUS_CONFIG[statusKey] || SEAT_STATUS_CONFIG.unavailable;

  const handleClick = () => {
    if (config.selectable && onClick) {
      onClick(seatData);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!config.selectable}
      className={`relative w-12 h-12 m-1 flex items-center justify-center
                  transition-all duration-200 ease-in-out transform hover:scale-110
                  ${config.selectable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
      title={`${seatData.seat_number} - ${config.label}`}
    >
      <Armchair size={40} className={`${config.iconColor} ${isSelected ? 'scale-110' : ''}`} strokeWidth={1.5} />
      {/* Overlay icon for selected or booked status */}
      {isSelected && <Check size={16} className="absolute text-white" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}/>}
      {statusKey === 'booked' && <X size={20} className="absolute text-white" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}/>}
    </button>
  );
};


const SeatPicker = ({ tripDetails, selectedSeats, onSeatSelect }) => {
  if (!tripDetails || !tripDetails.driver_seat_layout || !tripDetails.seats) {
    return <p className="text-center text-red-500">اطلاعات چیدمان صندلی‌ها موجود نیست.</p>;
  }

  const layout = tripDetails.driver_seat_layout;
  const tripSeatsMap = new Map(tripDetails.seats.map(s => [s.seat_number, s]));

  const renderGrid = () => {
    const grid = [];
    for (let r = 0; r < (layout.rows || 0); r++) {
      const rowSeats = [];
      for (let c = 0; c < (layout.cols || 0); c++) {
        const seatId = `${String.fromCharCode(65 + r)}${c + 1}`;

        let seatData = tripSeatsMap.get(seatId);
        // If seat is in layout's disabled_seats, it's not a seat.
        if (layout.disabled_seats && layout.disabled_seats.includes(seatId)) {
            seatData = null;
        }

        rowSeats.push(
          <Seat
            key={seatId}
            seatData={seatData}
            onClick={onSeatSelect}
            isSelected={selectedSeats.some(s => s.id === seatData?.id)}
          />
        );

        if (layout.aisles_after_cols && layout.aisles_after_cols.includes(c + 1) && (c + 1 < layout.cols)) {
          rowSeats.push(<div key={`aisle-${r}-${c}`} className="w-8 h-12 m-1" />);
        }
      }
      grid.push(<div key={`row-${r}`} className="flex justify-center">{rowSeats}</div>);
    }
    return grid;
  };

  const legendItems = Object.entries(SEAT_STATUS_CONFIG)
    .filter(([key]) => key !== 'unavailable') // Don't show 'unavailable' in legend
    .map(([key, config]) => ({ key, ...config }));

  return (
    <div className="p-6 border rounded-xl bg-brand-surface shadow-card">
      <h3 className="text-lg font-bold mb-4 text-center text-brand-secondary">انتخاب صندلی</h3>
      <div className="p-4 bg-gray-100 rounded-lg">
        <div className="flex justify-center mb-2">
            <div className="px-4 py-1 bg-gray-200 text-gray-600 text-sm font-semibold rounded-full">جلوی خودرو</div>
        </div>
        <div className="seat-grid-container overflow-x-auto py-2">
            {renderGrid()}
        </div>
      </div>
       <div className="mt-6 pt-4 border-t">
        <h4 className="text-md font-semibold mb-3 text-center">راهنما</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          {legendItems.map(item => (
            <div key={item.key} className="flex items-center space-x-2 rtl:space-x-reverse">
              <Armchair size={24} className={item.iconColor} strokeWidth={1.5}/>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeatPicker;
