import { Swiper, SwiperSlide } from "swiper/react";
import store_eye_test from "../assets/images/store_eye_test.webp";
import home_eye_test from "../assets/images/home_eye_test.webp";
import online_eye_test from "../assets/images/online_eye_test.webp";

import "swiper/css";
import { ArrowRight } from "lucide-react";
import "./FreeCheckup.css";

const checkupList = [
  { name: "Visit Nearest Store", description: "Walk in for quick eye test", image: store_eye_test, checkupUrl: "#" },
  { name: "Schedule at Home", description: "Try 1000+ frames", image: home_eye_test, checkupUrl: "#" },
  { name: "Take an Online Eye Test", description: "Anytime, anywhere", image: online_eye_test, checkupUrl: "#" },
];

const FreeCheckup = () => {
  return (
    <>
      <section className="py-12 sm:py-16">
        <div className="store-container">
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
            {checkupList.map(({ name, description, image, checkupUrl }) => (
              <SwiperSlide key={name}>
                <a
                  href={checkupUrl}
                  className="checkup-card block overflow-hidden transition-transform hover:scale-[1.02]"
                >
                  <div className="checkup-card-photo">
                    <img loading="lazy" decoding="async" src={image} alt="" />
                  </div>
                  <div className="checkup-card-caption">
                    <div><h3>{name}</h3><p>{description}</p></div>
                    <span className="checkup-card-arrow" aria-hidden="true"><ArrowRight /></span>
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
