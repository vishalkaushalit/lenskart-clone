import { LoaderProvider } from '../../shared/LoadingOverlay.jsx';
import {lazy,Suspense} from 'react';
import Loader from './components/Loader';
import { Routes, Route, Outlet } from "react-router-dom";

import StoreLayout from "./routes";
const Register=lazy(()=>import("./pages/Register"));
const Wishlist=lazy(()=>import("./pages/Wishlist"));
const Cart=lazy(()=>import("./pages/Cart"));
const ThankYou=lazy(()=>import("./pages/ThankYou"));
const Checkout=lazy(()=>import("./pages/Checkout"));
const ProductDetails=lazy(()=>import("./pages/ProductDetails"));
const Collection=lazy(()=>import("./pages/Collection"));
const Home=lazy(()=>import("./pages/Home"));
const Login=lazy(()=>import("./pages/Login"));
const Profile=lazy(()=>import("./pages/Profile"));
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <LoaderProvider className="store"><Suspense fallback={<Loader label="Loading page"/>}><Routes>
      <Route element={<StoreLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/eyeglasses" element={<Collection />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/thank-you/:id" element={<ThankYou />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<h1>Page not found</h1>} />
      </Route>
      <Route
        element={
          <main className="store-page-surface store-auth-layout">
            <Outlet />
          </main>
        }
      >
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/forgot-password"
          element={<p>Forgot password — coming soon.</p>}
        />

        <Route
          path="/reset-password"
          element={<p>Reset password — coming soon.</p>}
        />
      </Route>
    </Routes></Suspense></LoaderProvider>
  );
};

export default App;
