# Backend

Express 5 API using Mongoose, MongoDB, bcrypt password hashes, cookie sessions, and MongoDB transaction-based checkout. [Project overview](../README.md) · [Frontend](../frontend/README.md) · [Web panel](../web-panel/README.md)

## Setup and configuration

Run commands from `backend`:

```sh
npm install
npm run dev   # nodemon starts src/server.js and watches server changes.
npm start     # Start the API without nodemon.
npm test      # Run all *.test.js files through Node's built-in test runner.
```

```dotenv
# backend/.env — illustrative values; replace the placeholders locally.
MONGODB_URI=mongodb://127.0.0.1:27017/lenskart?replicaSet=rs0
# MongoDB database; transactions require a replica set or Atlas.
SESSION_SECRET=replace-with-a-long-random-secret
# Signs session cookies; required before the API can start.
PORT=5001
# API listener port, default 5001.
FRONTEND_URL=http://localhost:5173
# Allowed customer browser origin (origin only, without /api or trailing slash).
ADMIN_URL=http://localhost:5174
# Allowed panel browser origin.
NODE_ENV=development
# production enables the Secure cookie flag; production requires HTTPS.
```

`src/server.js` connects MongoDB, initializes user IDs and indexes, configures CORS and request-origin checks, creates the session store, mounts routes, serves images, and handles errors. `src/config/db.js` checks `MONGODB_URI` and connects with a 10-second server-selection timeout. JSON requests are limited to 512 KB; image uploads accept JPEG, PNG, or WebP up to 4 MB each.

## Authentication and identifiers

- `store.sid`: browser session cookie; HTTP-only, SameSite=Lax, and a 24-hour lifetime. Both apps use `credentials: 'include'`.
- `req.session.userId`: MongoDB account `_id` saved after login; it is not the display `userId` number.
- `requireAuth`: resolves the current account and blocks unauthenticated/disabled accounts.
- `requireRole('admin')`: protects all administration operations.
- `_id`: MongoDB ObjectId used for references and mutation URLs.
- `userId` / `orderId`: sequential display numbers allocated by atomic counters.
- Product/category `slug`: readable unique URL identifier. Products can also be opened by ObjectId.
- Registration ignores requested roles and creates a customer. Administrators cannot delete themselves or remove their own admin role through the user API.

## Database field reference

Mongoose adds `_id`, `createdAt`, and `updatedAt` to timestamped models. Array subdocuments also receive their own `_id` by default. Fields described as server-managed should not be supplied as editable form data.

### Product: `src/models/Product.js`

| Field | Type / constraint | Purpose and where it appears |
| --- | --- | --- |
| `sku` | Required unique string, max 100 | Inventory identifier; shown and searched in panel product lists. |
| `slug` | Unique lowercase URL slug, max 120 | Frontend `/products/:slug`; generated from name when omitted. |
| `name` | Required string, max 150 | Product title in cards, detail pages, cart, and orders. |
| `image` | Required local asset path or HTTP(S) URL | Cover image; saving a gallery sets this to `images[0]`. |
| `images` | Up to 8 valid image paths/URLs | Gallery, thumbnails, and image popup; legacy products fall back to `image`. |
| `description` | String, max 5000 | Product Details text and product search. |
| `features` | Up to 20 strings, each max 200 | Key feature bullets and product search. |
| `subtitle` | String, max 200 | Extra title text below the product name. |
| `category` | `Classic` or `Premium` | Storefront collection tabs; different from taxonomy categories. |
| `productType` | `Eyeglasses` or `Sunglasses` | Catalog type, admin filtering, and default lens selection. |
| `categoryIds` | Up to 50 Category references | Membership in multiple root categories. |
| `subcategoryIds` | Up to 50 Category references | Membership in children belonging to selected root categories. |
| `categoryId` | Category reference or null | Legacy/single primary root; used as fallback when arrays are empty. |
| `subcategoryId` | Category reference or null | Legacy/single primary child; used as fallback. |
| `shape` | Required string, max 50 | Shape filter and display: Square, Round, Cat Eye, etc. |
| `brand` | Required string, max 100 | Brand label, filter, and search. |
| `price` | Required number, 0–1,000,000 | Current selling price per frame; server uses it for checkout. |
| `originalPrice` | Required number, 0–1,000,000 | Original/list price for strike-throughs and product discount calculations. |
| `color` | Required string, max 50 | Base frame color and default cart choice. |
| `size` | `S`, `M`, or `L` | Base frame size and default cart choice. |
| `gender` | `Men`, `Women`, or `Unisex` | Filter and product specifications. |
| `stock` | Nonnegative safe integer | Available quantity; decremented at checkout and restored on cancellation. |
| `sales` | Nonnegative safe integer | Units ordered; used for best-seller sorting and adjusted on cancellation. Server-managed in normal product editing. |
| `rating` | Number 0–5 | Card rating; detail page uses review average when reviews exist. Server-managed in normal product editing. |
| `powered` | Boolean | Powered badge and default powered lens type. |
| `status` | `active` or `inactive` | Inactive products are excluded from public catalog and checkout. |
| `addedAt` | Date | Collection sorting; separate from database timestamps. Server-managed in normal editing. |
| `lensTypes` | Up to 12 strings, each max 300 | Product lens/type detail values. Checkout separately validates recognized selected lens labels. |
| `availableColors` | Up to 12 strings, each max 300 | Legacy selectable colors (read-only compatibility). For variant products, the API derives this list from active variant records. |
| `availableSizes` | `XS`, `S`, `M`, `M/L`, `L`, `XL` array | Legacy selectable sizes (read-only compatibility). For variant products, the API derives this list from active variant records. |
| `offerTitle` | String, max 100 | Product offer heading; does not create a coupon. |
| `offerText` | String, max 300 | Offer description; promotional display only. |
| `deliveryInformation` | String, max 1000 | Product delivery information text. |
| `assurances` | Up to 12 strings, each max 300 | Service-assurance data; review actual rendered badge behavior in ProductDetails before relying on text alone. |
| `material`, `hinge`, `temple`, `nosepad` | Strings, each max 300 | Four Product Highlights descriptions. |
| `highlightImages.material`, `.hinge`, `.temple`, `.nosepad` | Valid image path/URL or empty | Images for the four highlights; frontend falls back to the cover image. |
| `faqs` | Up to 20 objects | Questions shown in the FAQ accordion. |
| `faqs[].question` | Required string, max 200 | FAQ question heading. |
| `faqs[].answer` | Required string, max 1000 | FAQ answer body. |
| `reviews` | Up to 100 objects | Review list and average score. |
| `reviews[].name` | Required string, max 100 | Reviewer display name. |
| `reviews[].rating` | Required integer, 1–5 | Review score. |
| `reviews[].text` | Required string, max 2000 | Review message. |
| `reviews[].date` | Required Date | Review date. |

```js
// Documentation example: product body sent by the admin editor.
const product = {
  sku: 'demo-square-01',           // Unique stock identifier.
  name: 'Classic Square',          // Customer-facing product title.
  productType: 'Eyeglasses',       // Store catalog type.
  category: 'Classic',            // Classic/Premium tab, not a Category ID.
  brand: 'Lenskart', shape: 'Square', color: 'Black', size: 'M', gender: 'Unisex',
  price: 1500, originalPrice: 2000,// Current and original INR prices.
  stock: 100, status: 'active',    // Inventory quantity and storefront visibility.
  images: ['/assets/products/square.webp'], // First image becomes the cover.
  categoryIds: [], subcategoryIds: [],      // Actual saved Category ObjectIds go here.
  features: ['Lightweight frame'],          // Displayed as feature text.
};
```

### Category: `src/models/Category.js`

| Field | Purpose |
| --- | --- |
| `name` | Required label, max 100; unique within the same parent (case-insensitive index). |
| `slug` | Unique readable collection query value, max 120; generated if empty. |
| `parent` | Null for a main category, root Category ObjectId for a subcategory. Only two levels; parent cannot change after creation. |
| `image` | Homepage category/shape image; valid local asset path or HTTP(S) URL, or empty. |
| `kind` | `category`, `shape`, `type`, or `collection`; describes how the entry is grouped/displayed. |
| `sortOrder` | Numeric display ordering; lower numbers sort first. |
| `active` | Public visibility. Children of inactive roots are omitted from public category responses. |

### User: `src/models/User.js`

| Field | Purpose |
| --- | --- |
| `userId` | Immutable unique sequential display number; allocated by the server. |
| `name` | Required display/account name, trimmed, max 100. |
| `email` | Required unique lowercase email, max 254 in API validation; login identifier. |
| `passwordHash` | bcrypt hash; excluded from normal queries. Never display or store plaintext passwords here. |
| `phone` | Optional contact string, max 30. |
| `status` | Account enabled (`active`) or disabled (`inactive`). |
| `role` | `customer` or `admin`; controls panel access. |

User list response `status` indicates a valid login session on an enabled account. `accountStatus` indicates the stored enabled/disabled value. Dashboard active/inactive counts use the same session definition; they do not simply count the stored status.

Authentication input fields: `name`, `email`, `password`, and `confirmPassword` for registration; `email` and `password` for login. Passwords must have at least 8 characters and at most 72 UTF-8 bytes. Customer profile editing accepts `name` and `email`; admin user editing also accepts `phone`, `role`, and `status`. Admin creation accepts an initial `password`; the existing-user edit controller does not implement password changes.

### Coupon: `src/models/Coupon.js`

| Field | Purpose |
| --- | --- |
| `code` | Unique uppercase code, 2–40 letters/numbers/underscores/hyphens; entered at checkout. |
| `type` | `percentage` or `fixed`; determines calculation method. |
| `value` | Percent (at most 100) or fixed INR amount; positive, at most 1,000,000. |
| `minimum` | Minimum selling-price subtotal needed to use the coupon; default 0. |
| `expiresAt` | Expiry Date or null for no expiry. |
| `active` | Whether validation allows use. |

```js
const coupon = {
  code: 'SAVE10',      // Customer enters this exact code; server normalizes casing.
  type: 'percentage', // Percentage discount, not a fixed amount.
  value: 10,          // 10% of the current selling-price subtotal.
  minimum: 0,         // No minimum spend.
  expiresAt: null,    // No expiry.
  active: true,       // Available for checkout validation.
};
// ₹3,000 selling subtotal → ₹300 coupon discount → ₹2,700 payable.
```

### Order: `src/models/Order.js`

| Field | Purpose |
| --- | --- |
| `orderId` | Immutable unique sequential display number; URLs still use `_id`. |
| `user` | Customer account ObjectId; used for private order history and admin customer display. |
| `requestId` | Client-generated idempotency token, 10–100 word/hyphen characters; unique per customer when present. Prevents duplicate checkout/stock decrements on retry. |
| `shipping`, `billing` | Address objects; billing can fall back to shipping. |
| Address `name`, `phone`, `email` | Delivery/billing contact; validated phone and email formats. |
| Address `address`, `city`, `state` | Street and locality; required nonempty strings up to 300 characters. |
| Address `pincode` | Required six-digit Indian postal code, first digit 1–9. |
| Address `landmark` | Optional address detail, max 300; included by the customer checkout form. |
| `paymentMethod` | `cod` or `online` in schema; order-creation API currently accepts only `cod`. |
| `subtotal` | Sum of server-side selling prices × quantity before coupon discount. |
| `discount` | Coupon reduction; capped at subtotal and rounded to two decimals. |
| `couponCode` | Applied validated code or empty string. |
| `totalAmount` | Final payable amount after coupon discount. |
| `currency` | Defaults to `INR`. |
| `status` | `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`. New COD checkout creates `confirmed`. |
| `items[].product` | Reference to the product purchased. |
| `items[].name` | Product-name snapshot for order display after catalog changes. |
| `items[].quantity` | Number purchased; checkout validates 1–1000 and available stock. |
| `items[].unitPrice` | Server-side selling-price snapshot; client prices are ignored. |
| `items[].options.color` / `.size` / `.type` | Selected frame options; validated against product colors/sizes and recognized lens labels. |

Orders can move forward through pending → confirmed → shipped → delivered, or be cancelled before completion. Delivered/cancelled orders cannot be changed again. Cancellation restores stock and decrements sales in a transaction.

### Counter: `src/models/Counter.js`

`_id` is the counter name and `value` is the last allocated integer. User/order ID services increment atomically. Counters do not use timestamps or a version key.

## API reference

Paths below include `/api`. Authentication is cookie/session-based. Responses use `message` for errors; success shapes vary by endpoint, so use their named fields rather than assuming all endpoints share one wrapper.

| Method and path | Access | Purpose / input |
| --- | --- | --- |
| `GET /health` (also `GET /`) | Public | Server and database health. Root health path is outside `/api`. |
| `POST /auth/register` | Public, rate-limited | `name`, `email`, `password`, `confirmPassword`. |
| `POST /auth/login` | Public, rate-limited | `email`, `password`; regenerates and saves session. |
| `GET /auth/me` | Signed in | Public current account data. |
| `POST /auth/logout` | Public | Destroy session and clear cookie. |
| `GET /auth/admin-check` | Admin | Permission check endpoint. |
| `PATCH /account/profile` | Signed in | Edit own `name` and `email`. |
| `GET /account/orders?page=1` | Signed in | Own history, 10 per page; `hasMore` controls next page. |
| `GET /products` | Public | Active eyeglasses by default; `all=1` includes all active types; `ids=id1,id2` fetches up to 50 valid IDs. |
| `GET /products/navigation` | Public | Active product `name`, `brand`, `shape` for homepage navigation links. |
| `GET /products/:id` | Public | Active product by slug or ObjectId. |
| `GET /categories` | Public | Active category tree entries with ordering. |
| `GET /admin/products` | Admin | All products, including inactive. |
| `GET /admin/products/:id` | Admin | Product by ObjectId. |
| `POST /admin/products` | Admin | Create editable product fields. |
| `PATCH /admin/products/:id` | Admin | Update editable product fields. |
| `DELETE /admin/products/:id` | Admin | Delete requested product. |
| `POST /admin/products/images` | Admin | Raw JPEG/PNG/WebP bytes, not multipart; returns local `image` path. |
| `GET /admin/categories` | Admin | All categories and children. |
| `POST /admin/categories` | Admin | Create category fields. |
| `PATCH /admin/categories/:id` | Admin | Update category, preserving its parent. |
| `GET /users` | Admin | `page`, `limit`, `search`, `status`, `sort`; returns public users, pagination, and counts. |
| `POST /users` | Admin | Create account with administrator-specified fields. |
| `GET /users/:id` | Admin | Public account fields for dedicated view/edit pages; credentials excluded. |
| `PATCH /users/:id` | Admin | Edit allowed user fields. |
| `DELETE /users/:id` | Admin | Delete another account. |
| `GET /admin/coupons` | Admin | `page`, `search`; search code/type before pagination, 20 per page. |
| `POST /admin/coupons` | Admin | Create coupon fields. |
| `GET /admin/coupons/:id` | Admin | Fetch a coupon directly for view/edit pages; missing records return 404. |
| `PATCH /admin/coupons/:id` | Admin | Update coupon fields or enabled state. |
| `POST /coupons/validate` | Public | `code`, `items`; reprice cart and validate eligibility. |
| `POST /orders` | Signed in | `items`, `paymentMethod`, `couponCode`, `shipping`, `billing`, `requestId`. |
| `GET /admin/orders` | Admin | `page`, `search`, optional `status`; customer/order/product search before pagination. |
| `GET /admin/orders/:id` | Admin | Full order detail by ObjectId. |
| `PATCH /admin/orders/:id` | Admin | Update `status`. |
| `GET /admin/dashboard?days=7` | Admin | Live metrics; supports 7, 30, 90 calendar days in Asia/Kolkata. |

User `sort`: `newest`, `oldest`, `name-asc`, `name-desc`. User `status`: empty/all, `active`, `inactive`. Search length is limited to 100 characters. Panel product and category filtering occurs in the browser; orders, coupons, and users filter server-side.

```js
// Coupon validation request. Prices are deliberately absent: the API looks them up.
const request = {
  code: 'SAVE10',
  items: [{ id: 'PRODUCT_OBJECT_ID', quantity: 2,
    options: { color: 'Black', size: 'M', type: 'Zero Power' } }],
};
// Response fields: code (normalized coupon), percentage (rate or null for fixed),
// discount (INR savings), subtotal (current item sum), total (payable).
```

### Dashboard response fields

`range.days/start/end/timezone` describes the selected period; end is exclusive. `stats.users/activeUsers/inactiveUsers/products` are current store totals. `stats.orders/pending/completed/revenue` are selected-period order totals; completed means delivered and revenue includes delivered orders only, grouped by order creation date. `changes` compares these order metrics to the preceding equal-length calendar period; null means there is no nonzero baseline. `sales[].date/revenue` includes zero-filled days. `statuses[].status/count` covers all five order statuses. `recentOrders[]` exposes `id`, `orderId`, `customer`, `totalAmount`, `status`, `createdAt`, at most five newest in-period orders.

## Maintenance scripts

Run from `backend`. Scripts can modify stored records; inspect their scope before using them against non-demo data. Only the user-ID backfill explicitly offers `--dry-run`.

| Script / command | Responsibility |
| --- | --- |
| `npm run products:seed` | Inserts nine demo SKUs using `$setOnInsert`; existing products are not replaced. |
| `npm run products:dummy-images` | Downloads four online photos per demo SKU, validates signatures, saves locally, updates demo galleries/highlights, and writes source manifest. Requires network access. |
| `npm run users:backfill-ids -- --dry-run` | Preview user display-ID assignment. Omit `--dry-run` to write. |
| `node scripts/seed-categories.js` | Create Eyeglasses/Sunglasses roots, Classic/Premium children, and link unassigned products. |
| `node scripts/seed-home-categories.js` | Seed homepage categories/children and copy images from frontend assets. |
| `node scripts/seed-shape-categories.js` | Derive shapes from products and add memberships beneath applicable roots. |
| `node scripts/backfill-slugs.js` | Populate/repair product and category URL slugs, create indexes, and remove an older category slug index. |
| `node scripts/backfill-category-slugs.js` | Populate category URL slugs. |
| `node scripts/backfill-order-ids.js` | Assign sequential display IDs to legacy orders. |
| `node scripts/backfill-product-details.js` | Add missing storefront detail fields with empty defaults. |
| `node scripts/fill-product-details.js` | Populate descriptive content for `frame-1`. |
| `node scripts/upgrade-product-content.js` | Add missing content structures and enrich `frame-1` options/FAQ/highlights. |

For a demo database, start with products, then seed categories and optional homepage/shape entries, then backfill category slugs if needed. Seed scripts using `findOneAndUpdate` do not run document validation hooks the same way as `save`; slug backfills handle older/seeded records. Never assume a data script is a no-op because it was previously run.

## Source responsibilities

- `controllers/productController.js`: public serialization, editable-field allowlist, product CRUD, category validation, slug resolution, and navigation data.
- `controllers/userController.js`: admin user CRUD, search/pagination, login-based status, and self-protection checks.
- `controllers/accountController.js`: own-profile editing and private paginated order history.
- `controllers/dashboardController.js`: date windows, database aggregations, comparisons, recent-order serialization.
- `routes/authRoutes.js`: registration/login/logout/session identity and rate limits.
- `routes/productRoutes.js`: public/admin product routers and binary image upload.
- `routes/categoryRoutes.js`: taxonomy reads/writes and hierarchy rules.
- `routes/userRoutes.js`, `routes/accountRoutes.js`, `routes/dashboardRoutes.js`: mount controller methods with authentication/role protection.
- `routes/commerceRoutes.js`: coupon CRUD/validation, authoritative cart quotes, address validation, order transactions, status transitions, and order/coupon search.
- `services/productImages.js`: binary signature detection and uniquely named files.
- `services/userIds.js`, `services/orderIds.js`: atomic counters and legacy backfills.
- `services/loginStatus.js`: valid unexpired sessions used for online user counts.
- `services/search.js`: validated, escaped search terms and MongoDB text-field filters.
- `utils/slugs.js`: slug normalization, validation, and collision suffixes.
- `models/`: schemas and database indexes detailed above.
- `public/products/`: served image files; `sample-image-sources.json` records downloaded-photo provenance.
- `*.test.js`: Node tests beside the implementation, covering validation, permissions, serialization, pricing, retry behavior, ID assignment, search, and dashboard calculations.
- `package.json` / lockfile: scripts and dependency metadata; `.gitignore` excludes `.env` and installed packages.

## Troubleshooting

Database startup errors: verify URI, network access, and Atlas allowlist without printing credentials. Origin errors: compare browser origin to both configured allowed origins. Missing pictures: ensure the API is running and the referenced filename exists under `public/products`. Panel 401/403: log in through the frontend with an enabled administrator account. Transaction errors at checkout: use a replica set/Atlas deployment. Zero dashboard revenue is expected when there are no delivered orders in the selected period.

## Product variants

Variants are stored in the separate MongoDB `productvariants` collection (`ProductVariant` model). `productId` references `products._id`; the API sets it from the URL and never permits reassignment. Server startup creates its indexes. A case-insensitive unique index on `(productId, size, color)` prevents duplicate combinations.

| Field | Purpose |
| --- | --- |
| `productId` | Required, immutable parent product ObjectId. |
| `size` | Required frame size: XS, S, M, M/L, L or XL. |
| `color` | Required color name, trimmed, maximum 50 characters. |
| `price` | Optional rupee price, 0–1,000,000; `null` inherits current parent price. |
| `stock` | Non-negative integer inventory for this exact combination. |
| `images` | Ordered gallery of up to 8 uploaded image paths or HTTP(S) URLs. First is cover; empty inherits parent gallery. |
| `status` | `active` variants appear to shoppers; `inactive` variants remain editable by admins. |
| `createdAt`, `updatedAt` | Automatically maintained timestamps. |

```js
// POST /api/admin/products/:productId/variants — authenticated admin only
{
  size: 'M',                  // Frame size for this combination
  color: 'Black',              // Frame color for this combination
  price: null,                // Use the current parent product price
  stock: 10,                  // Available units of Black/M only
  images: ['/assets/products/frame.jpg'], // Variant-specific gallery
  status: 'active'            // Visible and purchasable
}
```

Admin endpoints: `GET` and `POST /api/admin/products/:id/variants`; `PATCH /api/admin/products/:id/variants/:variantId`. Uploaded files use the existing `POST /api/admin/products/images` endpoint (JPG, PNG, WebP, 4 MB per image). Edits are scoped to both parent and variant. Disable a variant using `status: inactive` to preserve order references.

Creating the first variant transactionally sets `products.hasVariants = true`. Legacy products retain parent inventory until then. Public product responses include only active variants and expose their summed stock; admin responses include inactive variants too, but omit their stock from the sum. Parent stock is no longer used for purchasing a variant product.

Cart requests contain parent `id`, selected `options.size`/`options.color`, and optional `variantId` which must agree with the selection. Checkout resolves price and stock from the database, stores `orders.items.variant` alongside `orders.items.product`, and atomically decrements variant inventory. Different variants of the same parent can be separate lines; duplicate lines for the same combination are rejected. Cancellation restores the referenced variant inventory once. Parent `sales` still records units sold. Repricing, deactivation or insufficient stock is checked again when placing the order.

Variant **Price** is the selling price; **Compare Price** (`originalPrice`) controls the crossed-out price and savings. Both can be blank/null to inherit the corresponding product price. Explicit compare prices must be at least the effective selling price. Variant forms, view pages and tables show both prices. Storefront cards, product details, cart and checkout use the selected variant comparison price; legacy variants continue inheriting product values.

`npm run products:sample-variants` adds missing sample combinations to existing products (up to three colors × S/M/L). Existing variants are preserved and duplicate combinations are skipped. New variants copy product galleries and selling/compare prices. Legacy stock is distributed across combinations without increasing total stock; products already using variants receive 10 sample units per new combination. Each product is updated transactionally. Use `npm run products:sample-variants -- --dry-run` to inspect the planned changes first.

Variants can be deleted using the trash action in the product details or variant-list table, followed by a confirmation dialog. `DELETE /api/admin/products/:id/variants/:variantId` is admin-only, scoped to its parent product, and transactional. Variants referenced by any order cannot be deleted (409); make them inactive instead so cancellation can restore inventory. Deleting the final variant keeps `hasVariants` enabled and the product unavailable until new active variants are added. Uploaded images remain available to other products/variants. Successful deletion refreshes the table; errors remain in the dialog.

Dashboard recent orders accept `recentPage` (1–10,000, default 1). The database applies skip/limit for 5-row pages and the response includes `recentPagination: { page, pageSize, total }`, where total is the full selected-range order count. Statistics and charts remain for the full date range.

<!-- AUTO-GENERATED:START -->
## Generated code reference

Maintained by `npm run docs:sync` from the repository root. Edit explanations above this section; generated content is replaced automatically. Source fingerprint: `c5ea096a230f39e25d1d6ea5a7ae79749587aa98b2ce6e8d14715e3b5fb0b6b3`.

### Actual npm commands

| Script | Command |
| --- | --- |
| test | `node --test` |
| users:backfill-ids | `node scripts/backfill-user-ids.js` |
| dev | `nodemon src/server.js` |
| start | `node src/server.js` |
| products:seed | `node scripts/seed-products.js` |
| products:dummy-images | `node scripts/add-dummy-product-images.js` |
| products:sample-variants | `node scripts/add-sample-variants.js` |
| products:variant-images | `node scripts/add-color-variant-images.js` |

### Environment keys used in source

`ADMIN_URL`, `BLOB_READ_WRITE_TOKEN`, `BLOB_STORE_ID`, `FRONTEND_URL`, `MONGODB_URI`, `NODE_ENV`, `PORT`, `SESSION_SECRET`, `VERCEL`, `VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_URL`. Values are never read from .env files.

### Source inventory and exported symbols

| File | Exports |
| --- | --- |
| [scripts/add-color-variant-images.js](scripts/add-color-variant-images.js) | Internal module / styles |
| [scripts/add-dummy-product-images.js](scripts/add-dummy-product-images.js) | Internal module / styles |
| [scripts/add-sample-variants.js](scripts/add-sample-variants.js) | Internal module / styles |
| [scripts/backfill-category-slugs.js](scripts/backfill-category-slugs.js) | Internal module / styles |
| [scripts/backfill-order-ids.js](scripts/backfill-order-ids.js) | Internal module / styles |
| [scripts/backfill-product-details.js](scripts/backfill-product-details.js) | Internal module / styles |
| [scripts/backfill-slugs.js](scripts/backfill-slugs.js) | Internal module / styles |
| [scripts/backfill-user-ids.js](scripts/backfill-user-ids.js) | Internal module / styles |
| [scripts/fill-product-details.js](scripts/fill-product-details.js) | Internal module / styles |
| [scripts/seed-categories.js](scripts/seed-categories.js) | Internal module / styles |
| [scripts/seed-home-categories.js](scripts/seed-home-categories.js) | Internal module / styles |
| [scripts/seed-products.js](scripts/seed-products.js) | Internal module / styles |
| [scripts/seed-shape-categories.js](scripts/seed-shape-categories.js) | Internal module / styles |
| [scripts/upgrade-product-content.js](scripts/upgrade-product-content.js) | Internal module / styles |
| [src/config/db.js](src/config/db.js) | connectDB |
| [src/controllers/accountController.js](src/controllers/accountController.js) | listOrders, updateProfile |
| [src/controllers/accountController.test.js](src/controllers/accountController.test.js) | Internal module / styles |
| [src/controllers/dashboardController.js](src/controllers/dashboardController.js) | change, dashboardRange, dashboardSummary, salesSeries |
| [src/controllers/dashboardController.test.js](src/controllers/dashboardController.test.js) | Internal module / styles |
| [src/controllers/productController.js](src/controllers/productController.js) | adminProducts, deleteProduct, listProducts, productDetails, productFields, productNavigation, publicProduct, saveProduct, storefrontProductDetails |
| [src/controllers/productController.test.js](src/controllers/productController.test.js) | Internal module / styles |
| [src/controllers/userActions.test.js](src/controllers/userActions.test.js) | Internal module / styles |
| [src/controllers/userController.js](src/controllers/userController.js) | createUser, deleteUser, editUser, listUsers, userDetails |
| [src/controllers/userController.test.js](src/controllers/userController.test.js) | Internal module / styles |
| [src/middleware/auth.js](src/middleware/auth.js) | requireAuth, requireRole |
| [src/middleware/auth.test.js](src/middleware/auth.test.js) | Internal module / styles |
| [src/models/Category.js](src/models/Category.js) | categorySlug |
| [src/models/Counter.js](src/models/Counter.js) | default export |
| [src/models/Coupon.js](src/models/Coupon.js) | default export |
| [src/models/Order.js](src/models/Order.js) | default export |
| [src/models/Product.js](src/models/Product.js) | default export |
| [src/models/ProductVariant.js](src/models/ProductVariant.js) | default export |
| [src/models/User.js](src/models/User.js) | default export |
| [src/routes/accountRoutes.js](src/routes/accountRoutes.js) | default export |
| [src/routes/authRoutes.js](src/routes/authRoutes.js) | default export |
| [src/routes/authRoutes.test.js](src/routes/authRoutes.test.js) | Internal module / styles |
| [src/routes/categoryRoutes.js](src/routes/categoryRoutes.js) | adminCategories, publicCategories |
| [src/routes/categoryRoutes.test.js](src/routes/categoryRoutes.test.js) | Internal module / styles |
| [src/routes/commerceRoutes.js](src/routes/commerceRoutes.js) | address, commerceAdmin, commercePublic, discountAmount, quote |
| [src/routes/commerceRoutes.test.js](src/routes/commerceRoutes.test.js) | Internal module / styles |
| [src/routes/dashboardRoutes.js](src/routes/dashboardRoutes.js) | default export |
| [src/routes/productRoutes.js](src/routes/productRoutes.js) | managedProducts, publicProducts |
| [src/routes/userRoutes.js](src/routes/userRoutes.js) | default export |
| [src/routes/variantRoutes.js](src/routes/variantRoutes.js) | default export |
| [src/routes/variantRoutes.test.js](src/routes/variantRoutes.test.js) | Internal module / styles |
| [src/server.js](src/server.js) | initializeApp |
| [src/services/loginStatus.js](src/services/loginStatus.js) | loggedInUserIds |
| [src/services/loginStatus.test.js](src/services/loginStatus.test.js) | Internal module / styles |
| [src/services/orderIds.js](src/services/orderIds.js) | initializeOrderIds, nextOrderId |
| [src/services/orderIds.test.js](src/services/orderIds.test.js) | Internal module / styles |
| [src/services/productImages.js](src/services/productImages.js) | imageExtension, uploadProductImage |
| [src/services/productImages.test.js](src/services/productImages.test.js) | Internal module / styles |
| [src/services/search.js](src/services/search.js) | searchTerms, textSearch |
| [src/services/search.test.js](src/services/search.test.js) | Internal module / styles |
| [src/services/userIds.js](src/services/userIds.js) | initializeUserIds, nextUserId |
| [src/services/userIds.test.js](src/services/userIds.test.js) | Internal module / styles |
| [src/services/variants.js](src/services/variants.js) | attachVariants, publicVariant |
| [src/services/variants.test.js](src/services/variants.test.js) | Internal module / styles |
| [src/utils/slugs.js](src/utils/slugs.js) | availableSlug, slugify, validSlug |
| [src/utils/slugs.test.js](src/utils/slugs.test.js) | Internal module / styles |

### Route declarations

Paths below are local declarations; consult the API/page guide above for mounted prefixes and permissions.

| Source | Declaration | Path |
| --- | --- | --- |
| src/routes/accountRoutes.js | router.patch | `/profile` |
| src/routes/accountRoutes.js | router.get | `/orders` |
| src/routes/authRoutes.js | router.post | `/register` |
| src/routes/authRoutes.js | router.post | `/login` |
| src/routes/authRoutes.js | router.get | `/me` |
| src/routes/authRoutes.js | router.post | `/logout` |
| src/routes/authRoutes.js | router.get | `/admin-check` |
| src/routes/categoryRoutes.js | publicCategories.get | `/` |
| src/routes/categoryRoutes.js | adminCategories.get | `/` |
| src/routes/categoryRoutes.js | adminCategories.post | `/` |
| src/routes/categoryRoutes.js | adminCategories.patch | `/:id` |
| src/routes/commerceRoutes.js | commerceAdmin.get | `/coupons` |
| src/routes/commerceRoutes.js | commerceAdmin.get | `/coupons/:id` |
| src/routes/commerceRoutes.js | commerceAdmin.post | `/coupons` |
| src/routes/commerceRoutes.js | commerceAdmin.patch | `/coupons/:id` |
| src/routes/commerceRoutes.js | commerceAdmin.get | `/orders` |
| src/routes/commerceRoutes.js | commerceAdmin.get | `/orders/:id` |
| src/routes/commerceRoutes.js | commerceAdmin.patch | `/orders/:id` |
| src/routes/commerceRoutes.js | commercePublic.post | `/coupons/validate` |
| src/routes/commerceRoutes.js | commercePublic.post | `/orders` |
| src/routes/commerceRoutes.js | commercePublic.get | `/orders/:id` |
| src/routes/dashboardRoutes.js | router.get | `/` |
| src/routes/productRoutes.js | publicProducts.get | `/` |
| src/routes/productRoutes.js | publicProducts.get | `/navigation` |
| src/routes/productRoutes.js | publicProducts.get | `/:id` |
| src/routes/productRoutes.js | managedProducts.use | `/:id/variants` |
| src/routes/productRoutes.js | managedProducts.post | `/images` |
| src/routes/productRoutes.js | managedProducts.get | `/` |
| src/routes/productRoutes.js | managedProducts.get | `/:id` |
| src/routes/productRoutes.js | managedProducts.post | `/` |
| src/routes/productRoutes.js | managedProducts.patch | `/:id` |
| src/routes/productRoutes.js | managedProducts.delete | `/:id` |
| src/routes/userRoutes.js | router.get | `/` |
| src/routes/userRoutes.js | router.get | `/:id` |
| src/routes/userRoutes.js | router.post | `/` |
| src/routes/userRoutes.js | router.patch | `/:id` |
| src/routes/userRoutes.js | router.delete | `/:id` |
| src/routes/variantRoutes.js | router.get | `/` |
| src/routes/variantRoutes.js | router.post | `/` |
| src/routes/variantRoutes.js | router.patch | `/:variantId` |
| src/routes/variantRoutes.js | router.delete | `/:variantId` |
| src/server.js | req.get | `Origin` |
| src/server.js | req.get | `Sec-Fetch-Site` |
| src/server.js | app.use | `/api/categories` |
| src/server.js | app.use | `/api/admin/categories` |
| src/server.js | app.use | `/api/admin` |
| src/server.js | app.use | `/api/admin/dashboard` |
| src/server.js | app.use | `/api` |
| src/server.js | app.use | `/api/auth` |
| src/server.js | app.use | `/api/account` |
| src/server.js | app.use | `/api/users` |
| src/server.js | app.use | `/api/products` |
| src/server.js | app.use | `/api/admin/products` |
| src/server.js | app.use | `/assets/products` |
| src/services/userIds.test.js | _pres.get | `save` |
| src/services/userIds.test.js | _pres.get | `insertMany` |

### Exact model definitions

These source excerpts keep every schema field, default, validator, index, and model hook visible as code changes. Field purposes are explained in the database dictionary above.

#### Category.js

```js
// Generated directly from backend/src/models/Category.js; edit the source model, not this excerpt.
import mongoose from 'mongoose';
export const categorySlug=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'category';
const schema=new mongoose.Schema({slug:{type:String,trim:true,maxlength:120,match:/^[a-z0-9]+(?:-[a-z0-9]+)*$/},image:{type:String,default:'',maxlength:2000,validate:value=>!value||/^\/assets\/products\/[\w.-]+$/.test(value)||/^https?:\/\/[^\s]+$/.test(value)},kind:{type:String,enum:['category','shape','type','collection'],default:'category'},sortOrder:{type:Number,default:0},name:{type:String,required:true,trim:true,maxlength:100},parent:{type:mongoose.Schema.Types.ObjectId,ref:'Category',default:null},active:{type:Boolean,default:true}},{timestamps:true});
schema.index({parent:1,name:1},{unique:true,collation:{locale:'en',strength:2}});
schema.index({slug:1},{unique:true,partialFilterExpression:{slug:{$type:'string'}}});
schema.pre('validate',function(){if(!this.slug)this.slug=categorySlug(this.name);});
export default mongoose.model('Category',schema);
```

#### Counter.js

```js
// Generated directly from backend/src/models/Counter.js; edit the source model, not this excerpt.
import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  value: { type: Number, required: true, default: 0 },
}, { versionKey: false });

export default mongoose.model('Counter', counterSchema);
```

#### Coupon.js

```js
// Generated directly from backend/src/models/Coupon.js; edit the source model, not this excerpt.
import mongoose from 'mongoose';
const schema=new mongoose.Schema({
  code:{type:String,required:true,unique:true,trim:true,uppercase:true,match:/^[A-Z0-9_-]{2,40}$/},
  type:{type:String,enum:['percentage','fixed'],required:true},
  value:{type:Number,required:true,min:0.01,max:1000000},
  minimum:{type:Number,min:0,max:1000000,default:0},
  expiresAt:{type:Date,default:null},
  active:{type:Boolean,default:true},
},{timestamps:true});
schema.pre('validate',function(){if(this.type==='percentage'&&this.value>100)this.invalidate('value','Percentage must not exceed 100.');});
export default mongoose.model('Coupon',schema);
```

#### Order.js

```js
// Generated directly from backend/src/models/Order.js; edit the source model, not this excerpt.
import mongoose from 'mongoose';
import {nextOrderId} from '../services/orderIds.js';

const orderSchema = new mongoose.Schema({
  orderId:{type:Number,immutable:true,unique:true,sparse:true,min:1,validate:Number.isSafeInteger},
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  requestId: {type:String},
  shipping: {type:Object}, billing: {type:Object},
  paymentMethod: {type:String,enum:["cod","online"],default:"cod"},
  subtotal: {type:Number,min:0},discount: {type:Number,min:0,default:0},couponCode: {type:String,default:""},
  items: [{
    product: {type:mongoose.Schema.Types.ObjectId,ref:"Product"},
    variant: {type:mongoose.Schema.Types.ObjectId,ref:"ProductVariant",default:null},
    options: {color:String,size:String,type:{type:String}},
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true });

orderSchema.index({user:1,requestId:1},{unique:true,partialFilterExpression:{requestId:{$type:'string'}}});
orderSchema.index({ user: 1, createdAt: -1, _id: -1 });

orderSchema.pre('save',async function(){if(this.isNew&&!this.$locals.orderIdAssigned){this.orderId=await nextOrderId(this.$session());this.$locals.orderIdAssigned=true;}});
export default mongoose.model('Order', orderSchema);
```

#### Product.js

```js
// Generated directly from backend/src/models/Product.js; edit the source model, not this excerpt.
import mongoose from 'mongoose';
import {slugify} from '../utils/slugs.js';
const validImage = (value) => typeof value === 'string' && value.length <= 2000 && (/^\/assets\/products\/[\w.-]+$/.test(value) || /^https?:\/\/[^\s]+$/.test(value));
const textList = { type: [String], default: [], validate: (values) => values.length <= 12 && values.every((value) => value.length <= 300) };
const schema = new mongoose.Schema({
  hasVariants: { type: Boolean, default: false },
  slug:{type:String,trim:true,maxlength:120,match:/^[a-z0-9]+(?:-[a-z0-9]+)*$/},
  categoryIds: {type:[{type:mongoose.Schema.Types.ObjectId,ref:'Category'}],default:[],validate:values=>values.length<=50},
  subcategoryIds: {type:[{type:mongoose.Schema.Types.ObjectId,ref:'Category'}],default:[],validate:values=>values.length<=50},
  categoryId: {type:mongoose.Schema.Types.ObjectId,ref:'Category',default:null},
  subcategoryId: {type:mongoose.Schema.Types.ObjectId,ref:'Category',default:null},
  sku: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
  name: { type: String, required: true, trim: true, maxlength: 150 },
  image: { type: String, required: true, maxlength: 2000, validate: (value) => /^\/assets\/products\/[\w.-]+$/.test(value) || /^https?:\/\/[^\s]+$/.test(value) },
  images: { type: [String], default: [], validate: (values) => values.length <= 8 && values.every(validImage) },
  description: { type: String, trim: true, maxlength: 5000, default: '' },
  features: { type: [String], default: [], validate: (values) => values.length <= 20 && values.every((value) => value.length <= 200) },
  faqs: { type: [{ question: { type: String, required: true, maxlength: 200 }, answer: { type: String, required: true, maxlength: 1000 } }], default: [], validate: values => values.length <= 20 },
  reviews: { type: [{ name: { type: String, required: true, maxlength: 100 }, rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger }, text: { type: String, required: true, maxlength: 2000 }, date: { type: Date, required: true } }], default: [], validate: values => values.length <= 100 },
  highlightImages: { material: { type: String, default: '', validate: v => !v || validImage(v) }, hinge: { type: String, default: '', validate: v => !v || validImage(v) }, temple: { type: String, default: '', validate: v => !v || validImage(v) }, nosepad: { type: String, default: '', validate: v => !v || validImage(v) } },
  subtitle: { type: String, trim: true, maxlength: 200, default: '' },
  lensTypes: textList,
  availableColors: textList,
  availableSizes: { type: [String], enum: ['XS', 'S', 'M', 'M/L', 'L', 'XL'], default: [] },
  offerTitle: { type: String, trim: true, maxlength: 100, default: '' },
  offerText: { type: String, trim: true, maxlength: 300, default: '' },
  deliveryInformation: { type: String, trim: true, maxlength: 1000, default: '' },
  assurances: textList,
  material: { type: String, trim: true, maxlength: 300, default: '' },
  hinge: { type: String, trim: true, maxlength: 300, default: '' },
  temple: { type: String, trim: true, maxlength: 300, default: '' },
  nosepad: { type: String, trim: true, maxlength: 300, default: '' },
  category: { type: String, enum: ['Classic', 'Premium'], default: 'Classic' },
  productType: { type: String, enum: ['Eyeglasses', 'Sunglasses'], default: 'Eyeglasses' },
  shape: { type: String, required: true, maxlength: 50 },
  brand: { type: String, required: true, maxlength: 100 },
  price: { type: Number, required: true, min: 0, max: 1000000 },
  originalPrice: { type: Number, required: true, min: 0, max: 1000000 },
  color: { type: String, required: true, maxlength: 50 },
  size: { type: String, enum: ['S', 'M', 'L'], default: 'M' },
  gender: { type: String, enum: ['Men', 'Women', 'Unisex'], default: 'Unisex' },
  stock: { type: Number, min: 0, default: 0, validate: Number.isSafeInteger },
  sales: { type: Number, min: 0, default: 0, validate: Number.isSafeInteger },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  powered: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  addedAt: { type: Date, default: Date.now },
}, { timestamps: true });
schema.index({slug:1},{unique:true,partialFilterExpression:{slug:{$type:'string'}}});
schema.pre('validate',function(){if(!this.slug)this.slug=slugify(this.name);});
export default mongoose.model('Product', schema);
```

#### ProductVariant.js

```js
// Generated directly from backend/src/models/ProductVariant.js; edit the source model, not this excerpt.
import mongoose from 'mongoose';
const image = value => typeof value === 'string' && value.length <= 2000 && (/^\/assets\/products\/[\w.-]+$/.test(value) || /^https?:\/\/[^\s]+$/.test(value));
const schema = new mongoose.Schema({
  // Parent product; combinations are unique within this product.
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, immutable: true, index: true },
  size: { type: String, enum: ['XS', 'S', 'M', 'M/L', 'L', 'XL'], required: true },
  color: { type: String, trim: true, required: true, maxlength: 50 },
  // Null inherits the current parent price. Stock belongs to this combination.
  price: { type: Number, default: null, min: 0, max: 1000000 },
  // Optional comparison price for the crossed-out price and discount display.
  originalPrice: { type: Number, default: null, min: 0, max: 1000000, validate: { validator: function(value) { return value == null || this.price == null || value >= this.price; }, message: 'Compare price cannot be below price.' } },
  stock: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
  // Ordered gallery; first image is the variant cover. Empty inherits product images.
  images: { type: [String], default: [], validate: values => values.length <= 8 && values.every(image) },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });
schema.index({ productId: 1, size: 1, color: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
export default mongoose.model('ProductVariant', schema);
```

#### User.js

```js
// Generated directly from backend/src/models/User.js; edit the source model, not this excerpt.
import mongoose from 'mongoose';
import { nextUserId } from '../services/userIds.js';

const userSchema = new mongoose.Schema(
    {
        userId: {
            type: Number,
            immutable: true,
            unique: true,
            sparse: true,
            min: 1,
            validate: Number.isSafeInteger,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254,
        },

        phone: { type: String, trim: true, maxlength: 30, default: '' },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },

        passwordHash: {
            type: String,
            required: true,
            select: false,
        },

        role: {
            type: String,
            enum: ['customer', 'admin'],
            default: 'customer',
        },
    },
    { timestamps: true }
);

userSchema.pre('save', async function () {
    if (this.isNew && !this.$locals.userIdAssigned) {
        // Ignore supplied IDs: only the shared counter assigns new account IDs.
        this.userId = await nextUserId();
        this.$locals.userIdAssigned = true;
    }
});

userSchema.pre('insertMany', async function (users) {
    for (const user of users) user.userId = await nextUserId();
});

export default mongoose.model('User', userSchema);
```
<!-- AUTO-GENERATED:END -->

`npm run products:variant-images` downloads color-matched online demo galleries and validates image signatures without writing to the database. Source pages and individual image URLs are recorded in `public/products/color-variant-image-sources.json`. Some sample color combinations use a similar frame model of the same shape. Run `npm run products:variant-images -- --apply` after reviewing the files to assign galleries to every existing size of each mapped color in one transaction; it also corrects frame-9’s default grey gallery. Prices, stock, sizes, color names and status stay intact. Missing mapped products/variants stop the transaction. Applying verifies the saved galleries. Requires internet/database access.

Variant attachment uses one database query and groups rows by product ID in one pass. Serialization, active inventory totals and unique option sets are built together, avoiding a scan of all variants for each product. Products without variants remain unchanged; variant products with no rows return empty options and zero stock.

Customer order receipts: `GET /api/orders/:id` requires authentication and returns only an order belonging to the signed-in user. Missing or other-customer orders return 404. The frontend uses this endpoint for refreshable `/thank-you/:id` pages.

## Vercel hosting

This app deploys with the other applications from the repository root. See [Single-project Vercel deployment](../README.md#single-project-vercel-deployment) for configuration, storage and verification.
