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
          <div className="ftr_wrapper flex items-center justify-between sm:py-10 sm:pt-0">
            <div className="ftr_left_sec flex items-center xl:gap-20">
              <div className="ftr_list">
                <h3 className="mb-4 text-xl text-white">Services</h3>
                <ul className="text-white text-[12px] flex flex-col gap-4">
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
                <h3 className="mb-4 text-xl text-white">About Us</h3>
                <ul className="text-white text-[12px] flex flex-col gap-4">
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
                <h3 className="mb-4 text-xl text-white">Help</h3>
                <ul className="text-white text-[12px] flex flex-col gap-4">
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
            <div className="ftr_rgt_sec w-[400px]">
              <div className="flex items-center justify-center  gap-3">
                <a href="#">
                  <img src={play_store} alt="Play Store" />
                </a>
                <a href="#">
                  <img src={app_store} alt="App Store" />
                </a>
              </div>
              <p className="text-center mt-3 text-[14px] font-light">
                Download Lenskart App to buy <br />
                Eyeglasses, Sunglasses and Contact
                Lenses
              </p>
            </div>
          </div>
          <hr />
          <div className="ftr_wrapper flex items-center justify-between sm:py-5">
            <div className="ftr_left_sec flex items-center xl:gap-20">
              <div className="ftr_list">
                <ul className="text-white text-[14px] flex gap-10">
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
            <div className="ftr_rgt_sec">
              <div className="flex items-center justify-end  gap-5">
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
