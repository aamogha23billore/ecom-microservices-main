# ecom-frontend

React + Vite storefront for the **ecom-microservices** backend. It talks to the
Spring Cloud Gateway and signs people in through Keycloak
(Authorization Code + PKCE, public client `oauth2-pkce`).

**Features:** landing page, sign-up, sign-in/out (SSO), product catalogue with
search / category filter / sort, product detail, cart with quantity stepper,
checkout and order confirmation, order history, profile editing, and an admin
screen for product CRUD.
Light and dark themes follow the OS setting.

## Run it

Requires Node 18+.

```bash
npm install
npm run dev
```

Open **http://localhost:5173** (use `localhost`, not `127.0.0.1`; Keycloak's
redirect URI is tied to it). The port is fixed on purpose: if 5173 is busy,
Vite will stop instead of silently picking another port that Keycloak would reject.

Start the backend first (Keycloak, Redis, config server, Eureka, the services and
the gateway on `:8080`).

### How requests flow

```
browser ──/api/*──▶ Vite dev server (:5173) ──proxy──▶ gateway (:8080) ──▶ services
browser ──────────────────────────────────────────────▶ Keycloak (:8443)  (login/token)
```

The gateway has no CORS configuration, so in development the browser only ever
talks to Vite, which forwards `/api/*` to the gateway. **No backend change is
needed for this.** To point at a different gateway, set `VITE_DEV_PROXY_TARGET`
(see `.env.example`).

## One-time Keycloak client settings

In the `ecom-app` realm, open **Clients → oauth2-pkce** and make sure:

| Setting | Value |
| --- | --- |
| Client authentication | **Off** (public client) |
| Standard flow | **On** |
| Valid redirect URIs | `http://localhost:5173/*` |
| Valid post logout redirect URIs | `http://localhost:5173/*` |
| Web origins | `http://localhost:5173` |

If any of these is missing you will see the "We can't reach the sign-in service"
screen, which lists exactly what the app expects. The tokens must also contain
`resource_access.oauth2-pkce.roles` (the gateway reads it), which is already how
your Postman setup works.

## Enable sign-up (one line in the gateway)

The gateway requires a token for **every** route, including `POST /api/users`, so
a brand-new visitor cannot register. The "Create account" page works as soon as
you allow that single route. In `gateway/.../security/SecurityConfig.java`:

```java
.authorizeExchange(exchange -> exchange
        .pathMatchers(HttpMethod.POST, "/api/users").permitAll()   // <-- add
        .anyExchange().authenticated())
```

(`import org.springframework.http.HttpMethod;`). Until then, the page shows a
message explaining this. Users you create in Postman still work as before.

## Backend changes this frontend needs (order service)

The cart stepper and the order history page need two endpoints that did not exist,
and the order history is only worth showing if the stored totals are right, so the
patch also fixes two pricing bugs. It is a small change to the **order service
only**; the gateway already routes `/api/orders/**` and `/api/cart/**` for every
HTTP method, so nothing else changes.

Apply `order-service-changes.patch` (from the repo root: `patch -p1 < order-service-changes.patch`)
or copy the six files from the backend zip over your project, then rebuild and
restart the order service.

| File | Change |
| --- | --- |
| `OrderController` | **new** `GET /api/orders`: the customer's orders, newest first |
| `OrderService` | `getOrdersForUser` (read-only transaction); **fix:** total is now `price x quantity` |
| `OrderRepository` | `findByUserIdOrderByCreatedAtDesc` |
| `CartController` | **new** `PUT /api/cart/items/{productId}` with `{ "quantity": n }` |
| `CartService` | `updateItemQuantity` (re-checks stock and price); **fix:** uses the real product price instead of the hard-coded `1000.00` |
| `CartQuantityRequest` | **new** request DTO |

`PUT /api/cart/items/{productId}` answers `204` on success, `404` if the product is
not in that customer's cart, and `400` with a short message for a quantity below 1,
not enough stock, or a product that is no longer available. Use the existing
`DELETE` to remove a line.

```bash
# order history
curl -H "Authorization: Bearer $TOKEN" -H "X-User-ID: <mongo-user-id>" http://localhost:8080/api/orders
# set a quantity
curl -X PUT -H "Authorization: Bearer $TOKEN" -H "X-User-ID: <mongo-user-id>" \
     -H "Content-Type: application/json" -d '{"quantity":3}' \
     http://localhost:8080/api/cart/items/42
```

**Existing data:** cart rows and orders created before the fix keep their old
`1000.00` prices. A cart line is corrected the next time it is added to or has its
quantity changed. In a development database you can simply clear stale carts
(`DELETE FROM cart_item;` in the order database). Past orders keep their stored
totals; the UI shows what the backend stored.

Until the patch is applied the cart stepper's "+/-" and the **Orders** page will
show an error (the endpoints return 404/405), while browsing, adding to cart and
checkout keep working.

## Known limits (not changed)

- **`X-User-ID` is trusted.** Cart and order endpoints take the customer id from a
  request header, so any logged-in user could read another customer's cart or
  orders by changing it. The safe fix is for the gateway to derive the id from the
  JWT (and overwrite the header) instead of trusting the client. This predates the
  new endpoints but order history makes it more visible.
- **Finding the current customer** is done by calling `GET /api/users` and matching
  the token's `sub` to `keyCloakId`. That works, but it returns every user to every
  logged-in person. A `GET /api/users/me` (or lookup by Keycloak id) would be
  better; the one place to change in the frontend is `loadProfile` in
  `src/auth/AuthContext.jsx`.
- `GET /api/products/search` only returns in-stock products and matches on the
  name only; the full list includes sold-out items (shown with a "Sold out" badge).
- Role checks in the gateway are commented out, so the **Manage products** screen
  is only hidden in the UI (ADMIN token role or `role: ADMIN` on the profile).
  Enforce it on the server before going live.
- The gateway rate-limits product routes (10 req/s via Redis). The cart and order
  history load the catalogue with one request, not one per item, to stay well
  under that.
- Order history is not paginated; it returns every order for the customer.

## Configuration

All optional; see `.env.example`.

| Variable | Default |
| --- | --- |
| `VITE_DEV_PROXY_TARGET` | `http://localhost:8080` |
| `VITE_API_BASE_URL` | *(empty, same origin)* |
| `VITE_KEYCLOAK_URL` | `http://localhost:8443` |
| `VITE_KEYCLOAK_REALM` | `ecom-app` |
| `VITE_KEYCLOAK_CLIENT_ID` | `oauth2-pkce` |
| `VITE_STORE_NAME` | `ecom` |
| `VITE_CURRENCY` / `VITE_LOCALE` | `USD` / browser default |

For a production build (`npm run build`), serve `dist/` from a host that is
registered in Keycloak (redirect URI + web origin), set `VITE_API_BASE_URL` to the
gateway, and add CORS for that origin to the gateway.

## Project layout

```
src/
  auth/        Keycloak singleton + AuthContext (login state, roles, store profile)
  api/         fetch client (token, X-User-ID, error mapping) + one file per service
  context/     CartContext (cart joined with catalogue), ToastContext
  components/  Header, ProductCard, Modal, route guard, states, icons ...
  pages/       Landing, Shop, ProductDetail, Cart, OrderConfirmation, Orders,
               Profile, Register, AdminProducts, NotFound
  styles/      tokens (light/dark), base, components, pages
```

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| "We can't reach the sign-in service" | Keycloak not running on `:8443`, or the client settings above are missing |
| Signed in, but every request is 401 | Token issuer differs from the gateway's `issuer-uri` (`http://localhost:8443/realms/ecom-app` in the docker profile) |
| "Cannot reach the server" | Gateway not running on `:8080` (or wrong `VITE_DEV_PROXY_TARGET`) |
| "No customer profile found" | That Keycloak user has no matching user-service record; create users through **Create account** |
| Products load but cart fails with 400 | The signed-in user's Mongo record is missing, or stock is lower than the quantity requested |
| Cart "+/-" or the Orders page show an error | The order-service patch above has not been applied/restarted yet |
