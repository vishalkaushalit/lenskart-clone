import {Link} from 'react-router-dom';
import {useCategories} from '../context/CategoryContext';
import {collectionLink} from '../state/collectionLinks';
import premium_Meller from "../assets/images/premium/premium_Meller.webp";
import premium_JJ from "../assets/images/premium/premium_JJ.webp";
import premium_OD from "../assets/images/premium/premium_OD.webp";
import premium_LPL from "../assets/images/premium/premium_LPL.webp";
import premium_Fossil from "../assets/images/premium/premium_Fossil.webp";

const premiumBrands = [
  { name: "Premium Meller", image: premium_Meller, premiumUrl: "/collection?brand=Meller" },
  { name: "Premium John Jocobs", image: premium_JJ, premiumUrl: "/collection?brand=John%20Jocobs" },
  { name: "Premium Own Days", image: premium_OD, premiumUrl: "/collection?brand=Own%20Days" },
  { name: "Premium Le Petit Lenetier", image: premium_LPL, premiumUrl: "/collection?brand=Le%20Petit%20Lenetier" },
  { name: "Premium Fossil", image: premium_Fossil, premiumUrl: "/collection?brand=Fossil" },
];

const PremiumEyewear = () => {
  const {productOptions}=useCategories();
  return (
    <>
      <section className="premium_eyewear_sec">
        <div className="mx-auto w-[90%] max-w-[1320px]">
          <h2 className="mb-7 text-xl sm:text-2xl font-extrabold text-ink">Premium Eyewear</h2>
          <div className="grid gap-5 md:grid-cols-[42%_1fr] lg:gap-7">
            <div className="overflow-hidden rounded-xl">
              <Link to={collectionLink(productOptions,{brand:'Meller'})}>
                <div>
                  <img
                    className="h-auto w-full"
                    src={premiumBrands[0].image}
                    alt={premiumBrands[0].name}
                  />
                </div>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-5 lg:gap-7">
              {premiumBrands.slice(1).map(({ name, image }) => (
                <Link to={collectionLink(productOptions,{brand:name.replace('Premium ','').replace('Jocobs','Jacobs')})} key={name}>
                  <div className="overflow-hidden rounded-xl">
                  <img loading="lazy" decoding="async" className="h-auto w-full" src={image} alt={name} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PremiumEyewear;
