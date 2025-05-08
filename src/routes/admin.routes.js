const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Job = require('../models/job.model');
const Application = require('../models/application.model');
const { auth, authorize } = require('../middleware/auth.middleware');

// Get all users (admin only)
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get all jobs (admin only)
router.get('/jobs', auth, authorize('admin'), async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('postedBy', 'firstName lastName email company')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Get all applications (admin only)
router.get('/applications', auth, authorize('admin'), async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('job')
      .populate('applicant', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// Get dashboard statistics (admin only)
router.get('/dashboard', auth, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const jobsByType = await Job.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const applicationsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      totalUsers,
      totalJobs,
      totalApplications,
      usersByRole,
      jobsByType,
      applicationsByStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

// Update user role (admin only)
router.patch('/users/:id/role', auth, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'recruiter', 'seeker'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all jobs posted by the user
    await Job.deleteMany({ postedBy: user._id });

    // Delete all applications submitted by the user
    await Application.deleteMany({ applicant: user._id });

    await user.remove();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

module.exports = router; 