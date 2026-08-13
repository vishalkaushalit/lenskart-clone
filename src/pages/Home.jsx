import React from "react";
import Header from "../header/Header";
import HomeSlider from "../components/HomeSlider";
import Categories from "../components/Categories";
import free_lens_replacement from "../../public/FLR1IN.webp";
import Eyeglasses from "../components/Eyeglasses";

const Home = () => {
  return (
    <>
      <Header />
      <HomeSlider />
      <Categories />
      <a href="#">
        <img
          className="img-fluid"
          src={free_lens_replacement}
          alt="Free Lens Replacement"
        />
      </a>
      <Eyeglasses />
    </>
  );
};

export default Home;
