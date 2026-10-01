import Header from "./header/Header";
import Footer from "./footer/Footer";
import { Outlet } from "react-router-dom";

function routes() {
  return (
    <>
      <Outlet />
    </>
  );
}

export default routes;
