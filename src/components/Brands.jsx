import React from "react";
import { MoveRightIcon } from "lucide-react";
import vincent_chase from "../assets/images/brands/vincent_chase.webp";
import hustlr from "../assets/images/brands/hustlr.webp";
import john_jacobs from "../assets/images/brands/john_jacobs.webp";
import aqua_lens from "../assets/images/brands/aqua_lens.webp";
import lenskart_air from "../assets/images/brands/lenskart_air.webp";
import hooper from "../assets/images/brands/hooper.webp";

const Brands = () => {
  return (
    <>
      <div className="exclusive_sec padding_70">
        <div className="container">
          <div className="info mb_30">
            <h2 className="heading">Our Brands</h2>
          </div>
          <div className="exclusive_wrappper">
            <a href="#" className="store_box">
              <img className="img-fluid" src={vincent_chase} alt="vincent_chase" />
            </a>
            <a href="#" className="store_box">
              <img className="img-fluid" src={hustlr} alt="hustlr" />
            </a>
            <a href="#" className="store_box">
              <img className="img-fluid" src={john_jacobs} alt="john_jacobs" />
            </a>
            <a href="#" className="store_box">
              <img className="img-fluid" src={aqua_lens} alt="aqua_lens" />
            </a>
            <a href="#" className="store_box">
              <img className="img-fluid" src={lenskart_air} alt="lenskart_air" />
            </a>
            <a href="#" className="store_box">
              <img className="img-fluid" src={hooper} alt="hooper" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Brands;
