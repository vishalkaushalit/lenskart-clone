import {availableSlug,validSlug} from '../utils/slugs.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
const editable = ['slug', 'categoryIds', 'subcategoryIds', 'categoryId', 'subcategoryId', 'faqs', 'reviews', 'highlightImages', 'subtitle', 'lensTypes', 'availableColors', 'availableSizes', 'offerTitle', 'offerText', 'deliveryInformation', 'assurances', 'material', 'hinge', 'temple', 'nosepad', 'description', 'features', 'sku', 'name', 'image', 'images', 'category', 'productType', 'shape', 'brand', 'price', 'originalPrice', 'color', 'size', 'gender', 'stock', 'status', 'powered'];
export function publicProduct(product) {
  const result = { id: String(product._id) };
  for (const key of [...editable, 'sales', 'rating', 'addedAt']) result[key] = product[key];
  result.categoryIds=product.categoryIds?.length?product.categoryIds.map(String):(product.categoryId?[String(product.categoryId)]:[]);
  result.subcategoryIds=product.subcategoryIds?.length?product.subcategoryIds.map(String):(product.subcategoryId?[String(product.subcategoryId)]:[]);
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
    let filter=req.query?.all==='1'?{status:'active'}:{status:'active',productType:'Eyeglasses'};
    if(req.query?.ids){const ids=String(req.query.ids).split(',');if(ids.length>50||ids.some(id=>!/^[a-f\d]{24}$/i.test(id)))return res.status(400).json({message:'Provide up to 50 valid product IDs.'});filter={status:'active',_id:{$in:[...new Set(ids)]}};}
    const products = await Product.find(filter).sort({ addedAt: 1, _id: 1 }).lean();
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
  if (error.code === 11000) return res.status(409).json({ message: 'A product with this SKU or slug already exists.' });
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
    if (Object.hasOwn(fields,'categoryIds')||Object.hasOwn(fields,'subcategoryIds')) {
      const existing=id?await Product.findById(id).lean():null;
      const roots=fields.categoryIds??existing?.categoryIds??[];
      const children=fields.subcategoryIds??existing?.subcategoryIds??[];
      if(!Array.isArray(roots)||!Array.isArray(children)||roots.length>50||children.length>50||[...roots,...children].some(value=>typeof value!=='string'||!/^[a-f\d]{24}$/i.test(value)))return res.status(400).json({message:'Choose valid categories and subcategories.'});
      const rootIds=[...new Set(roots)];const childIds=[...new Set(children)];
      const selected=await Category.find({_id:{$in:[...rootIds,...childIds]},active:true}).lean();
      if(rootIds.some(value=>!selected.some(row=>String(row._id)===value&&!row.parent))||childIds.some(value=>!selected.some(row=>String(row._id)===value&&rootIds.includes(String(row.parent)))))return res.status(400).json({message:'Choose active categories and subcategories belonging to the selected categories.'});
      fields.categoryIds=rootIds;fields.subcategoryIds=childIds;fields.categoryId=rootIds[0]||null;
      fields.subcategoryId=selected.find(row=>childIds.includes(String(row._id))&&String(row.parent)===fields.categoryId)?._id||null;
    }
    if (Object.hasOwn(fields,'categoryId')||Object.hasOwn(fields,'subcategoryId')) {
      const existing=id?await Product.findById(id).lean():null;
      const categoryId=Object.hasOwn(fields,'categoryId')?fields.categoryId:existing?.categoryId;
      const subcategoryId=Object.hasOwn(fields,'subcategoryId')?fields.subcategoryId:existing?.subcategoryId;
      if(categoryId){const category=await Category.findById(categoryId);if(!category||category.parent||!category.active)return res.status(400).json({message:'Choose an active main category.'});}
      if(subcategoryId){const child=await Category.findById(subcategoryId);if(!child||!child.active||String(child.parent)!==String(categoryId))return res.status(400).json({message:'Choose a subcategory belonging to this category.'});}
    }
    if(Object.hasOwn(fields,'slug')&&fields.slug&&!validSlug(fields.slug))return res.status(400).json({message:'Use a unique lowercase slug with letters, numbers and hyphens (up to 120 characters).'});
    if(!id&&!fields.slug)fields.slug=await availableSlug(Product,fields.name);
    if(id&&Object.hasOwn(fields,'slug')&&!fields.slug){const existing=await Product.findById(id).lean();if(!existing)return res.status(404).json({message:'Product not found.'});fields.slug=await availableSlug(Product,fields.name||existing.name,id);}
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
  if (!validSlug(req.params.id)&&!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(400).json({ message: 'Invalid product ID.' });
  try {
    const product = await Product.findOne({ ...(/^[a-f\d]{24}$/i.test(req.params.id)?{_id:req.params.id}:{slug:req.params.id}), status: 'active' }).lean();
    if (!product) return res.status(404).json({ message: 'This product is no longer available.' });
    res.json({ success: true, product: publicProduct(product) });
  } catch (error) { next(error); }
}

export async function productNavigation(req,res,next){
 try{const products=await Product.find({status:'active'}).select('name brand shape').lean();res.json({products:products.map(product=>({name:product.name,brand:product.brand,shape:product.shape}))});}catch(error){next(error);}
}
