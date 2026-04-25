import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { leaveRequestsService } from '../services/leave-requests.service.js';
import { logger } from '../utils/logger.js';

export const leaveRequestsController = {
  async getLeaveRequests(req: AuthRequest, res: Response) {
    try {
      const { employee_id, status, start_date, end_date } = req.query;

      const requests = await leaveRequestsService.getLeaveRequests({
        employee_id: employee_id as string,
        status: status as string,
        start_date: start_date as string,
        end_date: end_date as string,
      });

      res.json(requests);
    } catch (error: any) {
      logger.error('Get leave requests error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getLeaveRequestById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const request = await leaveRequestsService.getLeaveRequestById(id);

      if (!request) {
        res.status(404).json({ error: 'Leave request not found' });
        return;
      }

      res.json(request);
    } catch (error: any) {
      logger.error('Get leave request error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createLeaveRequest(req: AuthRequest, res: Response) {
    try {
      const requestData = req.body;

      const request = await leaveRequestsService.createLeaveRequest(requestData);

      logger.info(`Leave request created: ${request.id} by ${req.user!.email}`);
      res.status(201).json(request);
    } catch (error: any) {
      logger.error('Create leave request error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateLeaveRequest(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const request = await leaveRequestsService.updateLeaveRequest(id, updates);

      logger.info(`Leave request updated: ${id} by ${req.user!.email}`);
      res.json(request);
    } catch (error: any) {
      logger.error('Update leave request error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async approveLeaveRequest(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const request = await leaveRequestsService.approveLeaveRequest(id, req.user!.userId);

      logger.info(`Leave request approved: ${id} by ${req.user!.email}`);
      res.json(request);
    } catch (error: any) {
      logger.error('Approve leave request error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async rejectLeaveRequest(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { rejection_reason } = req.body;

      const request = await leaveRequestsService.rejectLeaveRequest(id, rejection_reason);

      logger.info(`Leave request rejected: ${id} by ${req.user!.email}`);
      res.json(request);
    } catch (error: any) {
      logger.error('Reject leave request error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteLeaveRequest(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await leaveRequestsService.deleteLeaveRequest(id);

      logger.info(`Leave request deleted: ${id} by ${req.user!.email}`);
      res.json({ message: 'Leave request deleted successfully' });
    } catch (error: any) {
      logger.error('Delete leave request error:', error);
      res.status(500).json({ error: error.message });
    }
  },
};
