import { Swiper, SwiperSlide } from "swiper/react";
import store_eye_test from "../assets/images/store_eye_test.webp";
import home_eye_test from "../assets/images/home_eye_test.webp";
import online_eye_test from "../assets/images/online_eye_test.webp";

import "swiper/css";

const checkupList = [
  { name: "Visit Nearest Store", image: store_eye_test, checkupUrl: "#" },
  { name: "Schedule at Home", image: home_eye_test, checkupUrl: "#" },
  { name: "Take an Online Eye Test", image: online_eye_test, checkupUrl: "#" },
];

const FreeCheckup = () => {
  return (
    <>
      <section className="py-12 sm:py-16">
        <div className="mx-auto w-[90%] max-w-[1320px]">
          <h2 className="mb-7 text-xl sm:text-2xl font-extrabold text-ink">
            Get a FREE Eye Check Up
          </h2>
          <Swiper
            spaceBetween={12}
            slidesPerView={1.5}
            breakpoints={{
              350: { slidesPerView: 2.25 },
              640: { slidesPerView: 3, spaceBetween: 20 },
            }}
            className="!pb-1"
          >
            {checkupList.map(({ name, image, checkupUrl }) => (
              <SwiperSlide key={name}>
                <a
                  href={checkupUrl}
                  className="block overflow-hidden rounded-xl transition-transform hover:scale-[1.02]"
                >
                  <div>
                    <img className="h-auto w-full" src={image} alt={name} />
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

export default FreeCheckup;
