import rectangle from "../assets/images/eyeglasses/rectangle.webp";
import cateye from "../assets/images/eyeglasses/cateye.webp";
import aviator from "../assets/images/eyeglasses/aviator.webp";
import geometric from "../assets/images/eyeglasses/geometric.webp";
import round from "../assets/images/eyeglasses/round.webp";
import clubmaster from "../assets/images/eyeglasses/clubmaster.webp";
import square from "../assets/images/eyeglasses/square.webp";

const frameShapes = [
  { name: "Rectangle", image: rectangle, eyeglassUrl: "#" },
  { name: "Cateye", image: cateye, eyeglassUrl: "#" },
  { name: "Aviator", image: aviator, eyeglassUrl: "#" },
  { name: "Geometric", image: geometric, eyeglassUrl: "#" },
  { name: "Round", image: round, eyeglassUrl: "#" },
  { name: "Clubmaster", image: clubmaster, eyeglassUrl: "#" },
  { name: "Square", image: square, eyeglassUrl: "#" },
];

const Eyeglasses = () => {
  return (
    <>
      <section className="py-12 sm:py-16">
        <div className="mx-auto w-[90%] max-w-[1320px]">
          <h2 className="mb-7 text-2xl font-extrabold leading-tight text-ink">Get the perfect shape - Eyeglasses</h2>
          <div className="flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none]">
            {frameShapes.map(({ name, image, eyeglassUrl }) => (
              <a href={eyeglassUrl} className="shrink-0 text-center" key={name}>
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

export default Eyeglasses;
