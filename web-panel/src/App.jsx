import { Link, Navigate, Route, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import Dashboard from "./dashboard/Dashboard";
import ProductDashboard from "./dashboard/ProductDashboard";
import Profile from "./pages/Profile";
import Logout from "./pages/Logout";
import EditProduct from "./pages/EditProduct";
import ProductDetails from "./pages/ProductDetails";
import AddProduct from "./pages/AddProduct";
import Commerce from "./pages/Commerce";
import Users from "./pages/Users";

export default function App() {
  return (
    <Routes>
      <Route element={<AdminRoute />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/product" element={<ProductDashboard />} />
        <Route path="/product/add" element={<AddProduct />} />
        <Route path="/product/:id/edit" element={<EditProduct />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/orders" element={<Commerce key="orders" kind="orders"/>}/>
        <Route path="/coupons" element={<Commerce key="coupons" kind="coupons"/>}/>
        <Route path="/users" element={<Users />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={
          <main className="grid min-h-dvh place-content-center gap-4 text-center">
            <h1 className="text-2xl font-bold">Page not found</h1>
            <Link to="/dashboard" className="text-blue-600 underline">Back to dashboard</Link>
          </main>
        } />
      </Route>
    </Routes>
  );
}
