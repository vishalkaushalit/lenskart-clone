import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import trending_1 from "../assets/images/trending/trending_1.webp";
import trending_2 from "../assets/images/trending/trending_2.webp";
import trending_3 from "../assets/images/trending/trending_3.webp";
import trending_4 from "../assets/images/trending/trending_4.webp";
import trending_5 from "../assets/images/trending/trending_5.webp";
import trending_6 from "../assets/images/trending/trending_6.webp";
import trending_7 from "../assets/images/trending/trending_7.webp";
import trending_8 from "../assets/images/trending/trending_8.webp";
// import trending_9 from "../assets/images/trending/trending_9.webp";
// import trending_10 from "../assets/images/trending/trending_10.webp";
// import trending_11 from "../assets/images/trending/trending_11.webp";
// import trending_12 from "../assets/images/trending/trending_12.webp";
import trending_1_video from "../assets/videos/trending_1.mp4";
import trending_2_video from "../assets/videos/trending_2.mp4";
import trending_3_video from "../assets/videos/trending_3.mp4";
import trending_4_video from "../assets/videos/trending_4.mp4";
import trending_5_video from "../assets/videos/trending_5.mp4";
import trending_6_video from "../assets/videos/trending_6.mp4";
import trending_7_video from "../assets/videos/trending_7.mp4";
import trending_8_video from "../assets/videos/trending_8.mp4";
// import trending_9_video from "../assets/videos/trending_9.mp4";
// import trending_10_video from "../assets/videos/trending_10.mp4";
// import trending_11_video from "../assets/videos/trending_11.mp4";
// import trending_12_video from "../assets/videos/trending_12.mp4";

import "swiper/css";

const videoUrls = [
  trending_1_video,
  trending_2_video,
  trending_3_video,
  trending_4_video,
  trending_5_video,
  trending_6_video,
  trending_7_video,
  trending_8_video,
  // trending_9_video,
  // trending_10_video,
  // trending_11_video,
  // trending_12_video,
];

const thumbnailImages = [
  trending_1,
  trending_2,
  trending_3,
  trending_4,
  trending_5,
  trending_6,
  trending_7,
  trending_8,
  // trending_9,
  // trending_10,
  // trending_11,
  // trending_12,
];

const videoSlides = [
  {
    id: 1,
    title: "Classic Round",
    thumbnail: thumbnailImages[0],
    video: videoUrls[0],
    link: "/shop/round-glasses",
  },
  {
    id: 2,
    title: "Aviator Edge",
    thumbnail: thumbnailImages[1],
    video: videoUrls[1],
    link: "/shop/aviator-glasses",
  },
  {
    id: 3,
    title: "Cat Eye Style",
    thumbnail: thumbnailImages[2],
    video: videoUrls[2],
    link: "/shop/cat-eye-glasses",
  },
  {
    id: 4,
    title: "Rectangle Smart",
    thumbnail: thumbnailImages[3],
    video: videoUrls[3],
    link: "/shop/rectangle-glasses",
  },
  {
    id: 5,
    title: "Blue Light Shield",
    thumbnail: thumbnailImages[4],
    video: videoUrls[4],
    link: "/shop/blue-light-glasses",
  },
  {
    id: 6,
    title: "Sunset Luxe",
    thumbnail: thumbnailImages[5],
    video: videoUrls[5],
    link: "/shop/sunset-luxe-glasses",
  },
  {
    id: 7,
    title: "Vintage Charm",
    thumbnail: thumbnailImages[6],
    video: videoUrls[6],
    link: "/shop/vintage-glasses",
  },
  {
    id: 8,
    title: "Modern Bold",
    thumbnail: thumbnailImages[7],
    video: videoUrls[7],
    link: "/shop/modern-glasses",
  },
  // {
  //   id: 9,
  //   title: "Elegant Retro",
  //   thumbnail: thumbnailImages[8],
  //   video: videoUrls[8],
  //   link: "/shop/retro-glasses",
  // },
  // {
  //   id: 10,
  //   title: "Urban Edge",
  //   thumbnail: thumbnailImages[9],
  //   video: videoUrls[9],
  //   link: "/shop/urban-glasses",
  // },
  // {
  //   id: 11,
  //   title: "Minimalist Pure",
  //   thumbnail: thumbnailImages[10],
  //   video: videoUrls[10],
  //   link: "/shop/minimalist-glasses",
  // },
  // {
  //   id: 12,
  //   title: "Fashion Forward",
  //   thumbnail: thumbnailImages[11],
  //   video: videoUrls[11],
  //   link: "/shop/fashion-glasses",
  // },
];

const Trending = () => {
  const swiperRef = useRef(null);
  const videoRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingIndex, setPlayingIndex] = useState(-1);

  useEffect(() => {
    const activeVideo = videoRefs.current[activeIndex];

    if (!activeVideo) return;

    activeVideo.pause();
    activeVideo.currentTime = 0;
    setPlayingIndex(-1);

    // Wait 2 seconds before starting the video (show poster)
    const initialDelayTimer = setTimeout(() => {
      activeVideo.play().catch(() => {});
      setPlayingIndex(activeIndex);

      // After playing for 3 seconds, advance to next slide
      const playDurationTimer = setTimeout(() => {
        setPlayingIndex(-1);
        if (swiperRef.current) {
          swiperRef.current.slideNext();
        }
      }, 3000);

      return () => clearTimeout(playDurationTimer);
    }, 500);

    return () => {
      clearTimeout(initialDelayTimer);
      activeVideo.pause();
      activeVideo.currentTime = 0;
      setPlayingIndex(-1);
    };
  }, [activeIndex]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      if (index === activeIndex) {
        video.muted = true;
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
          ref={swiperRef}
          className="trending-video-slider"
          modules={[Autoplay]}
          slidesPerView={4}
          spaceBetween={18}
          loop={true}
          speed={700}
          autoplay={true}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          breakpoints={{
            0: { slidesPerView: 1.5 },
            480: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
        >
          {videoSlides.map((slide, index) => (
            <SwiperSlide key={slide.id} className="trending-video-slide">
              <div
                className={`video-card ${index === activeIndex ? "is-active" : ""} ${index === playingIndex ? "is-playing" : ""}`}
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
                    playsInline
                    preload="metadata"
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
