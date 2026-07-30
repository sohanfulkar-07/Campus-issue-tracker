const express = require('express');
const router = express.Router();
const { getAdminAnalytics } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/analytics', protect, authorize('admin'), getAdminAnalytics);

module.exports = router;
