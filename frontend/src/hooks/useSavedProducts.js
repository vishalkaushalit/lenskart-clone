import { useEffect, useState } from 'react';
import { apiRequest } from '../api/api';
export default function useSavedProducts(ids){
  const key=ids.join(',');const [attempt,setAttempt]=useState(0);const [result,setResult]=useState({loading:true,items:[],error:''});
  useEffect(()=>{
    const controller=new AbortController();
    async function load(){
      const requested=key?key.split(','):[];setResult({loading:true,items:[],error:''});
      try{
        const validIds=[...new Set(requested.filter(id=>/^[a-f\d]{24}$/i.test(id)))];
        const products=[];
        for(let offset=0;offset<validIds.length;offset+=50){const data=await apiRequest(`/products?ids=${validIds.slice(offset,offset+50).join(',')}`,{signal:controller.signal});products.push(...data.products);}
        const byId=new Map(products.map(product=>[product.id,product]));
        const items=requested.map(id=>({id,product:byId.get(id)||null}));
        if(!controller.signal.aborted)setResult({loading:false,items,error:''});
      }catch(error){if(!controller.signal.aborted)setResult({loading:false,items:[],error:error.message});}
    }
    load();return()=>controller.abort();
  },[key,attempt]);
  return {...result,retry:()=>setAttempt((n)=>n+1)};
}
