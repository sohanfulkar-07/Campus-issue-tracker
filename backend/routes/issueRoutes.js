const express = require('express');
const router = express.Router();
const {
    createIssue,
    getMyIssues,
    getFacultyAssignedIssues,
    getAllIssues,
    getIssueById,
    updateIssueStatus
} = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, authorize('student'), upload.array('media', 5), createIssue);
router.get('/my-issues', protect, authorize('student'), getMyIssues);
router.get('/assigned', protect, authorize('faculty', 'admin'), getFacultyAssignedIssues);
router.get('/', protect, authorize('admin', 'faculty'), getAllIssues);
router.get('/:id', protect, getIssueById);
router.put('/:id/status', protect, authorize('faculty', 'admin'), updateIssueStatus);

module.exports = router;
