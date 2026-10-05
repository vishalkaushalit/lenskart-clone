import {lazy,Suspense} from 'react';
import Loader from './components/Loader';
import { Link, Navigate, Route, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
const Dashboard=lazy(()=>import("./dashboard/Dashboard"));
const ProductDashboard=lazy(()=>import("./dashboard/ProductDashboard"));
const Profile=lazy(()=>import("./pages/Profile"));
const Logout=lazy(()=>import("./pages/Logout"));
const EditProduct=lazy(()=>import("./pages/EditProduct"));
const ProductDetails=lazy(()=>import("./pages/ProductDetails"));
const AddProduct=lazy(()=>import("./pages/AddProduct"));
const OrderDetails=lazy(()=>import("./pages/OrderDetails"));
const Commerce=lazy(()=>import("./pages/Commerce"));
const Categories=lazy(()=>import("./pages/Categories"));
const Users=lazy(()=>import("./pages/Users"));

export default function App() {
  return (
    <Suspense fallback={<Loader label="Loading page"/>}><Routes>
      <Route element={<AdminRoute />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/product" element={<ProductDashboard />} />
        <Route path="/product/add" element={<AddProduct />} />
        <Route path="/product/:id/edit" element={<EditProduct />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/orders/:id" element={<OrderDetails/>}/>
        <Route path="/orders" element={<Commerce key="orders" kind="orders"/>}/>
        <Route path="/coupons" element={<Commerce key="coupons" kind="coupons"/>}/>
        <Route path="/categories" element={<Categories/>}/>
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
    </Routes></Suspense>
  );
}
