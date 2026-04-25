import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { employeesService } from '../services/employees.service.js';
import { logger } from '../utils/logger.js';

export const employeesController = {
  async getEmployees(req: AuthRequest, res: Response) {
    try {
      const { department, status } = req.query;

      const employees = await employeesService.getEmployees({
        department: department as string,
        status: status as string,
      });

      res.json(employees);
    } catch (error: any) {
      logger.error('Get employees error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getEmployeeById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const employee = await employeesService.getEmployeeById(id);

      if (!employee) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }

      res.json(employee);
    } catch (error: any) {
      logger.error('Get employee error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createEmployee(req: AuthRequest, res: Response) {
    try {
      const employeeData = req.body;

      const employee = await employeesService.createEmployee(employeeData);

      logger.info(`Employee created: ${employee.id} by ${req.user!.email}`);
      res.status(201).json(employee);
    } catch (error: any) {
      logger.error('Create employee error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateEmployee(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const employee = await employeesService.updateEmployee(id, updates);

      logger.info(`Employee updated: ${id} by ${req.user!.email}`);
      res.json(employee);
    } catch (error: any) {
      logger.error('Update employee error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteEmployee(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await employeesService.deleteEmployee(id);

      logger.info(`Employee deleted: ${id} by ${req.user!.email}`);
      res.json({ message: 'Employee deleted successfully' });
    } catch (error: any) {
      logger.error('Delete employee error:', error);
      res.status(500).json({ error: error.message });
    }
  },
};
