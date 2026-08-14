import React from "react";
import { MoveRightIcon } from "lucide-react";
import visit_store from "../assets/images/visit_store.webp";
import home_try_on from "../assets/images/home_try_on.webp";
import order_whatsapp from "../assets/images/order_whatsapp.webp";
import call_expert from "../assets/images/call_expert.webp";

const NearbyStores = () => {
  return (
    <>
      <div className="nearby_stores_sec">
        <div className="container">
          <div className="info mb_30">
            <h2 className="heading">Nearby Stores & Services</h2>
          </div>
          <div className="nearby_stores_wrappper">
            <a href="#" className="store_box">
              <img className="img-fluid" src={visit_store} alt="visit_store" />
            </a>
            <a href="#" className="store_box">
              <img className="img-fluid" src={home_try_on} alt="home_try_on" />
            </a>
            <a href="#" className="store_box">
              <img className="img-fluid" src={order_whatsapp} alt="order_whatsapp" />
            </a>
            <a href="#" className="store_box">
              <img className="img-fluid" src={call_expert} alt="call_expert" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default NearbyStores;
