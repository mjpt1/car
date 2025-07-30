'use client';

import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { format } from 'date-fns-jalali'; // Using jalaali for display
import { subDays } from 'date-fns';
import Button from '../ui/Button';

const ReportFilters = ({ onFilterChange }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [state, setState] = useState([
    {
      startDate: subDays(new Date(), 7),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  const handleApplyFilters = () => {
    onFilterChange({
      startDate: format(state[0].startDate, 'yyyy-MM-dd'),
      endDate: format(state[0].endDate, 'yyyy-MM-dd'),
    });
    setShowDatePicker(false);
  };

  const formattedStartDate = format(state[0].startDate, 'yyyy/MM/dd');
  const formattedEndDate = format(state[0].endDate, 'yyyy/MM/dd');

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm mb-6 relative">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">بازه زمانی:</label>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full mt-1 text-right rtl:text-left px-4 py-2 border rounded-md bg-gray-50"
          >
            {`${formattedStartDate} - ${formattedEndDate}`}
          </button>
        </div>
        <div className="pt-5">
            <Button onClick={handleApplyFilters}>اعمال فیلتر</Button>
        </div>
      </div>

      {showDatePicker && (
        <div className="absolute top-full right-0 mt-2 z-20 shadow-lg rounded-lg border bg-white">
           <DateRange
                editableDateInputs={true}
                onChange={item => setState([item.selection])}
                moveRangeOnFirstSelection={false}
                ranges={state}
                direction="horizontal"
            />
            <div className="p-2 border-t flex justify-end">
                 <Button size="sm" onClick={handleApplyFilters}>تایید</Button>
            </div>
        </div>
      )}
    </div>
  );
};

export default ReportFilters;
