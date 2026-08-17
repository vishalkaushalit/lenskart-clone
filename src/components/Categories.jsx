import category_img from "../assets/images/eyeglasses/eyeglasses.webp";

const categories = [
  { name: "Eyeglasses", image: category_img, categoryUrl: "#" },
  { name: "Sunglasses", image: category_img, categoryUrl: "#" },
  { name: "Special Power", image: category_img, categoryUrl: "#" },
  { name: "Contact Lenses", image: category_img, categoryUrl: "#" },
  { name: "Kids Glasses", image: category_img, categoryUrl: "#" },
  { name: "Sale", image: category_img, categoryUrl: "#" },
];

const Categories = () => {
  return (
    <>
      <div className="categories_sec padding_70">
        <div className="container">
          <div className="info mb_30">
            <h2 className="heading">Top Categories</h2>
          </div>
          <div className="category_wrapper">
            {categories.map(({ name, image, categoryUrl }) => (
              <a href={categoryUrl} className="category_link" key={name}>
                <div className="category_box">
                  <img
                    src={image}
                    alt={name}
                    className="category_img"
                  />
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

export default Categories;
