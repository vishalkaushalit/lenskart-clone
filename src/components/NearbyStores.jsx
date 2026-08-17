import visit_store from "../assets/images/visit_store.webp";
import home_try_on from "../assets/images/home_try_on.webp";
import order_whatsapp from "../assets/images/order_whatsapp.webp";
import call_expert from "../assets/images/call_expert.webp";

const services = [
  { name: "Visit store", image: visit_store },
  { name: "Home try-on", image: home_try_on },
  { name: "Order on WhatsApp", image: order_whatsapp },
  { name: "Call an expert", image: call_expert },
];

const NearbyStores = () => {
  return (
    <>
      <div className="nearby_stores_sec">
        <div className="container">
          <div className="info mb_30">
            <h2 className="heading">Nearby Stores & Services</h2>
          </div>
          <div className="nearby_stores_wrappper">
            {services.map(({ name, image }) => (
              <a href="#" className="store_box" key={name}>
                <img className="img-fluid" src={image} alt={name} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default NearbyStores;
