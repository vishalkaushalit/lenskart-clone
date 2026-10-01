import React from "react";
import Login_Image from "../assets/images/Login/login_image.webp";
const LoginImage = () => {
  return (
    <>
      {/* LEFT: BANNER */}
      <div
        className="relative flex w-full flex-col justify-between overflow-hidden bg-cover bg-center bg-no-repeat p-6 sm:p-8 lg:w-1/2 lg:p-10"
        style={{ backgroundImage: `url(${Login_Image})` }}
      >
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/50 to-slate-900/80" />

        {/* Top: Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white">
            {/* Cart Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            <h2 className="text-xl font-bold tracking-wide sm:text-2xl m-0">
              ShopAdmin
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-300">Manage. Grow. Succeed.</p>
        </div>

        {/* Bottom: Welcome */}
        <div className="relative z-10 mt-10">
          {/* Back button */}
          <button
            type="button"
            aria-label="Go back"
            className="mb-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>

          <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
            Welcome to ShopAdmin
          </h1>
          <p className="mt-3 max-w-md text-sm text-slate-300 sm:text-base">
            Your one-stop solution to manage users, products, coupons, orders
            and more.
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginImage;
