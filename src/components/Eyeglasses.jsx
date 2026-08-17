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
      <div className="eyeglasses_sec padding_70">
        <div className="container">
          <div className="info mb_30">
            <h2 className="heading">Get the perfect shape - Eyeglasses</h2>
          </div>
          <div className="category_wrapper">
            {frameShapes.map(({ name, image, eyeglassUrl }) => (
              <a href={eyeglassUrl} className="category_link" key={name}>
                <div className="category_box">
                  <img src={image} alt={name} className="eyeglass_img" />
                  <h3 className="category_title">{name}</h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Eyeglasses;
