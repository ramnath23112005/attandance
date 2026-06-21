export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh-token',
    PROFILE: '/auth/profile',
    USERS: '/auth/users',
  },
  ATTENDANCE: {
    BASE: '/attendance',
    BULK: '/attendance/bulk',
    BY_DATE: '/attendance/date',
    BY_USER: (userId?: string) => userId ? `/attendance/student/${userId}` : '/attendance',
    STATS: {
      OVERALL: '/attendance/stats/overall',
      SUBJECT: '/attendance/stats/subject',
      WEEKLY: '/attendance/stats/weekly',
      MONTHLY: '/attendance/stats/monthly',
      SEMESTER: '/attendance/stats/semester',
      TREND: '/attendance/stats/trend',
      HEATMAP: '/attendance/stats/heatmap',
      PREDICTION: '/attendance/stats/prediction',
    },
    RECORD: (id: string) => `/attendance/${id}`,
  },
  TIMETABLE: {
    BASE: '/timetable',
    WEEKLY: '/timetable/weekly',
    BY_DAY: (day: string) => `/timetable/day/${day}`,
    BY_ID: (id: string) => `/timetable/${id}`,
  },
  SUBJECTS: {
    BASE: '/subjects',
    BY_ID: (id: string) => `/subjects/${id}`,
  },
  HEALTH: '/health',
} as const;
