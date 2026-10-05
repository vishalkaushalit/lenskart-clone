import {useEffect,useState} from 'react';
import {apiRequest} from '../api/api';
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
  const [categories,setCategories]=useState([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [attempt,setAttempt]=useState(0);
  useEffect(()=>{const controller=new AbortController();async function load(){setLoading(true);setError('');try{const data=await apiRequest('/categories',{signal:controller.signal});if(!controller.signal.aborted)setCategories(data.categories);}catch(error){if(!controller.signal.aborted)setError(error.message);}finally{if(!controller.signal.aborted)setLoading(false);}}load();return()=>controller.abort();},[attempt]);
  return (
    <>
      <HomeSlider />
      <>{loading?<Loader label="Loading categories"/>:error?<div className="p-8"><PopupMessage message={error}/><button onClick={()=>setAttempt(n=>n+1)}>Retry categories</button></div>:<Categories categories={categories}/>}</>
      <a href="#" className="block">
        <div>
          <img
            className="h-auto w-full"
            src={promotionalBanners[0].image}
            alt={promotionalBanners[0].alt}
          />
        </div>
      </a>
      <Eyeglasses categories={categories}/>
      <Trending />
      <Sunglasses categories={categories}/>
      <NearbyStores />
      <Exclusive />
      <a href="#" className="block">
        <div>
          <img
            className="h-auto w-full"
            src={promotionalBanners[1].image}
            alt={promotionalBanners[1].alt}
          />
        </div>
      </a>
      <Brands />
      <PremiumEyewear />
      <FreeCheckup />
      {promotionalBanners.slice(2).map(({ image, alt, className }) => (
        <a href="#" className="block" key={alt}>
          <div className={className}>
            <img className="h-auto w-full" src={image} alt={alt} />
          </div>
        </a>
      ))}
      <Notes />
    </>
  );
};

export default Home;
