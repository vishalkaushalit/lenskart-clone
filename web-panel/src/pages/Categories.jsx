import { creationDate } from '../date';
import ActionLink from '../components/ActionLink';
import { Link, useSearchParams } from "react-router-dom";
import { matchesSearch } from "../search";
import StatusBadge from '../components/StatusBadge';
import {useEffect,useState} from 'react';
import DashboardLayout from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import NotificationPopup from '../components/NotificationPopup';
import {apiRequest} from '../api';
export default function Categories(){
 const [params, setParams] = useSearchParams();
 const search = params.get("search") || "";
 const pageValue=Number(params.get("page")||1);
 const page=Number.isSafeInteger(pageValue)&&pageValue>0?pageValue:1;
 function setPage(value){setParams(previous=>{const next=new URLSearchParams(previous);next.set("page",String(value));return next;});}
 const [rows,setRows]=useState([]);const [loading,setLoading]=useState(true);const [attempt,setAttempt]=useState(0);const [notice,setNotice]=useState(null);
 useEffect(()=>{const controller=new AbortController();async function load(){setLoading(true);try{const data=await apiRequest('/admin/categories',{signal:controller.signal});if(!controller.signal.aborted)setRows(data.categories);}catch(error){if(!controller.signal.aborted)setNotice({type:'error',message:error.message});}finally{if(!controller.signal.aborted)setLoading(false);}}load();return()=>controller.abort();},[attempt]);
 const filtered = rows.filter(row => matchesSearch([row.name, row.slug, row.kind, row.active ? "active" : "inactive", rows.find(root => root._id === row.parent)?.name], search));
 const current=Math.min(page,Math.max(1,Math.ceil(filtered.length/20)));
 return <DashboardLayout><main className="admin-page"><PageHeader title="Categories" description="Manage categories and subcategories"><button className="admin-button-secondary" disabled={loading} onClick={()=>setAttempt(n=>n+1)}>Refresh</button><Link to="/categories/add" className="admin-button-primary">Add Category</Link></PageHeader><DataTable label="Categories" footer={!loading&&<Pagination page={current} total={filtered.length} onPageChange={setPage} label="categories"/>}><thead><tr>{['Sr. No.','Name','Slug','Parent','Type','Status','Created On','Actions'].map(label=><th key={label}>{label}</th>)}</tr></thead><tbody>{loading?<tr><td colSpan={8}><Loader/></td></tr>:!filtered.length?<tr><td colSpan={8}>No categories found.</td></tr>:filtered.slice((current-1)*20,current*20).map((row,index)=><tr key={row._id}><td className="font-medium text-slate-700">{(current-1)*20+index+1}</td><td><Link to={`/categories/${row._id}`} className="text-blue-600">{row.name}</Link></td><td>{row.slug}</td><td>{rows.find(root=>root._id===row.parent)?.name||'—'}</td><td>{row.parent?'Subcategory':'Category'}</td><td><StatusBadge status={row.active?'active':'inactive'}/></td><td className="whitespace-nowrap">{creationDate(row.createdAt)}</td><td><div className="flex gap-2"><ActionLink to={`/categories/${row._id}`} action="view" label="View category"/><ActionLink to={`/categories/${row._id}/edit`} action="edit" label={`Edit ${row.name}`}/></div></td></tr>)}</tbody></DataTable>{notice&&<NotificationPopup notification={notice} onClose={()=>setNotice(null)}/>}</main></DashboardLayout>;
}
