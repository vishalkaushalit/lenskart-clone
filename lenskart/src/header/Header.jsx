import React from "react";
import styles from "./Header.module.css";
import { PhoneCall } from "lucide-react";

import {
  CircleUserRound,
  Glasses,
  Heart,
  Search,
  ShoppingBag,
} from "lucide-react";
import logo_white from "../assets/images/logo_white.svg";

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

function Header() {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.topbar_sec}>
          <div className={styles.container}>
            <div className={styles.topbar}>
              <div className={styles.locations}>
                <a href="#">Corporate</a>
                <a href="#">StoreLocator</a>
                <a href="#">Singapore</a>
                <a href="#">UAE</a>
                <a href="#">John Jacobs</a>
                <a href="#">Aqualens</a>
                <a href="#">Cobrowsing</a>
                <a href="#">Engineering Blog</a>
                <a href="#">Partner With Us</a>
              </div>
              <div>
                <a className={styles.callBtn} href="#">
                  <PhoneCall size={14} className={styles.callIcon} />
                  <p>99998 99998</p>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.navbar}>
          <a className={styles.logo} href="#" aria-label="Lenskart home">
            <img src={logo_white} alt="" />
          </a>

          <nav className={styles.navigation} aria-label="Main navigation">
            {navigation.map((navItem) => (
              <div className={styles.navItem} key={navItem.label}>
                <a className={styles.navLink} href="#">
                  {navItem.label}
                </a>
                <div className={styles.dropdown}>
                  <div className={styles.dropdownInner}>
                    {navItem.groups.map((group) => (
                      <div className={styles.dropdownGroup} key={group.title}>
                        <p>{group.title}</p>
                        {group.items.map((item) => (
                          <a href="#" key={item}>
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

          <div className={styles.actions}>
            <label className={styles.searchBox}>
              <Search aria-hidden="true" />
              <input
                type="search"
                placeholder={'Search "airy light glasses"'}
                aria-label="Search products"
              />
            </label>
            <a className={styles.iconButton} href="#" aria-label="Wishlist">
              <Heart aria-hidden="true" />
            </a>
            <a className={styles.iconButton} href="#" aria-label="Shopping bag">
              <ShoppingBag aria-hidden="true" />
            </a>
            <a className={styles.iconButton} href="#" aria-label="Account">
              <CircleUserRound aria-hidden="true" />
            </a>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
