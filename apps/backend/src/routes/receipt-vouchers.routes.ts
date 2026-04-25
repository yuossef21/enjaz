import { Router } from 'express';
import { receiptVouchersController } from '../controllers/receipt-vouchers.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = Router();

router.use(authenticate);

router.get('/', receiptVouchersController.getReceiptVouchers);
router.post('/', requirePermission('vouchers:create'), receiptVouchersController.createReceiptVoucher);
router.get('/:id', receiptVouchersController.getReceiptVoucherById);
router.patch('/:id', requirePermission('vouchers:edit'), receiptVouchersController.updateReceiptVoucher);
router.post('/:id/approve', requirePermission('vouchers:approve'), receiptVouchersController.approveReceiptVoucher);
router.post('/:id/post', requirePermission('vouchers:post'), receiptVouchersController.postReceiptVoucher);
router.delete('/:id', requirePermission('vouchers:delete'), receiptVouchersController.deleteReceiptVoucher);

export default router;
