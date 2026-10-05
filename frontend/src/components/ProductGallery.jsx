import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
export default function ProductGallery({ product, assetUrl, linkTo }) {
  const images = product.images?.length ? product.images : [product.image];
  const [selected, setSelected] = useState(0);
  const current = Math.min(selected, images.length - 1);
  const mainImage = <img src={assetUrl(images[current])} alt={`${product.name}, image ${current + 1}`} loading="lazy" />;
  return <div className="collection-gallery">
    {linkTo ? <Link to={linkTo} aria-label={`View ${product.name}`} className="collection-gallery-link">{mainImage}</Link> : mainImage}
    {images.length > 1 && <>
      <button className="collection-gallery-prev" aria-label={`Previous image of ${product.name}`} onClick={() => setSelected((current - 1 + images.length) % images.length)}><ChevronLeft size={18} /></button>
      <button className="collection-gallery-next" aria-label={`Next image of ${product.name}`} onClick={() => setSelected((current + 1) % images.length)}><ChevronRight size={18} /></button>
      <div className="collection-gallery-thumbnails">{images.map((image,index)=><button key={`${image}-${index}`} aria-label={`Show image ${index+1} of ${product.name}`} aria-pressed={current === index} onClick={()=>setSelected(index)}><img src={assetUrl(image)} alt="" loading="lazy" /></button>)}</div>
    </>}
  </div>;
}
