const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 5000;

const DATA_FILE = 'attendance.json';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ensure the attendance data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({}));
}

// Utility functions
const readData = () => JSON.parse(fs.readFileSync(DATA_FILE));
const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// POST endpoint to add attendance records
app.post('/attendance', (req, res) => {
  const { date, records } = req.body;

  // Validate the request body
  if (!date || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  const data = readData();

  // Ensure the date key exists
  if (!data[date]) {
    data[date] = [];
  }

  // Merge new records with the existing ones
  records.forEach((newRecord) => {
    const existingIndex = data[date].findIndex(
      (r) => r.day === newRecord.day && r.period === newRecord.period
    );

    if (existingIndex !== -1) {
      data[date][existingIndex] = newRecord; // Update existing record
    } else {
      data[date].push(newRecord); // Add new record
    }
  });

  // Save the updated data to the file
  writeData(data);
  res.json({ message: 'Attendance saved successfully' });
});

// GET endpoint to fetch all attendance data
app.get('/attendance', (req, res) => {
  const data = readData();
  res.json(data);
});

// GET endpoint to fetch attendance data for a specific date
app.get('/attendance/:date', (req, res) => {
  const date = req.params.date;
  const data = readData();

  if (!data[date]) {
    return res.status(404).json({ error: 'No records found for this date' });
  }

  res.json({ date, records: data[date] });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Attendance server is running at http://localhost:${PORT}`);
});
