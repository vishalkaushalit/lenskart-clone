import React from "react";
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
            src={free_lens_replacement}
            alt="Free Lens Replacement"
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
          <img className="img-fluid" src={meller_banner} alt="Meller" />
        </div>
      </a>
      <Brands />
      <a href="#">
        <div>
          <img
            className="img-fluid"
            src={buy_one_get_second_later}
            alt="Buy One Get Second Later"
          />
        </div>
      </a>
      <a href="#">
        <div className="padding_70">
          <img
            className="img-fluid"
            src={do_more_be_more}
            alt="Do More Be More"
          />
        </div>
      </a>
    </>
  );
};

export default Home;
