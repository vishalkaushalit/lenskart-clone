# Web Panel — Store Administration

Separate React/Vite application for enabled administrator accounts. Uses the same cookie-session API as the storefront. [Project overview](../README.md) · [Backend reference](../backend/README.md) · [Frontend](../frontend/README.md)

## Setup

Run from `web-panel`:

```sh
npm install
npm run dev       # localhost:5174, strict port: fails if occupied.
npm run build     # Production browser assets in dist/.
npm run preview   # Built preview, also strict port 5174.
npm run lint      # ESLint.
node --test src/search.test.js # Search matching and route-target tests.
```

```dotenv
# web-panel/.env
VITE_API_URL=http://localhost:5001/api
# Backend request prefix. Root-relative image paths resolve on this host.
VITE_FRONTEND_URL=http://localhost:5173
# Login/customer app destination for session redirects and account links.
```

`src/main.jsx` mounts the browser application; `src/App.jsx` lazy-loads admin pages. `AdminRoute` requests `/auth/me`, blocks non-admin accounts, redirects to the frontend login when needed, and provides `{user, updateUser}` through outlet context. `DashboardLayout` supplies the sidebar/header and responsive mobile navigation. Initial admin creation is explained in the project README; there is no default admin password.

## Pages and fields

### Dashboard (`/dashboard`)

`days` selects 7, 30, or 90 calendar days; `attempt` requests a manual refresh; `result.loading/data/error` controls spinner, rendered figures, retry, and stale-data messaging. The page calls `/admin/dashboard?days=...` and refreshes every 30 seconds, aborting obsolete requests when leaving/changing ranges.

| Data field | Dashboard use |
| --- | --- |
| `stats.users` | Total account count, including administrators. |
| `stats.activeUsers` | Enabled accounts with unexpired logged-in sessions. |
| `stats.inactiveUsers` | Remaining accounts, including logged-out or disabled accounts. |
| `stats.products` | Current product count, including inactive products. |
| `stats.orders` | Orders created within selected period. |
| `stats.pending` | Selected-period orders currently pending. |
| `stats.completed` | Selected-period orders currently delivered. |
| `stats.revenue` | INR totals of delivered orders created in the period. |
| `changes.orders/pending/completed/revenue` | Change versus preceding equal-length calendar period; null shows no baseline. |
| `sales[].date/revenue` | Daily sales line/area chart; missing days are zero-filled. |
| `statuses[].status/count` | Donut segments and legend for pending, confirmed, shipped, delivered, cancelled. |
| `recentOrders[].id/orderId` | Detail link ObjectId and visible order number. |
| `recentOrders[].customer/totalAmount/status/createdAt` | Recent-order table columns. |

Dates use Asia/Kolkata. Revenue is delivered-order value, not proof of an integrated online payment settlement. Recent orders are the newest five within the selected period. User/product counts are current totals, not historical counts filtered by the selector.

### Products (`/product`, `/product/add`, `/product/:id`, `/product/:id/edit`)

Product list fields: `catalog` is the full API catalog; `categories` provides root/child names; `categoryId`, `type`, `brand`, `status` filter rows; URL `search` combines words across name, SKU, brand, product type, shape, color, collection, gender, and status. URL `page` selects a 20-row page, reset on search change. `loading`, `failed`, `attempt` handle fetch/retry; `action` opens a product delete dialog; `notification` displays results.

ProductDetails displays gallery, price, stock, category/specifications, and edit/delete controls. AddProduct/EditProduct use the same ProductEditor, so field names are consistent. The API is responsible for validation and permission checks.

| Editor field | Purpose / conversion |
| --- | --- |
| `name`, `slug`, `subtitle` | Customer title, readable URL, and supporting title text; empty slug is generated. |
| `sku` | Required unique inventory identifier. |
| `productType` | Eyeglasses/Sunglasses catalog group. |
| `categoryIds`, `subcategoryIds` | Multiple root/child memberships; selecting a child also selects its root. Removing a root removes its children. |
| `brand`, `shape`, `color`, `size`, `gender` | Customer-facing specifications, search values, and filters. |
| `category` | Frame Range (Classic/Premium), separate from taxonomy memberships. |
| `price`, `originalPrice` | Numeric current/list prices in INR; used for bill savings. |
| `stock` | Editable for products without variants; variant products show a computed active-variant total and manage stock per variant. |
| `powered` | Powered badge/default lens selection. |
| `status` | Active/inactive storefront availability. |
| `description` | Long product description. |
| `features` | One line per feature; converted to a string array. |
| `lensTypes`, `assurances` | One value per line; converted to arrays. |
| `offerTitle`, `offerText` | Product offer display content; does not create coupon discounts. |
| `deliveryInformation` | Delivery explanatory text. |
| `material`, `hinge`, `temple`, `nosepad` | Four Product Highlights descriptions. |
| `images` | Gallery array, up to 8 images; first image is the cover. |
| `highlightImages` | Separate optional image for each highlight; upload or remove per key. |
| `faqs[].question/answer` | FAQ entries, add/remove controls, max 20. |
| `reviews[].name/rating/date/text` | Reviewer, score 1–5, date, and actual feedback; max 100. |

Gallery state retains local previews and uploaded/remote paths while editing. `chooseHighlight` handles selection for highlight images. Uploaded bytes use `/admin/products/images` with JPEG/PNG/WebP MIME types and max 5 MB; do not post a base64 JSON image. `busy` controls save state; upload state prevents saving partially uploaded images. Price and stock fields are converted to numbers; multiline entries become arrays before submission.

Server-managed fields such as `rating`, `sales`, and `addedAt` are not normal editable form inputs. Full model limits, field relationships, and legacy category compatibility are in the backend guide.

### Categories (`/categories`)

| Field | Purpose |
| --- | --- |
| `name` | Root/child label used in navigation and collection filters. |
| `slug` | Collection query slug; generated if blank. |
| `parent` | Empty for root, root ObjectId for child; immutable after creation. |
| `image` | Category/shape tile image; ImageUploadField uploads and supplies its path. |
| `kind` | Category, shape, type, or collection display classification. |
| `sortOrder` | Numeric navigation order. |
| `active` | Show/hide in public category responses. |
| `rows` / `filtered` | All category records / searched records, including parent names. |
| `edit` | Selected category or empty object for creation. |
| `busy`, `uploading` | Disable save while request/image upload is in progress. |
| URL `search`, `page` | Current header query and 20-row pagination. |

The parent list shows active roots. Taxonomy supports a root plus children, not unlimited nested levels. There is an edit action and active toggle field; no category delete endpoint is implemented.

### Users (`/users`)

| Field / control | Purpose |
| --- | --- |
| `name`, `email`, `phone` | Account/contact fields; email is normalized and unique. |
| `role` | Customer/admin permissions. |
| `status` in edit form | Enable/disable stored account. |
| `password` | Initial password when creating an account; existing-user edits do not change passwords. Server stores bcrypt hash. |
| `userId` | Sequential visible ID; allocated by API, not entered in forms. |
| List `status` / `accountStatus` | Logged-in activity vs stored account enablement. |
| URL `search` | Name/email/phone query, up to 100 characters; filters on API before pagination. |
| URL `page`, `limit` | Page number and page size (UI uses 20). |
| `status`, `sort` list state | Active/inactive login-status filter; newest/oldest/name ordering. |
| `result.users/pagination/counts` | Table rows, page totals, and status-tab counts. |
| `action` | Delete confirmation dialog target; add/edit actions use dedicated routes. |
| `currentUser` / `updateUser` | Outlet session account; protects self-actions and updates displayed account after own edits. |

The user list refreshes every 30 seconds. Deleting yourself is disabled; API also blocks self-deletion and self-demotion. Search results do not expose password hashes.

### Coupons (`/coupons`)

Commerce is a shared page selected by `kind='coupons'` or `kind='orders'`.

```js
// Coupon form values converted before the API request.
const coupon = {
  code: 'SAVE10',           // Uppercase unique checkout code.
  type: 'percentage',      // percentage or fixed INR amount.
  value: 10,               // Rate or amount, converted to Number.
  minimum: 0,              // Required spend, converted to Number.
  expiresAt: null,         // Empty input means no expiry; selected date uses
                           // 23:59:59 at +05:30 before conversion to ISO.
  active: true,            // Checkbox becomes a boolean.
};
```

Status badges distinguish disabled, expired, and active records. Red power button enables/disables the coupon and shares the 36px button and 16px icon sizes of view/edit actions; pencil edits it. URL `search` matches code/type, `page` selects 20-row API pagination. `ResourceEdit` loads `editor` for the separate add/edit form; list `busy` blocks overlapping quick toggles, `attempt` refreshes after toggles, and `notice` reports success/errors. Display text alone does not enable a coupon; it must be an eligible database record.

### Orders (`/orders`, `/orders/:id`)

List columns show `orderId`, customer `user.name/email`, `items[].name/quantity/options`, `totalAmount`, `couponCode/discount`, `paymentMethod`, `status`, and `createdAt`. Shipping details can expand within the customer cell. Search supports customer contact details, item names, coupon code, status/payment text, numeric order number (also `#123`), and ObjectId; it filters before 20-row pagination.

OrderDetails uses `items[].product` for a product link, `unitPrice` for the saved per-unit price, and quantity × unitPrice for line totals. It displays shipping/billing information and saved subtotal/discount/payable. The separate `/orders/:id/edit` page contains the status select and sends `PATCH /admin/orders/:id`; earlier statuses and completed/cancelled transitions are blocked. Cancellation restores inventory through backend transactions. No delete-order action exists.

### Profile and logout

`/profile` displays the current account; `/profile/edit` edits `name`/`email` through `/account/profile`, preserving session identity. `/logout` ends the server session and redirects toward the customer app. These pages do not have a dedicated data-search resource; header search defaults to products there and on the dashboard.

## Header search and reusable UI

`searchDestination()` maps product, user, category, order, and coupon paths to their list page. Search submits through a form, resets page, keeps other query parameters when searching the same list, and changes its placeholder to the current resource. Clear search removes query/page. Product-detail/add/edit headers show the contextual title instead of the list search form.

`matchesSearch()` requires all normalized words across a row's searchable values. Categories/products filter locally. Users/orders/coupons filter on the API. This prevents searching just the currently displayed page of orders/coupons.

`DataTable` supplies a header/footer and horizontally scrollable table wrapper. `Pagination` uses total count and page size. `StatusBadge` standardizes state colors. `NotificationPopup` displays request results; `PopupMessage` displays recoverable errors; `Loader` represents loading rather than fabricated empty data. Delete controls share the frontend's trash icon, pale pink border/background, dimensions, hover/focus styles, and disabled behavior. Confirmation dialogs retain explicit action labels.

## Styles, assets, and errors

`index.css` provides Tailwind/global utilities, admin layouts/table/form classes, and shared delete styling. `App.css` remains in the source; actual imports determine whether its styles apply. `src/assets/` contains legacy/template art; `public/` contains direct static icons. Product/category photos resolve from the backend rather than being copied into panel assets.

If the panel redirects to login, verify the same enabled admin session via the storefront. If requests fail with 401/403, inspect API role checks and origins. If images fail, verify their local backend files and API URL. If the dashboard is empty, inspect database records and date range; zero delivered revenue is valid. Online payment processing and order deletion are not panel features.

## Complete source file map

This map covers every JavaScript/JSX/CSS source file. Media assets are grouped by their asset directories in the guide.

| File | Responsibility |
| --- | --- |
| [`src/App.css`](src/App.css) | Application stylesheet; effect depends on whether it is imported. |
| [`src/App.jsx`](src/App.jsx) | Route definitions, lazy page imports, loading fallback, and missing-page behavior. |
| [`src/api.js`](src/api.js) | Cookie-authenticated API client, frontend redirect URL, and product image URL resolver. |
| [`src/components/AdminAccountMenu.jsx`](src/components/AdminAccountMenu.jsx) | Admin account/profile/store/logout menu. |
| [`src/components/AdminRoute.jsx`](src/components/AdminRoute.jsx) | Session/admin guard and current account outlet context. |
| [`src/components/AsideBarDashboard.jsx`](src/components/AsideBarDashboard.jsx) | Admin page navigation sidebar. |
| [`src/components/ChartDashboard.jsx`](src/components/ChartDashboard.jsx) | Live daily-revenue SVG and order-status donut/legend. |
| [`src/components/DashboardHeader.jsx`](src/components/DashboardHeader.jsx) | Resource-aware header search, mobile menu button, and contextual product titles. |
| [`src/components/DashboardLayout.jsx`](src/components/DashboardLayout.jsx) | Sidebar/header shell, mobile open state, focus and resize behavior. |
| [`src/components/DataTable.jsx`](src/components/DataTable.jsx) | Reusable scrollable table container with optional header/footer. |
| [`src/components/ImageUploadField.jsx`](src/components/ImageUploadField.jsx) | Single category image selection, upload, preview, and form value. |
| [`src/components/Loader.jsx`](src/components/Loader.jsx) | Reusable loading indicator with an accessible label. |
| [`src/components/NotificationPopup.jsx`](src/components/NotificationPopup.jsx) | Notification UI for request outcomes. |
| [`src/components/PageHeader.jsx`](src/components/PageHeader.jsx) | Page title/description and page action slots. |
| [`src/components/Pagination.jsx`](src/components/Pagination.jsx) | Page/count controls with configurable page size. |
| [`src/components/PopupMessage.jsx`](src/components/PopupMessage.jsx) | Inline error/status message. |
| [`src/components/ProductDialog.jsx`](src/components/ProductDialog.jsx) | Product deletion confirmation; also retains basic create/edit dialog logic. |
| [`src/components/ProductEditor.jsx`](src/components/ProductEditor.jsx) | Shared create/edit form, galleries, taxonomy, text lists, FAQ/reviews, and uploads. |
| [`src/components/RecentOrders.jsx`](src/components/RecentOrders.jsx) | Newest selected-period order rows with detail links. |
| [`src/components/StatDashboard.jsx`](src/components/StatDashboard.jsx) | Live user/product/period-order/revenue cards and comparisons. |
| [`src/components/StatusBadge.jsx`](src/components/StatusBadge.jsx) | Consistent active/inactive/order/coupon status badges. |
| [`src/components/UserActionDialog.jsx`](src/components/UserActionDialog.jsx) | User deletion confirmation (legacy create/edit branches are retained; navigation uses separate pages). |
| [`src/dashboard/Dashboard.jsx`](src/dashboard/Dashboard.jsx) | Dashboard fetch, date range, manual refresh, polling, errors and components. |
| [`src/dashboard/ProductDashboard.jsx`](src/dashboard/ProductDashboard.jsx) | Catalog filters/search, paginated product list, CRUD links, and delete dialog. |
| [`src/hooks/useProduct.js`](src/hooks/useProduct.js) | Fetch a single admin product for view/edit pages. |
| [`src/index.css`](src/index.css) | Global/Tailwind styles and shared delete-button appearance. |
| [`src/main.jsx`](src/main.jsx) | React entry point and browser-router mounting. |
| [`src/pages/AddProduct.jsx`](src/pages/AddProduct.jsx) | Create page wrapping ProductEditor. |
| [`src/pages/Categories.jsx`](src/pages/Categories.jsx) | Root/child category form, image upload, local search, and paginated table. |
| [`src/pages/Commerce.jsx`](src/pages/Commerce.jsx) | Shared orders/coupons listing, server search, page links, and coupon quick-toggle refresh. |
| [`src/pages/EditProduct.jsx`](src/pages/EditProduct.jsx) | Fetch selected product then mount editor with its fields. |
| [`src/pages/Logout.jsx`](src/pages/Logout.jsx) | End current session and redirect to customer app. |
| [`src/pages/OrderDetails.jsx`](src/pages/OrderDetails.jsx) | Saved order/address/items/totals and allowed status updates. |
| [`src/pages/ProductDetails.jsx`](src/pages/ProductDetails.jsx) | Admin gallery/specifications/price/inventory view and edit/delete actions. |
| [`src/pages/Profile.jsx`](src/pages/Profile.jsx) | Own-account profile editing. |
| [`src/pages/Users.jsx`](src/pages/Users.jsx) | Admin user listing, server search, login-status counts, sorting, polling, page links, and delete confirmation. |
| [`src/search.js`](src/search.js) | Normalized row matching and resource-aware header search destinations. |
| [`src/search.test.js`](src/search.test.js) | Node regression tests for search behavior. |

`index.html` is the browser root document; `vite.config.js` configures React/Tailwind and the dev server; `eslint.config.js` defines lint rules; `package.json` and its lockfile describe commands and dependency versions; `.gitignore` excludes generated/install artifacts. Existing `.env` files are local configuration; do not place private credentials in Vite variables.

The product details page keeps Brand, Category, SKU, Stock and Status in a compact summary beside the gallery. Extended fields appear in the Specifications tab; empty values are omitted. A compact Product variants table below the summary displays all saved active and inactive combinations, their size, color, effective price, stock, status, and clickable image thumbnails. Empty variant galleries show the product image; inherited prices are labeled. Its Manage variants link opens the separate editor. Product actions, including Manage variants, stay in the summary card so optional fields do not create a tall sidebar and blank space below the images.

## Separate view, add and edit pages

All supported administration actions use dedicated pages, with data fetched from the API so direct links and browser refresh work. Delete confirmation dialogs remain in the lists. Inline category/coupon creation and user editing dialogs are replaced by navigation.

| Resource | View | Add | Edit |
| --- | --- | --- | --- |
| Products | `/product/:id` | `/product/add` | `/product/:id/edit` |
| Variants | `/product/:id/variants/:variantId` | `/product/:id/variants/add` | `/product/:id/variants/:variantId/edit` |
| Categories/subcategories | `/categories/:id` | `/categories/add` | `/categories/:id/edit` |
| Users | `/users/:id` | `/users/add` | `/users/:id/edit` |
| Coupons | `/coupons/:id` | `/coupons/add` | `/coupons/:id/edit` |
| Orders | `/orders/:id` | Customer checkout | `/orders/:id/edit` |
| Current profile | `/profile` | Registration | `/profile/edit` |

`ResourceDetails.jsx` displays category, coupon and user fields. `ResourceEdit.jsx` preserves the existing fields and validators for category/coupon/user creation and editing, and order status editing. User creation requires a password; user editing does not change passwords. Self role/access controls remain locked. Categories retain their image-upload control and immutable parent when editing. Coupon expiry is saved at the end of the selected day in India. Orders retain forward-only status transitions and terminal-state restrictions; their details page is read-only. Successful saves show a notification and return to the list; failures retain the entered values. Variants keep the compact image gallery on separate add/edit pages, while the variant list shows View/Edit actions.

## Managing size/color variants

Save a base product first, then use **Variants** in the products table’s **Actions** column to open the separate **Product Variants** page at `/product/:id/variants` (`src/pages/ProductVariants.jsx`). Product details and edit pages also include a **Manage variants** link. The page uses `src/components/ProductVariants.jsx` to manage combinations. Add/edit forms follow the product editor layout: a full gallery card on the left, a separate field card on the right, and shared save/cancel actions beneath. On smaller screens the cards stack. Saved variants stay in a scrollable table. Add each desired combination separately. The compact table shows size, color, effective price, stock, cover image with extra-image count, and status; **View**, **Add variant**, and **Edit** each open separate routes.

- **Size / Color:** identify the combination; duplicates for a product are rejected, including color names differing only in case.
- **Price:** optional override; blank inherits the base product price.
- **Stock:** quantity for this combination. Once variants exist, the base stock input is replaced by a computed active-variant sum; stock is edited per variant.
- **Variant images:** upload up to 8 JPG, PNG or WebP files, at most 5 MB each. The shared `ProductImageGallery.jsx` provides the same controls as the product editor: click or drag-and-drop multiple files, add more images, preview thumbnails and the large image, remove images, and use **Set as main image** or click a gallery tile to choose the cover. The first image is the cover. Files are previewed locally and uploaded on save; failed saves reuse completed uploads. Empty galleries inherit product images.
- **Status:** active appears in the storefront; inactive hides the combination while retaining its identity for past orders. Use Edit to activate it again.

`productId` is supplied by the product-page URL. The UI uses admin-only variant endpoints and refreshes product data after a successful save; validation and upload errors appear beside the form. Saving the first variant enables variant inventory, so add the combinations you want to sell before relying on the new product stock.

Resource tables show **Created On** using real `createdAt` timestamps, formatted in India time; missing dates display an em dash. Product and variant API serializers include creation/update timestamps. Order item rows use the order creation date. `ActionLink.jsx` provides consistent eye/pencil icons with accessible names and tooltips; existing delete confirmations retain the shared trash control. Variant-management links use the layers icon.

Variant **Price** is the selling price; **Compare Price** (`originalPrice`) controls the crossed-out price and savings. Both can be blank/null to inherit the corresponding product price. Explicit compare prices must be at least the effective selling price. Variant forms, view pages and tables show both prices. Storefront cards, product details, cart and checkout use the selected variant comparison price; legacy variants continue inheriting product values.

Variants can be deleted using the trash action in the product details or variant-list table, followed by a confirmation dialog. `DELETE /api/admin/products/:id/variants/:variantId` is admin-only, scoped to its parent product, and transactional. Variants referenced by any order cannot be deleted (409); make them inactive instead so cancellation can restore inventory. Deleting the final variant keeps `hasVariants` enabled and the product unavailable until new active variants are added. Uploaded images remain available to other products/variants. Successful deletion refreshes the table; errors remain in the dialog.

Every web-panel table includes pagination and **Sr. No.** numbering that continues across pages. Pagination controls sit below and outside the table scroll area, so scrolling rows does not hide them. Table headings stay fixed at the top of the scroll area while rows scroll; shared tables and ordered items use a height capped at 65vh/640px, and compact variant tables retain their 280px cap. Main resource lists retain 20-row pages; variant tables use 5-row pages and ordered-item tables use 10-row pages. `useTablePagination` clamps local pages when rows are removed and resets when the product/order changes. Dashboard recent orders use 5-row server pages, with totals for the selected date range; changing the range resets the page. Order totals always include all items, not just the visible page.

<!-- AUTO-GENERATED:START -->
## Generated code reference

Maintained by `npm run docs:sync` from the repository root. Edit explanations above this section; generated content is replaced automatically. Source fingerprint: `316807030ed2ccb8b8b27e27fdfb5ad469334063cc489a7c445641e22005d468`.

### Actual npm commands

| Script | Command |
| --- | --- |
| dev | `vite` |
| build | `vite build` |
| lint | `eslint .` |
| preview | `vite preview` |

### Environment keys used in source

`VITE_API_URL`, `VITE_FRONTEND_URL`. Values are never read from .env files.

### Source inventory and exported symbols

| File | Exports |
| --- | --- |
| [src/App.css](src/App.css) | Internal module / styles |
| [src/App.jsx](src/App.jsx) | App |
| [src/api.js](src/api.js) | apiRequest, frontendUrl, productImageUrl |
| [src/components/ActionLink.jsx](src/components/ActionLink.jsx) | ActionLink |
| [src/components/AdminAccountMenu.jsx](src/components/AdminAccountMenu.jsx) | AdminAccountMenu |
| [src/components/AdminRoute.jsx](src/components/AdminRoute.jsx) | AdminRoute |
| [src/components/AsideBarDashboard.jsx](src/components/AsideBarDashboard.jsx) | default export |
| [src/components/ChartDashboard.jsx](src/components/ChartDashboard.jsx) | ChartDashboard |
| [src/components/DashboardHeader.jsx](src/components/DashboardHeader.jsx) | default export |
| [src/components/DashboardLayout.jsx](src/components/DashboardLayout.jsx) | DashboardLayout |
| [src/components/DataTable.jsx](src/components/DataTable.jsx) | DataTable |
| [src/components/ImageUploadField.jsx](src/components/ImageUploadField.jsx) | ImageUploadField |
| [src/components/Loader.jsx](src/components/Loader.jsx) | Loader |
| [src/components/NotificationPopup.jsx](src/components/NotificationPopup.jsx) | NotificationPopup |
| [src/components/PageHeader.jsx](src/components/PageHeader.jsx) | PageHeader |
| [src/components/Pagination.jsx](src/components/Pagination.jsx) | Pagination |
| [src/components/PopupMessage.jsx](src/components/PopupMessage.jsx) | PopupMessage |
| [src/components/ProductDialog.jsx](src/components/ProductDialog.jsx) | ProductDialog |
| [src/components/ProductEditor.jsx](src/components/ProductEditor.jsx) | ProductEditor |
| [src/components/ProductImageGallery.jsx](src/components/ProductImageGallery.jsx) | ProductImageGallery |
| [src/components/ProductVariants.jsx](src/components/ProductVariants.jsx) | ProductVariants |
| [src/components/RecentOrders.jsx](src/components/RecentOrders.jsx) | RecentOrders |
| [src/components/StatDashboard.jsx](src/components/StatDashboard.jsx) | StatDashboard |
| [src/components/StatusBadge.jsx](src/components/StatusBadge.jsx) | StatusBadge |
| [src/components/UserActionDialog.jsx](src/components/UserActionDialog.jsx) | UserActionDialog |
| [src/components/VariantDeleteButton.jsx](src/components/VariantDeleteButton.jsx) | VariantDeleteButton |
| [src/dashboard/Dashboard.jsx](src/dashboard/Dashboard.jsx) | Dashboard |
| [src/dashboard/ProductDashboard.jsx](src/dashboard/ProductDashboard.jsx) | ProductDashboard |
| [src/date.js](src/date.js) | creationDate |
| [src/date.test.js](src/date.test.js) | Internal module / styles |
| [src/hooks/useProduct.js](src/hooks/useProduct.js) | useProduct |
| [src/hooks/useTablePagination.js](src/hooks/useTablePagination.js) | useTablePagination |
| [src/index.css](src/index.css) | Internal module / styles |
| [src/main.jsx](src/main.jsx) | Internal module / styles |
| [src/pages/AddProduct.jsx](src/pages/AddProduct.jsx) | AddProduct |
| [src/pages/Categories.jsx](src/pages/Categories.jsx) | Categories |
| [src/pages/Commerce.jsx](src/pages/Commerce.jsx) | Commerce |
| [src/pages/EditProduct.jsx](src/pages/EditProduct.jsx) | EditProduct |
| [src/pages/Logout.jsx](src/pages/Logout.jsx) | Logout |
| [src/pages/OrderDetails.jsx](src/pages/OrderDetails.jsx) | OrderDetails |
| [src/pages/ProductDetails.jsx](src/pages/ProductDetails.jsx) | ProductDetails |
| [src/pages/ProductVariants.jsx](src/pages/ProductVariants.jsx) | ProductVariantsPage |
| [src/pages/Profile.jsx](src/pages/Profile.jsx) | Profile |
| [src/pages/ProfileDetails.jsx](src/pages/ProfileDetails.jsx) | ProfileDetails |
| [src/pages/ResourceDetails.jsx](src/pages/ResourceDetails.jsx) | ResourceDetails |
| [src/pages/ResourceEdit.jsx](src/pages/ResourceEdit.jsx) | ResourceEdit |
| [src/pages/Users.jsx](src/pages/Users.jsx) | Users |
| [src/search.js](src/search.js) | matchesSearch, searchDestination |
| [src/search.test.js](src/search.test.js) | Internal module / styles |
| [src/tablePagination.js](src/tablePagination.js) | paginateRows |
| [src/tablePagination.test.js](src/tablePagination.test.js) | Internal module / styles |

### Route declarations

Paths below are local declarations; consult the API/page guide above for mounted prefixes and permissions.

| Source | Declaration | Path |
| --- | --- | --- |
| src/App.jsx | React Route | `/dashboard` |
| src/App.jsx | React Route | `/product` |
| src/App.jsx | React Route | `/product/add` |
| src/App.jsx | React Route | `/product/:id/variants/add` |
| src/App.jsx | React Route | `/product/:id/variants/:variantId/edit` |
| src/App.jsx | React Route | `/product/:id/variants/:variantId` |
| src/App.jsx | React Route | `/product/:id/variants` |
| src/App.jsx | React Route | `/product/:id/edit` |
| src/App.jsx | React Route | `/product/:id` |
| src/App.jsx | React Route | `/categories/add` |
| src/App.jsx | React Route | `/categories/:id` |
| src/App.jsx | React Route | `/coupons/add` |
| src/App.jsx | React Route | `/coupons/:id` |
| src/App.jsx | React Route | `/users/add` |
| src/App.jsx | React Route | `/users/:id` |
| src/App.jsx | React Route | `/categories/:id/edit` |
| src/App.jsx | React Route | `/coupons/:id/edit` |
| src/App.jsx | React Route | `/users/:id/edit` |
| src/App.jsx | React Route | `/orders/:id/edit` |
| src/App.jsx | React Route | `/orders/:id` |
| src/App.jsx | React Route | `/orders` |
| src/App.jsx | React Route | `/coupons` |
| src/App.jsx | React Route | `/categories` |
| src/App.jsx | React Route | `/users` |
| src/App.jsx | React Route | `/profile` |
| src/App.jsx | React Route | `/profile/edit` |
| src/App.jsx | React Route | `/logout` |
| src/App.jsx | React Route | `*` |
| src/components/DashboardHeader.jsx | searchParams.get | `search` |
| src/components/DashboardHeader.jsx | next.delete | `page` |
| src/components/DashboardHeader.jsx | next.delete | `search` |
| src/components/DashboardHeader.jsx | next.delete | `search` |
| src/components/DashboardHeader.jsx | next.delete | `page` |
| src/dashboard/ProductDashboard.jsx | params.get | `search` |
| src/dashboard/ProductDashboard.jsx | params.get | `page` |
| src/dashboard/ProductDashboard.jsx | next.delete | `search` |
| src/dashboard/ProductDashboard.jsx | next.delete | `page` |
| src/pages/Categories.jsx | params.get | `search` |
| src/pages/Categories.jsx | params.get | `page` |
| src/pages/Commerce.jsx | params.get | `search` |
| src/pages/Commerce.jsx | params.get | `page` |
| src/pages/Users.jsx | searchParams.get | `page` |
| src/pages/Users.jsx | searchParams.get | `search` |
| src/pages/Users.jsx | next.delete | `search` |
| src/pages/Users.jsx | next.delete | `page` |
<!-- AUTO-GENERATED:END -->

Table action buttons share 36px square dimensions with 16px icons across products, variants, users, categories, coupons and orders. Product variant-management links use the same action style; icon-only delete buttons use `admin-action-delete`.

Create/edit forms share `admin-field` / `product-field` styling: 42px minimum height, 8px corners, light slate borders, 14px regular text, matching spacing, blue focus rings and disabled states. Variants use the same labels and fields as products. Text areas grow vertically; dropdowns reserve space for their arrow. File uploads and checkboxes keep their purpose-specific controls.

Product information avoids duplicate color/size inputs: manual Available colors / Available sizes fields are removed. Products with variants manage colors, sizes and inventory exclusively on the Variants pages; products without variants retain their single Frame Color / Frame Size fields. The API computes availability arrays from active variants. Existing legacy option arrays remain readable for compatibility, but are no longer writable product fields. Product specifications omit duplicate availability lists when the variants table is present.

Saved status values consistently use the shared `StatusBadge` component across tables and detail pages, including variant lists and individual variant views. Editable status controls remain dropdowns or radio buttons.

The shared product/variant image gallery displays the large upload/drop area only when there are no images. With existing images, use the compact plus button to add photos. Removing the last image restores the upload area automatically.

Variant add/edit pages share `product-editor-grid`, standard gallery sizing, panel borders/shadows and the sticky `product-editor-actions` footer with product add/edit pages. The surrounding list card is used only in list mode.

ProductEditor memoizes the category tree when loaded category data changes. Active children are grouped by parent in one pass and reused while editing fields or images, avoiding repeated full-category scans for each parent.
