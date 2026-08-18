import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import category_img from "../assets/images/eyeglasses/eyeglasses.webp";

import "swiper/css";
import "swiper/css/navigation";

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
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={20}
            slidesPerView={2.15}
            breakpoints={{
              480: { slidesPerView: 3.25 },
              640: { slidesPerView: 4.25 },
              1024: { slidesPerView: 5.25 }
            }}
            className="!pb-2 [&_.swiper-button-next]:!text-ink [&_.swiper-button-prev]:!text-ink"
          >
            {categories.map(({ name, image, categoryUrl }) => (
              <SwiperSlide key={name}>
                <a href={categoryUrl} className="block text-center">
                  <div>
                    <img src={image} alt={name} className="mb-2.5 w-full rounded-2xl bg-[#f5f5f5] p-4" />
                    <h3 className="text-sm font-semibold text-ink/60 sm:text-base">{name}</h3>
                  </div>
                </a>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </>
  );
};

export default Categories;
