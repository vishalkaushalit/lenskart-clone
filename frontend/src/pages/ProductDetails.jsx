import Loader from '../components/Loader';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, Share2, Star, ShieldCheck, Package, RefreshCw, UserRound, ChevronDown } from 'lucide-react';
import { apiRequest } from '../api/api';
import { useStore } from '../context/StoreContext';
import PopupMessage from '../components/PopupMessage';
import ProductImagePopup from '../components/ProductImagePopup';
import './ProductDetails.css';
import stylingMan from '../assets/images/trending/trending_3.webp';
import stylingWoman from '../assets/images/trending/trending_4.webp';
import guideFrame from '../assets/images/Login/login_image.webp';
const money = value => `₹${Number(value).toLocaleString('en-IN')}`;
const assetUrl = path => path?.startsWith('/') ? new URL(path, import.meta.env.VITE_API_URL || 'http://localhost:5001/api').href : path;
const productTypes = [['Powered Eyeglass','With Power'],['Zero Power','Screen Glass'],['Reading Glasses','+ Positive Power'],['Sunglass','UV Protection']];
const colorValues = { black:'#292c2b', grey:'#999999', gray:'#999999', white:'#dedede', pink:'#e98196', blue:'#718caf', red:'#f24c54', brown:'#725747', gold:'#c5a46c', green:'#93b5ad', silver:'#c5cfd4', transparent:'#dae4e6' };
const guides = [
  ['Choose the right frame', 'Compare the frame shape and color with your everyday style.'],
  ['Find your frame size', 'Check the size printed inside your current frame and compare it with this product.'],
  ['Lens & power coverage', 'Confirm the available lens type and your current prescription with the store before choosing prescription eyewear.'],
  ["Lenskart’s return policy", 'Contact the store to confirm return eligibility, timelines, and the return process before ordering.'],
  ['Lenskart Gold membership', 'Contact the store for the current membership price, benefits, and eligibility.'],
  ['Care for your glasses', 'Clean lenses with a microfiber cloth and keep your glasses in a protective case.'],
];
function Details({ product, products }) {
  const [selected, setSelected] = useState(0);
  const [imagePopup,setImagePopup] = useState(false);
  const [highlight, setHighlight] = useState('');
  const [guide, setGuide] = useState(null);
  const [type,setType] = useState(product.powered?'Powered Eyeglass':product.productType==='Sunglasses'?'Sunglass':'Zero Power');
  const [color,setColor] = useState(product.color);
  const [size,setSize] = useState(product.size);
  const [policy,setPolicy] = useState(null);
  const [allReviews,setAllReviews] = useState(false);
  const { favorites, toggleFavorite, addToCart, notify } = useStore();
  const images = product.images?.length ? product.images : [product.image];
  const highlightContent = {material:'Clean the frame with a soft cloth and follow the recommended care instructions.',hinge:'Open and close the frame arms gently to protect the hinges.',temple:'Choose a size that rests comfortably behind your ears.',nosepad:'Check that the bridge sits comfortably without slipping or pinching.',...Object.fromEntries(['material','hinge','temple','nosepad'].filter(key=>product[key]).map(key=>[key,product[key]]))};
  const highlights = ['material','hinge','temple','nosepad'];
  const activeHighlight = highlight || highlights[0];
  const highlightKeys = highlights.join(',');
  useEffect(()=>{
    const keys = highlightKeys.split(',').filter(Boolean);
    if (keys.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(()=>setHighlight(current=>keys[(keys.indexOf(current || keys[0])+1)%keys.length]),3000);
    return ()=>clearInterval(timer);
  },[highlightKeys,highlight]);
  const reviews = product.reviews || [];
  const average = reviews.length ? reviews.reduce((sum,review)=>sum+review.rating,0)/reviews.length : product.rating;
  const badges = [ ['No Questions Asked Returns',Package], ['Easy 14 day Exchange',RefreshCw], ['365 days Warranty',ShieldCheck] ];

  const similar = products.filter(item => item.id !== product.id).sort((a,b) => Number(b.brand === product.brand) - Number(a.brand === product.brand)).slice(0,6);
  const specs = { Brand: product.brand, Shape: product.shape, Size: product.size, Color: product.color, Gender: product.gender, SKU: product.sku };
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: product.name, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); notify('Product link copied.'); }
    } catch (error) { if (error.name !== 'AbortError') notify('Unable to share this product.','error'); }
  }
  return <><div className="store-product-layout">
    <div className="store-product-main">
      <section className="store-product-photos" aria-label="Product images">
        <div className="detail-thumb-rail">{images.map((image,index) => <button key={`${image}-${index}`} aria-label={`Show image ${index+1}`} aria-pressed={selected===index} onClick={event=>{setSelected(index);event.currentTarget.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});}}><img src={assetUrl(image)} alt="" loading="lazy"/></button>)}</div>
        <div className="detail-hero">{average>0&&<span className="detail-rating" aria-label={`${average.toFixed(1)} out of 5 stars, ${reviews.length} reviews`}>{average.toFixed(1)} <Star size={16} fill="currentColor"/>{reviews.length>0&&<span>{reviews.length.toLocaleString('en-IN')}</span>}</span>}<button className="detail-hero-open" aria-label="Enlarge product image" onClick={()=>setImagePopup(true)}><img src={assetUrl(images[selected])} alt={`${product.name}, image ${selected+1}`}/></button></div>
        {images.length>1&&<div className="detail-gallery-controls"><button aria-label="Previous image" onClick={()=>setSelected((selected+images.length-1)%images.length)}><ChevronLeft size={18}/></button><button aria-label="Next image" onClick={()=>setSelected((selected+1)%images.length)}><ChevronRight size={18}/></button></div>}
      </section>
      <section className="detail-section"><h2>How to Buy Your Glasses</h2><div className="detail-guide-row">{guides.map(([title],index)=><button key={title} className="detail-guide-card" aria-expanded={guide===index} onClick={()=>setGuide(guide===index?null:index)}><img src={[stylingWoman,guideFrame,stylingWoman,guideFrame,guideFrame,stylingMan][index]} alt="" loading="lazy"/><span className="detail-guide-overlay"/><strong>{title}</strong><small>Learn More <span aria-hidden="true">▸</span></small></button>)}</div>{guide!==null&&<p className="detail-guide-content">{guides[guide][1]}</p>}</section>
      {images.length>1&&<section className="detail-section"><h2>Explore the Details</h2><div className="detail-style-images">{images.slice(1).map((image,index)=><button key={`${image}-${index}`} onClick={()=>{setSelected(index+1);setImagePopup(true);}} aria-label={`Enlarge product image ${index+2}`}><img src={assetUrl(image)} alt={`${product.name}, detail ${index+1}`} loading="lazy"/></button>)}</div></section>}
      <section className="detail-section detail-styling"><h2>Styling Ideas</h2><div className="detail-styling-pair"><img src={stylingMan} alt="Style inspiration with bold black eyeglasses" loading="lazy"/><img src={stylingWoman} alt="Style inspiration with transparent pink eyeglasses" loading="lazy"/></div></section>
      {similar.length>0&&<section className="detail-similar"><h2>Similar Products</h2><div className="detail-similar-row">{similar.map(item=><article key={item.id} className="detail-similar-card"><div className="detail-similar-photo"><Link to={`/products/${item.id}`}><img src={assetUrl(item.image)} alt={item.name} loading="lazy"/></Link><button aria-label={favorites.includes(item.id)?`Remove ${item.name} from wishlist`:`Add ${item.name} to wishlist`} aria-pressed={favorites.includes(item.id)} onClick={()=>toggleFavorite(item)}><Heart size={19} fill={favorites.includes(item.id)?'currentColor':'none'}/></button></div><div className="detail-similar-content"><h3><Link to={`/products/${item.id}`}>{item.name}</Link></h3><p>{item.subtitle||`${item.color} · ${item.shape}`}</p><div className="detail-similar-price"><strong>{money(item.price)}</strong>{item.originalPrice>item.price&&<p><del>{money(item.originalPrice)}</del> <span>({Math.round((1-item.price/item.originalPrice)*100)}% OFF)</span></p>}</div><Link className="detail-similar-view" to={`/products/${item.id}`}>View</Link></div></article>)}</div></section>}

    </div>
    <aside className="store-product-info">
      <div className="detail-title-row"><div><h1>{product.name}</h1><p>{product.subtitle||`${product.color} ${product.shape}`}</p></div><button aria-label="Share product" onClick={share}><Share2 size={16}/></button><button aria-label={favorites.includes(product.id)?'Remove from wishlist':'Add to wishlist'} aria-pressed={favorites.includes(product.id)} onClick={()=>toggleFavorite(product)}><Heart size={18} fill={favorites.includes(product.id)?'currentColor':'none'}/></button></div>
      <div className="store-product-prices"><strong>{money(product.price)}</strong><small>Inclusive of all taxes</small></div>{product.originalPrice>product.price&&<p className="detail-discount"><del>{money(product.originalPrice)}</del> ({Math.round((1-product.price/product.originalPrice)*100)}% OFF)</p>}
      {(product.offerTitle||product.offerText)&&<section className="detail-offer"><h2>{product.offerTitle||'Product offer'}</h2><p>{product.offerText}</p></section>}
      <section className="detail-options"><h2>Product Type</h2><div className="detail-type-row">{productTypes.map(([label,caption])=><button key={label} aria-pressed={type===label} onClick={()=>setType(label)}><strong>{label}</strong><small>{caption}</small></button>)}</div><h3>Frame Color</h3><div className="detail-color-row">{[...new Set([product.color,...(product.availableColors||[])])].map(value=><button key={value} title={value} aria-label={`Frame color: ${value}`} aria-pressed={color===value} onClick={()=>setColor(value)}><span style={{background:colorValues[value.toLowerCase()]||'#b0b7c0'}}/></button>)}</div><p className="detail-selection-label">{color}</p><h3>Frame Size:</h3><div className="detail-size-row">{[...new Set([product.size,...(product.availableSizes||[])])].map(value=><button key={value} aria-pressed={size===value} onClick={()=>setSize(value)}>{value}</button>)}</div></section>
      {product.deliveryInformation&&<section className="detail-section"><h2>Delivery Details</h2><p className="detail-delivery">{product.deliveryInformation}</p></section>}
      <section className="detail-section"><h2>We Assure you</h2><div className="detail-assurances">{badges.map(([label,Icon],index)=><div key={label}><div className="detail-trust-art"><Icon size={42}/><ShieldCheck size={20}/></div><strong>{label}</strong><button onClick={()=>setPolicy(policy===index?null:index)} aria-expanded={policy===index}>Learn More ▸</button></div>)}</div>{policy!==null&&<p className="detail-delivery">{product.assurances?.[policy]||'Contact the store for the eligibility, terms, and process for this service.'}</p>}</section>
      {highlights.length>0&&<section className="detail-highlights"><h2>Product Highlights <small>New</small></h2><div className="detail-highlight-panel"><div className="detail-pills">{highlights.map(key=><button key={key} aria-pressed={key===activeHighlight} onClick={()=>setHighlight(key)}>{key==='nosepad'?'Nosepad':key}</button>)}</div><div key={activeHighlight} className="detail-highlight-slide"><p>{highlightContent[activeHighlight]}</p><img src={assetUrl(product.highlightImages?.[activeHighlight]||product.image)} alt={`${product.name}, ${activeHighlight} detail`}/></div></div></section>}
      <section className="detail-section detail-reviews"><h2>Rating &amp; Reviews</h2><div className="detail-review-summary"><div><p className="detail-review-score">{average>0?average.toFixed(1):'—'}<Star size={22} fill="currentColor"/></p><span>{reviews.length} Reviews</span></div><div className="detail-rating-bars">{[5,4,3,2,1].map(stars=>{const percentage=reviews.length?Math.round(reviews.filter(review=>review.rating===stars).length/reviews.length*100):0;return <div key={stars}><span>{stars} ★</span><div><i style={{width:`${percentage}%`}}/></div><small>{percentage}%</small></div>;})}</div></div><h3>User Reviews</h3>{reviews.length?(allReviews?reviews:reviews.slice(0,5)).map((review,index)=><article key={review._id||index} className="detail-user-review"><div><UserRound size={22}/><span>{review.name}<small>{new Date(review.date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</small></span><b>{review.rating} ★</b></div><p>{review.text}</p></article>):<p className="detail-muted">No customer reviews available yet.</p>}{reviews.length>5&&<button className="detail-read-reviews" onClick={()=>setAllReviews(value=>!value)}>{allReviews?'Show Fewer Reviews':'Read All Reviews'}</button>}</section>
      <section className="detail-accordions"><details><summary>Frequently asked questions <ChevronDown size={16}/></summary><div>{product.faqs?.length?product.faqs.map((faq,index)=><details key={index} className="detail-faq"><summary>{faq.question}<ChevronDown size={14}/></summary><p>{faq.answer}</p></details>):<p>No questions have been added for this product yet.</p>}</div></details><details><summary>Product Details <ChevronDown size={16}/></summary><div><p>{product.description}</p><dl className="store-product-specs">{Object.entries(specs).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div></details></section>
      <div className="detail-purchase"><p className={`store-product-stock ${product.stock>0?'':'out'}`}>{product.stock>0?'In stock':'Currently out of stock'}</p><button className="store-product-add-cart" disabled={product.stock<1} onClick={()=>addToCart(product,{type,color,size})}>{product.stock>0?'Add to cart':'Out of stock'}</button></div>
    </aside>
  </div>{imagePopup&&<ProductImagePopup images={images} selected={selected} name={product.name} assetUrl={assetUrl} onSelect={setSelected} onClose={()=>setImagePopup(false)}/>}</>;
}
export default function ProductDetails() {
  const { id } = useParams();
  const [result,setResult] = useState({loading:true});
  const [attempt,setAttempt] = useState(0);
  useEffect(()=>{
    const controller = new AbortController();
    window.scrollTo({top:0,behavior:'instant'});
    async function load() {
      setResult({loading:true});
      try {
        const [data,catalog] = await Promise.all([apiRequest(`/products/${id}`,{signal:controller.signal}),apiRequest('/products',{signal:controller.signal}).catch(()=>({products:[]}))]);
        if (!controller.signal.aborted) setResult({product:data.product,products:catalog.products||[],loading:false});
      } catch(error) {if(!controller.signal.aborted)setResult({loading:false,error:error.message,status:error.status});}
    }
    load(); return ()=>controller.abort();
  },[id,attempt]);
  return <section className="store-product-page"><Link to="/collection" className="store-product-back"><ArrowLeft size={14}/>Back to collection</Link>{result.loading?<Loader label="Loading product"/>:result.error?<div className="store-product-state"><h1>{result.status===404?'Product unavailable':'Unable to load product'}</h1><PopupMessage message={result.error}/><button onClick={()=>setAttempt(value=>value+1)}>Try again</button></div>:<Details key={result.product.id} product={result.product} products={result.products}/>}</section>;
}
