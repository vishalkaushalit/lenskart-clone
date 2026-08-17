import vincent_chase from "../assets/images/brands/vincent_chase.webp";
import hustlr from "../assets/images/brands/hustlr.webp";
import john_jacobs from "../assets/images/brands/john_jacobs.webp";
import aqua_lens from "../assets/images/brands/aqua_lens.webp";
import lenskart_air from "../assets/images/brands/lenskart_air.webp";
import hooper from "../assets/images/brands/hooper.webp";

const premiumBrands = [
  { name: "Vincent Chase", image: vincent_chase, premiumUrl: "#" },
  { name: "Hustlr", image: hustlr, premiumUrl: "#" },
  { name: "John Jacobs", image: john_jacobs, premiumUrl: "#" },
  { name: "Aqualens", image: aqua_lens, premiumUrl: "#" },
  { name: "Lenskart Air", image: lenskart_air, premiumUrl: "#" },
  { name: "Hooper", image: hooper, premiumUrl: "#" },
];

const PremiumEyewear = () => {
  return (
    <>
      <div className="exclusive_sec">
        <div className="container">
          <div className="info mb_30">
            <h2 className="heading">Premium Eyewear</h2>
          </div>
          <div className="exclusive_wrappper">
            {premiumBrands.map(({ name, image, premiumUrl }) => (
              <a href={premiumUrl} className="store_box" key={name}>
                <img className="img-fluid" src={image} alt={name} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PremiumEyewear;
