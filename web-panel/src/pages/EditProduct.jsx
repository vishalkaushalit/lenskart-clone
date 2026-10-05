import Loader from '../components/Loader';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import ProductEditor from '../components/ProductEditor';
import PopupMessage from '../components/PopupMessage';
import useProduct from '../hooks/useProduct';
export default function EditProduct(){
  const {id}=useParams();const {loading,product,error,retry}=useProduct(id);
  return <DashboardLayout><main className="admin-page">{loading?<Loader label="Loading product"/>:error?<div className="space-y-4"><PopupMessage message={error}/><button className="admin-button-secondary" onClick={retry}>Try again</button><Link to="/product" className="admin-button-secondary">Back to products</Link></div>:<ProductEditor key={product.id} product={product}/>}</main></DashboardLayout>;
}
