import React from "react";
import styles from "./Header.module.css";
import { PhoneCall } from "lucide-react";

const Header = () => {
  return (
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
  );
};

export default Header;
