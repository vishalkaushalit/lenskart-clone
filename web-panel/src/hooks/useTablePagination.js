import { useState } from 'react';
import { paginateRows } from '../tablePagination';
export default function useTablePagination(rows,pageSize=5,key=''){
 const [selection,setSelection]=useState({key,page:1});
 return {...paginateRows(rows,selection.key===key?selection.page:1,pageSize),setPage:page=>setSelection({key,page})};
}
