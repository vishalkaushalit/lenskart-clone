import { useEffect, useState } from "react";

import {
  ChevronDown,
  UserRound,
  Heart,
  Menu,
  PhoneCall,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";

import { FaUserAlt } from "react-icons/fa";

import logo from "../assets/images/logo.svg";
import get_gold from "../assets/images/get_gold.webp";

const topbarLinks = [
  "Corporate",
  "StoreLocator",
  "Singapore",
  "UAE",
  "John Jacobs",
  "Aqualens",
  "Cobrowsing",
  "Engineering Blog",
  "Partner With Us",
];

const navigation = [
  {
    label: "Eyeglasses",
    groups: [
      {
        title: "Men",
        items: ["Classic Eyeglasses", "Computer Glasses", "Premium Eyeglasses"],
      },
      {
        title: "Women",
        items: ["Cat Eye", "Transparent Frames", "Lightweight Frames"],
      },
      {
        title: "Kids",
        items: ["Kids Eyeglasses", "Teen Collection", "Blue Cut Glasses"],
      },
    ],
  },
  {
    label: "Sunglasses",
    groups: [
      { title: "Shop For", items: ["Men", "Women", "Kids"] },
      { title: "Styles", items: ["Aviator", "Wayfarer", "Round", "Cat Eye"] },
      { title: "Collections", items: ["New Arrivals", "Polarized", "Premium"] },
    ],
  },
  {
    label: "Contacts",
    groups: [
      {
        title: "Contact Lenses",
        items: ["Daily Disposable", "Monthly Disposable", "Color Lenses"],
      },
      { title: "Brands", items: ["Aqualens", "Bausch & Lomb", "Acuvue"] },
      {
        title: "Accessories",
        items: ["Lens Solution", "Lens Cases", "Eye Drops"],
      },
    ],
  },
  {
    label: "Special Power",
    groups: [
      { title: "Power Types", items: ["Bifocal", "Progressive", "Zero Power"] },
      {
        title: "Lens Features",
        items: ["Blue Cut", "Anti-Glare", "Photochromic"],
      },
      {
        title: "Need Help?",
        items: ["Book Eye Test", "Power Guide", "Talk to an Expert"],
      },
    ],
  },
  {
    label: "Stores",
    groups: [
      { title: "Find a Store", items: ["Near Me", "Top Cities", "All Stores"] },
      {
        title: "In Store",
        items: ["Free Eye Test", "Frame Styling", "Same Day Delivery"],
      },
      {
        title: "Popular Cities",
        items: ["Delhi", "Mumbai", "Bengaluru", "Pune"],
      },
    ],
  },
  {
    label: "Try @ Home",
    groups: [
      {
        title: "Home Trial",
        items: ["How It Works", "Choose 5 Frames", "Book Appointment"],
      },
      {
        title: "Benefits",
        items: ["Free Service", "Expert Assistance", "No Obligation"],
      },
      { title: "Support", items: ["Track Appointment", "FAQs", "Contact Us"] },
    ],
  },
];

const mobileMenuItems = [
  {
    label: "Eyeglasses",
    items: [
      "Eyeglasses",
      "Lenskart BLU Lenses",
      "Computer Glasses",
      "Kids Glasses",
      "Geometric Frames",
    ],
  },
  {
    label: "Sunglasses",
    items: [
      "Sunglasses",
      "Men's Sunglasses",
      "Women's Sunglasses",
      "Kids' Sunglasses",
      "Polarized Sunglasses",
    ],
  },
  {
    label: "Contact Lens",
    items: [
      "Contact Lenses",
      "Daily Disposable",
      "Monthly Disposable",
      "Color Lenses",
      "Lens Solution",
    ],
  },
  {
    label: "Special Power",
    items: [
      "Progressive Glasses",
      "Bifocal Glasses",
      "Zero Power",
      "Blue Cut Lenses",
      "Power Guide",
    ],
  },
  {
    label: "Stores",
    items: ["Find a Store", "Book an Eye Test", "Top Cities", "All Stores"],
  },
  {
    label: "Try @ Home",
    items: [
      "How It Works",
      "Choose 5 Frames",
      "Book Appointment",
      "Track Appointment",
    ],
  },
];

const Header = () => {
  const [isFixed, setIsFixed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header
        className={`z-[100] w-full bg-white text-black ${isFixed ? "fixed top-0 left-0 shadow-sm" : "relative"}`}
      >
        <div className="lg:hidden">
          <div className="flex h-[40px] items-center justify-between bg-ink px-4 text-white">
            <p className="text-[12px] font-light">
              4.5 <span className="text-yellow-400 text-[10px]">★</span> Rating
              | 50M+ Downloads
            </p>
            <a
              href="#"
              className="rounded-[5px] bg-white px-4 py-[5px] text-[9px] font-bold text-ink"
            >
              Open in App
            </a>
          </div>
          <div className="px-4 py-2">
            <div className="flex items-center justify-between gap-3">
              <a
                href="#"
                className="flex min-w-0 items-center gap-2"
                aria-label="Select location"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f1f1fa] text-[#686795]">
                  <FaUserAlt size={20} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[8px] italic text-[#ff5d4f]">
                    Get faster delivery ⚡
                  </span>
                  <span className="flex items-center gap-1 text-[12px] font-bold text-ink">
                    <span className="min-w-max overflow-hidden text-[10px]">
                      Select Location
                    </span>
                    <ChevronDown size={18} fill="currentColor" />
                  </span>
                </span>
              </a>
              <div className="flex items-center gap-3">
                <img className="w-[50px]" src={get_gold} alt="Get Gold" />
                <a href="#" aria-label="Wishlist" className="text-ink">
                  <Heart size={24} strokeWidth={1.8} />
                </a>
                <a href="#" aria-label="Shopping bag" className="text-ink">
                  <ShoppingBag size={24} strokeWidth={1.8} />
                </a>
                <button
                  type="button"
                  aria-label="Open menu"
                  onClick={() => setIsMenuOpen(true)}
                  className="text-ink"
                >
                  <Menu size={24} strokeWidth={1.8} />
                </button>
              </div>
            </div>
            <label className="mt-2 flex h-[40px] items-center gap-4 rounded-[10px] border-1 border-[#e6e6ef] px-3 text-[#73739d]">
              <Search size={16} className="shrink-0 text-ink" />
              <input
                className="min-w-0 w-full bg-transparent text-[14px] outline-none placeholder:text-[#73739d]"
                type="search"
                placeholder={'Search "metal eyeglasses"'}
                aria-label="Search products"
              />
            </label>
          </div>
        </div>

        <div
          className={`fixed inset-0 z-[200] ${isMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
          aria-hidden={!isMenuOpen}
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsMenuOpen(false)}
            className={`absolute inset-0 bg-black/35 transition-opacity ${isMenuOpen ? "opacity-100" : "opacity-0"}`}
          />
          <aside
            className={`relative ml-auto h-full w-3/4 overflow-y-auto bg-white text-ink transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <div className="flex h-[60px] items-center justify-between border-b border-[#ededf5] px-4">
              <img src={logo} alt="Lenskart" className="h-auto w-[50px]" />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setIsMenuOpen(false)}
              >
                <X size={24} strokeWidth={2} />
              </button>
            </div>
            <div className="px-4 py-6">
              <div className="flex items-start gap-3">
                <div className="border-1 rounded-full p-2">
                  <UserRound size={24} strokeWidth={1.7} className="shrink-0" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold leading-tight">
                    Hi Specsy!
                  </h2>
                  <p className="mt-2 max-w-[150px] text-[12px] text-[#686795]">
                    Login or Signup to track your orders and get access to
                    exclusive deals.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="mt-4 w-full rounded-[10px] bg-ink py-3 text-[14px] font-semibold text-white"
              >
                Login/Signup
              </button>
              <a
                href="tel:9999899998"
                className="pt-6 pb-4 flex items-center justify-between text-[14px] font-semibold"
              >
                <span>Talk to us</span>
                <span className="flex items-center gap-3">
                  <PhoneCall size={16} />
                  9999899998
                </span>
              </a>
              <div className="border-t border-[#ededf5]">
                {mobileMenuItems.map(({ label, items }) => {
                  const isOpen = openMobileMenu === label;

                  return (
                    <div className="border-b border-[#ededf5]" key={label}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between py-4 text-left text-[14px] font-semibold"
                        aria-expanded={isOpen}
                        aria-controls={`mobile-menu-${label}`}
                        onClick={() => setOpenMobileMenu(isOpen ? null : label)}
                      >
                        Shop {label}
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      <div
                        id={`mobile-menu-${label}`}
                        className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                      >
                        <div className="overflow-hidden">
                          <div className="pl-4">
                            {items.map((item) => (
                              <a
                                href="#"
                                className="block border-b border-[#ededf5] py-3 text-[14px] leading-tight text-[#686795] last:border-0 first:pt-0"
                                key={item}
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {item}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>

        <div className="hidden lg:block">
          <div className="border-b border-black/10 px-5 py-2">
            <div className="mx-auto flex max-w-[1400px] items-center justify-between">
              <div className="flex items-center overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
                {topbarLinks.map((link) => (
                  <a
                    href="#"
                    className="border-r border-black px-2 text-[10px] first:pl-0 last:border-0"
                    key={link}
                  >
                    {link}
                  </a>
                ))}
              </div>
              <div>
                <a
                  className="ml-4 flex shrink-0 items-center gap-2.5 font-bold text-[#010142]"
                  href="#"
                >
                  <PhoneCall size={14} />
                  <span className="text-sm">99998 99998</span>
                </a>
              </div>
            </div>
          </div>
          <div className="flex min-h-[70px] w-full items-center gap-4 overflow-x-auto px-5">
            <a
              className="grid shrink-0 place-items-center"
              href="#"
              aria-label="Lenskart home"
            >
              <img src={logo} alt="Logo" />
            </a>

            <nav
              className="flex h-[70px] shrink-0 items-stretch gap-5"
              aria-label="Main navigation"
            >
              {navigation.map((navItem) => (
                <div className="group flex items-center" key={navItem.label}>
                  <a
                    className="relative flex h-full items-center whitespace-nowrap text-[13px] font-bold uppercase tracking-tight after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:scale-x-0 after:bg-black after:transition-transform group-hover:after:scale-x-100 group-focus-within:after:scale-x-100 xl:text-[14px]"
                    href="#"
                  >
                    {navItem.label}
                  </a>
                  <div className="invisible absolute inset-x-0 top-full z-50 border-t border-black/10 bg-white px-[3%] opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <div className="mx-auto grid max-w-[1120px] grid-cols-3 gap-10 py-8 lg:pl-24 lg:gap-[70px]">
                      {navItem.groups.map((group) => (
                        <div
                          className="flex flex-col items-start gap-3"
                          key={group.title}
                        >
                          <p className="mb-1 text-sm font-extrabold uppercase text-ink">
                            {group.title}
                          </p>
                          {group.items.map((item) => (
                            <a
                              className="text-sm text-neutral-600 transition hover:translate-x-1 hover:text-ink"
                              href="#"
                              key={item}
                            >
                              {item}
                            </a>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-4 xl:gap-7">
              <label className="bg-gray-100 hidden h-11 w-[120px] items-center gap-3.5 rounded-lg px-4 lg:flex xl:w-[250px]">
                <Search size={20} color="black" aria-hidden="true" />
                <input
                  className="min-w-0 w-full bg-transparent text-base outline-none"
                  type="search"
                  placeholder={'Search "airy light glasses"'}
                  aria-label="Search products"
                />
              </label>
              <a
                className="grid shrink-0 place-items-center transition hover:-translate-y-0.5 hover:opacity-75"
                href="#"
                aria-label="Wishlist"
              >
                <Heart color="black" aria-hidden="true" />
              </a>
              <a
                className="grid shrink-0 place-items-center transition hover:-translate-y-0.5 hover:opacity-75"
                href="#"
                aria-label="Shopping bag"
              >
                <ShoppingBag color="black" aria-hidden="true" />
              </a>
              <a
                className="grid shrink-0 place-items-center transition hover:-translate-y-0.5 hover:opacity-75"
                href="#"
                aria-label="Account"
              >
                <UserRound color="black" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
