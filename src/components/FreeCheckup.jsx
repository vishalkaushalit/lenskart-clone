import vincent_chase from "../assets/images/brands/vincent_chase.webp";
import hustlr from "../assets/images/brands/hustlr.webp";
import john_jacobs from "../assets/images/brands/john_jacobs.webp";
import aqua_lens from "../assets/images/brands/aqua_lens.webp";
import lenskart_air from "../assets/images/brands/lenskart_air.webp";
import hooper from "../assets/images/brands/hooper.webp";

const premiumBrands = [
  { name: "Vincent Chase", image: vincent_chase },
  { name: "Hustlr", image: hustlr },
  { name: "John Jacobs", image: john_jacobs },
  { name: "Aqualens", image: aqua_lens },
  { name: "Lenskart Air", image: lenskart_air },
  { name: "Hooper", image: hooper },
];

const FreeCheckup = () => {
  return (
    <>
      <div className="exclusive_sec padding_70">
        <div className="container">
          <div className="info mb_30">
            <h2 className="heading">Get a FREE Eye Check Up</h2>
          </div>
          <div className="exclusive_wrappper">
            {premiumBrands.map(({ name, image }) => (
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

export default FreeCheckup;
