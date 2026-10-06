import {Link} from 'react-router-dom';
import {Swiper,SwiperSlide} from 'swiper/react';
import 'swiper/css';
const imageUrl=path=>path?.startsWith('/')?new URL(path,import.meta.env.VITE_API_URL||'http://localhost:5001/api').href:path;
export default function ShapeCollections({categories=[],name}){
 const root=categories.find(row=>!row.parent&&row.name===name);const shapes=categories.filter(row=>row.parent===root?._id&&row.kind==='shape');
 if(!root||!shapes.length)return null;
 return <section className="py-12 sm:py-16"><div className="store-container"><h2 className="mb-7 text-xl sm:text-2xl font-extrabold text-ink">Get the perfect shape - {root.name}</h2><Swiper spaceBetween={20} slidesPerView={2.5} breakpoints={{480:{slidesPerView:3.5},640:{slidesPerView:4.5},1024:{slidesPerView:5.5},1280:{slidesPerView:6.5}}} className="!pb-2">{shapes.map(shape=><SwiperSlide key={shape._id}><Link to={`/collection?category=${root.slug}&subcategory=${shape.slug}`} className="block text-center">{(shape.image||root.image)&&<img loading="lazy" decoding="async" src={imageUrl(shape.image||root.image)} alt={shape.name} className="aspect-square w-full rounded-full bg-white object-contain"/>}<h3 className="mt-2.5 text-sm font-semibold text-ink/60 sm:text-base">{shape.name}</h3></Link></SwiperSlide>)}</Swiper></div></section>;
}
