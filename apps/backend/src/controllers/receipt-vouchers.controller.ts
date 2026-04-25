import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { receiptVouchersService } from '../services/receipt-vouchers.service.js';
import { logger } from '../utils/logger.js';

export const receiptVouchersController = {
  async getReceiptVouchers(req: AuthRequest, res: Response) {
    try {
      const { status, start_date, end_date } = req.query;

      const vouchers = await receiptVouchersService.getReceiptVouchers({
        status: status as string,
        start_date: start_date as string,
        end_date: end_date as string,
      });

      res.json(vouchers);
    } catch (error: any) {
      logger.error('Get receipt vouchers error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getReceiptVoucherById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const voucher = await receiptVouchersService.getReceiptVoucherById(id);

      if (!voucher) {
        res.status(404).json({ error: 'Receipt voucher not found' });
        return;
      }

      res.json(voucher);
    } catch (error: any) {
      logger.error('Get receipt voucher error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createReceiptVoucher(req: AuthRequest, res: Response) {
    try {
      const voucherData = req.body;

      const voucher = await receiptVouchersService.createReceiptVoucher({
        ...voucherData,
        created_by: req.user!.userId,
      });

      logger.info(`Receipt voucher created: ${voucher.id} by ${req.user!.email}`);
      res.status(201).json(voucher);
    } catch (error: any) {
      logger.error('Create receipt voucher error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateReceiptVoucher(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const voucher = await receiptVouchersService.updateReceiptVoucher(id, updates);

      logger.info(`Receipt voucher updated: ${id} by ${req.user!.email}`);
      res.json(voucher);
    } catch (error: any) {
      logger.error('Update receipt voucher error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async approveReceiptVoucher(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const voucher = await receiptVouchersService.approveReceiptVoucher(id, req.user!.userId);

      logger.info(`Receipt voucher approved: ${id} by ${req.user!.email}`);
      res.json(voucher);
    } catch (error: any) {
      logger.error('Approve receipt voucher error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async postReceiptVoucher(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const voucher = await receiptVouchersService.postReceiptVoucher(id);

      logger.info(`Receipt voucher posted: ${id} by ${req.user!.email}`);
      res.json(voucher);
    } catch (error: any) {
      logger.error('Post receipt voucher error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteReceiptVoucher(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await receiptVouchersService.deleteReceiptVoucher(id);

      logger.info(`Receipt voucher deleted: ${id} by ${req.user!.email}`);
      res.json({ message: 'Receipt voucher deleted successfully' });
    } catch (error: any) {
      logger.error('Delete receipt voucher error:', error);
      res.status(500).json({ error: error.message });
    }
  },
};
