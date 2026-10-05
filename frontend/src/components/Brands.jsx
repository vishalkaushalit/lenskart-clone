import {Link} from 'react-router-dom';
import {useCategories} from '../context/CategoryContext';
import {collectionLink} from '../state/collectionLinks';
import vincent_chase from "../assets/images/brands/vincent_chase.webp";
import hustlr from "../assets/images/brands/hustlr.webp";
import john_jacobs from "../assets/images/brands/john_jacobs.webp";
import aqua_lens from "../assets/images/brands/aqua_lens.webp";
import lenskart_air from "../assets/images/brands/lenskart_air.webp";
import hooper from "../assets/images/brands/hooper.webp";

const brands = [
  { name: "Vincent Chase", image: vincent_chase, brandUrl: "/collection?brand=Vincent%20Chase" },
  { name: "Hustlr", image: hustlr, brandUrl: "/collection?brand=Hustlr" },
  { name: "John Jacobs", image: john_jacobs, brandUrl: "/collection?brand=John%20Jacobs" },
  { name: "Aqualens", image: aqua_lens, brandUrl: "/collection?brand=Aqualens" },
  { name: "Lenskart Air", image: lenskart_air, brandUrl: "/collection?brand=Lenskart%20Air" },
  { name: "Hooper", image: hooper, brandUrl: "/collection?brand=Hooper" },
];

const Brands = () => {
  const {productOptions}=useCategories();
  const availableBrands=[...new Set(productOptions.map(product=>product.brand).filter(Boolean))].sort();
  return (
    <>
      <section className="py-12 sm:py-16">
        <div className="mx-auto w-[90%] max-w-[1320px]">
          <h2 className="mb-7 text-xl sm:text-2xl font-extrabold text-ink">Our Brands</h2>
          <div className="mb-6 flex flex-wrap gap-3" aria-label="Brand collections">
            {availableBrands.map(brand=><Link key={brand} to={collectionLink(productOptions,{brand})} className="rounded-full border border-slate-200 px-5 py-2 text-ink transition-colors hover:bg-slate-100">{brand}</Link>)}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
            {brands.map(({ name, image }) => (
              <Link to={collectionLink(productOptions,{brand:name})} className="overflow-hidden rounded-xl transition-transform hover:scale-[1.02]" key={name}>
                <img loading="lazy" decoding="async" className="h-auto w-full" src={image} alt={name} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Brands;
