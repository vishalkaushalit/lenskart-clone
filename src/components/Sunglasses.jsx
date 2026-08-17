import rectangle from "../assets/images/sunglasses/rectangle.webp";
import cateye from "../assets/images/sunglasses/cateye.webp";
import aviator from "../assets/images/sunglasses/aviator.webp";
import geometric from "../assets/images/sunglasses/geometric.webp";
import round from "../assets/images/sunglasses/round.webp";
import clubmaster from "../assets/images/sunglasses/clubmaster.webp";
import square from "../assets/images/sunglasses/square.webp";

const frameShapes = [
  { name: "Rectangle", image: rectangle, sunglassUrl: "#" },
  { name: "Cateye", image: cateye, sunglassUrl: "#" },
  { name: "Aviator", image: aviator, sunglassUrl: "#" },
  { name: "Geometric", image: geometric, sunglassUrl: "#" },
  { name: "Round", image: round, sunglassUrl: "#" },
  { name: "Clubmaster", image: clubmaster, sunglassUrl: "#" },
  { name: "Square", image: square, sunglassUrl: "#" },
];

const Sunglasses = () => {
  return (
    <>
      <section className="py-12 sm:py-16">
        <div className="mx-auto w-[90%] max-w-[1320px]">
          <h2 className="mb-7 text-2xl font-extrabold leading-tight text-ink">Get the perfect shape - Sunglasses</h2>
          <div className="flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none]">
            {frameShapes.map(({ name, image, sunglassUrl }) => (
              <a href={sunglassUrl} className="shrink-0 text-center" key={name}>
                <div>
                  <img src={image} alt={name} className="size-36 rounded-full object-contain sm:size-44" />
                  <h3 className="mt-2.5 text-sm font-semibold text-ink/60 sm:text-base">{name}</h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Sunglasses;
