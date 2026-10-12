# Project API reference

This inventory covers all HTTP API routes currently defined in the backend, including the routes used by the customer frontend and admin web panel. Paths below include `/api`; `:id` and `:variantId` are placeholders for database IDs unless stated otherwise.

## Base URL and authentication

- Local backend: `http://localhost:5001/api`.
- Production: `<current website origin>/api`.
- Both browser apps can override the base URL using `VITE_API_URL`.
- Authentication uses the `store.sid` session cookie with a seven-day lifetime. MongoDB session expiry follows the cookie expiry. Browser requests send `credentials: 'include'`; no bearer token is required.
- **Public** means no login required, **Signed in** requires a session, and **Admin** also requires the `admin` role.
- Send JSON with `Content-Type: application/json`, except for the binary image-upload endpoint.
- Error responses include `message`; successful response structures depend on the endpoint.

## Health, authentication and account

| Method | Endpoint | Access | Purpose / input |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | Server/database health. Also available at `/` outside the API prefix. |
| POST | `/api/auth/register` | Public | Register a customer: `name`, `email`, `password`, `confirmPassword`. Rate-limited. |
| POST | `/api/auth/login` | Public | Log in: `email`, `password`. Creates a session; rate-limited. |
| GET | `/api/auth/me` | Signed in | Get the current account. |
| POST | `/api/auth/logout` | Public | Destroy the session and clear its cookie. |
| GET | `/api/auth/admin-check` | Admin | Test administrator access; defined as a permission-check utility. |
| PATCH | `/api/account/profile` | Signed in | Update own profile: `name`, `email` are required. |
| GET | `/api/account/orders` | Signed in | Own order history: `page` defaults to 1; 10 per page, with `hasMore`. |

## Storefront catalog and checkout

| Method | Endpoint | Access | Purpose / input |
| --- | --- | --- | --- |
| GET | `/api/categories` | Public | Active categories and eligible children, ordered for display. |
| GET | `/api/products` | Public | Active eyeglasses by default. `all=1` includes all active product types; `ids=id1,id2` retrieves up to 50 valid product IDs. |
| GET | `/api/products/navigation` | Public | Product navigation data: names, brands and shapes. |
| GET | `/api/products/:id` | Public | Active product details, accepting a product slug or ObjectId. |
| POST | `/api/coupons/validate` | Public | Validate `code` against `items`; returns normalized code, percentage, discount, subtotal and total. |
| POST | `/api/orders` | Signed in | Create an order: `items`, `paymentMethod`, `couponCode`, `shipping`, optional `billing`, `requestId`. Only `paymentMethod: "cod"` is supported. |
| GET | `/api/orders/:id` | Signed in | Get an order receipt belonging to the current customer. |

Cart items use `{ id, quantity, options: { color, size, type }, variantId? }`. Prices and discounts are calculated by the backend. Shipping requires `name`, `phone`, `email`, `address`, `city`, `state`, `pincode`; `landmark` is optional. Billing defaults to shipping. `requestId` is a 10–100 character identifier containing letters, digits, underscores or hyphens, used to avoid duplicate orders on retries.

The checkout page calls `POST /api/orders`; its shared coupon component calls `POST /api/coupons/validate`.

## Admin products, images and variants

All endpoints in this section require **Admin** access.

| Method | Endpoint | Purpose / input |
| --- | --- | --- |
| GET | `/api/admin/products` | List all products, including inactive products. |
| GET | `/api/admin/products/:id` | Product details by ObjectId. |
| POST | `/api/admin/products` | Create a product using the editable fields below. |
| PATCH | `/api/admin/products/:id` | Update supplied editable product fields. |
| DELETE | `/api/admin/products/:id` | Delete a product, subject to backend checks. |
| POST | `/api/admin/products/images` | Upload raw JPEG, PNG or WebP bytes, maximum 4 MB. Use the image MIME type as `Content-Type`, not multipart FormData. Returns `image` (local asset path or hosted Blob URL). |
| GET | `/api/admin/products/:id/variants` | List a product's variants. |
| POST | `/api/admin/products/:id/variants` | Create a size/color variant. |
| PATCH | `/api/admin/products/:id/variants/:variantId` | Update a variant. |
| DELETE | `/api/admin/products/:id/variants/:variantId` | Delete an unreferenced variant. Variants used in orders must be made inactive instead. |

Editable product fields: `slug`, `categoryIds`, `subcategoryIds`, `categoryId`, `subcategoryId`, `faqs`, `reviews`, `highlightImages`, `tryOnImage`, `subtitle`, `lensTypes`, `offerTitle`, `offerText`, `deliveryInformation`, `assurances`, `material`, `hinge`, `temple`, `nosepad`, `description`, `features`, `sku`, `name`, `image`, `images`, `category`, `productType`, `shape`, `brand`, `price`, `originalPrice`, `color`, `size`, `gender`, `stock`, `status`, `powered`.

Editable variant fields: `size`, `color`, `price`, `originalPrice`, `stock`, `images`, `tryOnImage`, `status`.

## Admin categories and users

All endpoints in this section require **Admin** access.

| Method | Endpoint | Purpose / input |
| --- | --- | --- |
| GET | `/api/admin/categories` | List all categories and children. |
| POST | `/api/admin/categories` | Create a category: `name`, optional `slug`, `parent`, `image`, `kind`, `sortOrder`, `active`. |
| PATCH | `/api/admin/categories/:id` | Update a category; `name` is required and its parent cannot change after creation. |
| GET | `/api/users` | List users: `page`, `limit`, `search`, `status`, `sort`. |
| GET | `/api/users/:id` | Account details, excluding credentials. |
| POST | `/api/users` | Create an account: `name`, `email`, `password`, optional `phone`, `status`, `role`. |
| PATCH | `/api/users/:id` | Update allowed account fields; see the user controller for validation and self-protection rules. |
| DELETE | `/api/users/:id` | Delete another account; self-deletion is blocked. |

User pagination defaults to page 1 and limit 20 (maximum limit 100). Sort values: `newest`, `oldest`, `name-asc`, `name-desc`. Status values: `active`, `inactive`, or empty for all.

## Admin coupons, orders and dashboard

All endpoints in this section require **Admin** access.

| Method | Endpoint | Purpose / input |
| --- | --- | --- |
| GET | `/api/admin/coupons` | List coupons: `page`, `search`; 20 per page. |
| GET | `/api/admin/coupons/:id` | Coupon details. |
| POST | `/api/admin/coupons` | Create a coupon: `code`, `type`, `value`, `minimum`, `expiresAt`, `active`. |
| PATCH | `/api/admin/coupons/:id` | Update supplied coupon fields. |
| GET | `/api/admin/orders` | List orders: `page`, `search`, optional `status`; 20 per page. |
| GET | `/api/admin/orders/:id` | Full order details, including customer information. |
| PATCH | `/api/admin/orders/:id` | Update `status`: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`. |
| GET | `/api/admin/dashboard` | Metrics: `days` (7, 30 or 90), `recentPage` (defaults to 1, five recent orders per page). Uses Asia/Kolkata calendar days. |

Order status cannot move backwards; delivered/cancelled orders cannot change. Cancellation restores inventory. Coupon types are `percentage` and `fixed`.

## External services and static resources

These are resources used by the browser, separate from the project's JSON API:

| Resource | Usage |
| --- | --- |
| `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task` | Face-landmark model downloaded when virtual try-on starts. |
| `/try-on/wasm/*` | Locally served MediaPipe runtime files. |
| `/assets/products/*` | Static product images served by the standalone backend and copied into hosted builds. Hosted uploads may use Vercel Blob URLs. |
| `https://i.pravatar.cc/100?img=12` | Placeholder account avatar. |
| `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap` | Web font stylesheet. |

Legacy, unmounted frontend dashboard files also reference Unsplash placeholder photos. MongoDB and Vercel Blob are backend service integrations, not additional browser-facing API routes. Cart and wishlist use browser storage; no dedicated cart/wishlist API exists. Online payment and password reset are not connected.

## Source locations

- Route mounting and health: `backend/src/server.js`.
- Route definitions: `backend/src/routes/`.
- Request validation and responses: `backend/src/controllers/`, with commerce/category/variant handlers also in their route files.
- Customer API client: `frontend/src/api/api.js`.
- Admin API client: `web-panel/src/api.js`.
- Shared fetch/session handling: `shared/requestClient.js`.
- Database field details and setup: [backend guide](backend/README.md).

Update this inventory when adding, removing or changing API routes.
