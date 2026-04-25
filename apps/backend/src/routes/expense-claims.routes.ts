import { Router } from 'express';
import { expenseClaimsController } from '../controllers/expense-claims.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = Router();

router.use(authenticate);

router.get('/', expenseClaimsController.getExpenseClaims);
router.post('/', requirePermission('expenses:create'), expenseClaimsController.createExpenseClaim);
router.get('/:id', expenseClaimsController.getExpenseClaimById);
router.post('/:id/submit', expenseClaimsController.submitExpenseClaim);
router.post('/:id/approve', requirePermission('expenses:approve'), expenseClaimsController.approveExpenseClaim);
router.post('/:id/reject', requirePermission('expenses:approve'), expenseClaimsController.rejectExpenseClaim);
router.post('/:id/pay', requirePermission('expenses:pay'), expenseClaimsController.markAsPaid);
router.delete('/:id', requirePermission('expenses:delete'), expenseClaimsController.deleteExpenseClaim);

export default router;
