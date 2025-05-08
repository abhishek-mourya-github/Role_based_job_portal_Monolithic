const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Application = require('../models/application.model');
const Job = require('../models/job.model');
const { auth, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Validation schema
const applicationSchema = Joi.object({
  job: Joi.string().required(),
  coverLetter: Joi.string().optional()
});

// Apply for a job (job seeker only)
router.post('/', auth, authorize('seeker'), upload.single('resume'), async (req, res) => {
  try {
    const { error } = applicationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Resume is required' });
    }

    const job = await Job.findById(req.body.job);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: req.body.job,
      applicant: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = new Application({
      job: req.body.job,
      applicant: req.user._id,
      resume: req.file.path,
      coverLetter: req.body.coverLetter
    });

    await application.save();

    // Add application to job's applications array
    job.applications.push(application._id);
    await job.save();

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting application' });
  }
});

// Get applications for a job (recruiter who posted or admin)
router.get('/job/:jobId', auth, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these applications' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// Get applications submitted by the current user
router.get('/my-applications', auth, authorize('seeker'), async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// Update application status (recruiter who posted or admin)
router.patch('/:id/status', auth, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'reviewed', 'shortlisted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const job = await Job.findById(application.job);
    if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error updating application status' });
  }
});

module.exports = router; 