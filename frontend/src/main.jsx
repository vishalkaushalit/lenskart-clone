import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import StoreProvider from "./context/StoreProvider";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreProvider><AuthProvider>
        <App />
      </AuthProvider></StoreProvider>
    </BrowserRouter>
  </React.StrictMode>
);