import vincent_chase from "../assets/images/brands/vincent_chase.webp";
import hustlr from "../assets/images/brands/hustlr.webp";
import john_jacobs from "../assets/images/brands/john_jacobs.webp";
import aqua_lens from "../assets/images/brands/aqua_lens.webp";
import lenskart_air from "../assets/images/brands/lenskart_air.webp";
import hooper from "../assets/images/brands/hooper.webp";

const brands = [
  { name: "Vincent Chase", image: vincent_chase, brandUrl: "#" },
  { name: "Hustlr", image: hustlr, brandUrl: "#" },
  { name: "John Jacobs", image: john_jacobs, brandUrl: "#" },
  { name: "Aqualens", image: aqua_lens, brandUrl: "#" },
  { name: "Lenskart Air", image: lenskart_air, brandUrl: "#" },
  { name: "Hooper", image: hooper, brandUrl: "#" },
];

const Brands = () => {
  return (
    <>
      <section className="py-12 sm:py-16">
        <div className="mx-auto w-[90%] max-w-[1320px]">
          <h2 className="mb-7 text-2xl font-extrabold text-ink">Our Brands</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map(({ name, image, brandUrl }) => (
              <a href={brandUrl} className="overflow-hidden rounded-xl transition-transform hover:scale-[1.02]" key={name}>
                <img className="h-auto w-full" src={image} alt={name} />
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Brands;
