import { Link } from 'react-router-dom';
import { Eye, Pencil, Truck } from 'lucide-react';
export default function ActionLink({to, action, label}) {
 const Icon=action==='edit'?Pencil:action==='track'?Truck:Eye;
 return <Link to={to} title={label} aria-label={label} className="admin-action-link"><Icon size={16} aria-hidden="true"/></Link>;
}
