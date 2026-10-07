import { LoaderProvider } from '../../shared/LoadingOverlay.jsx';
import {lazy,Suspense} from 'react';
import Loader from './components/Loader';
import { Link, Navigate, Route, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
const Dashboard=lazy(()=>import("./dashboard/Dashboard"));
const ProductDashboard=lazy(()=>import("./dashboard/ProductDashboard"));
const ProfileDetails=lazy(()=>import("./pages/ProfileDetails"));
const Profile=lazy(()=>import("./pages/Profile"));
const Logout=lazy(()=>import("./pages/Logout"));
const EditProduct=lazy(()=>import("./pages/EditProduct"));
const ProductDetails=lazy(()=>import("./pages/ProductDetails"));
const ProductVariants=lazy(()=>import("./pages/ProductVariants"));
const AddProduct=lazy(()=>import("./pages/AddProduct"));
const OrderDetails=lazy(()=>import("./pages/OrderDetails"));
const Commerce=lazy(()=>import("./pages/Commerce"));
const Categories=lazy(()=>import("./pages/Categories"));
const ResourceDetails=lazy(()=>import("./pages/ResourceDetails"));
const ResourceEdit=lazy(()=>import("./pages/ResourceEdit"));
const Users=lazy(()=>import("./pages/Users"));

export default function App() {
  return (
    <LoaderProvider className="admin"><Suspense fallback={<Loader label="Loading page"/>}><Routes>
      <Route element={<AdminRoute />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/product" element={<ProductDashboard />} />
        <Route path="/product/add" element={<AddProduct />} />
        <Route path="/product/:id/variants/add" element={<ProductVariants key="add" mode="add"/>}/>
        <Route path="/product/:id/variants/:variantId/edit" element={<ProductVariants key="edit" mode="edit"/>}/>
        <Route path="/product/:id/variants/:variantId" element={<ProductVariants key="view" mode="view"/>}/>
        <Route path="/product/:id/variants" element={<ProductVariants />} />
        <Route path="/product/:id/edit" element={<EditProduct />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/categories/add" element={<ResourceEdit key="categories-add" mode="add" kind="categories"/>}/>
        <Route path="/categories/:id" element={<ResourceDetails key="categories" kind="categories"/>}/>
        <Route path="/coupons/add" element={<ResourceEdit key="coupons-add" mode="add" kind="coupons"/>}/>
        <Route path="/coupons/:id" element={<ResourceDetails key="coupons" kind="coupons"/>}/>
        <Route path="/users/add" element={<ResourceEdit key="users-add" mode="add" kind="users"/>}/>
        <Route path="/users/:id" element={<ResourceDetails key="users" kind="users"/>}/>
        <Route path="/categories/:id/edit" element={<ResourceEdit key="categories" kind="categories"/>}/>
        <Route path="/coupons/:id/edit" element={<ResourceEdit key="coupons" kind="coupons"/>}/>
        <Route path="/users/:id/edit" element={<ResourceEdit key="users" kind="users"/>}/>
        <Route path="/orders/:id/edit" element={<ResourceEdit key="orders" kind="orders"/>}/>
        <Route path="/orders/:id" element={<OrderDetails/>}/>
        <Route path="/orders" element={<Commerce key="orders" kind="orders"/>}/>
        <Route path="/coupons" element={<Commerce key="coupons" kind="coupons"/>}/>
        <Route path="/categories" element={<Categories/>}/>
        <Route path="/users" element={<Users />} />
        <Route path="/profile" element={<ProfileDetails />} />
        <Route path="/profile/edit" element={<Profile />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={
          <main className="grid min-h-dvh place-content-center gap-4 text-center">
            <h1 className="text-2xl font-bold">Page not found</h1>
            <Link to="/dashboard" className="text-blue-600 underline">Back to dashboard</Link>
          </main>
        } />
      </Route>
    </Routes></Suspense></LoaderProvider>
  );
}
