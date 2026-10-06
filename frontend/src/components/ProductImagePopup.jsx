import './ProductPopup.css';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function ProductImagePopup({ images, selected, name, assetUrl, onSelect, onClose }) {
  const dialogRef = useRef(null);
  const railRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);
  useEffect(() => {
    railRef.current?.children[selected]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [selected]);
  function move(direction) { onSelect((selected + direction + images.length) % images.length); }
  return createPortal(<dialog ref={dialogRef} className="product-popup product-image-popup" aria-label={`${name} image gallery`}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) { const rect=event.currentTarget.getBoundingClientRect(); if(event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom) onClose(); } }}
    onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); } }}>
    <button className="product-image-popup-close" autoFocus onClick={onClose} aria-label="Close image gallery"><X size={25}/></button>
    <div className="product-image-popup-layout">
      <div className="product-image-popup-thumbs" ref={railRef}>{images.map((image,index)=><button key={`${image}-${index}`} aria-label={`Show image ${index+1}`} aria-pressed={selected===index} onClick={()=>onSelect(index)}><img src={assetUrl(image)} alt="" loading="lazy"/></button>)}</div>
      <div className="product-image-popup-main">
        <img key={selected} src={assetUrl(images[selected])} alt={`${name}, image ${selected+1}`}/>
        {images.length>1&&<><button className="product-image-popup-prev" aria-label="Previous image" onClick={()=>move(-1)}><ChevronLeft/></button><button className="product-image-popup-next" aria-label="Next image" onClick={()=>move(1)}><ChevronRight/></button></>}
      </div>
    </div>
    <span className="sr-only" role="status">Image {selected+1} of {images.length}</span>
  </dialog>,document.body);
}
