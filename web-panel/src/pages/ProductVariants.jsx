import StatusBadge from '../components/StatusBadge';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import ProductVariants from '../components/ProductVariants';
import Loader from '../components/Loader';
import PopupMessage from '../components/PopupMessage';
import useProduct from '../hooks/useProduct';
import { productImageUrl } from '../api';
export default function ProductVariantsPage({mode='list'}) {
  const { id, variantId } = useParams();
  const navigate=useNavigate();
  const { loading, product, error, retry } = useProduct(id);
  const variant=product?.variants?.find(row=>row.id===variantId);
  const base=`/product/${id}/variants`;
  return <DashboardLayout><main className="admin-page">
    <PageHeader title={{list:'Product Variants',add:'Add Variant',edit:'Edit Variant',view:'Variant Details'}[mode]} description={product ? `Manage size, color and images for ${product.name}` : 'Add and manage product variants'}><Link to={base} className="admin-button-secondary">All variants</Link>{mode==='list'&&<Link to={`${base}/add`} className="admin-button-primary">Add variant</Link>}<Link to={`/product/${id}`} className="admin-button-secondary">Product details</Link></PageHeader>
    {loading?<Loader label="Loading variants"/>:error?<div><PopupMessage message={error}/><button type="button" className="admin-button-secondary" onClick={retry}>Try again</button></div>:variantId&&!variant?<PopupMessage message="Variant not found."/>:mode==='view'?<section className="product-panel"><div className="mb-5 flex flex-wrap gap-3">{(variant.images.length?variant.images:product.images).map((path,index)=><img key={index} src={productImageUrl(path)} alt={`${variant.color} ${variant.size}`} className="h-32 w-32 rounded border object-contain"/>)}</div><dl className="grid gap-4 sm:grid-cols-3">{Object.entries({Size:variant.size,Color:variant.color,Price:`₹${variant.price??product.price}`,'Compare Price':`₹${Math.max(variant.originalPrice??product.originalPrice??product.price,variant.price??product.price)}`,Stock:variant.stock,Status:variant.status}).map(([label,value])=><div key={label}><dt className="text-sm text-slate-400">{label}</dt><dd className="text-sm font-medium">{label==='Status'?<StatusBadge status={value}/>:value}</dd></div>)}</dl><Link to={`${base}/${variant.id}/edit`} className="admin-button-primary mt-5">Edit variant</Link></section>:<ProductVariants key={`${id}-${variantId||mode}`} mode={mode} initialVariant={variant} product={product} onCancel={()=>navigate(base)} onChange={()=>mode==='list'?retry():navigate(base)}/>}
  </main></DashboardLayout>;
}
