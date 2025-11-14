# Bazar Shop Frontend - AI Agent Instructions

## Project Overview
This is a **dual-mode React e-commerce frontend** for the Bazar product catalog system:
1. **Standalone SPA** - Full React app with routing (`npm start`)
2. **Embeddable UMD Widget** - Distributable catalog widget (`npm run build:widget`)

**Tech Stack:** React 19.2, Vite, TailwindCSS, Framer Motion, React Router v7

## Critical Architecture Patterns

### Dual Build System
- **SPA Build**: Uses `react-scripts` (CRA) → outputs to `build/`
- **Widget Build**: Uses Vite (`vite.widget.config.mjs`) → outputs UMD bundle to `dist/products-widget.umd.js`
  - Entry point: `src/catalog-widget-entry.jsx`
  - Externalizes React, ReactDOM, Framer Motion (expects host page to provide)
  - Exposes `window.initProductsWidget(containerId)` and `window.BazarCatalog`
  - Auto-initializes if `#products-root` element exists on page load

### API Configuration Cascade
API base URL resolution (see `src/services/api.js`):
1. `window.BAZAR_API_BASE_URL` (for widget embeds)
2. `window.REACT_APP_API_URL` (alternate window override)
3. `process.env.REACT_APP_API_URL` (CRA environment variable)
4. Fallback: `http://localhost:8080/api/v1`

**Critical:** When adding API calls, use the centralized `productsAPI`, `cartAPI`, or `orderAPI` objects from `services/api.js`.

### Data Flow & State Management
- **No global state library** - local component state + prop drilling
- Cart state is **lightweight**: Only `cartCount` and `cartTotal` stored in `Catalog.jsx`
- Full cart details fetched on-demand via `cartAPI.getCartSummary()`
- After cart mutations, always call `fetchLightCartInfo()` to sync UI

### Product Data Structure
```javascript
{
  productResponseDto: { productId, name, description, price, stock, storeId },
  catalogResourceUrlSet: [{ productCatalogId, productImageUrl }]
}
```
**Note:** Nested structure is API contract - always access via `product.productResponseDto.name`, etc.

## Component Patterns

### Modal Orchestration
`Catalog.jsx` manages three modal states via `AnimatePresence`:
- `ProductModal` - Product details (click card)
- `OrderSummaryModal` - Cart review (click floating checkout button)
- `OrderCheckout` - Final checkout form (from OrderSummaryModal)

**Pattern:** Modals use Framer Motion with backdrop blur:
```jsx
<motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" 
  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
```

### Image Carousel on Hover
`ProductCard.jsx` auto-cycles through `catalogResourceUrlSet` images on hover (800ms intervals). Resets to first image on mouse leave.

### API Error Handling
All API calls follow this pattern:
```javascript
try {
  const response = await someAPI.method();
  const data = response.data || response;
  // Use data
} catch (err) {
  console.error('Context:', err);
  setError(err.message || 'Fallback message');
}
```

## Development Workflows

### Local Development
```powershell
npm start  # Runs on http://localhost:3000
```
- Uses `/catalog` route for product catalog
- Uses `/order-checkout` route (though currently modal-based)

### Widget Development
```powershell
npm run build:widget  # Outputs to dist/products-widget.umd.js
```
Embed in static HTML:
```html
<script>window.BAZAR_API_BASE_URL = 'https://api.bazar.com/api/v1';</script>
<script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
<script src="dist/products-widget.umd.js"></script>
<div id="products-root"></div>  <!-- Auto-initializes -->
```

### Testing
```powershell
npm test  # React Testing Library + Jest
```
**Note:** Tests are minimal currently - `App.test.js` only.

## Backend Integration

### Hardcoded Values to Replace
- `storeId: 9` in `productsAPI.getAllProducts()` - fetch from config/auth
- `customerId: "random123"` in `OrderSummaryModal.jsx` - replace with session/auth context

### Checkout Flow
1. User adds items → `cartAPI.addToCart()` or `cartAPI.createCart()` (if first item)
2. Clicks checkout button → Opens `OrderSummaryModal`
3. Applies discount codes → `cartAPI.applyDiscount(code)`
4. Clicks "Proceed to Checkout" → `orderAPI.generateCheckoutLink(customerId)`
5. Redirects to external payment URL (Stripe/payment gateway)

**Important:** Payment happens externally - app receives payment link from backend.

## Styling Conventions
- **TailwindCSS utility-first** - no custom CSS classes except in `App.css`, `index.css`
- **Responsive breakpoints:** `md:` (768px+) for desktop layouts
- **Color palette:** Black/white/gray + accent colors inline
- **Animations:** Use Framer Motion `whileHover`, `whileTap` for interactions

## Common Gotchas
1. **Widget external dependencies** - Don't bundle React/ReactDOM in widget build (already externalized in Vite config)
2. **Search is client-side** - Filters `products` array by name/description in `Catalog.jsx`
3. **Cart operations** - Always await and refetch summary after mutations
4. **Stock badges** - Show "Low stock" for `stock < 50`, "Only X left" for `stock < 10`
5. **Image handling** - First image in `catalogResourceUrlSet` is default/thumbnail

## File Navigation
- **API layer:** `src/services/api.js` (all backend calls)
- **Main catalog:** `src/components/catalog/Catalog.jsx`
- **Widget entry:** `src/catalog-widget-entry.jsx`
- **Routes:** `src/components/routes/AppRoutes.jsx`
- **Mock data:** `src/data/mockedProducts.js` (reference structure)
