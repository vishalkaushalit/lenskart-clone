const formatter=new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',year:'numeric',timeZone:'Asia/Kolkata'});
export function creationDate(value){if(!value)return '—';const date=new Date(value);return Number.isNaN(date.getTime())?'—':formatter.format(date);}
