import visit_store from "../assets/images/visit_store.webp";
import home_try_on from "../assets/images/home_try_on.webp";
import order_whatsapp from "../assets/images/order_whatsapp.webp";
import call_expert from "../assets/images/call_expert.webp";

const services = [
  { name: "Visit store", image: visit_store, storeUrl: "#" },
  { name: "Home try-on", image: home_try_on, storeUrl: "#" },
  { name: "Order on WhatsApp", image: order_whatsapp, storeUrl: "#" },
  { name: "Call an expert", image: call_expert, storeUrl: "#" },
];

const NearbyStores = () => {
  return (
    <>
      <section className="nearby_stores_sec">
        <div className="mx-auto w-[90%] max-w-[1320px]">
          <h2 className="mb-7 text-2xl font-extrabold text-ink">Nearby Stores & Services</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map(({ name, image, storeUrl }) => (
              <a href={storeUrl} className="overflow-hidden rounded-xl transition-transform hover:scale-[1.02]" key={name}>
                <img className="h-auto w-full" src={image} alt={name} />
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default NearbyStores;
