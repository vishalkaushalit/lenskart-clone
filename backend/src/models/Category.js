import mongoose from 'mongoose';
export const categorySlug=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'category';
const schema=new mongoose.Schema({slug:{type:String,trim:true,maxlength:120,match:/^[a-z0-9]+(?:-[a-z0-9]+)*$/},image:{type:String,default:'',maxlength:2000,validate:value=>!value||/^\/assets\/products\/[\w.-]+$/.test(value)||/^https?:\/\/[^\s]+$/.test(value)},kind:{type:String,enum:['category','shape','type','collection'],default:'category'},sortOrder:{type:Number,default:0},name:{type:String,required:true,trim:true,maxlength:100},parent:{type:mongoose.Schema.Types.ObjectId,ref:'Category',default:null},active:{type:Boolean,default:true}},{timestamps:true});
schema.index({parent:1,name:1},{unique:true,collation:{locale:'en',strength:2}});
schema.index({slug:1},{unique:true,partialFilterExpression:{slug:{$type:'string'}}});
schema.pre('validate',function(){if(!this.slug)this.slug=categorySlug(this.name);});
export default mongoose.model('Category',schema);
