import { Link } from 'react-router-dom';
import { useState } from 'react';
import ProductCardImage from './ProductCardImage';
export default function ProductGallery({ product, assetUrl, linkTo, dots = false }) {
  const images = product.images?.length ? product.images : [product.image];
  const [selected, setSelected] = useState(0);
  const current = Math.min(selected, images.length - 1);
  const mainImage = <ProductCardImage src={assetUrl(images[current])} alt={`${product.name}, image ${current + 1}`} />;
  return <div className="collection-gallery">
    {linkTo ? <Link to={linkTo} aria-label={`View ${product.name}`} className="collection-gallery-link">{mainImage}</Link> : mainImage}
    {images.length > 1 && <>
      <div className={dots?'collection-gallery-dots':'collection-gallery-thumbnails'}>{images.map((image,index)=><button key={`${image}-${index}`} aria-label={`Show image ${index+1} of ${product.name}`} aria-pressed={current === index} onClick={()=>setSelected(index)}>{!dots&&<img src={assetUrl(image)} alt="" loading="lazy" />}</button>)}</div>
    </>}
  </div>;
}
