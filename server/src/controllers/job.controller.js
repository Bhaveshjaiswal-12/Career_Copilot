import { searchJobs } from '../services/job.service.js';
import SavedJob from '../models/SavedJob.js';
import User from '../models/User.js';

/**
 * Search and discover jobs
 * GET /api/jobs
 */
export async function getJobs(req, res, next) {
  try {
    const {
      query = '',
      location = '',
      remote = 'all',
      sortBy = 'match',
      page = 1,
      limit = 20,
    } = req.query;

    // Get fresh user profile for matching if authenticated
    let userProfile = null;
    if (req.user?._id) {
      const user = await User.findById(req.user._id).select('profile');
      if (user?.profile) {
        userProfile = user.profile;
      }
    }

    const results = await searchJobs({
      query: String(query),
      location: String(location),
      remote: String(remote),
      sortBy: String(sortBy),
      page: Number(page) || 1,
      limit: Math.min(50, Math.max(1, Number(limit) || 20)),
      userProfile,
    });

    // Check which jobs are already saved by this user
    let savedJobIds = new Set();
    if (req.user?._id) {
      const saved = await SavedJob.find({ userId: req.user._id }).select('jobId');
      savedJobIds = new Set(saved.map((s) => s.jobId));
    }

    const jobsWithSavedFlag = results.jobs.map((job) => ({
      ...job,
      isSaved: savedJobIds.has(job.id),
    }));

    res.json({
      success: true,
      data: {
        ...results,
        jobs: jobsWithSavedFlag,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all saved jobs for current user
 * GET /api/jobs/saved
 */
export async function getSavedJobs(req, res, next) {
  try {
    const savedJobs = await SavedJob.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        savedJobs,
        count: savedJobs.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Save a job for current user
 * POST /api/jobs/save
 */
export async function saveJob(req, res, next) {
  try {
    const { jobId, title, company, location, remote, url, description, tags, source, salary, notes } = req.body;

    if (!jobId || !title || !company || !url) {
      return res.status(400).json({
        success: false,
        error: { message: 'Job ID, title, company, and URL are required to save a job' },
      });
    }

    const saved = await SavedJob.findOneAndUpdate(
      { userId: req.user._id, jobId },
      {
        userId: req.user._id,
        jobId,
        title,
        company,
        location: location || '',
        remote: Boolean(remote),
        url,
        description: description || '',
        tags: Array.isArray(tags) ? tags : [],
        source: source || 'Arbeitnow',
        salary: salary || '',
        notes: notes || '',
        status: 'saved',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      success: true,
      data: { savedJob: saved },
      message: 'Job saved to your shortlist',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Remove a saved job
 * DELETE /api/jobs/:jobId/save
 */
export async function removeSavedJob(req, res, next) {
  try {
    const { jobId } = req.params;

    const result = await SavedJob.findOneAndDelete({
      userId: req.user._id,
      jobId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: { message: 'Saved job not found' },
      });
    }

    res.json({
      success: true,
      message: 'Job removed from saved list',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update a saved job's status or notes
 * PATCH /api/jobs/:jobId/saved
 */
export async function updateSavedJob(req, res, next) {
  try {
    const { jobId } = req.params;
    const { status, notes } = req.body;

    const updateFields = {};
    if (status) updateFields.status = status;
    if (notes !== undefined) updateFields.notes = notes;

    const updated = await SavedJob.findOneAndUpdate(
      { userId: req.user._id, jobId },
      updateFields,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: { message: 'Saved job not found' },
      });
    }

    res.json({
      success: true,
      data: { savedJob: updated },
    });
  } catch (err) {
    next(err);
  }
}
