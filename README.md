# Lenskart Clone

An eyewear store with a customer-facing React app, a separate React administration panel, and an Express/MongoDB API. Each application directory is an independent npm project; the root npm scripts manage documentation only.

## Project guides

- [API reference](API_REFERENCE.md): all project API endpoints, access requirements, inputs, and external resources.
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

Try-on images are shared across sizes of the same color: upload and save an image on one variant, then leave the other sizes’ try-on uploads empty. A variant’s own image takes priority, followed by another variant of the same color, then the matching base product color. Colors are matched ignoring case and surrounding spaces. The variant editor previews the reused image.

## Reviews after delivery

Customers can write a 1–5 star review from **My profile → Order History** once 48 hours have elapsed since delivery of their purchased product. Submissions remain private until an admin approves them in **Reviews & Approvals** in the web-panel. Approved reviews appear under the matching product with a Verified purchase label; rejected reviews stay hidden. One review is allowed per product per order.

Product pages show the five newest reviews. **View all reviews** links to `/products/:id/reviews`, a separate public page displaying all reviews for that product newest first. Approved customer reviews show a **Verified purchase** badge beside the reviewer’s name on both pages; existing manually entered reviews do not receive this badge.

Customers can track their own orders at `/orders/:id/track`, reached from Order History, the account menu, or checkout confirmation. The tracker shows a fulfillment timeline, real recorded stage times in IST, cancellation, purchased items and delivery address. Visible active orders refresh every 30 seconds; delivered/cancelled orders stop polling.

Admins can save the carrier and waybill/tracking number in the order editor. Customers see these in Order History and the tracker. A generated waybill without carrier collection displays **Your shipment has been booked**; dispatch wording appears after collection.

Reviews are combined by product across all sizes and colors. Switching variants keeps the same review list, count and average rating. Customer submissions reference the purchased product, with one review per product per order even if multiple variants were purchased.

Product and category view/edit links use saved slugs. Admin product URLs accept both slug and legacy ObjectId, and product pages replace legacy URLs with the canonical slug. Variant view/edit URLs use generated color-size slugs (for example `black-s`); collisions after normalization include the variant ID to disambiguate. Changing variant color/size changes this generated slug; legacy variant ID links remain valid. API writes continue to use database IDs. Orders, users, coupons and other records without dedicated slugs retain ID URLs.

<!-- AUTO-GENERATED:START -->
## Generated application summary

| Application | Source files | Guide |
| --- | --- | --- |
| backend | 88 | [README](backend/README.md) |
| frontend | 118 | [README](frontend/README.md) |
| web-panel | 62 | [README](web-panel/README.md) |

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

The Vercel install command explicitly includes development dependencies for both browser apps, so their Vite build tools remain available even when `NODE_ENV=production` is configured. Backend installation remains production-only.

`npm run build` builds both browser apps into root `dist/`, copies the panel into `dist/admin/`, and copies existing backend product images to `dist/assets/products/`. New hosted uploads use Blob URLs and are limited to **4 MB per image** to stay below Vercel's function request limit. All new web-panel uploads use public Vercel Blob storage, including local development; no local filesystem fallback is allowed. Existing images must be committed to the repository to be included at build time.

The root `api/index.js` awaits cached backend initialization before dispatching requests. Local `npm start --prefix backend` still starts the standalone API. Hosted secure cookies use Express proxy trust; all three apps share one origin and session cookie.

## Live virtual try-on

Product detail pages have a **Virtual Try-On** button beneath the image gallery. In the admin product editor, upload a **Virtual try-on image**; for variant products, upload a separate matching image in each variant editor when its color differs from the base product. Same-color variants can use the product image unless they have their own override. Save the product/variant before checking the storefront. Existing products without prepared assets show an availability message and do not request camera access.

Use a tightly cropped, front-facing PNG or WebP with a transparent background and transparent lens interiors (unless the lenses are intentionally tinted). Center the bridge; avoid side views, white backgrounds and large margins. The upload field checks transparency, a landscape aspect ratio and the 4 MB limit. Use the actual product frame rather than a generic illustration.

Shoppers click **Start camera**, grant camera permission, face good light and remove existing glasses. MediaPipe detects eye landmarks and positions a 2D frame overlay with head-tilt tracking. Size and height sliders adjust the visual placement. This implementation is a visual approximation, not calibrated sizing, depth occlusion, or a full 3D model. True side views require per-frame 3D assets and a 3D renderer.

Camera access requires HTTPS (localhost is supported). Video stays in the browser; no face imagery is sent to the API or stored. The model downloads from Google's MediaPipe model storage on start, so an internet connection is required. Closing the dialog, stopping the camera, leaving the page or hiding the tab releases the stream. Camera permission/device and model-loading failures show retry guidance.

`frontend/scripts/prepare-try-on.mjs` copies the installed MediaPipe WASM files into generated `frontend/public/try-on/wasm/` before dev/build; these files are ignored by Git and included in the deployed static build. Run `node --test frontend/src/utils/tryOnPlacement.test.mjs` for placement and variant-isolation checks; API schema/projection tests run with `npm test --prefix backend`.

## API performance

The Vercel API region is configured as `bom1` (Mumbai) to match the MongoDB Atlas region. Redeploy after changing `vercel.json`; the build-machine region shown in logs can differ from the function runtime region. If the database moves, update the configured function region too.

Sessions reuse the Mongoose MongoDB client and its database instead of opening a second connection pool. Independent model initialization runs together. Orders/coupons fetch their count and page concurrently, sorted by creation date and `_id` for stable pagination. Compound indexes support order date sorting, order status/date filtering, and coupon date sorting. Model initialization creates missing indexes; the first startup after adding indexes can take longer. Dashboard queries no longer all wait for the online-session scan. Product details render independently of the recommendations catalog request.

Run backend tests and the application builds before deployment. Compare the same authenticated API request in DevTools before/after redeploy, separating the first request from subsequent requests. Live database query plans and latency have not been benchmarked by these code checks. Cold initialization still connects to MongoDB, verifies indexes and checks legacy user IDs; large collections or Atlas resource limits can remain bottlenecks. No shared response cache is added for account or order data.

Unused starter graphics, obsolete loader assets and unreferenced marketing media have been removed. Product/category images and virtual try-on runtime files remain because setup scripts, image libraries or stored database URLs can load them dynamically.

Generated `dist/` directories and Vite caches are disposable and ignored by Git. Run the relevant build command to recreate production bundles; development regenerates Vite caches. macOS `.DS_Store` metadata is also ignored.

Missing `/assets/products/*` files return HTTP 404 after the static filesystem check, rather than the storefront HTML fallback. If a saved image is missing, re-upload it through the hosted panel and save its record. Ensure the deployment has a connected public Vercel Blob store.

Existing local catalog images can be migrated to Blob with `npm run images:migrate-blob --prefix backend` (validation) and `npm run images:migrate-blob --prefix backend -- --apply` (upload and link database records). See the backend guide; migration checkpoints are kept locally under `output/blob-migration/`.

The existing catalog image files have been migrated to public Vercel Blob storage and removed from `backend/public/products/`. MongoDB records use Blob URLs. Frontend promotional/library assets remain local because the apps still use them. The build copies any remaining product-directory files; it does not need the migrated image copies. Local uploads use Blob when backend Blob credentials are configured. Seed/download scripts can recreate local catalog files and paths; migrate those new records before using them on Vercel.

All web-panel image uploads (product galleries, variants, categories, highlights, library selections and virtual try-on images) use the shared Blob-only endpoint. Blob credentials are required locally and on Vercel. Missing credentials or storage failures return HTTP 503; images are never saved to local disk as a fallback. Save the form after uploading to persist the returned Blob URL in MongoDB.
