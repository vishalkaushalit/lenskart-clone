import Header from "../header/Header";
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

const promotionalBanners = [
  { image: free_lens_replacement, alt: "Free Lens Replacement" },
  { image: meller_banner, alt: "Meller" },
  { image: buy_one_get_second_later, alt: "Buy One Get Second Later" },
  { image: do_more_be_more, alt: "Do More Be More", className: "padding_70" },
];

const Home = () => {
  return (
    <>
      <Header />
      <HomeSlider />
      <Categories />
      <a href="#">
        <div>
          <img
            className="img-fluid"
            src={promotionalBanners[0].image}
            alt={promotionalBanners[0].alt}
          />
        </div>
      </a>
      <Eyeglasses />
      <Trending />
      <Sunglasses />
      <NearbyStores />
      <Exclusive />
      <a href="#">
        <div>
          <img
            className="img-fluid"
            src={promotionalBanners[1].image}
            alt={promotionalBanners[1].alt}
          />
        </div>
      </a>
      <Brands />
      <PremiumEyewear />
      <FreeCheckup />
      {promotionalBanners.slice(2).map(({ image, alt, className }) => (
        <a href="#" key={alt}>
          <div className={className}>
            <img className="img-fluid" src={image} alt={alt} />
          </div>
        </a>
      ))}
    </>
  );
};

export default Home;
