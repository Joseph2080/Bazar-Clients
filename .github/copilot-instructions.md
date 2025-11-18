# Bazar Shop Frontend - AI Agent Instructions

## Project Overview
This is a **dual-mode React e-commerce frontend** for the Bazar product catalog system:
1. **Standalone SPA** - Full React app with routing (`npm start`)
2. **Embeddable UMD Widget** - Distributable catalog widget (`npm run build:widget`)

**Tech Stack:** React 19.2, Redux Toolkit, React-Redux, Vite, TailwindCSS, Framer Motion, React Router v7

## Critical Architecture Patterns

### Authentication with OAuth2 & AWS Cognito
Application uses **OAuth2 Authorization Code Flow with PKCE** for secure authentication:

**Authentication Context** (`src/context/AuthContext.jsx`):
- Centralized auth state management via React Context
- `useAuth()` hook provides: `isAuthenticated`, `user`, `login()`, `logout()`, `handleCallback()`
- Token management: JWT access tokens (sessionStorage, 1hr), refresh tokens (HTTP-only cookies, 30 days)
- Auto-refresh mechanism on 401 errors via `fetchWithAuth()` helper

**OAuth2 Flow**:
1. User clicks "Add to Cart" without auth → `login('/catalog')` called
2. Generates PKCE code verifier + challenge, stores in sessionStorage with random state
3. Redirects to Cognito hosted UI: `https://your-domain.auth.region.amazoncognito.com/oauth2/authorize`
4. User authenticates, Cognito redirects to `/auth/callback?code=XXX&state=YYY`
5. `AuthCallback.jsx` extracts code, validates state (CSRF protection)
6. Calls `handleCallback(code, state)` → exchanges code for tokens via backend
7. Backend validates code verifier, returns access + refresh tokens
8. Access token stored in sessionStorage, refresh in HTTP-only cookie (set by backend)
9. User redirected to original intended path (stored in sessionStorage)

**Token Management**:
```javascript
// Access token (short-lived, 1hr)
sessionStorage.setItem('accessToken', jwt);

// Refresh token (long-lived, 30 days) - HTTP-only cookie
// Set by backend: Set-Cookie: refreshToken=XXX; HttpOnly; Secure; SameSite=Strict

// User extraction from JWT
const decoded = jwtDecode(accessToken);
const user = { sub: decoded.sub, email: decoded.email, username: decoded.username };
```

**Auto-Refresh Logic** (`fetchWithAuth` in `api.js`):
```javascript
try {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` }});
  if (response.status === 401) {
    await refreshAccessToken(); // Silent refresh
    return fetch(url, { headers: { Authorization: `Bearer ${newToken}` }}); // Retry
  }
  return response;
} catch (error) {
  // If refresh fails, user must re-authenticate
}
```

**Protected vs Public Endpoints**:
- **Public** (uses `fetchPublic()`): `/products`, `/stores`, `/auth/*`
- **Protected** (uses `fetchWithAuth()`): `/cart/*`, `/orders/*`, `/customer/*`
- Cart operations require authentication - trigger login if not authenticated

**Route Protection** (`ProtectedRoute.jsx`):
```jsx
<Route path="/order-checkout" element={<ProtectedRoute><OrderCheckout /></ProtectedRoute>} />
```
Checks `isAuthenticated`, calls `login(currentPath)` if false, stores path for post-auth redirect.

**Critical Security Practices**:
1. **PKCE** - Code verifier (random 128 chars) prevents authorization code interception
2. **State parameter** - Random value prevents CSRF attacks on callback
3. **HTTP-only cookies** - Refresh token inaccessible to JavaScript (XSS protection)
4. **sessionStorage** - Access token cleared on tab close (less persistent than localStorage)
5. **No customer ID in frontend** - Backend extracts user ID from JWT `sub` claim
6. **Credentials: 'include'** - All protected requests send cookies for refresh token

### State Management with Redux
Application uses **Redux Toolkit** for centralized state management:

**Store Structure** (`src/store/index.js`):
- `cart` slice - Cart items, count, total, loading states
- `products` slice - Product catalog, search filtering, loading states
- `ui` slice - Modal visibility, selected product state

**Key Redux Patterns**:
```javascript
// Dispatch async thunks for API calls
dispatch(fetchProducts());
dispatch(addToCart({ productId, quantity, isFirstItem }));

// Access state with useSelector
const { cartCount, cartTotal } = useSelector(state => state.cart);
const { filteredItems } = useSelector(state => state.products);

// Dispatch actions for UI state
dispatch(setSelectedProduct(product));
dispatch(openOrderSummary());
```

**Critical Slices**:
- **cartSlice.js**: Handles `fetchCartSummary`, `addToCart`, `removeFromCart`, `applyDiscountCode`
- **productsSlice.js**: Handles `fetchProducts`, `setSearchQuery` (client-side filtering)
- **uiSlice.js**: Manages modal states (`showProductModal`, `showOrderSummary`, `showOrderCheckout`)

**Redux Flow Example** (Adding to cart):
1. User clicks "Add to Cart" → Component checks `isAuthenticated` via `useAuth()`
2. If not authenticated → Call `login('/catalog')` and return
3. If authenticated → Component dispatches `addToCart()` thunk
4. Thunk calls API with `fetchWithAuth()`, auto-refreshes token if 401
5. Redux updates `cartCount` state automatically
6. Component dispatches `fetchCartSummary()` to refresh full cart details
7. UI reactively updates via `useSelector`

**Important**: Both SPA and widget bundle include Redux Provider + AuthProvider wrapping

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

**Critical:** When adding API calls, use the centralized `productsAPI`, `cartAPI`, or `orderAPI` objects from `services/api.js`. Wrap API calls in Redux async thunks for state management.

### Product Data Structure
```javascript
{
  productResponseDto: { productId, name, description, price, stock, storeId },
  catalogResourceUrlSet: [{ productCatalogId, productImageUrl }]
}
```
**Note:** Nested structure is API contract - always access via `product.productResponseDto.name`, etc.

## Component Patterns

### Redux-Connected Components
Components use `useSelector` and `useDispatch` hooks:
```javascript
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../../store/slices/productsSlice';

const { filteredItems, isLoading } = useSelector(state => state.products);
const dispatch = useDispatch();

useEffect(() => {
  dispatch(fetchProducts());
}, [dispatch]);
```

### Modal Orchestration
`Catalog.jsx` uses Redux UI slice for modal states:
- `ProductModal` - Triggered by `setSelectedProduct(product)` action
- `OrderSummaryModal` - Triggered by `openOrderSummary()` action
- `OrderCheckout` - Triggered by `openOrderCheckout()` action

Modal state accessed via: `const { showProductModal, selectedProduct } = useSelector(state => state.ui);`

**Pattern:** Modals use Framer Motion with backdrop blur:
```jsx
<motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" 
  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
```

### Image Carousel on Hover
`ProductCard.jsx` auto-cycles through `catalogResourceUrlSet` images on hover (800ms intervals). Resets to first image on mouse leave.

### API Error Handling in Redux
All async thunks handle three states (pending, fulfilled, rejected):
```javascript
// In slice extraReducers
.addCase(fetchProducts.pending, (state) => {
  state.isLoading = true;
  state.error = null;
})
.addCase(fetchProducts.fulfilled, (state, action) => {
  state.isLoading = false;
  state.items = action.payload;
})
.addCase(fetchProducts.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
})
```

Components handle errors via Redux state: `const { error } = useSelector(state => state.cart);`

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

### Authentication Integration
- **No hardcoded customer IDs** - Backend extracts user ID from JWT `sub` claim in Authorization header
- **Cognito Configuration** (backend must provide):
  - `GET /auth/login-url` - Returns Cognito authorize URL
  - `POST /auth/token` - Exchanges code for tokens (validates PKCE verifier)
  - `POST /auth/refresh` - Exchanges refresh token for new access token
  - All endpoints must accept `redirect_uri` parameter for callback URL

### Checkout Flow
1. User adds items → Check `isAuthenticated`, if false call `login('/catalog')`
2. If authenticated → Dispatch `addToCart({ productId, quantity, isFirstItem })` thunk
3. Clicks checkout button → Dispatch `openOrderSummary()` action
4. Applies discount codes → Dispatch `applyDiscountCode(code)` thunk
5. Clicks "Proceed to Checkout" → Call `orderAPI.generateCheckoutLink()` (no customerId param)
6. Backend extracts user ID from JWT, generates checkout session
7. Redirects to external payment URL (Stripe/payment gateway)
8. After payment, backend redirects to:
   - **Success:** `http://localhost:3000/payment/success?orderId={orderId}`
   - **Failure:** `http://localhost:3000/payment/failure?orderId={orderId}`

**Important:** All cart/order operations use Redux thunks with `fetchWithAuth()` for automatic token management.

## Styling Conventions
- **TailwindCSS utility-first** - no custom CSS classes except in `App.css`, `index.css`
- **Responsive breakpoints:** `md:` (768px+) for desktop layouts
- **Color palette:** Black/white/gray + accent colors inline
- **Animations:** Use Framer Motion `whileHover`, `whileTap` for interactions

## Common Gotchas
1. **Widget external dependencies** - Don't bundle React/ReactDOM/Redux in widget build (externalized in Vite config)
2. **Search is client-side** - Redux `productsSlice` filters items when `setSearchQuery()` is dispatched
3. **Cart operations** - Always dispatch `fetchCartSummary()` after mutations to sync full cart state
4. **Stock badges** - Show "Low stock" for `stock < 50`, "Only X left" for `stock < 10`
5. **Image handling** - First image in `catalogResourceUrlSet` is default/thumbnail
6. **Redux DevTools** - Available in development for debugging state changes
7. **Authentication required** - Cart/order operations trigger login flow if user not authenticated
8. **Token refresh** - Handled automatically by `fetchWithAuth()`, no manual intervention needed
9. **PKCE verifier** - Stored in sessionStorage, cleared after token exchange
10. **Redirect paths** - Stored in sessionStorage to navigate back after authentication

## Routes
- `/` - Redirects to `/catalog`
- `/catalog` - Main product catalog (public, no auth required)
- `/auth/callback` - OAuth2 callback handler (public)
- `/order-checkout` - Checkout page (protected, requires auth)
- `/payment/success` - Payment success page (protected, requires auth)
- `/payment/failure` - Payment failure page (protected, requires auth)

## File Navigation
- **Authentication:** `src/context/AuthContext.jsx` (auth state, login/logout, token management)
- **Auth Components:** `src/components/auth/AuthCallback.jsx`, `ProtectedRoute.jsx`
- **Redux Store:** `src/store/index.js` (store configuration)
- **Redux Slices:** `src/store/slices/cartSlice.js`, `productsSlice.js`, `uiSlice.js`
- **API layer:** `src/services/api.js` (all backend calls, auth helpers, token refresh)
- **Main catalog:** `src/components/catalog/Catalog.jsx` (Redux + Auth connected)
- **Payment pages:** `src/components/payment/PaymentSuccess.jsx`, `PaymentFailure.jsx`
- **Widget entry:** `src/catalog-widget-entry.jsx` (includes Redux + Auth Providers)
- **Routes:** `src/components/routes/AppRoutes.jsx` (public + protected routes)
- **Mock data:** `src/data/mockedProducts.js` (reference structure)
