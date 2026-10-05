import { useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
export default function PopupMessage({message,type='error',onClose}){
  const {notify}=useStore();const last=useRef(null);const callback=useRef(onClose);
  useEffect(()=>{callback.current=onClose;},[onClose]);
  useEffect(()=>{if(message&&last.current!==`${type}:${message}`){last.current=`${type}:${message}`;notify(message,type,()=>callback.current?.());}},[message,type,notify]);
  return null;
}
