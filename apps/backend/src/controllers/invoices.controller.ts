import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { invoicesService } from '../services/invoices.service.js';
import { logger } from '../utils/logger.js';

export const invoicesController = {
  async getInvoices(req: AuthRequest, res: Response) {
    try {
      const { status, customer_id, start_date, end_date } = req.query;

      const invoices = await invoicesService.getInvoices({
        status: status as string,
        customer_id: customer_id as string,
        start_date: start_date as string,
        end_date: end_date as string,
      });

      res.json(invoices);
    } catch (error: any) {
      logger.error('Get invoices error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getInvoiceById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const invoice = await invoicesService.getInvoiceById(id);

      if (!invoice) {
        res.status(404).json({ error: 'Invoice not found' });
        return;
      }

      res.json(invoice);
    } catch (error: any) {
      logger.error('Get invoice error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createInvoice(req: AuthRequest, res: Response) {
    try {
      const { lines, ...invoiceData } = req.body;

      const invoice = await invoicesService.createInvoice(
        { ...invoiceData, created_by: req.user!.userId },
        lines
      );

      logger.info(`Invoice created: ${invoice.id} by ${req.user!.email}`);
      res.status(201).json(invoice);
    } catch (error: any) {
      logger.error('Create invoice error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateInvoice(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const invoice = await invoicesService.updateInvoice(id, req.body);

      logger.info(`Invoice updated: ${id} by ${req.user!.email}`);
      res.json(invoice);
    } catch (error: any) {
      logger.error('Update invoice error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateInvoiceStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const invoice = await invoicesService.updateInvoiceStatus(id, status);

      logger.info(`Invoice status updated: ${id} to ${status} by ${req.user!.email}`);
      res.json(invoice);
    } catch (error: any) {
      logger.error('Update invoice status error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async recordPayment(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { amount } = req.body;

      const invoice = await invoicesService.recordPayment(id, amount);

      logger.info(`Payment recorded for invoice: ${id} amount: ${amount} by ${req.user!.email}`);
      res.json(invoice);
    } catch (error: any) {
      logger.error('Record payment error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteInvoice(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await invoicesService.deleteInvoice(id);

      logger.info(`Invoice deleted: ${id} by ${req.user!.email}`);
      res.json({ message: 'Invoice deleted successfully' });
    } catch (error: any) {
      logger.error('Delete invoice error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getInvoiceStats(req: AuthRequest, res: Response) {
    try {
      const stats = await invoicesService.getInvoiceStats();
      res.json(stats);
    } catch (error: any) {
      logger.error('Get invoice stats error:', error);
      res.status(500).json({ error: error.message });
    }
  },
};
