# Web panel

The separate admin application for the Lenskart clone.

## Run locally

```sh
npm install
npm run dev
```

Vite runs on `http://localhost:5174` and requires that port to be available.
The frontend should run on `http://localhost:5173` and the backend on
`http://localhost:5001`.

- `/` redirects to `/dashboard`.
- `/dashboard` displays the store overview.
- `/product` displays the product management page.

These routes check the shared backend session at `/api/auth/me` and require
an admin account. Log in through the frontend first. Logout clears that session
and returns to the frontend login page.

The dashboard metrics, recent orders, and product rows currently use the
existing sample data; product management actions are not connected to an API.

## Configuration

The local API and frontend URLs work by default. To override them, copy
`.env.example` to `.env` and set `VITE_API_URL` and `VITE_FRONTEND_URL`.
Keep the frontend's `VITE_ADMIN_URL` and the backend's `ADMIN_URL` pointed at
this application's origin (`http://localhost:5174` locally).

## Checks

```sh
npm run lint
npm run build
```

When deploying, configure the host to serve `index.html` for client routes such
as `/dashboard` and `/product`.
