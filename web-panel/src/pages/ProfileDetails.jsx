import { Link, useOutletContext } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
export default function ProfileDetails(){
 const {user}=useOutletContext();
 return <DashboardLayout><main className="admin-page"><PageHeader title="My profile" description="Your account information"><Link to="/profile/edit" className="admin-button-primary">Edit profile</Link></PageHeader><section className="product-panel"><dl className="grid gap-5 sm:grid-cols-2">{Object.entries({Name:user.name,Email:user.email,Role:user.role}).map(([label,value])=><div key={label}><dt className="mb-1 text-sm text-slate-400">{label}</dt><dd className="text-sm font-medium">{value}</dd></div>)}</dl></section></main></DashboardLayout>;
}
