import { Swiper, SwiperSlide } from "swiper/react";
import rectangle from "../assets/images/eyeglasses/rectangle.webp";
import cateye from "../assets/images/eyeglasses/cateye.webp";
import aviator from "../assets/images/eyeglasses/aviator.webp";
import geometric from "../assets/images/eyeglasses/geometric.webp";
import round from "../assets/images/eyeglasses/round.webp";
import clubmaster from "../assets/images/eyeglasses/clubmaster.webp";
import square from "../assets/images/eyeglasses/square.webp";

import "swiper/css";

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
            {frameShapes.map(({ name, image, eyeglassUrl }) => (
              <SwiperSlide key={name}>
                <a href={eyeglassUrl} className="block text-center">
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

export default Eyeglasses;
