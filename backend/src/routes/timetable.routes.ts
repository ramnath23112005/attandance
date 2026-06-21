import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { createTimetableSchema, updateTimetableSchema } from '../validators/timetable.validator';
import * as timetableController from '../controllers/timetable.controller';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/weekly', timetableController.getWeekly);
router.get('/day/:day', timetableController.getByDay);
router.get('/', timetableController.getAll);
router.get('/:id', timetableController.getById);

router.post(
  '/',
  authorize(UserRole.ADMIN),
  validate(createTimetableSchema),
  timetableController.create
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validate(updateTimetableSchema),
  timetableController.update
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  timetableController.remove
);

export default router;
