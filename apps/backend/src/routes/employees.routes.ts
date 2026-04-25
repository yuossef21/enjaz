import { Router } from 'express';
import { employeesController } from '../controllers/employees.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = Router();

router.use(authenticate);

router.get('/', employeesController.getEmployees);
router.post('/', requirePermission('employees:create'), employeesController.createEmployee);
router.get('/:id', employeesController.getEmployeeById);
router.patch('/:id', requirePermission('employees:edit'), employeesController.updateEmployee);
router.delete('/:id', requirePermission('employees:delete'), employeesController.deleteEmployee);

export default router;
