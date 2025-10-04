import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AttendanceList.css';

const AttendanceList = () => {
  const [allRecords, setAllRecords] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekRecords, setWeekRecords] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [error, setError] = useState(null);

  const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Get Monday–Friday range for selected week
  const getWeekRange = (date) => {
    const day = date.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(date);
    start.setDate(date.getDate() + diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 4);
    return { start, end };
  };

  const isDateInRange = (dateStr, start, end) => {
    const date = new Date(dateStr);
    return date >= start && date <= end;
  };

  const fetchAttendanceRecords = async () => {
    try {
      const response = await fetch('http://localhost:5000/attendance');
      const data = await response.json();

      if (response.ok) {
        setAllRecords(data);
      } else {
        setError('Failed to load attendance records');
      }
    } catch (err) {
      setError('An error occurred while fetching data');
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  useEffect(() => {
    const { start, end } = getWeekRange(selectedDate);
    const filtered = [];

    Object.entries(allRecords).forEach(([date, records]) => {
      if (isDateInRange(date, start, end)) {
        records.forEach((record) => {
          filtered.push({ ...record, date });
        });
      }
    });

    setWeekRecords(filtered);
  }, [selectedDate, allRecords]);

  const formatDate = (date) => {
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'Invalid Date' : d.toISOString().split('T')[0];
  };

  return (
    <div className="attendance-container">
      <div className="header">
        <h1>📋 Attendance List</h1>
        <p>Showing records for the selected week.</p>
        <button onClick={() => setShowCalendar(true)}>📅 Select Week</button>
        <p><strong>Week of:</strong> {selectedDate.toDateString()}</p>
      </div>

      {showCalendar && (
        <div className="calendar-popup">
          <span className="close-calendar" onClick={() => setShowCalendar(false)}>&times;</span>
          <Calendar
            onChange={(date) => {
              setSelectedDate(date);
              setShowCalendar(false);
            }}
            value={selectedDate}
          />
        </div>
      )}

      {error && <div className="error">{error}</div>}

      <table className="attendance-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Day</th>
            <th>Lecture</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {weekRecords.length === 0 ? (
            <tr>
              <td colSpan="4">No attendance records found for this week.</td>
            </tr>
          ) : (
            weekRecords.map((record, index) => (
              <tr key={index}>
                <td>{formatDate(record.date)}</td>
                <td>{dayMap[new Date(record.date).getDay()]}</td>
                <td>{record.period}</td>
                <td>{record.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="footer">
        <a href="index5.html">
          <button>🔙 Back to Timetable</button>
        </a>
      </div>
    </div>
  );
};

export default AttendanceList;
