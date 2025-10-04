import React, { useEffect, useState } from 'react';
import './AttendanceAnalysis.css';

const AttendanceAnalysis = () => {
  const [records, setRecords] = useState([]);
  const [subjectSummary, setSubjectSummary] = useState({});
  const [weeklySummary, setWeeklySummary] = useState({});
  const [totalSummary, setTotalSummary] = useState({});

  const referenceSubjects = ['EEMI', 'PE', 'MPMC', 'PS-II', 'EoE', 'ICS'];

  const timetable = {
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

  // Fetch attendance data from server
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch('http://localhost:5000/attendance');
        const data = await res.json();

        // Flatten all records from all dates
        const all = [];
        Object.entries(data).forEach(([date, dayRecords]) => {
          dayRecords.forEach((record) => {
            all.push({ ...record, date });
          });
        });

        setRecords(all);
      } catch (err) {
        console.error('Failed to fetch attendance data:', err);
      }
    };

    fetchRecords();
  }, []);

  // Analyze attendance data
  useEffect(() => {
    if (records.length === 0) return;

    const total = { Present: 0, Absent: 0, Leave: 0, Total: 0 };
    const subjects = {};
    const weekly = {};

    records.forEach((r) => {
      const periodNum = parseInt(r.period.replace('Lecture ', '')) - 1;
      const lectures = timetable[r.day]?.[periodNum]?.split('\n') || [];

      lectures.forEach((lecture) => {
        const subjectCode = lecture.split('/')[0]?.replace(/[^A-Z-]/g, '').trim();
        const baseSubject = getBaseSubject(subjectCode);

        if (!baseSubject) return;

        total[r.status] = (total[r.status] || 0) + 1;
        total.Total++;

        if (!subjects[baseSubject]) {
          subjects[baseSubject] = { Present: 0, Absent: 0, Leave: 0, Total: 0 };
        }
        subjects[baseSubject][r.status]++;
        subjects[baseSubject].Total++;

        const date = new Date(r.date);
        const weekKey = `${date.getFullYear()}-W${getWeekOfYear(date)}`;

        if (!weekly[weekKey]) weekly[weekKey] = {};
        if (!weekly[weekKey][baseSubject]) {
          weekly[weekKey][baseSubject] = { Present: 0, Absent: 0, Leave: 0, Total: 0 };
        }

        weekly[weekKey][baseSubject][r.status]++;
        weekly[weekKey][baseSubject].Total++;
      });
    });

    referenceSubjects.forEach((subj) => {
      if (!subjects[subj]) {
        subjects[subj] = { Present: 0, Absent: 0, Leave: 0, Total: 0 };
      }
    });

    setTotalSummary(total);
    setSubjectSummary(subjects);
    setWeeklySummary(weekly);
  }, [records]);

  const getBaseSubject = (code) => {
    if (!code) return null;
    return referenceSubjects.find((subj) => code.includes(subj)) || null;
  };

  const getWeekOfYear = (date) => {
    const firstJan = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + firstJan.getDay() + 1) / 7);
  };

  return (
    <div className="analysis-container">
      <h1>📊 Attendance Analysis</h1>

      <section>
        <h2>Total Attendance</h2>
        <ul className="summary-list">
          <li><strong>Total:</strong> {totalSummary.Total}</li>
          <li><span className="present">Present:</span> {totalSummary.Present}</li>
          <li><span className="absent">Absent:</span> {totalSummary.Absent}</li>
          <li><span className="leave">Leave:</span> {totalSummary.Leave}</li>
        </ul>
      </section>

      <section>
        <h2>Attendance Per Subject</h2>
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Total</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Leave</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(subjectSummary).map(([subject, stats]) => (
              <tr key={subject}>
                <td>{subject}</td>
                <td>{stats.Total}</td>
                <td>{stats.Present}</td>
                <td>{stats.Absent}</td>
                <td>{stats.Leave}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Attendance Per Subject Per Week</h2>
        {Object.entries(weeklySummary).map(([week, subjects]) => (
          <div key={week} className="week-block">
            <h3>{week}</h3>
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Total</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Leave</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(subjects).map(([subject, stats]) => (
                  <tr key={subject}>
                    <td>{subject}</td>
                    <td>{stats.Total}</td>
                    <td>{stats.Present}</td>
                    <td>{stats.Absent}</td>
                    <td>{stats.Leave}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </section>

      <section>
        <h2>📘 Subjects Report</h2>
        <ul className="subject-report">
          {referenceSubjects.map((subj) => {
            const stats = subjectSummary[subj] || { Total: 0 };
            return (
              <li key={subj}>
                <strong>{subj}</strong>: {stats.Total > 0 ? '✔️ Recorded' : '❌ No Records'}
              </li>
            );
          })}
        </ul>
      </section>

      <div className="footer">
        <a href="index5.html">
          <button>🔙 Back to Timetable</button>
        </a>
      </div>
    </div>
  );
};

export default AttendanceAnalysis;
