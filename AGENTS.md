# Project design reference

Use https://www.lenskart.com/ as the design and interaction reference for future UI changes in this project. Inspect the corresponding current page or public source before making reference-based changes. User-provided screenshots and explicit preferences take precedence. Do not claim visual verification unless it was performed.

All modal popups in frontend and web-panel must use the shared dimensions in `shared/Popup.css`, through `product-popup` or `app-popup`. The desktop similar-items reference uses 600px width, a 90vw width limit, an 80vh height limit and 16px corners. Keep popup sizing consistent by editing the shared stylesheet. Compact notification toasts and filter drawers have their own established layouts.

Keep relevant README documentation synchronized when changing source code. Run `npm run docs:sync` and `npm run docs:check`, plus lint/build for affected applications as appropriate.
