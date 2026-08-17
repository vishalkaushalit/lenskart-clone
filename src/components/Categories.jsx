import category_img from "../assets/images/eyeglasses/eyeglasses.webp";

const categories = [
  "Eyeglasses",
  "Sunglasses",
  "Special Power",
  "Contact Lenses",
  "Kids Glasses",
  "Sale",
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
            {categories.map((category) => (
              <a href="#" className="category_link" key={category}>
                <div className="category_box">
                  <img
                    src={category_img}
                    alt={category}
                    className="category_img"
                  />
                  <h3 className="category_title">{category}</h3>
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
