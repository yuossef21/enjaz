import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = Router();

router.use(authenticate);

router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/', attendanceController.getAttendance);
router.get('/my-records', attendanceController.getMyRecords);
router.get('/export', attendanceController.exportToExcel);
router.patch('/:id', requirePermission('attendance:edit'), attendanceController.updateAttendance);
router.delete('/:id', requirePermission('attendance:delete'), attendanceController.deleteAttendance);

export default router;
