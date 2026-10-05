export function slugify(value){return String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100).replace(/-$/,'')||'item';}
export async function availableSlug(Model,name,id){const base=slugify(name);let slug=base;let suffix=2;while(await Model.exists({slug,...(id?{_id:{$ne:id}}:{})}))slug=`${base}-${suffix++}`;return slug;}
export const validSlug=value=>typeof value==='string'&&value.length<=120&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)&&!/^[a-f\d]{24}$/i.test(value);
