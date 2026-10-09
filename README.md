# Lenskart Clone

An eyewear store with a customer-facing React app, a separate React administration panel, and an Express/MongoDB API. Each application directory is an independent npm project; the root npm scripts manage documentation only.

## Project guides

- [Backend](backend/README.md): server setup, every database field, API endpoints, authentication, scripts, and file responsibilities.
- [Frontend](frontend/README.md): customer pages, search, product display, shopping state, billing, checkout, and UI files.
- [Web panel](web-panel/README.md): administration pages, product form fields, categories, users, coupons, orders, and live dashboard.

Commented `.env`, JavaScript, and request examples in these guides explain what each value controls. Examples are documentation, not extra application code.

## Architecture

```text
frontend (localhost:5173) ───┐
                           ├── backend (localhost:5001/api) ── MongoDB
web-panel (localhost:5174) ─┘             │
                                         └── /assets/products/* → backend/public/products/
```

Both browser apps send cookies with API requests. Login creates a MongoDB-backed session; the panel checks the same session and requires an admin role. Cart and wishlist data are stored in the customer browser, while products, categories, users, coupons, and orders are stored in MongoDB.

## Local setup

Use a modern Node.js version compatible with the installed Vite packages (Node 22.12+ is a suitable baseline), npm, and a MongoDB deployment supporting transactions. Checkout uses transactions, so a standalone MongoDB server needs a replica set. The repository was developed against MongoDB Atlas.

1. Install packages in each directory:

   ```sh
   # Run each command from the repository root.
   npm install --prefix backend
   npm install --prefix frontend
   npm install --prefix web-panel
   ```

2. Create or update each app's `.env` using the commented examples in its guide. Keep real database credentials and session secrets private. `VITE_*` values are public browser configuration.
3. Start the apps in three terminals:

   ```sh
   # Terminal 1: API and database session service.
   cd backend
   npm run dev
   ```

   ```sh
   # Terminal 2: customer store.
   cd frontend
   npm run dev
   ```

   ```sh
   # Terminal 3: administration panel.
   cd web-panel
   npm run dev
   ```

4. Open the storefront at `http://localhost:5173`, the panel at `http://localhost:5174`, and check API health at `http://localhost:5001/api/health`.

The frontend normally starts on port 5173; Vite may choose a different port if it is occupied. The panel strictly uses 5174. Keep actual browser origins aligned with backend `FRONTEND_URL` and `ADMIN_URL`.

## First data and admin access

From `backend`, run `npm run products:seed` for sample frames. Category/image setup scripts are described in the backend guide. `npm run products:dummy-images` downloads online sample photos and attaches them to the nine demo SKUs. Image source URLs are recorded in `backend/public/products/sample-image-sources.json`.

Register through the frontend. Registration always creates a customer, and there are no built-in admin credentials. Promote an account's `role` to `admin` directly in your development database for initial panel access; after that, administrators can manage accounts through the panel. Do not change passwords to plain text: the database stores `passwordHash`.

A coupon such as `SAVE10` must exist as an active percentage coupon with `value: 10` to work. Coupons are database records, not hardcoded frontend offers.

## How the store works

1. The panel saves products and category relationships through admin API routes.
2. The frontend loads active products, filters them with collection/search parameters, and opens product pages by slug or database ID.
3. A customer chooses frame options and saves items to their cart.
4. Coupon validation fetches current product prices and computes the discount on the API.
5. Cash-on-delivery checkout validates address, options, stock, and coupon eligibility, then creates an order and adjusts inventory in a transaction.
6. The panel updates order status. Delivered orders contribute to dashboard revenue; cancelled orders restore inventory.

## Verification

```sh
# API unit and route-handler tests.
npm test --prefix backend
# Frontend state tests (run from frontend).
node --test src/state/*.test.js
# Panel search tests (run from web-panel).
node --test src/search.test.js
# Browser production builds.
npm run build --prefix frontend
npm run build --prefix web-panel
# Full lint checks; existing unrelated issues may require separate cleanup.
npm run lint --prefix frontend
npm run lint --prefix web-panel
```

## Current scope

Cash on delivery is implemented. Online payment, password reset, and several promotional/navigation links are placeholders. Homepage marketing media is mostly local static content; categories and product navigation come from the API. Legacy dashboard files in `frontend/src/dashboard/` are not mounted by the customer application's current routes; the active admin panel lives in `web-panel`.

Production hosting must support browser-route fallback to `index.html`, persistent image storage, HTTPS session cookies, appropriate proxy configuration, and the correct API/CORS origins. `npm run build` builds browser assets; it does not deploy them.

Administration lists link to separate view, add and edit pages for products, variants, categories, users and coupons. Orders have view/status-edit pages and are created through customer checkout. Profile viewing and editing also use separate pages.

## Product variants

Products support multiple size/color combinations with their own images, inventory and optional prices. Save the product in the web panel, then choose **Variants** from its **Actions** column to open the separate page for adding and editing combinations, with the same image-upload gallery as the product form. The backend stores them separately in `productvariants`, linked by `productId`; storefront selections and checkout use the chosen variant. See the application guides for every field and endpoint.

<!-- AUTO-GENERATED:START -->
## Generated application summary

| Application | Source files | Guide |
| --- | --- | --- |
| backend | 60 | [README](backend/README.md) |
| frontend | 91 | [README](frontend/README.md) |
| web-panel | 51 | [README](web-panel/README.md) |

Update references with `npm run docs:sync`; verify with `npm run docs:check`. Run `npm run docs:hooks` once per clone to enable commit-time synchronization. Review written field explanations whenever behavior changes.
<!-- AUTO-GENERATED:END -->

Design reference: [Lenskart](https://www.lenskart.com/) is the reference for future project UI changes, as recorded in the root `AGENTS.md`. Current desktop similar-items popup source uses 600px width, 90vw maximum width, 80vh maximum height, 16px corners, an 18px/800 heading and a scrolling item list. Shared dialogs use this width/height limit; existing user instructions remain authoritative.

## Single-project Vercel deployment

Deploy the repository root as one Vercel project: storefront `/`, panel `/admin/`, API `/api/`. Root `vercel.json` supplies installation, build, output and routing settings; choose the **Other** framework preset and Node.js **22.x**. Do not select an application subdirectory.

1. Push these changes to GitHub and import the repository into Vercel.
2. Add server environment variables `MONGODB_URI` (Atlas / replica set supporting transactions) and a strong random `SESSION_SECRET`. Set `NODE_ENV=production`.
3. Create a **public Vercel Blob store** connected to this project and its deployment environments. Supply `BLOB_READ_WRITE_TOKEN` if the store connection does not provide SDK credentials. Keep database and Blob credentials server-only.
4. Deploy. The build clears browser URL overrides and uses the current origin automatically; no `VITE_*` variables are needed. Vercel preview and production origins are allowed automatically. For a custom domain, set both `FRONTEND_URL` and `ADMIN_URL` to its exact HTTPS origin, without `/admin` or a trailing slash, and redeploy.
5. Check `/api/health`, login, `/admin/dashboard`, refreshing product/admin routes, checkout and image uploads. These checks require a live database and Blob store; a local build alone does not verify them.

`npm run build` builds both browser apps into root `dist/`, copies the panel into `dist/admin/`, and copies existing backend product images to `dist/assets/products/`. New hosted uploads use Blob URLs and are limited to **4 MB per image** to stay below Vercel's function request limit. Local standalone backend uploads still use `backend/public/products`. Existing images must be committed to the repository to be included at build time.

The root `api/index.js` awaits cached backend initialization before dispatching requests. Local `npm start --prefix backend` still starts the standalone API. Hosted secure cookies use Express proxy trust; all three apps share one origin and session cookie.
