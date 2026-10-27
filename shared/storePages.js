// Register storefront pages here. Static entries also populate the admin SEO table.
export const storePages = [
  {
    "path": "/",
    "label": "Home",
    "title": "Eyeglasses, Sunglasses & Frames",
    "description": "Explore eyeglasses, sunglasses and frames. Find your favorite shape, color and size at Lenskart Clone.",
    "noindex": false,
    "layout": "store",
    "protected": false,
    "component": "Home"
  },
  {
    "path": "/collection",
    "label": "Collection",
    "title": "Shop Eyewear",
    "description": "Browse our eyewear collection and filter frames by brand, shape, color and size.",
    "noindex": false,
    "layout": "store",
    "protected": false,
    "component": "Collection"
  },
  {
    "path": "/eyeglasses",
    "label": "Eyeglasses",
    "title": "Shop Eyeglasses",
    "description": "Explore eyeglasses and compare frame styles, sizes and colors.",
    "noindex": false,
    "layout": "store",
    "protected": false,
    "component": "Collection"
  },
  {
    "path": "/wishlist",
    "label": "Wishlist",
    "title": "Your Wishlist",
    "description": "View and shop your saved eyewear.",
    "noindex": true,
    "layout": "store",
    "protected": false,
    "component": "Wishlist"
  },
  {
    "path": "/cart",
    "label": "Cart",
    "title": "Shopping Cart",
    "description": "Review your eyewear, selected options and cart total.",
    "noindex": true,
    "layout": "store",
    "protected": false,
    "component": "Cart"
  },
  {
    "path": "/checkout",
    "label": "Checkout",
    "title": "Checkout",
    "description": "Choose your delivery address and complete your order.",
    "noindex": true,
    "layout": "store",
    "protected": true,
    "component": "Checkout"
  },
  {
    "path": "/profile",
    "label": "Account",
    "title": "Your Account",
    "description": "Manage your profile and view your order history.",
    "noindex": true,
    "layout": "store",
    "protected": true,
    "component": "Profile"
  },
  {
    "path": "/login",
    "label": "Sign in",
    "title": "Sign In",
    "description": "Sign in to manage your account and eyewear orders.",
    "noindex": true,
    "layout": "auth",
    "protected": false,
    "component": "Login"
  },
  {
    "path": "/register",
    "label": "Registration",
    "title": "Create an Account",
    "description": "Create an account to save your favorites and place orders.",
    "noindex": true,
    "layout": "auth",
    "protected": false,
    "component": "Register"
  },
  {
    "path": "/forgot-password",
    "label": "Forgot password",
    "title": "Forgot Password",
    "description": "Password recovery information.",
    "noindex": true,
    "layout": "auth",
    "protected": false,
    "message": "Forgot password \u2014 coming soon."
  },
  {
    "path": "/reset-password",
    "label": "Reset password",
    "title": "Reset Password",
    "description": "Password reset information.",
    "noindex": true,
    "layout": "auth",
    "protected": false,
    "message": "Reset password \u2014 coming soon."
  },
  {
    "path": "/products/:id",
    "component": "ProductDetails",
    "layout": "store"
  },
  {
    "path": "/products/:id/reviews",
    "component": "ProductReviews",
    "layout": "store"
  },
  {
    "path": "/thank-you/:id",
    "component": "ThankYou",
    "layout": "store",
    "protected": true
  },
  {
    "path": "/orders/:id/track",
    "component": "OrderTracker",
    "layout": "store",
    "protected": true
  }
];

export const editableStorePages = storePages.filter(page => !page.path.includes(':'));
