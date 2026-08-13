import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import image_1 from "../assets/images/image_1.webp";
import image_2 from "../assets/images/image_2.webp";
import image_3 from "../assets/images/image_3.webp";
import image_4 from "../assets/images/image_4.webp";
import image_5 from "../assets/images/image_5.webp";
import image_6 from "../assets/images/image_6.webp";
import image_7 from "../assets/images/image_7.webp";
import image_8 from "../assets/images/image_8.webp";
import image_9 from "../assets/images/image_9.webp";
import image_10 from "../assets/images/image_10.webp";
import image_11 from "../assets/images/image_11.webp";
import image_12 from "../assets/images/image_12.webp";
import image_13 from "../assets/images/hip-hop.jpeg";
import image_14 from "../assets/images/image_14.webp";
import image_15 from "../assets/images/image_15.webp";

const bannerImages = [
  image_1,
  image_2,
  image_3,
  image_4,
  image_5,
  image_6,
  image_7,
  image_8,
  image_9,
  image_10,
  image_11,
  image_12,
  image_13,
  image_14,
  image_15,
];

function HomeSlider() {
  return (
    <Swiper
      className="home-slider"
      modules={[Navigation, Pagination, Autoplay]}
      slidesPerView={1}
      spaceBetween={0}
      navigation={{
        prevEl: ".home-slider-prev",
        nextEl: ".home-slider-next",
      }}
      pagination={{
        clickable: true,
        dynamicBullets: true,
        dynamicMainBullets: 1,
      }}
      autoplay={{ delay: 5000 }}
      loop={true}
    >
      {bannerImages.map((image, index) => (
        <SwiperSlide key={`${image}-${index}`}>
          <a href="#">
            <img className="banner_img" src={image} alt="Home Banner" />
          </a>
        </SwiperSlide>
      ))}
      <button
        className="home-slider-arrow home-slider-prev"
        type="button"
        aria-label="Previous slide"
      >
        <ChevronLeft aria-hidden="true" />
      </button>
      <button
        className="home-slider-arrow home-slider-next"
        type="button"
        aria-label="Next slide"
      >
        <ChevronRight aria-hidden="true" />
      </button>
    </Swiper>
  );
}

export default HomeSlider;
