import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Routes from "./routes.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./dashboard/Dashboard.jsx";
import ProductDashboard from "./dashboard/ProductDashboard.jsx";

const route = createBrowserRouter([
  {
    path: "/",
    element: <Routes />,
    errorElement: (
      <div className="flex justify-center items-center h-screen">
        <img src="/404_not_found.gif" alt="Not found" />
      </div>
    ),
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "product",
        element: <ProductDashboard />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={route} />
  </StrictMode>,
);
