import dayjs from 'dayjs';

function jsonToCsv(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0] as Record<string, unknown>);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      const escaped = String(val ?? '').replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function generateHtmlReport(data: {
  studentName?: string;
  overall: { percentage: number; present: number; total: number; absent: number; leave: number };
  subjects: Array<{ subject: string; percentage: number; present: number; total: number }>;
  prediction?: { currentPercentage: number; targetPercentage: number; warning: string };
}) {
  const dateStr = dayjs().format('MMMM D, YYYY');
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Attendance Report</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; }
  h1 { color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th, td { border: 1px solid #ddd; padding: 10px; text-align: center; }
  th { background: #f5f5f5; font-weight: 600; }
  .summary { display: flex; gap: 20px; margin: 20px 0; }
  .card { background: #f9f9f9; border-radius: 8px; padding: 20px; flex: 1; text-align: center; }
  .card h3 { margin: 0 0 8px; color: #666; font-size: 14px; text-transform: uppercase; }
  .card .value { font-size: 28px; font-weight: 700; }
  .green { color: #4caf50; } .red { color: #f44336; } .purple { color: #9c27b0; }
  .footer { margin-top: 30px; font-size: 12px; color: #999; text-align: center; }
</style></head>
<body>
  <h1>Attendance Report</h1>
  <p><strong>Student:</strong> ${data.studentName || 'N/A'} | <strong>Generated:</strong> ${dateStr}</p>

  <div class="summary">
    <div class="card"><h3>Attendance</h3><div class="value ${data.overall.percentage >= 75 ? 'green' : 'red'}">${data.overall.percentage}%</div></div>
    <div class="card"><h3>Present</h3><div class="value green">${data.overall.present}</div></div>
    <div class="card"><h3>Absent</h3><div class="value red">${data.overall.absent}</div></div>
    <div class="card"><h3>Leave</h3><div class="value purple">${data.overall.leave}</div></div>
  </div>

  <h2>Subject-wise Breakdown</h2>
  <table>
    <thead><tr><th>Subject</th><th>Total</th><th>Present</th><th>Percentage</th></tr></thead>
    <tbody>
      ${data.subjects.map((s) => `<tr><td>${s.subject}</td><td>${s.total}</td><td>${s.present}</td><td class="${s.percentage >= 75 ? 'green' : 'red'}">${s.percentage}%</td></tr>`).join('')}
    </tbody>
  </table>

  ${data.prediction ? `
  <h2>Prediction</h2>
  <p><strong>Current:</strong> ${data.prediction.currentPercentage}% | <strong>Target:</strong> ${data.prediction.targetPercentage}%</p>
  <p>${data.prediction.warning}</p>` : ''}

  <div class="footer">Attandance - Attendance Management System</div>
</body></html>`.trim();
}

export const exportService = {
  toCsv(data: Record<string, unknown>[], filename = 'attendance-export.csv') {
    const csv = jsonToCsv(data);
    downloadFile(csv, filename, 'text/csv;charset=utf-8;');
  },

  toPdf(htmlContent: string, filename = 'attendance-report.pdf') {
    const styledHtml = htmlContent.includes('<!DOCTYPE')
      ? htmlContent
      : `<html><body>${htmlContent}</body></html>`;
    downloadFile(styledHtml, filename.replace('.pdf', '.html'), 'text/html;charset=utf-8;');
  },

  generateReport(data: {
    studentName?: string;
    overall: { percentage: number; present: number; total: number; absent: number; leave: number };
    subjects: Array<{ subject: string; percentage: number; present: number; total: number }>;
    prediction?: { currentPercentage: number; targetPercentage: number; warning: string };
  }) {
    const html = generateHtmlReport(data);
    this.toPdf(html, `attendance-report-${dayjs().format('YYYY-MM-DD')}.html`);
  },

  exportAttendanceRecords(records: Array<Record<string, unknown>>) {
    this.toCsv(records, `attendance-records-${dayjs().format('YYYY-MM-DD')}.csv`);
  },
};
