import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import ProductVariant from '../models/ProductVariant.js';
import { publicVariant } from '../services/variants.js';
const router = express.Router({ mergeParams: true });
router.use((req, res, next) => /^[a-f\d]{24}$/i.test(req.params.id) ? next() : res.status(400).json({ message: 'Invalid product ID.' }));
router.get('/', async (req, res, next) => {
  try { if (!await Product.exists({ _id: req.params.id })) return res.status(404).json({ message: 'Product not found.' });
    const variants = await ProductVariant.find({ productId: req.params.id }).sort({ createdAt: 1, _id: 1 }).lean();
    res.json({ variants: variants.map(publicVariant) });
  } catch (error) { next(error); }
});
async function save(req, res, next) {
  if (req.params.variantId && !/^[a-f\d]{24}$/i.test(req.params.variantId)) return res.status(400).json({ message: 'Invalid variant ID.' });
  const fields = {};
  for (const key of ['size', 'color', 'price', 'originalPrice', 'stock', 'images', 'tryOnImage', 'status']) if (Object.hasOwn(req.body || {}, key)) fields[key] = req.body[key];
  let session;
  try {
    session = await mongoose.startSession(); let variant;
    await session.withTransaction(async () => {
      const product = await Product.findById(req.params.id).session(session);
      if (!product) throw Object.assign(new Error('Product not found.'), { status: 404 });
      if (req.params.variantId) {
        variant = await ProductVariant.findOne({ _id: req.params.variantId, productId: product._id }).session(session);
        if (!variant) throw Object.assign(new Error('Variant not found.'), { status: 404 });
        Object.assign(variant, fields);
        if (variant.originalPrice != null && variant.originalPrice < (variant.price ?? product.price)) throw Object.assign(new Error('Compare price cannot be below price.'), {status:400});
        await variant.save({ session });
      } else {
        if (fields.originalPrice != null && fields.originalPrice < (fields.price ?? product.price)) throw Object.assign(new Error('Compare price cannot be below price.'), {status:400});
        [variant] = await ProductVariant.create([{ ...fields, productId: product._id }], { session });
      }
      product.hasVariants = true; await product.save({ session });
    });
    res.status(req.params.variantId ? 200 : 201).json({ variant: publicVariant(variant) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'This size and color combination already exists for this product.' });
    if (['ValidationError', 'CastError'].includes(error.name)) return res.status(400).json({ message: 'Check variant size, color, price, stock, and images.' });
    if (error.status) return res.status(error.status).json({ message: error.message });
    next(error);
  } finally { if (session) await session.endSession(); }
}
router.post('/', save);
router.patch('/:variantId', save);
// Delete only unreferenced variants so order cancellation can still restore inventory.
router.delete('/:variantId', async (req,res,next)=>{
  if(!/^[a-f\d]{24}$/i.test(req.params.variantId))return res.status(400).json({message:'Invalid variant ID.'});
  let session;
  try {
    session=await mongoose.startSession();
    await session.withTransaction(async()=>{
      const product=await Product.findById(req.params.id).session(session);
      if(!product)throw Object.assign(new Error('Product not found.'),{status:404});
      const variant=await ProductVariant.findOne({_id:req.params.variantId,productId:product._id}).session(session);
      if(!variant)throw Object.assign(new Error('Variant not found.'),{status:404});
      if(await Order.exists({'items.variant':variant._id}).session(session))throw Object.assign(new Error('This variant is used in an order. Set its status to Inactive instead.'),{status:409});
      await ProductVariant.deleteOne({_id:variant._id,productId:product._id},{session});
      // Keep variant inventory enabled even when deleting the last combination.
      await product.save({session});
    });
    res.json({message:'Variant deleted.'});
  }catch(error){if(error.status)return res.status(error.status).json({message:error.message});next(error);}
  finally{if(session)await session.endSession();}
});
export default router;
