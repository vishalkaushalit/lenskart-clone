import Product from '../models/Product.js';
const editable = ['faqs', 'reviews', 'highlightImages', 'subtitle', 'lensTypes', 'availableColors', 'availableSizes', 'offerTitle', 'offerText', 'deliveryInformation', 'assurances', 'material', 'hinge', 'temple', 'nosepad', 'description', 'features', 'sku', 'name', 'image', 'images', 'category', 'productType', 'shape', 'brand', 'price', 'originalPrice', 'color', 'size', 'gender', 'stock', 'status', 'powered'];
export function publicProduct(product) {
  const result = { id: String(product._id) };
  for (const key of [...editable, 'sales', 'rating', 'addedAt']) result[key] = product[key];
  result.images = product.images?.length ? product.images : [product.image];
  return result;
}
export function productFields(body) {
  const fields = {};
  for (const key of editable) if (Object.hasOwn(body || {}, key)) fields[key] = body[key];
  return fields;
}
export async function listProducts(req, res, next) {
  try {
    const products = await Product.find({ status: 'active', productType: 'Eyeglasses' }).sort({ addedAt: 1, _id: 1 }).lean();
    res.json({ success: true, products: products.map(publicProduct) });
  } catch (error) { next(error); }
}
export async function adminProducts(req, res, next) {
  try {
    const products = await Product.find({}).sort({ createdAt: -1, _id: -1 }).lean();
    res.json({ success: true, products: products.map(publicProduct) });
  } catch (error) { next(error); }
}
function failure(error, res, next) {
  if (error.code === 11000) return res.status(409).json({ message: 'A product with this SKU already exists.' });
  if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ message: 'Check the product fields, image URL, prices, and stock.' });
  next(error);
}
export async function saveProduct(req, res, next) {
  const id = req.params.id;
  if (id && !/^[a-f\d]{24}$/i.test(id)) return res.status(400).json({ message: 'Invalid product ID.' });
  const fields = productFields(req.body);
  if (Object.hasOwn(fields, 'images')) {
    if (!Array.isArray(fields.images) || !fields.images.length || fields.images.length > 8 || fields.images.some((image) => typeof image !== 'string')) return res.status(400).json({ message: 'Choose between 1 and 8 product images.' });
    fields.image = fields.images[0];
  }
  if (!Object.keys(fields).length) return res.status(400).json({ message: 'Provide product details.' });
  try {
    const product = id ? await Product.findByIdAndUpdate(id, { $set: fields }, { new: true, runValidators: true }) : await Product.create(fields);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.status(id ? 200 : 201).json({ success: true, product: publicProduct(product) });
  } catch (error) { failure(error, res, next); }
}
export async function deleteProduct(req, res, next) {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(400).json({ message: 'Invalid product ID.' });
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ success: true, message: 'Product deleted.' });
  } catch (error) { next(error); }
}

export async function productDetails(req, res, next) {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(400).json({ message: 'Invalid product ID.' });
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ success: true, product: publicProduct(product) });
  } catch (error) { next(error); }
}

export async function storefrontProductDetails(req, res, next) {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(400).json({ message: 'Invalid product ID.' });
  try {
    const product = await Product.findOne({ _id: req.params.id, status: 'active' }).lean();
    if (!product) return res.status(404).json({ message: 'This product is no longer available.' });
    res.json({ success: true, product: publicProduct(product) });
  } catch (error) { next(error); }
}
