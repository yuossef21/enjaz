import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { expenseClaimsService } from '../services/expense-claims.service.js';
import { logger } from '../utils/logger.js';

export const expenseClaimsController = {
  async getExpenseClaims(req: AuthRequest, res: Response) {
    try {
      const { employee_id, status, start_date, end_date } = req.query;
      const role = req.user!.role;
      const currentUserId = req.user!.userId;

      const employeeId = role === 'promoter' ? currentUserId : (employee_id as string);

      const claims = await expenseClaimsService.getExpenseClaims({
        employee_id: employeeId,
        status: status as string,
        start_date: start_date as string,
        end_date: end_date as string,
      });

      res.json(claims);
    } catch (error: any) {
      logger.error('Get expense claims error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getExpenseClaimById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const claim = await expenseClaimsService.getExpenseClaimById(id);

      if (!claim) {
        res.status(404).json({ error: 'Expense claim not found' });
        return;
      }

      res.json(claim);
    } catch (error: any) {
      logger.error('Get expense claim error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createExpenseClaim(req: AuthRequest, res: Response) {
    try {
      const { items, ...claimData } = req.body;

      const claim = await expenseClaimsService.createExpenseClaim(
        { ...claimData, employee_id: req.user!.userId },
        items
      );

      logger.info(`Expense claim created: ${claim.id} by ${req.user!.email}`);
      res.status(201).json(claim);
    } catch (error: any) {
      logger.error('Create expense claim error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async submitExpenseClaim(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const claim = await expenseClaimsService.submitExpenseClaim(id);

      logger.info(`Expense claim submitted: ${id} by ${req.user!.email}`);
      res.json(claim);
    } catch (error: any) {
      logger.error('Submit expense claim error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async approveExpenseClaim(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const claim = await expenseClaimsService.approveExpenseClaim(id, req.user!.userId);

      logger.info(`Expense claim approved: ${id} by ${req.user!.email}`);
      res.json(claim);
    } catch (error: any) {
      logger.error('Approve expense claim error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async rejectExpenseClaim(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { rejection_reason } = req.body;

      const claim = await expenseClaimsService.rejectExpenseClaim(id, rejection_reason);

      logger.info(`Expense claim rejected: ${id} by ${req.user!.email}`);
      res.json(claim);
    } catch (error: any) {
      logger.error('Reject expense claim error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async markAsPaid(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const claim = await expenseClaimsService.markAsPaid(id);

      logger.info(`Expense claim marked as paid: ${id} by ${req.user!.email}`);
      res.json(claim);
    } catch (error: any) {
      logger.error('Mark as paid error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteExpenseClaim(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await expenseClaimsService.deleteExpenseClaim(id);

      logger.info(`Expense claim deleted: ${id} by ${req.user!.email}`);
      res.json({ message: 'Expense claim deleted successfully' });
    } catch (error: any) {
      logger.error('Delete expense claim error:', error);
      res.status(500).json({ error: error.message });
    }
  },
};
