import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import {
  markAttendanceSchema,
  bulkAttendanceSchema,
  updateAttendanceSchema,
} from '../validators/attendance.validator';
import * as attendanceController from '../controllers/attendance.controller';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/stats/overall', attendanceController.getOverallStats);
router.get('/stats/subject', attendanceController.getSubjectStats);
router.get('/stats/weekly', attendanceController.getWeeklyStats);
router.get('/stats/monthly', attendanceController.getMonthlyStats);
router.get('/stats/semester', attendanceController.getSemesterStats);
router.get('/stats/trend', attendanceController.getTrend);
router.get('/stats/heatmap', attendanceController.getHeatmap);
router.get('/stats/prediction', attendanceController.getPrediction);

router.get('/date', attendanceController.getByDate);
router.get('/student/:userId', attendanceController.getByUser);
router.get('/', attendanceController.getByUser);

router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.FACULTY),
  validate(markAttendanceSchema),
  attendanceController.mark
);

router.post(
  '/bulk',
  authorize(UserRole.ADMIN, UserRole.FACULTY),
  validate(bulkAttendanceSchema),
  attendanceController.markBulk
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.FACULTY),
  validate(updateAttendanceSchema),
  attendanceController.update
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  attendanceController.remove
);

export default router;
