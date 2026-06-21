import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { createSubjectSchema, updateSubjectSchema } from '../validators/subject.validator';
import * as subjectController from '../controllers/subject.controller';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/', subjectController.getAll);
router.get('/:id', subjectController.getById);

router.post(
  '/',
  authorize(UserRole.ADMIN),
  validate(createSubjectSchema),
  subjectController.create
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validate(updateSubjectSchema),
  subjectController.update
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  subjectController.remove
);

export default router;
