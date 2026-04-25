import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { productsService } from '../services/products.service.js';
import { logger } from '../utils/logger.js';

export const productsController = {
  async getProducts(req: AuthRequest, res: Response) {
    try {
      const { category, status } = req.query;

      const products = await productsService.getProducts({
        category: category as string,
        status: status as string,
      });

      res.json(products);
    } catch (error: any) {
      logger.error('Get products error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getProductById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const product = await productsService.getProductById(id);

      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      res.json(product);
    } catch (error: any) {
      logger.error('Get product error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createProduct(req: AuthRequest, res: Response) {
    try {
      const productData = req.body;

      const product = await productsService.createProduct(productData);

      logger.info(`Product created: ${product.id} by ${req.user!.email}`);
      res.status(201).json(product);
    } catch (error: any) {
      logger.error('Create product error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateProduct(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const product = await productsService.updateProduct(id, updates);

      logger.info(`Product updated: ${id} by ${req.user!.email}`);
      res.json(product);
    } catch (error: any) {
      logger.error('Update product error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteProduct(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await productsService.deleteProduct(id);

      logger.info(`Product deleted: ${id} by ${req.user!.email}`);
      res.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
      logger.error('Delete product error:', error);
      res.status(500).json({ error: error.message });
    }
  },
};
