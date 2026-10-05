import {useState} from 'react';
import CategoryProvider from './context/CategoryProvider';
import Header from "./header/Header";
import Footer from "./footer/Footer";
import { Outlet } from "react-router-dom";

function StoreLayout() {
  const [hideNavigation,setHideNavigation]=useState(false);
  return (
    <CategoryProvider>
      {!hideNavigation&&<Header />}
      <main>
        <Outlet context={{setHideNavigation}} />
      </main>
      {!hideNavigation&&<Footer />}
    </CategoryProvider>
  );
}

export default StoreLayout;
