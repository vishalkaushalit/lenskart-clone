import {availableSlug,validSlug} from '../utils/slugs.js';
import express from 'express';
import Category from '../models/Category.js';
import {requireAuth,requireRole} from '../middleware/auth.js';
export const publicCategories=express.Router();
export const adminCategories=express.Router();
adminCategories.use(requireAuth,requireRole('admin'));
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res)).catch(error=>{if(error.code===11000)return res.status(409).json({message:'A category with this name or slug already exists.'});if(['ValidationError','CastError'].includes(error.name))return res.status(400).json({message:'Check the category fields.'});next(error);});
publicCategories.get('/',wrap(async(req,res)=>{const rows=await Category.find({active:true}).sort({sortOrder:1,name:1}).lean();const roots=new Set(rows.filter(row=>!row.parent).map(row=>String(row._id)));res.json({categories:rows.filter(row=>!row.parent||roots.has(String(row.parent)))});}));
adminCategories.get('/',wrap(async(req,res)=>res.json({categories:await Category.find().sort({sortOrder:1,name:1}).lean()})));
async function save(req,res){
  const body=req.body||{};if(typeof body.name!=='string'||!body.name.trim()||body.name.length>100)return res.status(400).json({message:'Enter a category name (up to 100 characters).'});
  let category;if(req.params.id){if(!/^[a-f\d]{24}$/i.test(req.params.id))return res.status(400).json({message:'Invalid category ID.'});category=await Category.findById(req.params.id);if(!category)return res.status(404).json({message:'Category not found.'});}else category=new Category();
  const parent=Object.hasOwn(body,'parent')?body.parent||null:category.parent||null;
  if(parent){if(!/^[a-f\d]{24}$/i.test(String(parent))||String(parent)===String(category._id))return res.status(400).json({message:'Choose a valid parent category.'});const root=await Category.findById(parent);if(!root||root.parent)return res.status(400).json({message:'Subcategories must belong to a main category.'});if(await Category.exists({parent:category._id}))return res.status(400).json({message:'A category with subcategories cannot become a subcategory.'});}
  if(req.params.id&&String(parent||'')!==String(category.parent||''))return res.status(400).json({message:'The parent cannot be changed after creation.'});
  if(Object.hasOwn(body,'image'))category.image=body.image;
  if(Object.hasOwn(body,'kind'))category.kind=body.kind;
  if(Object.hasOwn(body,'sortOrder'))category.sortOrder=body.sortOrder;
  if(body.slug){if(!validSlug(body.slug))return res.status(400).json({message:'Use a unique lowercase slug with letters, numbers and hyphens (up to 120 characters).'});category.slug=body.slug;}else if(!category.slug||Object.hasOwn(body,'slug')&&body.slug==='')category.slug=await availableSlug(Category,body.name,category._id);
  category.name=body.name.trim();category.parent=parent;if(typeof body.active==='boolean')category.active=body.active;await category.save();res.status(req.params.id?200:201).json({category});
}
adminCategories.post('/',wrap(save));adminCategories.patch('/:id',wrap(save));
