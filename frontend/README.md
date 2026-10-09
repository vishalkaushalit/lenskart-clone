# Frontend — Customer Store

React 19 storefront built with Vite, React Router, Tailwind CSS, and page/component CSS. Products and categories come from the API; promotional images and videos are bundled locally. [Project overview](../README.md) · [Backend field reference](../backend/README.md) · [Web panel](../web-panel/README.md)

## Setup

Run from `frontend`:

```sh
npm install
npm run dev       # Customer development server, normally localhost:5173.
npm run build     # Production HTML/CSS/JS in dist/.
npm run preview   # Preview built files; does not start the backend.
npm run lint      # ESLint rules for JavaScript/JSX.
node --test src/state/*.test.js # Shopping, checkout, search, and link logic tests.
```

```dotenv
# frontend/.env
VITE_API_URL=http://localhost:5001/api
# API prefix, including /api. Also used to resolve root-relative image URLs.
VITE_ADMIN_URL=http://localhost:5174
# Panel destination after admin login and for admin account links.
```

These values are embedded in browser bundles. Restart Vite after editing `.env`. Default API fallback is `http://localhost:5001/api`; provide the admin URL explicitly to enable configured panel links/redirects.

## Entry points and pages

`index.html` supplies the root element. `src/main.jsx` mounts StrictMode, BrowserRouter, StoreProvider, and AuthProvider. `src/App.jsx` lazy-loads pages with a Suspense loading fallback. `src/routes.jsx` supplies the shared store header/footer, category provider, and outlet context.

| URL | Page and purpose |
| --- | --- |
| `/` | Home: carousel, API categories/shapes, promotional sections, trending media, brands, and service information. |
| `/collection`, `/eyeglasses` | Collection: API catalog, taxonomy and attribute filters, sorting, search, wishlist actions, and product galleries. |
| `/products/:id` | ProductDetails: active product by slug or ObjectId; gallery/popup, price, frame options, highlights, FAQ, reviews, and add to cart. |
| `/wishlist` | Wishlist: browser-saved product IDs resolved to current API products. |
| `/cart` | Cart: selected options, quantity controls, item deletion, original/current prices, coupon, and billing total in one card. |
| `/checkout` | Protected checkout: addresses, COD selection, review step, coupon summary, idempotent order submission, and redirect to the thank-you page. |
| `/thank-you/:id` | Protected order receipt, loaded from the signed-in customer’s saved order; supports refreshing the page. |
| `/profile` | Protected account profile and order history. |
| `/login`, `/register` | Authentication forms outside the normal store layout. |
| `/forgot-password`, `/reset-password` | Placeholder messages; reset functionality is not implemented. |
| Other URLs | Page-not-found fallback. |

`ProtectedRoute` requires a valid login for protected routes. `CustomerRoute` is an additional role-aware component in the source, but is not the guard currently mounted in App.jsx. The live administration routes are in `web-panel`; the older `src/dashboard` files are not mounted here.

## Search, filtering, and navigation fields

| Field / state | What it controls |
| --- | --- |
| URL `search` | Submitted desktop/mobile product query; retained in search inputs and result heading. |
| URL `category` | Root category slug or legacy ObjectId; maps to product root memberships. |
| URL `subcategory` | Child slug or ObjectId within the selected root. |
| URL `brand` | Exact case-insensitive brand filter. |
| URL `shape` | Exact case-insensitive frame-shape filter. |
| `catalog` | API `/products?all=1` results; includes all active product types. |
| `tab` | All, Classic, or Premium collection choice. |
| `sort` | Recommended, price-low, price-high, bestsellers, or newest. |
| `draft` | Checkbox selections before Apply. |
| `filters` | Applied Price/Gender/Shape & Style/Frame Size/Brand/Frame Color selections. |
| `ProductCard.selectedColor` | Local card color choice; variants update the card gallery, price and size. Only real available colors and counts are shown. |
| `loading`, `error`, `attempt` | Fetch status, error message, and retry counter. |

`ProductSearch` submits on Enter or the search icon. `matchesSearch` normalizes case, accents, and punctuation, then requires every word to occur in searchable product fields, in any order. It searches name, brand, shape, color, type, category, gender, SKU, subtitle, description, material, features, and lensTypes. Empty search opens all products. A new query resets collection-local filtering state. `collectionLinks.js` builds homepage links only when corresponding catalog values exist; missing matches return `#`.

```js
// Examples of customer-facing URLs; URLSearchParams encodes spaces safely.
const search = new URLSearchParams({ search: 'black square' });
// /collection?search=black+square → matches separate color and shape fields.
const taxonomy = new URLSearchParams({ category: 'eyeglasses', subcategory: 'square' });
// /collection?category=eyeglasses&subcategory=square → selected taxonomy membership.
```

## Product fields and visual responsibilities

The [complete database dictionary](../backend/README.md#database-field-reference) covers all persisted product fields. In the customer UI:

- `name`, `subtitle`, `brand`: product titles and accompanying text.
- `image` / `images`: cover, thumbnails, and popup; gallery falls back to the cover when empty.
- `price` / `originalPrice`: selling price, struck-through original price, and discount percentage.
- `shape`, `color`, `size`, `gender`, `category`, `productType`: specifications, collection tabs, and search/filter values.
- `stock`: availability and maximum quantities. `sales` and `addedAt`: best-seller/newest sort values.
- `powered`: product badge and default powered-lens option.
- `availableColors`, `availableSizes`: derived from active variants when variants exist; legacy arrays remain supported for old products. Color/size selection and inventory use the actual variants. `lensTypes` holds separate lens-detail text. Checkout validates allowed options on the API.
- `description`, `features`: descriptive content and bullet points.
- `offerTitle`, `offerText`, `deliveryInformation`, `assurances`: product offer/service fields; marketing text does not itself create discounts or delivery integrations.
- `material`, `hinge`, `temple`, `nosepad`, `highlightImages`: rotating Product Highlights text/images, falling back to the cover image when a highlight image is empty.
- `faqs[].question/answer`: accordion content.
- `reviews[].name/rating/text/date`: review display and average score. Some service/guide content remains static in ProductDetails; changing backend text does not necessarily replace every static badge.

The removed “Explore the Details” section is not rendered. Product gallery images remain accessible from the main gallery.

## Authentication and shared state

| Context field | Purpose |
| --- | --- |
| Auth `user` | Current `{id, userId, name, email, role}` returned by `/auth/me`. |
| Auth `loading`, `error` | Initial session lookup status. |
| Auth `login`, `updateProfile` | Submit login/profile changes and update the provider's internal user state. |
| Auth `logout` | Calls logout API and clears current account state. |
| Store `favorites` | Saved product ObjectId strings. |
| Store `cart` | Items containing product `id`, `quantity`, and selected `options`. |
| Store `cartCount` | Sum of item quantities, used in header/cart labels. |
| Store `couponCode` / `setCouponCode` | Entered code; preserved in sessionStorage. |
| Store `appliedCoupon` / `setAppliedCoupon` | Successful quote plus cart signature; in-memory application state. |
| `toggleFavorite`, `removeFavorite` | Add/remove saved product IDs. |
| `addToCart`, `removeFromCart`, `changeQuantity`, `clearCart` | Cart mutations and stock checks; clearing cart clears coupon state. |
| `notify` | Content-sized, white, bordered success/error notifications with 8px inner padding at the top right, 12px below the header’s visible bottom edge, aligned with the shared page gutter and updated on scroll/resize, with safe-area spacing, automatic dismissal after 1 second followed by a 260ms exit animation, and a close button. |

```js
// Browser cart shape; the API always reads current prices from MongoDB.
const cartItem = {
  id: 'PRODUCT_OBJECT_ID', // Identifies the live product, not its display SKU.
  quantity: 1,            // Number of units; increase is bounded by current stock.
  options: {
    color: 'Black',       // Selected allowed color.
    size: 'M',            // Selected allowed size.
    type: 'Zero Power',   // Selected lens choice.
  },
};
// One cart line per product ID. To add a different selection for the same
// product, remove the existing line first; current cart logic rejects mixing it.
```

Storage keys:

- localStorage `collection-favorites`: product IDs for wishlist.
- localStorage `store-cart`: cart item array.
- sessionStorage `store-coupon-code`: entered code only.
- Authentication resides in the HTTP-only backend session cookie, not localStorage.

The provider validates stored arrays, handles malformed storage, and listens for cross-tab storage updates. Product details are fetched afresh by saved IDs, so removed/unavailable products get a recoverable empty/error state.

## Billing and coupon fields

| Derived field | Calculation / display |
| --- | --- |
| `billItems[].original` | max(originalPrice, price) × quantity; original line total. |
| `billItems[].discount` | (originalPrice adjusted as above − price) × quantity; product saving. |
| `billItems[].payable` | price × quantity; current item total. |
| `originalTotal` / checkout `subtotal` | Sum of original-price line totals for bill display. |
| `discountTotal` | Sum of product savings. |
| `total` | Sum of selling-price line totals; coupon API calls this `subtotal`. |
| Coupon `code` | Normalized validated coupon label. |
| Coupon `percentage` | Actual configured rate, or null for a fixed coupon; shown beside code. |
| Coupon `discount` | API-calculated saving, displayed in green with a minus sign. |
| Coupon `subtotal` / `total` | API selling-price subtotal / final payable. |
| Coupon `signature` | JSON representation of the cart at validation time; stale coupon results stop applying when cart/options/quantity change. |
| Final payable | Selling-price `total` − current valid coupon discount. |

`CouponField` validates format, sends `/coupons/validate`, and rejects stale price results. Once applied, it hides the entry form. `CouponDiscount` displays the tag icon, code/rate, and green amount. `CouponApplied` displays the removable chip; removal clears the quote and entered code. Cart total shows original-price strike-through when there is a saving. No separate “Product discounts applied / You are saving” note is rendered.

## Checkout fields and flow

Address form field names are prefixed `delivery-` / `billing-`: `name`, `phone`, `email`, `address`, optional `landmark`, `city`, `state`, `pincode`. The prefix identifies which form section owns a value; the submitted nested object uses unprefixed keys. `sameBilling` copies delivery into billing. `paymentMethod` chooses COD/online; online remains unavailable for submission. `review` stores the first submit's address values for confirmation. Editing the form clears review. `placing` prevents repeated clicks, `requestId` stays stable across retry, and `completedOrderId` stores the successful order ID.

```js
// Payload built after the Review order step.
const checkoutRequest = {
  items: cart,             // Product IDs, quantities, selected options.
  paymentMethod: 'cod',    // Only supported payment method for order creation.
  couponCode: 'SAVE10',    // Only the currently valid applied coupon is sent.
  shipping: { name: 'Customer', phone: '9999999999', email: 'customer@example.com',
    address: 'Street 1', city: 'Delhi', state: 'Delhi', pincode: '110001' },
  billing: { /* Same address keys; delivery address if sameBilling is true. */ },
  requestId: 'generated-unique-token', // Retained if a network retry is needed.
};
```

The backend ignores client prices, verifies options/stock, and computes payable. On success, the app replaces the checkout URL with `/thank-you/:id`, shows the saved order, and clears the cart. The completed order takes precedence over the empty-cart redirect, including while the receipt page loads. The receipt loads from `GET /orders/:id`, scoped to the signed-in customer, so refreshing retains the receipt. Missing products and excess quantities block checkout until corrected.

## Styles and assets

`index.css` supplies global/Tailwind styling and the shared `.delete-button` appearance. `Collection.css`, `ProductDetails.css`, `SavedProducts.css`, `Checkout.css`, and `CouponField.css` own their respective page/feature layouts. The cart uses an aligned two-column layout on desktop, container-responsive product rows, a white single billing card, and matching card borders. Coupon styles are shared by cart and checkout.

`src/assets/images/` contains category, frame-shape, brand, hero, service, and promotional images. `src/assets/videos/` contains trending clips. `public/` serves files directly from `/`, while imported source assets are bundled by Vite. Backend product photos use `/assets/products/*` on the API host. SVG icon/logo assets are separate from product photos.

## Troubleshooting and limits

If search returns nothing, check product visibility and whether all query words match actual data. If images fail, check `VITE_API_URL` and backend asset availability. If cart totals change, refresh product data and reapply the coupon. If an admin login does not redirect, configure `VITE_ADMIN_URL`. Homepage buttons pointing to `#`, reset-password messages, and online payment are placeholders. No admin functionality is enabled by merely importing legacy dashboard components.

## Complete source file map

This map covers every JavaScript/JSX/CSS source file. Media assets are grouped by their asset directories in the guide.

| File | Responsibility |
| --- | --- |
| [`src/App.jsx`](src/App.jsx) | Route definitions, lazy page imports, loading fallback, and missing-page behavior. |
| [`src/api/api.js`](src/api/api.js) | Cookie-authenticated API requests; parses JSON and attaches HTTP status to errors. |
| [`src/assets/css/LoadingScreen.css`](src/assets/css/LoadingScreen.css) | Styles for the additional loading screen. |
| [`src/assets/js/script.js`](src/assets/js/script.js) | Legacy source script; current module imports determine use. |
| [`src/components/AccountMenu.jsx`](src/components/AccountMenu.jsx) | Signed-in/out account navigation and admin destination links. |
| [`src/components/AsideBarDashboard.jsx`](src/components/AsideBarDashboard.jsx) | Dashboard sidebar navigation and mobile presentation. Legacy customer-tree dashboard code, not mounted by current App.jsx routes. |
| [`src/components/Brands.jsx`](src/components/Brands.jsx) | Homepage brand section and collection links. |
| [`src/components/Categories.jsx`](src/components/Categories.jsx) | Public root-category tiles linking to collections. |
| [`src/components/ChartDashboard.jsx`](src/components/ChartDashboard.jsx) | Dashboard chart visuals. Legacy customer-tree dashboard code, not mounted by current App.jsx routes. |
| [`src/components/CollectionSort.jsx`](src/components/CollectionSort.jsx) | Collection sorting control. |
| [`src/components/CouponApplied.jsx`](src/components/CouponApplied.jsx) | Applied code chip and removal action. |
| [`src/components/CouponDiscount.jsx`](src/components/CouponDiscount.jsx) | Code/rate tag row and green deducted amount. |
| [`src/components/CouponField.css`](src/components/CouponField.css) | Shared coupon/billing-total/chip styling. |
| [`src/components/CouponField.jsx`](src/components/CouponField.jsx) | Coupon input/validation; hidden when a current quote is applied. |
| [`src/components/CustomerRoute.jsx`](src/components/CustomerRoute.jsx) | Additional role-aware route guard; not currently mounted in App.jsx. |
| [`src/components/DashboardHeader.jsx`](src/components/DashboardHeader.jsx) | Dashboard header/navigation and search entry. Legacy customer-tree dashboard code, not mounted by current App.jsx routes. |
| [`src/components/Exclusive.jsx`](src/components/Exclusive.jsx) | Exclusive collection promotions with available catalog links. |
| [`src/components/Eyeglasses.jsx`](src/components/Eyeglasses.jsx) | Homepage eyeglass shape section. |
| [`src/components/FreeCheckup.jsx`](src/components/FreeCheckup.jsx) | Eye-checkup promotion carousel; service links are placeholders. |
| [`src/components/GlassesModel.jsx`](src/components/GlassesModel.jsx) | Animated Three.js torus mesh demonstration; not a production frame model. |
| [`src/components/HomeSlider.jsx`](src/components/HomeSlider.jsx) | Homepage image carousel using local promotional assets. |
| [`src/components/Loader.jsx`](src/components/Loader.jsx) | Reusable loading indicator with an accessible label. |
| [`src/components/LoadingScreen.jsx`](src/components/LoadingScreen.jsx) | Additional loading-screen presentation. |
| [`src/components/LoginForm.jsx`](src/components/LoginForm.jsx) | Login fields, validation, API submission, account state, and admin redirect. |
| [`src/components/LoginImage.jsx`](src/components/LoginImage.jsx) | Authentication promotional/banner artwork. |
| [`src/components/NearbyStores.jsx`](src/components/NearbyStores.jsx) | Store/service promotional section. |
| [`src/components/Notes.jsx`](src/components/Notes.jsx) | Homepage informational/store notes. |
| [`src/components/NotificationPopup.jsx`](src/components/NotificationPopup.jsx) | Notification UI for request outcomes. |
| [`src/components/PopupMessage.jsx`](src/components/PopupMessage.jsx) | Inline error/status message. |
| [`src/components/PremiumEyewear.jsx`](src/components/PremiumEyewear.jsx) | Premium brand promotions. |
| [`src/components/ProductGallery.jsx`](src/components/ProductGallery.jsx) | Collection-card cover/gallery with selectable dots (optional thumbnail mode), without image navigation arrows. |
| [`src/components/ProductImagePopup.jsx`](src/components/ProductImagePopup.jsx) | Enlarged product images with selection and close controls. |
| [`src/components/ProductSearch.jsx`](src/components/ProductSearch.jsx) | Accessible product search form for desktop/mobile, Enter, and icon submission. |
| [`src/components/ProtectedRoute.jsx`](src/components/ProtectedRoute.jsx) | Current signed-in guard used for checkout/profile routes. |
| [`src/components/RecentOrders.jsx`](src/components/RecentOrders.jsx) | Dashboard recent-order table. Legacy customer-tree dashboard code, not mounted by current App.jsx routes. |
| [`src/components/ShapeCollections.jsx`](src/components/ShapeCollections.jsx) | Eyeglasses and sunglasses shape tiles use white image backgrounds; their section retains the storefront background. |
| [`src/components/StatDashboard.jsx`](src/components/StatDashboard.jsx) | Dashboard statistic cards. Legacy customer-tree dashboard code, not mounted by current App.jsx routes. |
| [`src/components/StoreIcon.jsx`](src/components/StoreIcon.jsx) | Header cart/wishlist icons and counts. |
| [`src/components/Sunglasses.jsx`](src/components/Sunglasses.jsx) | Homepage sunglass shape section. |
| [`src/components/Trending.jsx`](src/components/Trending.jsx) | Trending image/video media section. |
| [`src/context/AuthContext.jsx`](src/context/AuthContext.jsx) | Session lookup, login, logout, and own-profile update provider. |
| [`src/context/AuthState.js`](src/context/AuthState.js) | Auth context declaration and consumer hook. |
| [`src/context/CategoryContext.js`](src/context/CategoryContext.js) | Category context declaration and useCategories hook. |
| [`src/context/CategoryProvider.jsx`](src/context/CategoryProvider.jsx) | Public category fetching, loading/error state, and retry. |
| [`src/context/StoreContext.js`](src/context/StoreContext.js) | Shopping context declaration and consumer hook. |
| [`src/context/StoreProvider.jsx`](src/context/StoreProvider.jsx) | Persistent cart/wishlist, coupon state, cross-tab synchronization, and toasts. |
| [`src/dashboard/Dashboard.jsx`](src/dashboard/Dashboard.jsx) | Dashboard page composing statistics, charts, and recent orders. Legacy customer-tree dashboard code, not mounted by current App.jsx routes. |
| [`src/dashboard/ProductDashboard.jsx`](src/dashboard/ProductDashboard.jsx) | Product table page with search and actions. Legacy customer-tree dashboard code, not mounted by current App.jsx routes. |
| [`src/data/collection.js`](src/data/collection.js) | Filter groups and product-attribute/price matching. |
| [`src/footer/Footer.jsx`](src/footer/Footer.jsx) | Store footer, service/company/help links, and branding. |
| [`src/header/Header.jsx`](src/header/Header.jsx) | Desktop/mobile store navigation, category links, product search, cart/wishlist/account links. |
| [`src/hooks/useSavedProducts.js`](src/hooks/useSavedProducts.js) | Fetch current products for saved IDs, with abort/loading/error/retry handling. |
| [`src/index.css`](src/index.css) | Global/Tailwind styles and shared delete-button appearance. |
| [`src/main.jsx`](src/main.jsx) | React entry point and browser-router mounting. |
| [`src/pages/Cart.jsx`](src/pages/Cart.jsx) | Current cart rows and single billing card with coupon and checkout link. |
| [`src/pages/Checkout.css`](src/pages/Checkout.css) | Checkout address, payment, summary, and order-success layouts. |
| [`src/pages/Checkout.jsx`](src/pages/Checkout.jsx) | Address/payment/review form, authoritative order request, and success display. |
| [`src/pages/Collection.css`](src/pages/Collection.css) | Collection cards, sidebar filters, sorting, and mobile drawer. |
| [`src/pages/Collection.jsx`](src/pages/Collection.jsx) | Active catalog, taxonomy/attribute filters, sorting, search, and product cards. |
| [`src/pages/Home.jsx`](src/pages/Home.jsx) | Home page, promotional section composition, categories and product navigation data. |
| [`src/pages/Login.jsx`](src/pages/Login.jsx) | Login page composition. |
| [`src/pages/ProductDetails.css`](src/pages/ProductDetails.css) | Product gallery/detail, highlights, reviews, and purchase layout. |
| [`src/pages/ProductDetails.jsx`](src/pages/ProductDetails.jsx) | Product gallery, options, highlights, descriptive content, reviews, and cart action. |
| [`src/pages/Profile.jsx`](src/pages/Profile.jsx) | Customer account editing and order history. |
| [`src/pages/Register.jsx`](src/pages/Register.jsx) | Registration fields, validation, and API submission. |
| [`src/pages/SavedProducts.css`](src/pages/SavedProducts.css) | Wishlist/cart card layouts and billing styles. |
| [`src/pages/Wishlist.jsx`](src/pages/Wishlist.jsx) | Saved favorites resolved to API products and add/remove actions. |
| [`src/routes.jsx`](src/routes.jsx) | Shared header/footer/category-provider layout; outlet context can hide navigation. |
| [`src/state/checkout.js`](src/state/checkout.js) | Build checkout rows from current cart state and fetched products. |
| [`src/state/checkout.test.js`](src/state/checkout.test.js) | Node regression tests for checkout behavior. |
| [`src/state/collectionLinks.js`](src/state/collectionLinks.js) | Build available brand, product-name, and shape collection links. |
| [`src/state/collectionLinks.test.js`](src/state/collectionLinks.test.js) | Node regression tests for collectionLinks behavior. |
| [`src/state/productSearch.js`](src/state/productSearch.js) | Multiword normalized product-field search. |
| [`src/state/productSearch.test.js`](src/state/productSearch.test.js) | Node regression tests for productSearch behavior. |
| [`src/state/shopping.js`](src/state/shopping.js) | Pure cart/favorite normalization and quantity/stock logic. |
| [`src/state/shopping.test.js`](src/state/shopping.test.js) | Node regression tests for shopping behavior. |

`index.html` is the browser root document; `vite.config.js` configures React/Tailwind and the dev server; `eslint.config.js` defines lint rules; `package.json` and its lockfile describe commands and dependency versions; `.gitignore` excludes generated/install artifacts. Existing `.env` files are local configuration; do not place private credentials in Vite variables.

## Variant selection and shopping

For products with `hasVariants`, the product page builds colors from active variants and sizes from the chosen color. Switching color retains the selected size when available, otherwise selects the first size for that color. Switching size/color resets the gallery to its first image and changes price, stock and images to the selected combination. Products without variants keep their existing options.

Product detail color swatches and size buttons are 44px circles with 16px gaps between options. Size text and color labels are 12px. Each color label sits below its button with an 8px gap, and Frame Size starts 32px below the color options. Labels are outside the buttons so their height is included in the layout.

Product detail share and wishlist icons match the header icons: 24px with a 1.8 stroke width.

`--store-wishlist-coral` in `src/index.css` sets the shared coral red (`#ff5b4b`) for cart/wishlist count badges and selected wishlist hearts on collection cards, similar-product cards, and product details. Badge numbers remain white; hearts return to their original outline color when removed from the wishlist.

`--store-page-background` in `src/index.css` sets the shared pale lavender (`#f3f2ff`) page background across the storefront: home, collection, product details, wishlist, cart, checkout, profile, and authentication pages. `store-page-surface` applies it to both route layouts; page-specific backgrounds use the same variable. Cards, headers and intentional promotional section colors retain their own backgrounds.

Wishlist card typography is sized for the compact grid: 16px/600 product names, 18px/600 prices, 12px/600 View Similar text, and 16px/500 View buttons. Names, prices and View buttons use 24px line heights; View Similar uses 1.4.

`src/pages/Wishlist.css` follows the public Lenskart wishlist layout and supplied screenshot: a full-width white heading bar, inline **Your Wishlist** and live item count separated by a dot, and a lavender (`#f2f2ff`) content area. The desktop heading uses 28px/600 with a 36px line height, and the count uses 20px/500 with a 28px line height. Desktop heading padding is 24px 32px 20px; cards start in a content area with 24px 32px padding. Mobile margins and typography scale down. No nonfunctional 3D toggle is included.

Wishlist cards use compact vertical spacing: 14px above the price, 20px below it, and desktop content padding of 8px at the top and 16px at the bottom. Image sizing and grid widths stay consistent with the shared card layout.

The cart heading displays “Cart” when empty and includes the item count when products are present. The empty cart shows a Continue shopping button below “Your bag is empty”, linking to `/collection`. Wishlist/cart headings, the empty checkout state and the profile order-history empty state omit Continue shopping links.

`ScrollToTop.jsx` sits inside `BrowserRouter`, outside the lazy-page loading boundary. It resets scroll instantly before paint whenever the pathname or query changes, and sets browser scroll restoration to manual while mounted. Opening a page or another brand/category collection starts at the top rather than retaining the previous page position. Normal state changes such as wishlist actions do not reset scrolling.

Collection filters omit the Category and Subcategory dropdowns in both the desktop sidebar and mobile drawer. Category/subcategory navigation links and URL-based catalog filtering still work; attribute filters, reset and sorting remain available.

Header and footer content follow the wishlist's full-width alignment: 32px side margins on desktop/tablet and 16px below 768px. `--store-page-gutter` and `store-container` in `src/index.css` share these margins with the wishlist heading/card grid and section containers; header/footer backgrounds remain full-width.

Cart and checkout use the same full-width horizontal alignment via `--store-page-gutter`, without their former 1440px cap or independent side padding. Both start with 28px top padding and use aligned top edges for their two-column item/form and bill-summary layouts. Grid children permit shrinking to prevent long content from pushing the summary out of alignment; the layouts stack on mobile.

Checkout places the shared Apply Coupon field at the bottom of its order summary, below totals and applied-coupon details, matching the cart's bottom coupon placement.

Top Categories image tiles use white backgrounds, including the Eyeglasses tile, while retaining rounded corners and image padding.

The homepage Our Brands section displays six image tiles: Vincent Chase, Hustlr, John Jacobs, Aqualens, Lenskart Air and Hooper. Each tile links directly to `/collection?brand=...`, including before navigation data loads. Collection filtering shows matching catalog products or its existing empty state when that brand has no products. Tiles appear in three columns on desktop and two on mobile, without a duplicate text-link row.

`WishlistCard.jsx` uses a rounded white card with a large image, an X to remove the saved product, a View Similar link filtering the collection by frame shape, product name, current price, and an outlined View button linking to product details. No red tag appears. Variant products use their first active variant for the displayed image and price. The grid retains the previous card widths: four columns on desktop, three at 1100px and below, two at 767px and below, and one below 360px. Gaps are 20px on desktop and 12px on mobile; unavailable saved products retain a removal control.

`ProductCardImage.jsx` and its stylesheet provide the shared image area for collection, similar-product and wishlist cards. The area scales with card width at a 1.6 aspect ratio; the image fills it with centered `object-fit: cover` and no padding. Collection cards also omit the former top image padding. Image cropping is consistent across these cards; gallery thumbnails and the product detail gallery retain their own sizing.

`src/state/productVariants.js` resolves combinations. A null variant price inherits the product price; an empty gallery inherits product images. Unavailable combinations cannot be purchased. Wishlist entries for variant products link to the product page to choose a combination.

```js
// Cart line: parent product remains the lookup ID; variant identifies a separate line.
{
  id: 'parent-product-object-id', // Fetch shared product information
  variantId: 'variant-object-id', // Identify this size/color inventory
  quantity: 1,                   // Units of this combination
  options: { type: 'Zero Power', color: 'Black', size: 'M' }
}
```

`cartKey` in `src/state/shopping.js` uses product + variant identity to preserve separate combinations in local storage and update/remove their quantities independently. `checkoutRows` resolves each cart entry against fetched product variants, so cart, checkout and coupon calculations use the current selected price and gallery. Missing, inactive or changed combinations display as unavailable. Checkout blocks orders exceeding variant stock; the server revalidates everything before placing the order.

The collection uses `ProductCard.jsx` for the rounded reference layout: floating rating/wishlist controls, a large image gallery with selectable dots, View Similar, actual color swatches, a size badge, current/original pricing and a separate offer footer. View Similar applies the frame-shape filter, wishlist controls preserve their existing behavior, and variant color selection resolves the matching gallery and pricing.

Variant **Price** is the selling price; **Compare Price** (`originalPrice`) controls the crossed-out price and savings. Both can be blank/null to inherit the corresponding product price. Explicit compare prices must be at least the effective selling price. Variant forms, view pages and tables show both prices. Storefront cards, product details, cart and checkout use the selected variant comparison price; legacy variants continue inheriting product values.

<!-- AUTO-GENERATED:START -->
## Generated code reference

Maintained by `npm run docs:sync` from the repository root. Edit explanations above this section; generated content is replaced automatically. Source fingerprint: `80c20211c814d135a56d73ebc1c360cfc522599126940963ea9b994cf2ed43a1`.

### Actual npm commands

| Script | Command |
| --- | --- |
| dev | `vite` |
| build | `vite build` |
| lint | `eslint .` |
| preview | `vite preview` |
| prebuild | `node scripts/prepare-try-on.mjs` |
| predev | `node scripts/prepare-try-on.mjs` |

### Environment keys used in source

`PROD`, `VITE_ADMIN_URL`, `VITE_API_URL`. Values are never read from .env files.

### Source inventory and exported symbols

| File | Exports |
| --- | --- |
| [src/App.jsx](src/App.jsx) | default export |
| [src/api/api.js](src/api/api.js) | apiRequest |
| [src/api/requestClient.js](src/api/requestClient.js) | Internal module / styles |
| [src/assets/css/LoadingScreen.css](src/assets/css/LoadingScreen.css) | Internal module / styles |
| [src/assets/js/script.js](src/assets/js/script.js) | Internal module / styles |
| [src/components/AccountMenu.jsx](src/components/AccountMenu.jsx) | AccountMenu |
| [src/components/AsideBarDashboard.jsx](src/components/AsideBarDashboard.jsx) | default export |
| [src/components/Brands.jsx](src/components/Brands.jsx) | default export |
| [src/components/Categories.jsx](src/components/Categories.jsx) | Categories |
| [src/components/ChartDashboard.jsx](src/components/ChartDashboard.jsx) | default export |
| [src/components/CollectionSort.jsx](src/components/CollectionSort.jsx) | CollectionSort |
| [src/components/CouponApplied.jsx](src/components/CouponApplied.jsx) | CouponApplied |
| [src/components/CouponDiscount.jsx](src/components/CouponDiscount.jsx) | CouponDiscount |
| [src/components/CouponField.css](src/components/CouponField.css) | Internal module / styles |
| [src/components/CouponField.jsx](src/components/CouponField.jsx) | CouponField |
| [src/components/CustomerRoute.jsx](src/components/CustomerRoute.jsx) | CustomerRoute |
| [src/components/DashboardHeader.jsx](src/components/DashboardHeader.jsx) | default export |
| [src/components/Exclusive.jsx](src/components/Exclusive.jsx) | default export |
| [src/components/Eyeglasses.jsx](src/components/Eyeglasses.jsx) | Eyeglasses |
| [src/components/FreeCheckup.css](src/components/FreeCheckup.css) | Internal module / styles |
| [src/components/FreeCheckup.jsx](src/components/FreeCheckup.jsx) | default export |
| [src/components/GlassesModel.jsx](src/components/GlassesModel.jsx) | GlassesModel |
| [src/components/HomeSlider.jsx](src/components/HomeSlider.jsx) | default export |
| [src/components/Loader.jsx](src/components/Loader.jsx) | Internal module / styles |
| [src/components/LoadingScreen.jsx](src/components/LoadingScreen.jsx) | LoadingScreen |
| [src/components/LoginForm.jsx](src/components/LoginForm.jsx) | default export |
| [src/components/LoginImage.jsx](src/components/LoginImage.jsx) | default export |
| [src/components/NearbyStores.jsx](src/components/NearbyStores.jsx) | default export |
| [src/components/Notes.jsx](src/components/Notes.jsx) | default export |
| [src/components/NotificationPopup.jsx](src/components/NotificationPopup.jsx) | NotificationPopup |
| [src/components/PopupMessage.jsx](src/components/PopupMessage.jsx) | PopupMessage |
| [src/components/PremiumEyewear.jsx](src/components/PremiumEyewear.jsx) | default export |
| [src/components/ProductCard.jsx](src/components/ProductCard.jsx) | ProductCard |
| [src/components/ProductCardImage.css](src/components/ProductCardImage.css) | Internal module / styles |
| [src/components/ProductCardImage.jsx](src/components/ProductCardImage.jsx) | ProductCardImage |
| [src/components/ProductGallery.jsx](src/components/ProductGallery.jsx) | ProductGallery |
| [src/components/ProductImagePopup.jsx](src/components/ProductImagePopup.jsx) | ProductImagePopup |
| [src/components/ProductPopup.css](src/components/ProductPopup.css) | Internal module / styles |
| [src/components/ProductSearch.jsx](src/components/ProductSearch.jsx) | ProductSearch |
| [src/components/ProtectedRoute.jsx](src/components/ProtectedRoute.jsx) | ProtectedRoute |
| [src/components/RecentOrders.jsx](src/components/RecentOrders.jsx) | default export |
| [src/components/ScrollToTop.jsx](src/components/ScrollToTop.jsx) | ScrollToTop |
| [src/components/ShapeCollections.jsx](src/components/ShapeCollections.jsx) | ShapeCollections |
| [src/components/SimilarProductCard.jsx](src/components/SimilarProductCard.jsx) | SimilarProductCard |
| [src/components/SimilarProductsPopup.css](src/components/SimilarProductsPopup.css) | Internal module / styles |
| [src/components/SimilarProductsPopup.jsx](src/components/SimilarProductsPopup.jsx) | SimilarProductsPopup |
| [src/components/StatDashboard.jsx](src/components/StatDashboard.jsx) | default export |
| [src/components/StoreIcon.jsx](src/components/StoreIcon.jsx) | StoreIcon |
| [src/components/Sunglasses.jsx](src/components/Sunglasses.jsx) | Sunglasses |
| [src/components/Trending.jsx](src/components/Trending.jsx) | default export |
| [src/components/VirtualTryOn.css](src/components/VirtualTryOn.css) | Internal module / styles |
| [src/components/VirtualTryOn.jsx](src/components/VirtualTryOn.jsx) | VirtualTryOn |
| [src/components/WishlistCard.css](src/components/WishlistCard.css) | Internal module / styles |
| [src/components/WishlistCard.jsx](src/components/WishlistCard.jsx) | WishlistCard |
| [src/context/AuthContext.jsx](src/context/AuthContext.jsx) | AuthProvider |
| [src/context/AuthState.js](src/context/AuthState.js) | AuthContext, useAuth |
| [src/context/CategoryContext.js](src/context/CategoryContext.js) | CategoryContext, useCategories |
| [src/context/CategoryProvider.jsx](src/context/CategoryProvider.jsx) | CategoryProvider |
| [src/context/StoreContext.js](src/context/StoreContext.js) | StoreContext, useStore |
| [src/context/StoreProvider.jsx](src/context/StoreProvider.jsx) | StoreProvider |
| [src/dashboard/Dashboard.jsx](src/dashboard/Dashboard.jsx) | default export |
| [src/dashboard/ProductDashboard.jsx](src/dashboard/ProductDashboard.jsx) | default export |
| [src/data/collection.js](src/data/collection.js) | filterGroups, matchesFilters |
| [src/footer/Footer.jsx](src/footer/Footer.jsx) | default export |
| [src/header/Header.jsx](src/header/Header.jsx) | default export |
| [src/hooks/useSavedProducts.js](src/hooks/useSavedProducts.js) | useSavedProducts |
| [src/index.css](src/index.css) | Internal module / styles |
| [src/main.jsx](src/main.jsx) | Internal module / styles |
| [src/pages/Cart.jsx](src/pages/Cart.jsx) | Cart |
| [src/pages/Checkout.css](src/pages/Checkout.css) | Internal module / styles |
| [src/pages/Checkout.jsx](src/pages/Checkout.jsx) | Checkout |
| [src/pages/Collection.css](src/pages/Collection.css) | Internal module / styles |
| [src/pages/Collection.jsx](src/pages/Collection.jsx) | Collection |
| [src/pages/Home.jsx](src/pages/Home.jsx) | default export |
| [src/pages/Login.jsx](src/pages/Login.jsx) | default export |
| [src/pages/ProductDetails.css](src/pages/ProductDetails.css) | Internal module / styles |
| [src/pages/ProductDetails.jsx](src/pages/ProductDetails.jsx) | ProductDetails |
| [src/pages/Profile.jsx](src/pages/Profile.jsx) | Profile |
| [src/pages/Register.jsx](src/pages/Register.jsx) | Register |
| [src/pages/SavedProducts.css](src/pages/SavedProducts.css) | Internal module / styles |
| [src/pages/ThankYou.jsx](src/pages/ThankYou.jsx) | ThankYou |
| [src/pages/Wishlist.css](src/pages/Wishlist.css) | Internal module / styles |
| [src/pages/Wishlist.jsx](src/pages/Wishlist.jsx) | Wishlist |
| [src/routes.jsx](src/routes.jsx) | default export |
| [src/state/checkout.js](src/state/checkout.js) | checkoutRows |
| [src/state/checkout.test.js](src/state/checkout.test.js) | Internal module / styles |
| [src/state/collectionLinks.js](src/state/collectionLinks.js) | collectionLink |
| [src/state/collectionLinks.test.js](src/state/collectionLinks.test.js) | Internal module / styles |
| [src/state/productSearch.js](src/state/productSearch.js) | matchesSearch |
| [src/state/productSearch.test.js](src/state/productSearch.test.js) | Internal module / styles |
| [src/state/productVariants.js](src/state/productVariants.js) | resolveVariant |
| [src/state/productVariants.test.js](src/state/productVariants.test.js) | Internal module / styles |
| [src/state/shopping.js](src/state/shopping.js) | cartKey, cartQuantity, normalizeStore |
| [src/state/shopping.test.js](src/state/shopping.test.js) | Internal module / styles |
| [src/utils/tryOnPlacement.js](src/utils/tryOnPlacement.js) | tryOnPlacement |

### Route declarations

Paths below are local declarations; consult the API/page guide above for mounted prefixes and permissions.

| Source | Declaration | Path |
| --- | --- | --- |
| src/App.jsx | React Route | `/` |
| src/App.jsx | React Route | `/collection` |
| src/App.jsx | React Route | `/products/:id` |
| src/App.jsx | React Route | `/wishlist` |
| src/App.jsx | React Route | `/cart` |
| src/App.jsx | React Route | `/eyeglasses` |
| src/App.jsx | React Route | `/checkout` |
| src/App.jsx | React Route | `/thank-you/:id` |
| src/App.jsx | React Route | `/profile` |
| src/App.jsx | React Route | `*` |
| src/App.jsx | React Route | `/login` |
| src/App.jsx | React Route | `/register` |
| src/App.jsx | React Route | `/forgot-password` |
| src/App.jsx | React Route | `/reset-password` |
| src/components/ProductSearch.jsx | params.get | `search` |
| src/dashboard/ProductDashboard.jsx | params.get | `search` |
| src/pages/Collection.jsx | params.get | `search` |
| src/pages/Collection.jsx | params.get | `category` |
| src/pages/Collection.jsx | params.get | `subcategory` |
| src/pages/Collection.jsx | params.get | `search` |
| src/pages/Collection.jsx | params.get | `brand` |
| src/pages/Collection.jsx | params.get | `shape` |
| src/pages/Collection.jsx | params.get | `brand` |
| src/pages/Collection.jsx | params.get | `brand` |
| src/pages/Profile.jsx | params.get | `tab` |
<!-- AUTO-GENERATED:END -->

Collection results memoize filtering/sorting by catalog, query, selected filters, taxonomy and sort order. Available filter choices are memoized by catalog. Opening filters, editing draft filters and wishlist updates reuse the unchanged computed results.

At tablet widths (768–1023px), We Assure you stacks its three assurances vertically, with each icon beside its label and Learn More action.

Similar Products uses `SimilarProductCard`: a white image area with wishlist action, light-grey content, lens description, current/compare pricing and calculated discount, and a full-width View link. It resolves the first active variant for its gallery and pricing, keeps cards aligned, and scrolls horizontally on small screens.

Similar-product mobile typography uses an 18px semibold title/price, 16px regular lens text, 15px compare/discount text and a 16px semibold View button. Desktop Similar Products stays inside the left product column. Two equal-width cards are visible at once on desktop, with 12px gaps and horizontal scrolling for additional cards. Compact desktop cards use an 18px title, 14px lens/discount text, a 16px price/View button, 12px horizontal padding and 28px separation before pricing. The Similar Products heading inherits the same 20px size, weight and line-height as the other left-column section headings, with 24px space before cards on desktop and 18px on mobile.

Collection and similar-product card photos fill their landscape image area with centered `object-fit: cover` and no extra image padding. This removes excess white margins from square catalog photos and makes frames appear larger. Full product galleries keep their existing viewing behavior.

The storefront product page omits the positive In stock label. Unavailable products show Currently out of stock and a disabled Out of stock purchase button; inventory checks remain active.

Checkout omits the Edit cart link from the order summary.

View Similar on collection and wishlist cards opens a shared dialog on the current page. It loads active products of the same product type and shape, excludes the selected product, and supports wishlist actions, loading/error/empty states, retry, Escape and close-button dismissal, scroll locking and focus restoration. Product View links still open the selected product details.

The similar-items dialog uses stacked horizontal cards with a large image, product name, actual size badge, selling/compare prices, discount, wishlist control and a Buy link to product details. Its heading and close button remain outside the scrolling list. The first result receives a blue outline matching the reference layout.

Product popups must keep the same dimensions going forward. Both the image slider and similar-items dialog use `product-popup` from `src/components/ProductPopup.css`: 600px maximum width and 80dvh height, constrained to 90vw, with shared mobile margins. Change this shared stylesheet when adjusting product popup sizing rather than adding page-specific dimensions.

All modal popups across the storefront and web panel follow the product image slider size: 600px maximum width and 80dvh height, constrained to 90vw. `shared/Popup.css` is the single sizing source, using `product-popup` or `app-popup`; future modal popups must use these classes. Long dialog content scrolls inside. Compact toast notifications and filter drawers retain their separate interaction layouts.

Design reference: [Lenskart](https://www.lenskart.com/) is the reference for future project UI changes, as recorded in the root `AGENTS.md`. Current desktop similar-items popup source uses 600px width, 90vw maximum width, 80vh maximum height, 16px corners, an 18px/800 heading and a scrolling item list. Shared dialogs use this width/height limit; existing user instructions remain authoritative.

Similar-items popup typography: 18px/800 heading, 16px/600 product names, 16px/700 selling prices with 14px supporting text, 13px size/comparison text and 14px/600 Buy buttons. Mobile names/prices reduce to 14px and secondary text to 12–13px. Explicit line heights and wrapping keep long product names readable in the horizontal layout.

Similar-items popup photos use 30% of each horizontal card and a 140px desktop / 110px mobile media area. Images are centered with contain sizing so the complete frame remains visible without distortion.

Similar-items cards use 6px vertical / 8px horizontal padding, 6px gaps after titles and size badges, 6px before comparison prices, and 10px/8px spacing around the Buy divider to reduce card height while preserving text wrapping.

Similar-items cards have a plain white background with transparent image wrappers, removing the gray gradient behind product photos. Images retain their proportions, and shorter text spacing plus 32px Buy buttons keep the cards compact.

Popup images are enlarged by 20% within their 30% card column, preserving card and popup widths. The media wrapper clips overflow while the image remains centered.

Similar-items cards use a consistent 3:7 image-to-content column ratio on desktop and mobile, matching the supplied reference.

The product page keeps Add to cart after the FAQs in the product information column. The purchase area sticks to the bottom of the viewport until scrolling reaches its original position, then remains in the normal page layout. Out-of-stock selections retain the disabled purchase button.

The shared loading overlay uses the supplied `loader-eyewear.mp4`, stored as `../shared/loader.mp4`, and plays it silently at normal 1× speed on a continuous loop using inline video playback. The centered video replaces the CSS cube animation; loading states retain their accessible status labels.

`LoaderProvider` in `../shared/LoadingOverlay.jsx` displays the video overlay while requests are pending and reveals content immediately when loading ends, with no minimum duration. It covers content with an opaque background and makes underlying controls inert until loading ends. Overlapping loaders share one overlay.

Authentication routes use `.store-auth-layout` with a full dynamic viewport minimum height to center login and registration cards vertically. Auth card containers have a 960px maximum width and retain responsive side gutters. Taller cards expand the page and remain scrollable on smaller screens.

Registration uses compact page/card padding, field spacing and input heights to avoid excess vertical overflow on desktop. Short viewports and stacked mobile cards still scroll when their actual content exceeds the available height.

Successful admin login redirects to `/dashboard?login=success` in the web panel. The authenticated dashboard keeps the flag until the shared “Logged in successfully.” success notification has appeared after dashboard loading finishes. The login toast stays visible for three seconds; dismissing it removes the flag from the URL so refreshing the cleaned URL does not repeat it.

Wishlist cards use an 18px remove icon and 14px View button text, retaining their existing clickable areas.

Product-page FAQ and Product Details accordions share a white background in both collapsed and expanded states. A subtle separator below the FAQ section separates it from Product Details.

The closed Product Details accordion shows a bottom separator; its expanded styling is unchanged. The purchase area has no top margin.

On two-column product pages, both columns scroll normally until the shorter column reaches its bottom, then it stays sticky while the taller column continues until both bottoms align. This works whether the left or right column is taller. Each sticky offset adapts to column, header and viewport heights; columns shorter than the viewport stay below the header. Mobile retains normal stacked scrolling.

## Vercel hosting

This app deploys with the other applications from the repository root. See [Single-project Vercel deployment](../README.md#single-project-vercel-deployment) for configuration, storage and verification.

## Product virtual try-on

The product gallery has a Virtual Try-On button opening the shared-size `product-popup` dialog. Camera starts only on an explicit click. MediaPipe is dynamically imported, and inference runs at most ten times per second while the video preview renders normally. A matching transparent `tryOnImage` from the product or selected variant is anchored to eye landmarks; variants never inherit another color's image. Missing assets show an availability state. Streams, inference animation and detector resources are released on stop/unmount; hiding the tab stops the camera.

This is a 2D visual overlay with tilt, size and height adjustments. It does not measure fit or provide 3D side views. See [Live virtual try-on setup](../README.md#live-virtual-try-on) for asset preparation, browser requirements and privacy behavior. The model is fetched from Google when started; WASM is copied from the installed package before dev/build and hosted with the app.

The gallery Virtual Try-On action is centered, capped at 220px wide with a 44px minimum height, and uses the purchase button’s navy background with white text. Its styles live in `ProductDetails.css`.

The try-on popup’s camera and Back to product buttons use the same compact navy styling: up to 220px wide, at least 44px tall, centered with white text.

## Repeated API requests

`apiRequest` shares identical pending GET requests through `src/api/requestClient.js`. Concurrent components and Strict Mode effect remounts subscribe to one network request. Aborting one consumer does not interrupt others; when every consumer leaves, the underlying fetch is aborted after the immediate remount window. Completed and failed responses are not cached, so retries and later navigation request fresh data. Different paths, queries and request settings remain independent. Writes are never deduplicated and separate subsequent reads from earlier pending reads.

Run `node --test frontend/src/api/requestClient.test.mjs` to check sharing, cancellation, retries and mutation behavior. React Strict Mode remains enabled. An OPTIONS preflight followed by GET/POST is a browser CORS exchange rather than a duplicate application request.

The pending request implementation is shared with the admin panel in `shared/requestClient.js`; the frontend module re-exports it. Each browser app retains its own API base URL and body headers.

Password fields use the shared `PasswordInput` component with an eye button to show/hide the value. Passwords start hidden; the keyboard-accessible toggle preserves input validation and autocomplete and never submits the form.
