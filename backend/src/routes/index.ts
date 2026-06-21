import { Router } from 'express';
import authRoutes from './auth.routes';
import attendanceRoutes from './attendance.routes';
import timetableRoutes from './timetable.routes';
import subjectRoutes from './subject.routes';
import seedRoutes from './seed.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/timetable', timetableRoutes);
router.use('/subjects', subjectRoutes);
router.use('/seed', seedRoutes);

export default router;
