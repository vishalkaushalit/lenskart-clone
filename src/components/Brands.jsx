import vincent_chase from "../assets/images/brands/vincent_chase.webp";
import hustlr from "../assets/images/brands/hustlr.webp";
import john_jacobs from "../assets/images/brands/john_jacobs.webp";
import aqua_lens from "../assets/images/brands/aqua_lens.webp";
import lenskart_air from "../assets/images/brands/lenskart_air.webp";
import hooper from "../assets/images/brands/hooper.webp";

const brands = [
  { name: "Vincent Chase", image: vincent_chase, url: "#" },
  { name: "Hustlr", image: hustlr, url: "#" },
  { name: "John Jacobs", image: john_jacobs, url: "#" },
  { name: "Aqualens", image: aqua_lens, url: "#" },
  { name: "Lenskart Air", image: lenskart_air, url: "#" },
  { name: "Hooper", image: hooper, url: "#" },
];

const Brands = () => {
  return (
    <>
      <div className="exclusive_sec padding_70">
        <div className="container">
          <div className="info mb_30">
            <h2 className="heading">Our Brands</h2>
          </div>
          <div className="exclusive_wrappper">
            {brands.map(({ name, image, url }) => (
              <a href={url} className="store_box" key={name}>
                <img className="img-fluid" src={image} alt={name} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Brands;
