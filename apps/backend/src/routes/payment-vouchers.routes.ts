import { Router } from 'express';
import { paymentVouchersController } from '../controllers/payment-vouchers.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = Router();

router.use(authenticate);

router.get('/', paymentVouchersController.getPaymentVouchers);
router.post('/', requirePermission('vouchers:create'), paymentVouchersController.createPaymentVoucher);
router.get('/:id', paymentVouchersController.getPaymentVoucherById);
router.patch('/:id', requirePermission('vouchers:edit'), paymentVouchersController.updatePaymentVoucher);
router.post('/:id/approve', requirePermission('vouchers:approve'), paymentVouchersController.approvePaymentVoucher);
router.post('/:id/post', requirePermission('vouchers:post'), paymentVouchersController.postPaymentVoucher);
router.delete('/:id', requirePermission('vouchers:delete'), paymentVouchersController.deletePaymentVoucher);

export default router;
