import React from "react";
import { MoveRightIcon } from "lucide-react";
import transparent_frames from "../assets/images/exclusive/transparent_frames.webp";
import popmart from "../assets/images/exclusive/popmart.webp";
import john_jacobs_bold from "../assets/images/exclusive/john_jacobs_bold.webp";
import john_jacobs_prada from "../assets/images/exclusive/john_jacobs_prada.webp";
import hustlr_switch from "../assets/images/exclusive/hustlr_switch.webp";
import ultra_light_frames from "../assets/images/exclusive/ultra_light_frames.webp";

const Exclusive = () => {
  return (
    <>
      <div className="exclusive_sec padding_70">
        <div className="container">
          <div className="info mb_30">
            <h2 className="heading">Exclusively at Lenskart</h2>
          </div>
          <div className="exclusive_wrappper">
            <a href="#" className="store_box">
              <img className="img-fluid" src={transparent_frames} alt="transparent_frames" />
            </a>
            <a href="#" className="store_box">
              <img className="img-fluid" src={popmart} alt="popmart" />
            </a>
            <a href="#" className="store_box">
              <img className="img-fluid" src={john_jacobs_bold} alt="john_jacobs_bold" />
            </a>
            <a href="#" className="store_box">
              <img className="img-fluid" src={john_jacobs_prada} alt="john_jacobs_prada" />
            </a>
            <a href="#" className="store_box">
              <img className="img-fluid" src={hustlr_switch} alt="hustlr_switch" />
            </a>
            <a href="#" className="store_box">
              <img className="img-fluid" src={ultra_light_frames} alt="ultra_light_frames" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Exclusive;
