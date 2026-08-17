import rectangle from "../assets/images/sunglasses/rectangle.webp";
import cateye from "../assets/images/sunglasses/cateye.webp";
import aviator from "../assets/images/sunglasses/aviator.webp";
import geometric from "../assets/images/sunglasses/geometric.webp";
import round from "../assets/images/sunglasses/round.webp";
import clubmaster from "../assets/images/sunglasses/clubmaster.webp";
import square from "../assets/images/sunglasses/square.webp";

const frameShapes = [
  { name: "Rectangle", image: rectangle },
  { name: "Cateye", image: cateye },
  { name: "Aviator", image: aviator },
  { name: "Geometric", image: geometric },
  { name: "Round", image: round },
  { name: "Clubmaster", image: clubmaster },
  { name: "Square", image: square },
];

const Sunglasses = () => {
  return (
    <>
      <div className="eyeglasses_sec sunglasses_sec padding_70">
        <div className="container">
          <div className="info mb_30">
            <h2 className="heading">Get the perfect shape - Sunglasses</h2>
          </div>
          <div className="category_wrapper">
            {frameShapes.map(({ name, image }) => (
              <a href="#" className="category_link" key={name}>
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

export default Sunglasses;
