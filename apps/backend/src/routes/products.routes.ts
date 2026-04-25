import { Router } from 'express';
import { productsController } from '../controllers/products.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = Router();

router.use(authenticate);

router.get('/', productsController.getProducts);
router.post('/', requirePermission('products:create'), productsController.createProduct);
router.get('/:id', productsController.getProductById);
router.patch('/:id', requirePermission('products:edit'), productsController.updateProduct);
router.delete('/:id', requirePermission('products:delete'), productsController.deleteProduct);

export default router;
