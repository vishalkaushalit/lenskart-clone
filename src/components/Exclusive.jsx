import transparent_frames from "../assets/images/exclusive/transparent_frames.webp";
import popmart from "../assets/images/exclusive/popmart.webp";
import john_jacobs_bold from "../assets/images/exclusive/john_jacobs_bold.webp";
import john_jacobs_prada from "../assets/images/exclusive/john_jacobs_prada.webp";
import hustlr_switch from "../assets/images/exclusive/hustlr_switch.webp";
import ultra_light_frames from "../assets/images/exclusive/ultra_light_frames.webp";

const exclusiveCollections = [
  { name: "Transparent frames", image: transparent_frames, exclusiveUrl: "#" },
  { name: "Popmart", image: popmart, exclusiveUrl: "#" },
  { name: "John Jacobs Bold", image: john_jacobs_bold, exclusiveUrl: "#" },
  { name: "John Jacobs Prada", image: john_jacobs_prada, exclusiveUrl: "#" },
  { name: "Hustlr Switch", image: hustlr_switch, exclusiveUrl: "#" },
  { name: "Ultra-light frames", image: ultra_light_frames, exclusiveUrl: "#" },
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
            {exclusiveCollections.map(({ name, image, exclusiveUrl }) => (
              <a href={exclusiveUrl} className="store_box" key={name}>
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
