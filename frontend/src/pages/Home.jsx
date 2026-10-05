import {collectionLink} from '../state/collectionLinks';
import {Link} from 'react-router-dom';
import {useEffect,useState} from 'react';
import {apiRequest} from '../api/api';
import {CategoryContext} from '../context/CategoryContext';
import {useCategories} from '../context/CategoryContext';
import Loader from '../components/Loader';
import PopupMessage from '../components/PopupMessage';
import HomeSlider from "../components/HomeSlider";
import Categories from "../components/Categories";
import free_lens_replacement from "/FLR1IN.webp";
import meller_banner from "/meller_banner.webp";
import buy_one_get_second_later from "/buy_one_get_second_later.webp";
import do_more_be_more from "/do_more_be_more.webp";
import Eyeglasses from "../components/Eyeglasses";
import Trending from "../components/Trending";
import Sunglasses from "../components/Sunglasses";
import NearbyStores from "../components/NearbyStores";
import Exclusive from "../components/Exclusive";
import Brands from "../components/Brands";
import PremiumEyewear from "../components/PremiumEyewear";
import FreeCheckup from "../components/FreeCheckup";
import Notes from "../components/Notes";

const promotionalBanners = [
  { image: free_lens_replacement, alt: "Free Lens Replacement" },
  { image: meller_banner, alt: "Meller" },
  { image: buy_one_get_second_later, alt: "Buy One Get Second Later" },
  {
    image: do_more_be_more,
    alt: "Do More Be More",
    className: "py-12 sm:py-16",
  },
];

const Home = () => {
  const categoryState=useCategories();
  const {categories,loading,error,retry}=categoryState;
  const [productOptions,setProductOptions]=useState([]);
  useEffect(()=>{const controller=new AbortController();apiRequest('/products/navigation',{signal:controller.signal}).then(data=>setProductOptions(data.products)).catch(()=>{});return()=>controller.abort();},[]);
  return (
    <CategoryContext.Provider value={{...categoryState,productOptions}}>
      <HomeSlider />
      <>{loading?<Loader label="Loading categories"/>:error?<div className="p-8"><PopupMessage message={error}/><button onClick={retry}>Retry categories</button></div>:<Categories categories={categories}/>}</>
      <Link to="#" className="block">
        <div>
          <img loading="lazy" decoding="async"
            className="h-auto w-full"
            src={promotionalBanners[0].image}
            alt={promotionalBanners[0].alt}
          />
        </div>
      </Link>
      <Eyeglasses categories={categories}/>
      <Trending />
      <Sunglasses categories={categories}/>
      <NearbyStores />
      <Exclusive />
      <Link to={collectionLink(productOptions,{brand:'Meller'})} className="block">
        <div>
          <img loading="lazy" decoding="async"
            className="h-auto w-full"
            src={promotionalBanners[1].image}
            alt={promotionalBanners[1].alt}
          />
        </div>
      </Link>
      <Brands />
      <PremiumEyewear />
      <FreeCheckup />
      {promotionalBanners.slice(2).map(({ image, alt, className }) => (
        <Link to={collectionLink(productOptions)} className="block" key={alt}>
          <div className={className}>
            <img loading="lazy" decoding="async" className="h-auto w-full" src={image} alt={alt} />
          </div>
        </Link>
      ))}
      <Notes />
    </CategoryContext.Provider>
  );
};

export default Home;
