import { useEffect, useRef, useState } from "react";
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
import trending_9 from "../assets/images/trending/trending_9.webp";
import trending_10 from "../assets/images/trending/trending_10.webp";
import trending_11 from "../assets/images/trending/trending_11.webp";
import trending_12 from "../assets/images/trending/trending_12.webp";
import trending_1_video from "../assets/videos/trending_1.mp4";
import trending_2_video from "../assets/videos/trending_2.mp4";
import trending_3_video from "../assets/videos/trending_3.mp4";
import trending_4_video from "../assets/videos/trending_4.mp4";
import trending_5_video from "../assets/videos/trending_5.mp4";
import trending_6_video from "../assets/videos/trending_6.mp4";
import trending_7_video from "../assets/videos/trending_7.mp4";
import trending_8_video from "../assets/videos/trending_8.mp4";

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
  trending_1_video, // Cycle back to video 1 for slide 9
  trending_2_video, // Cycle back to video 2 for slide 10
  trending_3_video, // Cycle back to video 3 for slide 11
  trending_4_video, // Cycle back to video 4 for slide 12
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
  trending_9,
  trending_10,
  trending_11,
  trending_12,
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
  {
    id: 9,
    title: "Elegant Retro",
    thumbnail: thumbnailImages[8],
    video: videoUrls[8],
    link: "/shop/retro-glasses",
  },
  {
    id: 10,
    title: "Urban Edge",
    thumbnail: thumbnailImages[9],
    video: videoUrls[9],
    link: "/shop/urban-glasses",
  },
  {
    id: 11,
    title: "Minimalist Pure",
    thumbnail: thumbnailImages[10],
    video: videoUrls[10],
    link: "/shop/minimalist-glasses",
  },
  {
    id: 12,
    title: "Fashion Forward",
    thumbnail: thumbnailImages[11],
    video: videoUrls[11],
    link: "/shop/fashion-glasses",
  },
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
    <section className="py-12 sm:py-16">
      <div className="mx-auto w-[90%] max-w-[1320px]">
        <h2 className="mb-7 text-2xl font-extrabold text-ink">#Trending at Lenskart</h2>

        <Swiper
          ref={swiperRef}
          className="overflow-hidden pb-2.5"
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
            <SwiperSlide key={slide.id} className="h-auto">
              <div
                className="h-full"
              >
                <div className="relative h-[290px] overflow-hidden rounded-[26px] sm:h-[330px] lg:h-[440px]">
                  <img
                    src={slide.thumbnail}
                    alt={slide.title}
                    className={`absolute inset-0 z-1 size-full object-cover transition duration-200 ${index === playingIndex ? "scale-105 opacity-0" : "opacity-100"}`}
                  />
                  <video
                    ref={(element) => {
                      videoRefs.current[index] = element;
                    }}
                    className={`absolute inset-0 z-2 block size-full object-cover transition duration-200 ${index === playingIndex ? "opacity-100" : "opacity-0"}`}
                    src={slide.video}
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="absolute inset-0 z-3 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />
                  <a href={slide.link} className="absolute bottom-4 left-4 z-4 inline-flex min-w-27 items-center justify-center rounded-full border border-white/75 bg-white/95 px-4 py-2.5 text-sm font-bold text-ink shadow-lg transition hover:-translate-y-0.5 hover:bg-white sm:bottom-[18px] sm:left-[18px] sm:min-w-30 sm:px-[18px]">
                    Shop now
                  </a>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Trending;
