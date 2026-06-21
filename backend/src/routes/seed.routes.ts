import { Router } from 'express';
import { seedDatabase } from '../controllers/seed.controller';

const router = Router();

router.post('/', seedDatabase);

export default router;
