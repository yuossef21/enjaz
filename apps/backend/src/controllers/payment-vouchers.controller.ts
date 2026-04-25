import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { paymentVouchersService } from '../services/payment-vouchers.service.js';
import { logger } from '../utils/logger.js';

export const paymentVouchersController = {
  async getPaymentVouchers(req: AuthRequest, res: Response) {
    try {
      const { status, start_date, end_date } = req.query;

      const vouchers = await paymentVouchersService.getPaymentVouchers({
        status: status as string,
        start_date: start_date as string,
        end_date: end_date as string,
      });

      res.json(vouchers);
    } catch (error: any) {
      logger.error('Get payment vouchers error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getPaymentVoucherById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const voucher = await paymentVouchersService.getPaymentVoucherById(id);

      if (!voucher) {
        res.status(404).json({ error: 'Payment voucher not found' });
        return;
      }

      res.json(voucher);
    } catch (error: any) {
      logger.error('Get payment voucher error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createPaymentVoucher(req: AuthRequest, res: Response) {
    try {
      const voucherData = req.body;

      const voucher = await paymentVouchersService.createPaymentVoucher({
        ...voucherData,
        created_by: req.user!.userId,
      });

      logger.info(`Payment voucher created: ${voucher.id} by ${req.user!.email}`);
      res.status(201).json(voucher);
    } catch (error: any) {
      logger.error('Create payment voucher error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updatePaymentVoucher(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const voucher = await paymentVouchersService.updatePaymentVoucher(id, updates);

      logger.info(`Payment voucher updated: ${id} by ${req.user!.email}`);
      res.json(voucher);
    } catch (error: any) {
      logger.error('Update payment voucher error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async approvePaymentVoucher(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const voucher = await paymentVouchersService.approvePaymentVoucher(id, req.user!.userId);

      logger.info(`Payment voucher approved: ${id} by ${req.user!.email}`);
      res.json(voucher);
    } catch (error: any) {
      logger.error('Approve payment voucher error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async postPaymentVoucher(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const voucher = await paymentVouchersService.postPaymentVoucher(id);

      logger.info(`Payment voucher posted: ${id} by ${req.user!.email}`);
      res.json(voucher);
    } catch (error: any) {
      logger.error('Post payment voucher error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deletePaymentVoucher(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await paymentVouchersService.deletePaymentVoucher(id);

      logger.info(`Payment voucher deleted: ${id} by ${req.user!.email}`);
      res.json({ message: 'Payment voucher deleted successfully' });
    } catch (error: any) {
      logger.error('Delete payment voucher error:', error);
      res.status(500).json({ error: error.message });
    }
  },
};
