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
      <section className="py-12 sm:py-16">
        <div className="mx-auto w-[90%] max-w-[1320px]">
          <h2 className="mb-7 text-2xl font-extrabold leading-tight text-ink">Top Categories</h2>
          <div className="flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none]">
            {categories.map(({ name, image, categoryUrl }) => (
              <a href={categoryUrl} className="shrink-0 text-center" key={name}>
                <div>
                  <img src={image} alt={name} className="mb-2.5 w-36 rounded-2xl bg-[#f5f5f5] p-4 sm:w-[180px]" />
                  <h3 className="text-sm font-semibold text-ink/60 sm:text-base">{name}</h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Categories;
