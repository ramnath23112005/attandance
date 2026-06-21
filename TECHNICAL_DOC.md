# Attandance — Deep Technical Document

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  App.js (Route-less composition)                  │   │
│  │  ├── Material.jsx (Timetable + Attendance Mark)   │   │
│  │  ├── AttandaceList.jsx (Attendance List View)     │   │
│  │  └── AttendanceAnalysis.jsx (Analytics Engine)    │   │
│  └──────────────────────────────────────────────────┘   │
│                     HTTP (fetch)                         │
│                          │                               │
└──────────────────────────┼───────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────┐
│              Backend (Express 4 / Node.js)               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  server.js                                       │   │
│  │  ├── GET    /attendance                          │   │
│  │  ├── GET    /attendance/:date                    │   │
│  │  └── POST   /attendance                          │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  attendance.json (filesystem-based data store)    │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│            Static HTML Pages (html/ directory)           │
│  index.html, index2.html ... index6.html                 │
│  att.html, attendance-list.html                          │
│  TimeTable.html, TimeTable2.html                         │
│  styles.css                                              │
└─────────────────────────────────────────────────────────┘
```

The application uses a **monolithic frontend** architecture — all three components are mounted simultaneously in `App.js` without client-side routing. The backend is a simple REST API server backed by a flat JSON file for persistence, not a database.

---

## 2. Backend Implementation

### 2.1 Server Entry: `backend/server.js`

The server is a single-file Express application running on port `5000`.

**Dependencies:**
- `express` — HTTP server framework
- `cors` — Cross-Origin Resource Sharing (allows React dev server on port 3000 to call port 5000)
- `body-parser` — JSON body parsing middleware (though Express 4.21+ includes `express.json()` natively, this uses the external middleware)
- `fs` — Node.js filesystem module (used for JSON file read/write)

### 2.2 Data Persistence Strategy

**Storage:** A single `attendance.json` file at the backend root.

**Schema:**
```json
{
  "YYYY-MM-DD": [
    {
      "day": "Monday",
      "period": "Lecture 1",
      "status": "Present"
    }
  ]
}
```

Keys are date strings (ISO-8601 date-only format). Each value is an array of attendance records for that date.

**Utility Functions:**
```javascript
const readData = () => JSON.parse(fs.readFileSync(DATA_FILE));
const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
```
- `readData` — Deserializes the entire JSON file into memory
- `writeData` — Writes the entire object tree back with 2-space indentation

**Concurrency Model:** Single-threaded, no locking. Read-modify-write is atomic within Node's event loop because all I/O is synchronous (`readFileSync`/`writeFileSync`), making it safe for single-instance deployments. Not safe for multi-process or clustered deployments.

### 2.3 API Endpoints

#### `GET /attendance`
- **Purpose:** Fetch all attendance data
- **Response:** Entire `attendance.json` object `{ "2025-08-04": [...], ... }`
- **Status:** Always 200

#### `GET /attendance/:date`
- **Purpose:** Fetch attendance records for a specific date
- **Params:** `:date` — ISO date string (e.g., `2025-08-04`)
- **Response:** `{ "date": "2025-08-04", "records": [...] }`
- **Error:** 404 if date not found `{ "error": "No records found for this date" }`

#### `POST /attendance`
- **Purpose:** Insert or update attendance records for a date
- **Body:** `{ "date": "2025-08-04", "records": [ { "day": "Monday", "period": "Lecture 1", "status": "Present" } ] }`
- **Validation:** Returns 400 if `date` is missing or `records` is not an array
- **Merge Logic:** For each new record, checks if a record with the same `day` + `period` combination already exists for that date. If found, it **updates** the existing record (overwrites). If not found, it **appends** the new record.
- **Response:** `{ "message": "Attendance saved successfully" }` (200)

### 2.4 Orphaned Mongoose Model: `backend/models/Attendance.js`

```javascript
const mongoose = require('mongoose');
const attendanceSchema = new mongoose.Schema({
  day: { type: String, required: true },
  period: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Leave'], required: true },
  date: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Attendance', attendanceSchema);
```

This model is **defined but never imported or used** anywhere. It represents a previous or intended MongoDB-based implementation. The live system uses the JSON file approach instead. The model schema defines the canonical data shape:
- `day` (String, required) — Day of the week
- `period` (String, required) — Lecture identifier
- `status` (String, enum: Present/Absent/Leave, required)
- `date` (Date, defaults to now)

---

## 3. Frontend Implementation

### 3.1 Application Shell: `frontend/src/App.js`

All three main components are rendered simultaneously in a flat hierarchy:

```jsx
<div className="app-wrapper">
  <Material />           {/* Timetable + Attendance Marking */}
  <AttendanceList />     {/* Attendance List View */}
  <AttendanceAnalysis /> {/* Analytics */}
</div>
```

There is **no client-side routing** (React Router is installed as a dependency but `BrowserRouter` is only used in `index.js` to wrap `<App />` without any `<Routes>` or `<Route>` definitions). All components render on the same page in vertical order.

### 3.2 Index Entry: `frontend/src/index.js`

Wraps `<App />` in `<BrowserRouter>` from `react-router-dom`, enabling potential future routing but currently unused.

### 3.3 Component: `Material.jsx` — Timetable & Attendance Marking

**File:** `frontend/src/components/pages/FootNav/Material.jsx`

This is the core component. It renders a 5x10 timetable grid (Mon-Fri x 10 lecture slots) with color-coded attendance cells.

#### State Management

| State Variable | Type | Purpose |
|---|---|---|
| `attendanceRecords` | `Array<{day, period, status}>` | Holds all fetched + newly marked records for the current week |
| `currentDay` | String | The day name of the cell being marked |
| `currentPeriod` | String | The period label of the cell being marked |
| `currentCell` | DOM element | Direct reference to the clicked `<td>` for immediate color update |
| `selectedDate` | Date | The date selected via calendar (defaults to `new Date()`) |
| `highlightedDay` | String | The day name corresponding to `selectedDate` (used for row highlighting) |
| `showCalendar` | Boolean | Toggles the calendar popup |

#### Key Functions

**`getWeekRange(date)` — Week Boundary Calculator**
```javascript
const getWeekRange = (date) => {
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setDate(date.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 4);
  return { start, end };
};
```
Computes Monday (start) to Friday (end) of the week containing `date`. If `date` is Sunday, rolls back 6 days to the previous Monday. The week is always 5 days (Mon-Fri).

**`getWeekDatesMap(startDate)` — Date Mapping**
Creates a map of `{ "Monday": Date, "Tuesday": Date, ... }` by iterating 5 days from `startDate`, used to translate day names into actual dates for API calls.

**`selectStatus(day, period, cell)` — Modal Trigger**
Stores the clicked cell's metadata and displays the status selection modal.

**`submitStatus(status)` — Async (async, fire-and-forget)**
1. Looks up `weekDatesMap[currentDay]` to get the actual date
2. Formats it as `YYYY-MM-DD`
3. Creates `newRecord = { day, period, status }`
4. Immediately updates local `attendanceRecords` state
5. Directly mutates the DOM: sets `currentCell.style.backgroundColor` (Present=green, Absent=red, Leave=purple)
6. Sends `POST /attendance` to backend
7. On failure, shows `alert()` but does not roll back the UI change

#### Data Flow for Attendance Marking

```
User clicks cell
  └─► selectStatus() opens modal
User clicks "Present"/"Absent"/"Leave"
  └─► submitStatus()
       ├─► Updates local state (attendanceRecords)
       ├─► Mutates DOM directly (currentCell.style.backgroundColor)
       └─► POST /attendance to backend (async, non-blocking)
```

#### useEffect Hooks

**Hook 1: Fetch weekly attendance on date change**
```javascript
useEffect(() => {
  // Iterates over all dates in weekDatesMap
  // For each date, calls GET /attendance/:dateKey
  // If 404 or error, skips (no data for that day)
  // Collects all records into attendanceRecords
}, [selectedDate]);
```

**Hook 2: Apply colors on records change**
```javascript
useEffect(() => {
  // Iterates over each row in the rendered <table>
  // Matches record.day with row's first cell textContent
  // Computes column index from record.period (Lecture N = column N)
  // Sets cell backgroundColor based on status
}, [attendanceRecords]);
```
This is a post-mount DOM traversal approach — it queries the DOM by class names and loops through rows/columns to paint cells. Fragile if the table structure changes.

#### Timetable Data Structure

`timetableData` is a hardcoded JavaScript object keyed by day names (Monday-Friday), each containing a 10-element array of lecture strings. Empty strings represent free periods. Lecture strings follow the format:
```
"SubjectCode(Type)/Room/Faculty"
```
Examples:
- `"EEMI(L)/B 301/SG"` — EEMI Lecture, Room B 301, faculty SG
- `"PE(T1)/A 307/SB\nMPMC (T2)/A 304/SB"` — combined/hybrid periods (split by `\n`)

This data is **not fetched from the backend** — it is hardcoded in the component.

#### Calendar Integration

Uses `react-calendar` (v6). When a date is selected:
1. `handleDateChange(date)` stores the date
2. Computes `highlightedDay` via `dayMap[date.getDay()]`
3. The corresponding day row gets the CSS class `highlighted-row` (light pink background)
4. Hides the calendar popup

---

### 3.4 Component: `AttandaceList.jsx` — Attendance List View

**File:** `frontend/src/components/pages/FootNav/AttandaceList.jsx`

Displays a flat table of attendance records filtered by the selected week.

#### State

| State Variable | Type | Purpose |
|---|---|---|
| `allRecords` | Object | Full dataset from `GET /attendance` `{ "date": [...] }` |
| `selectedDate` | Date | Currently selected date for week filtering |
| `weekRecords` | `Array<{day, period, status, date}>` | Flattened + filtered records for the selected week |
| `showCalendar` | Boolean | Calendar popup visibility |
| `error` | String/null | Error message from failed fetch |

#### Data Flow

```
On mount: GET /attendance ──► allRecords
On selectedDate change:
  1. Compute week boundaries (Monday-Friday)
  2. Filter allRecords by date range
  3. Flatten nested records with date into weekRecords array
  4. Render table
```

#### Date Filtering Logic

```javascript
Object.entries(allRecords).forEach(([date, records]) => {
  if (isDateInRange(date, start, end)) {
    records.forEach((record) => {
      filtered.push({ ...record, date });
    });
  }
});
```
Each record gains a `date` field (the key from the parent object) so the table can display the date alongside day/period/status.

---

### 3.5 Component: `AttendanceAnalysis.jsx` — Analytics Engine

**File:** `frontend/src/components/pages/FootNav/AttendanceAnalysis.jsx`

This is the most computationally intensive component. It performs three levels of aggregation.

#### Reference Subject Constants

```javascript
const referenceSubjects = ['EEMI', 'PE', 'MPMC', 'PS-II', 'EoE', 'ICS'];
```

These strings are matched against lecture cell content to categorize records by subject.

#### Subject Extraction Algorithm

```javascript
lectures.forEach((lecture) => {
  const subjectCode = lecture.split('/')[0]?.replace(/[^A-Z-]/g, '').trim();
  const baseSubject = getBaseSubject(subjectCode);
  // ...
});
```
1. Splits multi-lecture cells by `\n`
2. For each lecture string, splits by `/` and takes the first segment
3. Strips non-alphabetic characters (removes whitespace, digits, symbols)
4. Matches against `referenceSubjects` via `getBaseSubject()`:
```javascript
const getBaseSubject = (code) => {
  return referenceSubjects.find((subj) => code.includes(subj)) || null;
};
```
Uses `String.includes()` for partial matching — so "PS-II" matches records containing "PS-II" in the extracted code string.

#### Aggregation Levels

**Level 1: Total Summary (`totalSummary`)**
```javascript
{ Present: N, Absent: N, Leave: N, Total: N }
```
Accumulated across all records, all subjects, all weeks.

**Level 2: Per-Subject Summary (`subjectSummary`)**
```javascript
{ "EEMI": { Present: N, Absent: N, Leave: N, Total: N }, ... }
```
Each record contributes to every subject found in that period's lecture cell. If a period has multiple subjects (e.g., "EEMI(T1) ... MPMC(T2) ..."), both get incremented.

**Level 3: Weekly Per-Subject Summary (`weeklySummary`)**
```javascript
{ "2025-W32": { "EEMI": { Present: N, Absent: N, Leave: N, Total: N }, ... }, ... }
```
Week key format: `YYYY-W{weekNumber}` using `getWeekOfYear()`:
```javascript
const getWeekOfYear = (date) => {
  const firstJan = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + firstJan.getDay() + 1) / 7);
};
```

#### Data Flow

```
On mount: GET /attendance ──► records (flattened array)
                                 │
On records change (useEffect):   │
  ├─► Initialize totals         │
  ├─► For each record:          │
  │     ├─► Parse period #      │
  │     ├─► Lookup day in timetable
  │     ├─► Extract subjects    │
  │     ├─► Update totalSummary │
  │     ├─► Update subjectSummary
  │     └─► Update weeklySummary
  └─► Fill missing subjects with zeroes
```

---

### 3.6 CSS Architecture

Three CSS files with overlapping responsibilities:

| File | Scope | Theme |
|---|---|---|
| `Material.css` | Timetable component | Pink/rose theme (`#ffe4e1`, `#ff69b4`, `#d63384`) |
| `AttendanceList.css` | Attendance List component | Pink accent (`#ff69b4`, `#c71585`) |
| `AttendanceAnalysis.css` | Analytics component | Neutral green/red/purple status colors |

All three define styles for `table`, `modal`, `footer`, and `button` — creating potential specificity conflicts when rendered on the same page (all three are mounted in `App.js`). The last-loaded stylesheet wins for shared selectors.

---

## 4. HTML Static Pages (`html/` directory)

Eleven static HTML files and one CSS file, representing an earlier or alternative version of the UI. These pages share `styles.css` and use vanilla JavaScript (no framework).

### Page Inventory

| File | Purpose |
|---|---|
| `index.html` | Landing page / Login portal |
| `index2.html` | Dashboard or secondary navigation |
| `index3.html` | Student portal (likely timetable view) |
| `index4.html` | Attendance marking page |
| `index5.html` | Timetable main view (references from React components as "Back" link) |
| `index6.html` | Additional UI (possibly settings) |
| `att.html` | Attendance marking form |
| `attendance-list.html` | Attendance records list |
| `TimeTable.html` | Timetable display |
| `TimeTable2.html` | Alternate timetable layout |
| `styles.css` | Shared stylesheet for all HTML pages |

These appear to be an earlier prototype built before the React frontend was implemented. The React components reference `index5.html` in anchor tags as the "Back to Timetable" navigation target.

---

## 5. Data Flow End-to-End

### Attendance Marking Sequence

```
[User] ──click cell──► [Material.jsx]
                          │
                  selectStatus(day, period, cell)
                          │
                   [Modal] ◄── "Mark Your Attendance"
                     │
        ┌────────────┼────────────┐
   "Present"    "Absent"     "Leave"
        │            │            │
        └────────────┼────────────┘
                     │
              submitStatus(status)
                     │
            ┌────────┴────────┐
            │                 │
    Local Update          API Call
    attendanceRecords     POST /attendance
    DOM mutation         { date, records: [{...}] }
    (cell color)              │
                         Backend saves
                         to attendance.json
```

### Analytics Sequence

```
[Component Mount] ──► GET /attendance
                              │
                    Full JSON object returns
                              │
                    Flatten into record array
                              │
                    For each record:
                      ├─► Extract subjects from timetable
                      ├─► Subject totals += 1
                      ├─► Week-of-year computed
                      └─► Week-subject totals += 1
                              │
                    Render 3 sections:
                      ├─► Total summary (list)
                      ├─► Per-subject table
                      └─► Per-week-per-subject tables
```

---

## 6. Edge Cases & Notable Behaviors

### 6.1 Concurrency
The backend uses synchronous file I/O (`readFileSync`/`writeFileSync`). Under load, concurrent requests are serialized by the Node.js event loop — one request reads, modifies, and writes before the next starts. However, if two `POST /attendance` requests arrive simultaneously, the second may overwrite the first's data because both read the same initial state. This is a race condition.

### 6.2 Missing Subject Assignment
`AttendanceAnalysis.jsx` extracts subjects by matching timetable entries. If a record's `day` + `period` combination doesn't match any timetable entry, or if the extracted subject code doesn't match any `referenceSubjects`, the record is **silently skipped** — it contributes to no subject totals but still counts in the total summary.

### 6.3 Direct DOM Mutation
`Material.jsx` bypasses React's virtual DOM by directly setting `element.style.backgroundColor` on table cells. This creates a **synchronization gap** — the DOM can be out of sync with the `attendanceRecords` state. The `useEffect` that calls `applyAttendanceColors()` will re-paint all cells whenever `attendanceRecords` changes, but the initial mutation from `submitStatus()` provides immediate visual feedback.

### 6.4 No Authentication
There is zero authentication or authorization. Any client that can reach the backend can read and write all attendance data. The `attendance.json` file is world-readable/writable on the server filesystem.

### 6.5 Date Handling
- `selectedDate` defaults to `new Date()` (client's local time)
- Date keys use `toISOString().split('T')[0]` which returns UTC date, not local date. If a client is in a negative UTC offset timezone (e.g., UTC-5), the date could be off by one day.
- The day name (`Monday`, `Tuesday`, etc.) is computed from the client's local time via `date.getDay()`, creating a potential mismatch between `dateKey` (UTC) and `day` (local).

### 6.6 No Data Validation on Backend
The status field is not validated — any string is accepted. The Mongoose model defined an enum `['Present', 'Absent', 'Leave']` but it's not used in the runtime code.

### 6.7 Multi-Lecture Cells
The timetable has cells with multiple lectures separated by `\n` (e.g., `"EEMI(T1)...\nMPMC(T2)..."`). The analytics engine handles this by splitting and processing each line independently. However, the attendance marking modal only stores one `period` string (`"Lecture N"`) — when a user clicks a combined cell, the system cannot determine which specific lecture within that cell is being marked.

### 6.8 Orphaned Code
- `backend/models/Attendance.js` — Mongoose model, never imported
- `frontend/src/components/pages/backup/` — Contains `.jsx`, `.json`, `.css` files that appear to be older versions of components
- `frontend/src/App.css` — Empty file
- React Router is installed but not used for routing
- `frontend/package.json` lists `concurrently` as a dev dependency (to run both servers) but there's no root `package.json` to orchestrate it

---

## 7. Potential Improvements

| Area | Issue | Suggestion |
|---|---|---|
| **Storage** | File-based, no concurrency safety | Migrate to SQLite or MongoDB |
| **API** | Single file, no validation | Use Express Router, add request validation (Joi/Zod) |
| **State** | Direct DOM mutation | Use React refs or controlled components |
| **Timetable** | Hardcoded in component | Serve from API, store in DB |
| **Date** | UTC/local mismatch | Normalize all dates to local-time date strings |
| **Analytics** | Silent subject-skip | Log unmatched records for debugging |
| **Auth** | None | Add JWT or session-based auth |
| **Routing** | All components render at once | Implement React Router properly with distinct routes |
| **CSS** | Cascade conflicts between components | Use CSS Modules or styled-components |
| **Multi-lecture** | Can't specify which lecture in a cell | Split cells into individual clickable sub-cells |
