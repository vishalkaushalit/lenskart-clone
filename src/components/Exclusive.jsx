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
      <section className="py-12 sm:py-16">
        <div className="mx-auto w-[90%] max-w-[1320px]">
          <h2 className="mb-7 text-2xl font-extrabold text-ink">Exclusively at Lenskart</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {exclusiveCollections.map(({ name, image, exclusiveUrl }) => (
              <a href={exclusiveUrl} className="overflow-hidden rounded-xl transition-transform hover:scale-[1.02]" key={name}>
                <img className="h-auto w-full" src={image} alt={name} />
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Exclusive;
