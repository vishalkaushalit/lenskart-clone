import { Swiper, SwiperSlide } from "swiper/react";
import eyeglasses from "../assets/images/category/eyeglasses.webp";
import sunglasses from "../assets/images/category/sunglasses.webp";
import special_power from "../assets/images/category/special_power.webp";
import contact_lenses from "../assets/images/category/contact_lenses.webp";
import kids_glasses from "../assets/images/category/kids_glasses.webp";
import sale from "../assets/images/category/sale.webp";

import "swiper/css";

const categories = [
  {
    name: "Eyeglasses",
    image: eyeglasses,
    categoryUrl: "#",
    dropdownItems: [
      { label: "Square", image: eyeglasses },
      { label: "Rectangle", image: eyeglasses },
      { label: "Round", image: eyeglasses },
      { label: "Geometric", image: eyeglasses },
      { label: "Cat Eye", image: eyeglasses },
      { label: "Oval", image: eyeglasses },
    ],
    viewAllText: "View all shapes",
  },
  {
    name: "Sunglasses",
    image: sunglasses,
    categoryUrl: "#",
    dropdownItems: [
      { label: "Square", image: sunglasses },
      { label: "Rectangle", image: sunglasses },
      { label: "Round", image: sunglasses },
      { label: "Geometric", image: sunglasses },
      { label: "Oversized", image: sunglasses },
      { label: "Wayfarer", image: sunglasses },
    ],
    viewAllText: "View all shapes",
  },
  {
    name: "Special Power",
    image: special_power,
    categoryUrl: "#",
    dropdownItems: [
      { label: "Progressive", image: special_power },
      { label: "Bifocal", image: special_power },
      { label: "Trifocal", image: special_power },
      { label: "Reading Glasses", image: special_power },
      { label: "Computer Glasses", image: special_power },
    ],
    viewAllText: "View all types",
  },
  {
    name: "Contact Lenses",
    image: contact_lenses,
    categoryUrl: "#",
    dropdownItems: [
      { label: "Daily", image: contact_lenses },
      { label: "Weekly", image: contact_lenses },
      { label: "Monthly", image: contact_lenses },
      { label: "Colored", image: contact_lenses },
      { label: "Prescription", image: contact_lenses },
    ],
    viewAllText: "View all lenses",
  },
  {
    name: "Kids Glasses",
    image: kids_glasses,
    categoryUrl: "#",
    dropdownItems: [
      { label: "Frames", image: kids_glasses },
      { label: "Sunglasses", image: kids_glasses },
      { label: "Accessories", image: kids_glasses },
      { label: "Trending", image: kids_glasses },
    ],
    viewAllText: "View all kids",
  },
  { name: "Sale", image: sale, categoryUrl: "#" },
];

const Categories = () => {
  return (
    <>
      <section className="py-12 sm:py-16">
        <div className="mx-auto w-[90%] max-w-[1320px]">
          <h2 className="mb-7 text-xl sm:text-2xl font-extrabold leading-tight text-ink">
            Top Categories
          </h2>
          <Swiper
            spaceBetween={20}
            slidesPerView={2.5}
            breakpoints={{
              480: { slidesPerView: 3.75 },
              640: { slidesPerView: 4.75 },
              1024: { slidesPerView: 5.75 },
              1280: { slidesPerView: 6 },
            }}
            className="!pb-2 overflow-visible"
            style={{ overflow: "visible" }}
          >
            {categories.map(
              ({ name, image, categoryUrl, dropdownItems, viewAllText }) => (
                <SwiperSlide key={name} style={{ overflow: "visible" }}>
                  <div className="relative group">
                    <a href={categoryUrl} className="block text-center">
                      <div>
                        <img
                          src={image}
                          alt={name}
                          className="mb-2.5 w-full rounded-2xl bg-[#f5f5f5] p-4"
                        />
                        <h3 className="text-sm font-semibold text-ink/60 sm:text-base">
                          {name}
                        </h3>
                      </div>
                    </a>

                    {/* Dropdown Menu */}
                    {dropdownItems && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-64">
                        <div className="divide-y divide-gray-300">
                          {dropdownItems.map((item) => (
                            <a
                              key={item.label}
                              href="#"
                              className="flex items-center gap-4 p-2 transition-colors"
                            >
                              <img
                                src={item.image}
                                alt={item.label}
                                className="w-20 h-15 rounded p-1 object-contain"
                              />
                              <span className="text-md font-medium text-ink">
                                {item.label}
                              </span>
                            </a>
                          ))}
                          <a
                            href="#"
                            className="block text-center p-5 text-md font-semibold text-ink transition-colors"
                          >
                            {viewAllText}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              ),
            )}
          </Swiper>
        </div>
      </section>
    </>
  );
};

export default Categories;
