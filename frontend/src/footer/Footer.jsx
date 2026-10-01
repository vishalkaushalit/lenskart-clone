import play_store from "/play_store.svg";
import app_store from "/app_store.svg";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
} from "react-icons/fa6";

const Footer = () => {
  return (
    <>
      <footer className="bg-ink text-white">
        <div className="mx-auto w-[90%] max-w-[1320px]">
          <div className="flex flex-col gap-10 py-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid w-full grid-cols-2 gap-x-8 gap-y-9 sm:grid-cols-3 lg:w-auto lg:gap-x-16 xl:gap-x-20">
              <div className="ftr_list">
                <h3 className="mb-4 text-lg font-semibold text-white sm:text-xl">Services</h3>
                <ul className="flex flex-col gap-3 text-xs text-white sm:gap-4">
                  <li>
                    <a href="#">Store Locator</a>
                  </li>
                  <li>
                    <a href="#">Buying Guide</a>
                  </li>
                  <li>
                    <a href="#">Frame Size</a>
                  </li>
                </ul>
              </div>
              <div className="ftr_list">
                <h3 className="mb-4 text-lg font-semibold text-white sm:text-xl">About Us</h3>
                <ul className="flex flex-col gap-3 text-xs text-white sm:gap-4">
                  <li>
                    <a href="#">We Are Hiring</a>
                  </li>
                  <li>
                    <a href="#">Refer And Earn</a>
                  </li>
                  <li>
                    <a href="#">Lenskart Coupons</a>
                  </li>
                </ul>
              </div>
              <div className="ftr_list">
                <h3 className="mb-4 text-lg font-semibold text-white sm:text-xl">Help</h3>
                <ul className="flex flex-col gap-3 text-xs text-white sm:gap-4">
                  <li>
                    <a href="#">FAQ's</a>
                  </li>
                  <li>
                    <a href="#">Grievance Redressal</a>
                  </li>
                  <li>
                    <a href="#">Cardemi</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="w-full text-center lg:w-[400px] lg:shrink-0">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a href="#">
                  <img className="h-auto max-w-[135px]" src={play_store} alt="Play Store" />
                </a>
                <a href="#">
                  <img className="h-auto max-w-[135px]" src={app_store} alt="App Store" />
                </a>
              </div>
              <p className="mt-3 text-center text-sm font-light leading-6">
                Download Lenskart App to buy<br className="hidden sm:block" /> Eyeglasses, Sunglasses and Contact Lenses
              </p>
            </div>
          </div>
          <hr className="border-white/30" />
          <div className="flex flex-col gap-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="ftr_list">
                <ul className="flex justify-center md:justify-start flex-wrap gap-x-6 gap-y-3 text-sm text-white sm:gap-x-10">
                  <li>
                    <a href="#">T & C</a>
                  </li>
                  <li>
                    <a href="#">Privacy</a>
                  </li>
                  <li>
                    <a href="#">Disclaimer</a>
                  </li>
                  <li>
                    <a href="#">Cookie Settings</a>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-5 justify-center md:justify-end">
                <a href="#">
                  <FaFacebookF />
                </a>
                <a href="#">
                  <FaInstagram />
                </a>
                <a href="#">
                  <FaXTwitter />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
