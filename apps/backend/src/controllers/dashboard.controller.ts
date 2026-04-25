import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { dashboardService } from '../services/dashboard.service.js';
import { logger } from '../utils/logger.js';

export const dashboardController = {
  async getStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const role = req.user!.role;

      const stats = await dashboardService.getComprehensiveStats(
        role === 'promoter' ? userId : undefined,
        role
      );

      res.json(stats);
    } catch (error: any) {
      logger.error('Get dashboard stats error:', error);
      res.status(500).json({ error: error.message });
    }
  },
};
