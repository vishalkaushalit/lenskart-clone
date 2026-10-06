export function paginateRows(rows,page,pageSize){
 const current=Math.max(1,Math.min(Number.isSafeInteger(page)?page:1,Math.max(1,Math.ceil(rows.length/pageSize))));
 const offset=(current-1)*pageSize;
 return {page:current,pageSize,total:rows.length,offset,rows:rows.slice(offset,offset+pageSize)};
}
