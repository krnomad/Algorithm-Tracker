import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const ReviewCalendarSection = ({ problems, selectedDate, onDateChange }) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">📆 Review Calendar</h2>
      <Calendar
        onChange={onDateChange}
        value={selectedDate}
        tileContent={({ date }) => {
          const key = date.toISOString().split('T')[0];
          const count = problems.reduce((acc, p) => acc + (p.reviews?.includes(key) ? 1 : 0), 0);
          return count > 0 ? <div className="text-xs text-center text-blue-600 font-bold">●</div> : null;
        }}
      />
    </div>
  );
};

export default ReviewCalendarSection;
