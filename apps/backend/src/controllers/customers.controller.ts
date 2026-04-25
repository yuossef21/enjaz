import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { customersService } from '../services/customers.service.js';
import { logger } from '../utils/logger.js';

export const customersController = {
  async getCustomers(req: AuthRequest, res: Response) {
    try {
      const { search, customer_type, is_active } = req.query;

      const customers = await customersService.getCustomers({
        search: search as string,
        customer_type: customer_type as string,
        is_active: is_active === 'true' ? true : is_active === 'false' ? false : undefined,
      });

      res.json(customers);
    } catch (error: any) {
      logger.error('Get customers error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getCustomerById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const customer = await customersService.getCustomerById(id);

      if (!customer) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }

      res.json(customer);
    } catch (error: any) {
      logger.error('Get customer error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createCustomer(req: AuthRequest, res: Response) {
    try {
      const customer = await customersService.createCustomer(req.body);
      logger.info(`Customer created: ${customer.id} by ${req.user!.email}`);

      res.status(201).json(customer);
    } catch (error: any) {
      logger.error('Create customer error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateCustomer(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const customer = await customersService.updateCustomer(id, req.body);

      logger.info(`Customer updated: ${id} by ${req.user!.email}`);
      res.json(customer);
    } catch (error: any) {
      logger.error('Update customer error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteCustomer(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await customersService.deleteCustomer(id);

      logger.info(`Customer deleted: ${id} by ${req.user!.email}`);
      res.json({ message: 'Customer deleted successfully' });
    } catch (error: any) {
      logger.error('Delete customer error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getCustomerInvoices(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const invoices = await customersService.getCustomerInvoices(id);

      res.json(invoices);
    } catch (error: any) {
      logger.error('Get customer invoices error:', error);
      res.status(500).json({ error: error.message });
    }
  },
};
