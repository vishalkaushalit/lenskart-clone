import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CircleCheck, CircleAlert, X } from "lucide-react";

export default function NotificationPopup({ notification, onClose, duration = 1000 }) {
  const popupRef = useRef(null);
  const [closing,setClosing] = useState(false);
  const closeRef = useRef(onClose);
  useEffect(()=>{closeRef.current=onClose;},[onClose]);
  useEffect(()=>{
    const timer=setTimeout(()=>setClosing(true),duration);
    return()=>clearTimeout(timer);
  },[duration]);
  useEffect(()=>{
    if(!closing)return;
    const timer=setTimeout(()=>closeRef.current(),260);
    return()=>clearTimeout(timer);
  },[closing]);
  useLayoutEffect(()=>{
    function position(){
      const bottom=Math.max(0,document.querySelector('header')?.getBoundingClientRect().bottom||0);
      popupRef.current?.style.setProperty('--notification-header-bottom',`${bottom}px`);
    }
    position();
    const observer=new ResizeObserver(position);
    const header=document.querySelector('header');
    if(header)observer.observe(header);
    window.addEventListener('resize',position);
    window.addEventListener('scroll',position,true);
    return()=>{observer.disconnect();window.removeEventListener('resize',position);window.removeEventListener('scroll',position,true);};
  },[]);
  const success=notification.type==='success';
  const Icon=success?CircleCheck:CircleAlert;
  return createPortal(
    <div ref={popupRef} className={`admin-notification ${success?'':'is-error'} ${closing?'is-leaving':''}`} role={success?'status':'alert'}>
      <Icon size={20} aria-hidden="true"/>
      <p>{notification.message}</p>
      <button type="button" onClick={()=>setClosing(true)} aria-label="Dismiss notification"><X size={16} aria-hidden="true"/></button>
    </div>,document.body
  );
}
