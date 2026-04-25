import { Router } from 'express';
import { leaveRequestsController } from '../controllers/leave-requests.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = Router();

router.use(authenticate);

router.get('/', leaveRequestsController.getLeaveRequests);
router.post('/', requirePermission('leave:create'), leaveRequestsController.createLeaveRequest);
router.get('/:id', leaveRequestsController.getLeaveRequestById);
router.patch('/:id', requirePermission('leave:edit'), leaveRequestsController.updateLeaveRequest);
router.post('/:id/approve', requirePermission('leave:approve'), leaveRequestsController.approveLeaveRequest);
router.post('/:id/reject', requirePermission('leave:approve'), leaveRequestsController.rejectLeaveRequest);
router.delete('/:id', requirePermission('leave:delete'), leaveRequestsController.deleteLeaveRequest);

export default router;
