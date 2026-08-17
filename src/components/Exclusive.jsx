import transparent_frames from "../assets/images/exclusive/transparent_frames.webp";
import popmart from "../assets/images/exclusive/popmart.webp";
import john_jacobs_bold from "../assets/images/exclusive/john_jacobs_bold.webp";
import john_jacobs_prada from "../assets/images/exclusive/john_jacobs_prada.webp";
import hustlr_switch from "../assets/images/exclusive/hustlr_switch.webp";
import ultra_light_frames from "../assets/images/exclusive/ultra_light_frames.webp";

const exclusiveCollections = [
  { name: "Transparent frames", image: transparent_frames, url: "#" },
  { name: "Popmart", image: popmart, url: "#" },
  { name: "John Jacobs Bold", image: john_jacobs_bold, url: "#" },
  { name: "John Jacobs Prada", image: john_jacobs_prada, url: "#" },
  { name: "Hustlr Switch", image: hustlr_switch, url: "#" },
  { name: "Ultra-light frames", image: ultra_light_frames, url: "#" },
];

const Exclusive = () => {
  return (
    <>
      <div className="exclusive_sec padding_70">
        <div className="container">
          <div className="info mb_30">
            <h2 className="heading">Exclusively at Lenskart</h2>
          </div>
          <div className="exclusive_wrappper">
            {exclusiveCollections.map(({ name, image, url }) => (
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

export default Exclusive;
