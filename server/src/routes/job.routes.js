import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  getJobs,
  getSavedJobs,
  saveJob,
  removeSavedJob,
  updateSavedJob,
} from '../controllers/job.controller.js';

const router = Router();

// All job routes require authentication
router.use(protect);

router.get('/', getJobs);
router.get('/saved', getSavedJobs);
router.post('/save', saveJob);
router.delete('/:jobId/save', removeSavedJob);
router.patch('/:jobId/saved', updateSavedJob);

export default router;
