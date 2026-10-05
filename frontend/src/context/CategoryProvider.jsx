import {useEffect,useState} from 'react';
import {CategoryContext} from './CategoryContext';
import {apiRequest} from '../api/api';
export default function CategoryProvider({children}){
 const [state,setState]=useState({categories:[],productOptions:[],loading:true,error:''});const [attempt,setAttempt]=useState(0);
 useEffect(()=>{const controller=new AbortController();apiRequest('/categories',{signal:controller.signal}).then(data=>{if(!controller.signal.aborted)setState({categories:data.categories,productOptions:[],loading:false,error:''});}).catch(error=>{if(!controller.signal.aborted)setState({categories:[],productOptions:[],loading:false,error:error.message});});return()=>controller.abort();},[attempt]);
 return <CategoryContext.Provider value={{...state,retry:()=>setAttempt(n=>n+1)}}>{children}</CategoryContext.Provider>;
}
