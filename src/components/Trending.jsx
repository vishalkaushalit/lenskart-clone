import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

const videoSlides = [
  {
    id: 1,
    title: "Top Frames",
    thumbnail:
      "https://images.unsplash.com/photo-1577803947579-9f4ff6a7d1db?auto=format&fit=crop&w=900&q=80",
    video:
      "https://assets.mixkit.co/videos/preview/mixkit-woman-in-sunglasses-looking-at-the-camera-11441-large.mp4",
    link: "/shop",
  },
  {
    id: 2,
    title: "Blue Light",
    thumbnail:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    video:
      "https://assets.mixkit.co/videos/preview/mixkit-close-up-of-person-putting-on-sunglasses-13004-large.mp4",
    link: "/shop",
  },
  {
    id: 3,
    title: "Bold Style",
    thumbnail:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    video:
      "https://assets.mixkit.co/videos/preview/mixkit-man-wearing-sunglasses-in-the-city-26479-large.mp4",
    link: "/shop",
  },
  {
    id: 4,
    title: "Classic Look",
    thumbnail:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    video:
      "https://assets.mixkit.co/videos/preview/mixkit-young-woman-with-sunglasses-in-a-store-39592-large.mp4",
    link: "/shop",
  },
  {
    id: 5,
    title: "Lens Care",
    thumbnail:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    video:
      "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-sunglasses-17942-large.mp4",
    link: "/shop",
  },
  {
    id: 6,
    title: "Sunset Edit",
    thumbnail:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
    video:
      "https://assets.mixkit.co/videos/preview/mixkit-woman-with-sunglasses-on-a-beach-17756-large.mp4",
    link: "/shop",
  },
];

const Trending = () => {
  const videoRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      if (index === activeIndex) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [activeIndex]);

  return (
    <div className="categories_sec trending_sec padding_70">
      <div className="container">
        <div className="info">
          <h2 className="heading">#Trending at Lenskart</h2>
        </div>

        <Swiper
          className="trending-video-slider"
          modules={[Autoplay]}
          slidesPerView={4}
          spaceBetween={18}
          loop={true}
          speed={700}
          autoplay={{
            delay: 2600,
            disableOnInteraction: false,
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          breakpoints={{
            0: { slidesPerView: 1.2 },
            480: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
        >
          {videoSlides.map((slide, index) => (
            <SwiperSlide key={slide.id} className="trending-video-slide">
              <div
                className={`video-card ${index === activeIndex ? "is-active" : ""}`}
              >
                <div className="video-media-wrap">
                  <img
                    src={slide.thumbnail}
                    alt={slide.title}
                    className="video-thumbnail"
                  />
                  <video
                    ref={(element) => {
                      videoRefs.current[index] = element;
                    }}
                    className="video-player"
                    src={slide.video}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    autoPlay={index === activeIndex}
                  />
                  <div className="video-overlay" />
                  <a href={slide.link} className="shop-now-btn">
                    Shop now
                  </a>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Trending;
