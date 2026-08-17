import premium_Meller from "../assets/images/premium/premium_Meller.webp";
import premium_JJ from "../assets/images/premium/premium_JJ.webp";
import premium_OD from "../assets/images/premium/premium_OD.webp";
import premium_LPL from "../assets/images/premium/premium_LPL.webp";
import premium_Fossil from "../assets/images/premium/premium_Fossil.webp";

const premiumBrands = [
  { name: "Premium Meller", image: premium_Meller, premiumUrl: "#" },
  { name: "Premium John Jocobs", image: premium_JJ, premiumUrl: "#" },
  { name: "Premium Own Days", image: premium_OD, premiumUrl: "#" },
  { name: "Premium Le Petit Lenetier", image: premium_LPL, premiumUrl: "#" },
  { name: "Premium Fossil", image: premium_Fossil, premiumUrl: "#" },
];

const PremiumEyewear = () => {
  return (
    <>
      <div className="premium_eyewear_sec">
        <div className="container">
          <div className="info mb_30">
            <h2 className="heading">Premium Eyewear</h2>
          </div>
          <div className="premium_wrappper">
            <div className="premium_left_sec">
              <a href={premiumBrands[0].premiumUrl}>
                <div className="imgBox">
                  <img
                    className="img-fluid"
                    src={premiumBrands[0].image}
                    alt={premiumBrands[0].name}
                  />
                </div>
              </a>
            </div>
            <div className="premium_right_sec">
              {premiumBrands.slice(1).map(({ name, image, premiumUrl }) => (
                <a href={premiumUrl} key={name}>
                  <div className="imgBox">
                    <img className="img-fluid" src={image} alt={name} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PremiumEyewear;
