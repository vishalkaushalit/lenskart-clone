import { Routes, Route, Outlet } from "react-router-dom";

import StoreLayout from "./routes";
import Register from "./pages/Register";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";
import Collection from "./pages/Collection";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/eyeglasses" element={<Collection />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<h1>Page not found</h1>} />
      </Route>
      <Route
        element={
          <main className="flex min-h-dvh flex-col items-center justify-center">
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
    </Routes>
  );
};

export default App;
