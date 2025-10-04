import React, { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Material.css';

const Timetable = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [currentDay, setCurrentDay] = useState('');
  const [currentPeriod, setCurrentPeriod] = useState('');
  const [currentCell, setCurrentCell] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [highlightedDay, setHighlightedDay] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const dayName = dayMap[date.getDay()];
    setHighlightedDay(dayName);
    setShowCalendar(false);
  };

  const getWeekRange = (date) => {
    const day = date.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(date);
    start.setDate(date.getDate() + diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 4);
    return { start, end };
  };

  const getWeekDatesMap = (startDate) => {
    const map = {};
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dayName = dayMap[date.getDay()];
      map[dayName] = date;
    }
    return map;
  };

  const getMonthName = (date) => date.toLocaleString('default', { month: 'long' });

  const getWeekOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    const adjustedDate = dayOfMonth + firstDay.getDay();
    return Math.ceil(adjustedDate / 7);
  };

  const getWeekDayNames = (startDate) => {
    const names = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      names.push(dayMap[date.getDay()]);
    }
    return names;
  };

  const isHighlighted = (day) => day === highlightedDay;

  const selectStatus = (day, period, cell) => {
    setCurrentDay(day);
    setCurrentPeriod(period);
    setCurrentCell(cell);
    document.getElementById('modalInfo').textContent = `${day} - ${period}`;
    document.getElementById('statusModal').style.display = 'flex';
  };

  const closeModal = () => {
    document.getElementById('statusModal').style.display = 'none';
  };

  const viewAttendance = () => {
    window.location.href = "attendance-list.html";
  };

  const renderLectureCell = (day, period, content) => {
    return content ? (
      <td onClick={(e) => selectStatus(day, period, e.target)}>{content}</td>
    ) : (
      <td className="empty"></td>
    );
  };

  const applyAttendanceColors = (records) => {
    const rows = document.querySelectorAll('table tbody tr');

    // Clear previous colors
    rows.forEach((row) => {
      for (let i = 1; i < row.children.length; i++) {
        row.children[i].style.backgroundColor = '';
      }
    });

    // Apply new colors
    records.forEach((record) => {
      rows.forEach((row) => {
        if (row.children[0].textContent === record.day) {
          const periodIndex = parseInt(record.period.split(' ')[1]) - 1;
          const cell = row.children[periodIndex + 1];
          if (!cell) return;

          if (record.status === 'Present') cell.style.backgroundColor = '#90ee90';
          else if (record.status === 'Absent') cell.style.backgroundColor = '#ff6347';
          else if (record.status === 'Leave') cell.style.backgroundColor = '#d8bfd8';
        }
      });
    });
  };

  const { start, end } = getWeekRange(selectedDate);
  const weekDatesMap = getWeekDatesMap(start);
  const weekDayNames = getWeekDayNames(start);

  const timetableData = {
    Monday: [
      'EEMI(L)/B 301/SG',
      'PE(L)/B 301/SB',
      'EEMI(T1)/A 307/SG\nMPMC (T2)/A 304/SB',
      '',
      'PS-II(L)/B 301/KT',
      'PE(T2)/A 304/SB\nPS-II (T1)/A 307/KT',
      '',
      'EoE(L)/B 301/SS',
      '',
      ''
    ],
    Tuesday: [
      'ICS(L)/B 301/SS',
      'EEMI(L)/B 301/SG',
      'ICS(T1)/A 308/SS\nEEMI (T2)/A 307/SG',
      '',
      'PS-II(L)/B 302/KT',
      'ICS(T2)/A 308/SS\nMPMC(T1)/A 304/NK',
      '',
      'MPMC(L)/B 301/NK',
      '',
      ''
    ],
    Wednesday: [
      'MPMC (L)/B 302/NK',
      'EEMI(L)/B 302/SG',
      'PE(L)/B 302/SB',
      'ICS(L)/B 302/SS',
      '',
      'PS-II (T2)/A 307/KT',
      '',
      '',
      '',
      ''
    ],
    Thursday: [
      '',
      '',
      'EEMI(L)/B 301/SG',
      'PE(L)/B 301/SB',
      '',
      'PS-II(L)/B 302/KT',
      'EoE(L)/B 302/SS',
      'PE(T1)/A 304/SB',
      '',
      ''
    ],
    Friday: [
      'MPMC(L)/B 302/NK',
      'PE(L)/B 302/SB',
      'PS-II(L)/B 302/KT',
      'ICS(L)/B 302/SS',
      '',
      'MPMC(L)/B 301/NK',
      '',
      'ICS(T1)/A 307/SS',
      '',
      ''
    ]
  };

  const currentWeekData = timetableData;

  const submitStatus = async (status) => {
    const actualDate = weekDatesMap[currentDay];
    const dateKey = actualDate.toISOString().split('T')[0];

    const newRecord = { day: currentDay, period: currentPeriod, status };
    const updatedRecords = [...attendanceRecords, newRecord];
    setAttendanceRecords(updatedRecords);

    if (status === 'Present') currentCell.style.backgroundColor = '#90ee90';
    else if (status === 'Absent') currentCell.style.backgroundColor = '#ff6347';
    else if (status === 'Leave') currentCell.style.backgroundColor = '#d8bfd8';

    try {
      const response = await fetch('http://localhost:5000/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateKey, records: [newRecord] })
      });

      const data = await response.json();
      console.log('Synced:', data.message);
    } catch (err) {
      console.error('Error syncing to backend:', err);
      alert('Failed to sync with server.');
    }

    alert(`You have marked ${status} for ${currentDay} - ${currentPeriod}`);
    closeModal();
  };

  useEffect(() => {
    const fetchWeeklyAttendance = async () => {
      const weekDates = Object.values(weekDatesMap);
      const allRecords = [];

      for (const date of weekDates) {
        const dateKey = date.toISOString().split('T')[0];
        try {
          const response = await fetch(`http://localhost:5000/attendance/${dateKey}`);
          if (!response.ok) throw new Error('No data');
          const data = await response.json();
          allRecords.push(...(data.records || []));
        } catch (err) {
          console.log(`No saved attendance for ${dateKey}`);
        }
      }

      setAttendanceRecords(allRecords);
      const dayName = dayMap[selectedDate.getDay()];
      setHighlightedDay(dayName);
    };

    fetchWeeklyAttendance();
  }, [selectedDate]);

  useEffect(() => {
    applyAttendanceColors(attendanceRecords);
  }, [attendanceRecords]);

  return (
    <div>
      <div className="header">
        <h1>SECTOR LITUS LOCUM</h1>
        <h2>SEMESTER: V</h2>
        <p><strong>Month:</strong> {getMonthName(selectedDate)}</p>
        <p><strong>Week:</strong> {getWeekOfMonth(selectedDate)}</p>
        <p><strong>Week Range:</strong> {start.toDateString()} to {end.toDateString()}</p>
        <button onClick={() => setShowCalendar(true)} style={{ marginTop: '10px' }}>
          Open Calendar
        </button>
      </div>

      {showCalendar && (
        <div className="calendar-popup" ref={calendarRef}>
          <span className="close-calendar" onClick={() => setShowCalendar(false)}>&times;</span>
          <Calendar onChange={handleDateChange} value={selectedDate} />
          <div className="calendar-info">
            <p><strong>Selected:</strong> {selectedDate.toDateString()}</p>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Days</th>
            {[...Array(10)].map((_, i) => (
              <th key={i}>
                Lecture {i + 1}<br />
                {['8:40-9:30', '9:30-10:20', '10:20-11:10', '11:10-12:00', '12:00-12:50', '12:50-14:00', '13:40-23:00', '2:30-3:20', '3:20-4:10', '4:10-5:00'][i]}
              </th>
            ))}
                    </tr>
        </thead>
        <tbody>
          {weekDayNames.map((day) => (
            <tr key={day} className={isHighlighted(day) ? 'highlighted-row' : ''}>
              <td>{day}</td>
              {(currentWeekData[day] || []).map((lecture, i) =>
                renderLectureCell(day, `Lecture ${i + 1}`, lecture)
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="legend" style={{ marginTop: '20px' }}>
        <strong>Color Legend:</strong>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          <li>
            <span style={{ backgroundColor: '#90ee90', padding: '4px 10px', marginRight: '10px' }}></span>
            Present
          </li>
          <li>
            <span style={{ backgroundColor: '#ff6347', padding: '4px 10px', marginRight: '10px' }}></span>
            Absent
          </li>
          <li>
            <span style={{ backgroundColor: '#d8bfd8', padding: '4px 10px', marginRight: '10px' }}></span>
            Leave
          </li>
        </ul>
      </div>

      <div className="footer" style={{ marginTop: '30px' }}>
        <button onClick={viewAttendance}>View Attendance</button>
      </div>

      <div id="statusModal" className="modal">
        <div className="modal-content">
          <span className="close" onClick={closeModal}>&times;</span>
          <h3>Mark Your Attendance</h3>
          <p id="modalInfo"></p>
          <div className="status-options">
            <button onClick={() => submitStatus('Present')}>Present</button>
            <button onClick={() => submitStatus('Absent')}>Absent</button>
            <button onClick={() => submitStatus('Leave')}>Leave</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timetable;
