import express from 'express';
import variantRoutes from './variantRoutes.js';
import { uploadProductImage, uploadTryOnAsset } from '../services/productImages.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  productNavigation,
  listProducts,
  adminProducts,
  saveProduct,
  deleteProduct,
  productDetails,
  storefrontProductDetails,
} from '../controllers/productController.js';
export const publicProducts = express.Router();
publicProducts.get('/', listProducts);
publicProducts.get('/navigation', productNavigation);
publicProducts.get('/:id', storefrontProductDetails);
export const managedProducts = express.Router();
managedProducts.use(requireAuth, requireRole('admin'));
managedProducts.use('/:id/variants', variantRoutes);
managedProducts.post(
  '/images',
  express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '4mb' }),
  uploadProductImage,
);
managedProducts.post(
  '/try-on',
  express.raw({
    type: ['image/png', 'image/webp', 'model/gltf-binary', 'application/octet-stream'],
    limit: '4mb',
  }),
  uploadTryOnAsset,
);
managedProducts.get('/', adminProducts);
managedProducts.get('/:id', productDetails);
managedProducts.post('/', saveProduct);
managedProducts.patch('/:id', saveProduct);
managedProducts.delete('/:id', deleteProduct);
