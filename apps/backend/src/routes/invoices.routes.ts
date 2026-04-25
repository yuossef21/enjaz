import { Router } from 'express';
import { invoicesController } from '../controllers/invoices.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = Router();

router.use(authenticate);

router.get('/', invoicesController.getInvoices);
router.post('/', requirePermission('invoices:create'), invoicesController.createInvoice);
router.get('/stats', invoicesController.getInvoiceStats);
router.get('/:id', invoicesController.getInvoiceById);
router.patch('/:id', requirePermission('invoices:edit'), invoicesController.updateInvoice);
router.patch('/:id/status', requirePermission('invoices:edit'), invoicesController.updateInvoiceStatus);
router.post('/:id/payment', requirePermission('invoices:payment'), invoicesController.recordPayment);
router.delete('/:id', requirePermission('invoices:delete'), invoicesController.deleteInvoice);

export default router;
