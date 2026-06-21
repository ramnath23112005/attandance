import { Router } from 'express';
import authRoutes from './auth.routes';
import attendanceRoutes from './attendance.routes';
import timetableRoutes from './timetable.routes';
import subjectRoutes from './subject.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/timetable', timetableRoutes);
router.use('/subjects', subjectRoutes);

export default router;
