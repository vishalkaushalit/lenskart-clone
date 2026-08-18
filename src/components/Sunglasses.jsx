import { Swiper, SwiperSlide } from "swiper/react";
import rectangle from "../assets/images/sunglasses/rectangle.webp";
import cateye from "../assets/images/sunglasses/cateye.webp";
import aviator from "../assets/images/sunglasses/aviator.webp";
import geometric from "../assets/images/sunglasses/geometric.webp";
import round from "../assets/images/sunglasses/round.webp";
import clubmaster from "../assets/images/sunglasses/clubmaster.webp";
import square from "../assets/images/sunglasses/square.webp";

import "swiper/css";

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
          <Swiper
            spaceBetween={20}
            slidesPerView={2.15}
            breakpoints={{
              480: { slidesPerView: 3.5 },
              640: { slidesPerView: 4.5 },
              1024: { slidesPerView: 5.5 },
              1280: { slidesPerView: 6.5 },
            }}
            className="!pb-2"
          >
            {frameShapes.map(({ name, image, sunglassUrl }) => (
              <SwiperSlide key={name}>
                <a href={sunglassUrl} className="block text-center">
                  <div>
                    <img src={image} alt={name} className="aspect-square w-full rounded-full object-contain" />
                    <h3 className="mt-2.5 text-sm font-semibold text-ink/60 sm:text-base">{name}</h3>
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

export default Sunglasses;
