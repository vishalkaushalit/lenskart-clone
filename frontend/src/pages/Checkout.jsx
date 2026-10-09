import CouponApplied from "../components/CouponApplied";
import CouponDiscount from "../components/CouponDiscount";
import CouponField from "../components/CouponField";
import { useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  ShoppingBag,
  Check,
} from "lucide-react";
import { useAuth } from "../context/AuthState";
import { useStore } from "../context/StoreContext";
import useSavedProducts from "../hooks/useSavedProducts";
import Loader from "../components/Loader";
import PopupMessage from "../components/PopupMessage";
import "./Checkout.css";
import { apiRequest } from "../api/api";
import { checkoutRows } from "../state/checkout";
const money = (value) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const asset = (path) =>
  path?.startsWith("/")
    ? new URL(
        path,
        import.meta.env.VITE_API_URL ||
          (import.meta.env.PROD
            ? `${window.location.origin}/api`
            : "http://localhost:5001/api"),
      ).href
    : path;
const addressFields = [
  ["name", "Full name", "name"],
  ["phone", "Phone number", "tel"],
  ["email", "Email address", "email"],
  ["address", "Street address", "street-address"],
  ["landmark", "Landmark (optional)", "off"],
  ["city", "City", "address-level2"],
  ["state", "State", "address-level1"],
  ["pincode", "Pincode", "postal-code"],
];
function AddressFields({ prefix, user }) {
  return (
    <div className="checkout-fields">
      {addressFields.map(([name, label, complete]) => (
        <label
          key={name}
          className={name === "address" ? "checkout-wide" : ""}
          htmlFor={`${prefix}-${name}`}
        >
          {label}
          {name !== "landmark" && <span> *</span>}
          <input
            id={`${prefix}-${name}`}
            name={`${prefix}-${name}`}
            defaultValue={
              name === "name"
                ? user?.name || ""
                : name === "email"
                  ? user?.email || ""
                  : ""
            }
            type={
              name === "email" ? "email" : name === "phone" ? "tel" : "text"
            }
            autoComplete={`section-${prefix} ${complete}`}
            required={name !== "landmark"}
            maxLength={name === "email" ? 254 : name === "address" ? 300 : 100}
            pattern={
              name === "pincode"
                ? "[1-9][0-9]{5}"
                : name === "phone"
                  ? "[+]?[0-9 ()-]{10,20}"
                  : undefined
            }
            inputMode={
              name === "pincode"
                ? "numeric"
                : name === "phone"
                  ? "tel"
                  : undefined
            }
            title={
              name === "pincode"
                ? "Enter a six-digit Indian pincode"
                : undefined
            }
          />
        </label>
      ))}
    </div>
  );
}
export default function Checkout() {
  const [completedOrderId, setCompletedOrderId] = useState(null);

  const { user } = useAuth();
  const { cart, notify, appliedCoupon, clearCart } = useStore();
  const [placing, setPlacing] = useState(false);
  const requestId = useRef(null);
  const { loading, items, error, retry } = useSavedProducts(
    cart.map((item) => item.id),
  );
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [sameBilling, setSameBilling] = useState(true);
  const [review, setReview] = useState(null);
  const rows = checkoutRows(items, cart);
  const blocked = rows.some(
    ({ product, entry }) => !product || entry.quantity > product.stock,
  );
  const subtotal = rows.reduce(
    (sum, { product, entry }) =>
      sum +
      (product
        ? Math.max(product.price, product.originalPrice || product.price) *
          entry.quantity
        : 0),
    0,
  );
  const total = rows.reduce(
    (sum, { product, entry }) =>
      sum + (product ? product.price * entry.quantity : 0),
    0,
  );
  const coupon =
    appliedCoupon?.signature === JSON.stringify(cart) &&
    appliedCoupon.subtotal === total
      ? appliedCoupon
      : null;
  async function submit(event) {
    event.preventDefault();
    if (placing) return;
    if (blocked) {
      notify("Update unavailable items or quantities in your cart.", "error");
      return;
    }
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    if (!review) {
      setReview(fields);
      notify("Delivery details are ready for review.");
      return;
    }
    if (paymentMethod !== "cod") {
      notify("Online payment is not connected yet. Choose COD.", "error");
      return;
    }
    if (!requestId.current)
      requestId.current =
        globalThis.crypto?.randomUUID?.() ||
        `order-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setPlacing(true);
    function address(prefix) {
      return Object.fromEntries([
        ...addressFields.map(([key]) => [key, fields[`${prefix}-${key}`]]),
      ]);
    }
    try {
      const data = await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: cart,
          paymentMethod,
          couponCode: coupon?.code || "",
          shipping: address("delivery"),
          billing: sameBilling ? address("delivery") : address("billing"),
          requestId: requestId.current,
        }),
      });
      setCompletedOrderId(data.order._id);
      clearCart();
      notify("Order placed successfully.");
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setPlacing(false);
    }
  }
  if (completedOrderId)
    return <Navigate to={`/thank-you/${completedOrderId}`} replace />;
  if (!cart.length) return <Navigate to="/cart" replace />;
  return (
    <section className="checkout-page">
      <Link to="/cart" className="checkout-back">
        <ArrowLeft size={16} />
        Back to cart
      </Link>
      <h1>Checkout</h1>
      <p className="checkout-intro">Review your items and delivery details.</p>
      {loading ? (
        <Loader label="Loading checkout" />
      ) : error ? (
        <div>
          <PopupMessage message={error} />
          <button className="saved-button" onClick={retry}>
            Try again
          </button>
        </div>
      ) : !cart.length ? (
        <div className="checkout-empty">
          <ShoppingBag size={40} />
          <h2>Your cart is empty</h2>
        </div>
      ) : (
        <div className="checkout-layout">
          <form onSubmit={submit} onChange={() => setReview(null)}>
            <section className="checkout-panel">
              <h2>
                <MapPin size={19} />
                Delivery address
              </h2>
              <AddressFields prefix="delivery" user={user} />
            </section>
            <section className="checkout-panel">
              <h2>Billing address</h2>
              <label className="checkout-checkbox">
                <input
                  type="checkbox"
                  checked={sameBilling}
                  onChange={(event) => {
                    setSameBilling(event.target.checked);
                    setReview(null);
                  }}
                />
                Same as delivery address
              </label>
              {!sameBilling && <AddressFields prefix="billing" user={user} />}
            </section>
            <section className="checkout-panel">
              <h2>
                <CreditCard size={19} />
                Payment
              </h2>
              <div className="checkout-payment-options">
                {[
                  [
                    "cod",
                    "Cash on Delivery (COD)",
                    "Pay when your order arrives.",
                  ],
                  [
                    "online",
                    "Pay Online",
                    "Pay digitally once online payments are connected.",
                  ],
                ].map(([value, label, description]) => (
                  <label
                    key={value}
                    className={`checkout-payment-option ${paymentMethod === value ? "is-selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={value}
                      checked={paymentMethod === value}
                      onChange={() => setPaymentMethod(value)}
                    />
                    <span>
                      <strong>{label}</strong>
                      <small>{description}</small>
                    </span>
                  </label>
                ))}
              </div>
              <p className="checkout-payment-note">
                {paymentMethod === "online"
                  ? "Online payment processing is not connected yet."
                  : "Pay for your order on delivery."}
              </p>
            </section>
            {review && (
              <section
                className="checkout-panel checkout-review"
                aria-live="polite"
              >
                <h2>
                  <Check size={19} />
                  Delivery details
                </h2>
                <p>
                  <strong>{review["delivery-name"]}</strong>
                  <br />
                  {review["delivery-address"]}
                  <br />
                  {review["delivery-city"]}, {review["delivery-state"]} –{" "}
                  {review["delivery-pincode"]}
                  <br />
                  {review["delivery-phone"]}
                  <br />
                  {review["delivery-email"]}
                </p>
                {!sameBilling && (
                  <p>
                    <strong>Billing address</strong>
                    <br />
                    {review["billing-name"]}
                    <br />
                    {review["billing-address"]}
                    <br />
                    {review["billing-city"]}, {review["billing-state"]} –{" "}
                    {review["billing-pincode"]}
                  </p>
                )}
                <p>
                  <strong>Payment method:</strong>{" "}
                  {review.paymentMethod === "cod"
                    ? "Cash on Delivery (COD)"
                    : "Pay Online"}
                </p>
                <p className="checkout-payment-note">
                  Your order has not been placed.
                </p>
              </section>
            )}
            <button
              className="checkout-submit"
              disabled={
                blocked ||
                placing ||
                (Boolean(review) && paymentMethod === "online")
              }
              type="submit"
            >
              {placing
                ? "Placing order…"
                : review
                  ? paymentMethod === "cod"
                    ? "Place order (COD)"
                    : "Pay online unavailable"
                  : "Review order"}
            </button>
          </form>
          <aside className="checkout-panel checkout-summary">
            <h2>Order summary</h2>
            <div className="checkout-items">
              {rows.map(({ id, key, product, entry }) => (
                <article key={key}>
                  {product ? (
                    <>
                      <div className="checkout-item-image">
                        <img src={asset(product.image)} alt={product.name} />
                        <span
                          className="checkout-item-count"
                          aria-label={`${entry.quantity} items`}
                        >
                          {entry.quantity}
                        </span>
                      </div>
                      <div className="checkout-item-details">
                        <Link to={`/products/${product.slug || id}`}>
                          {product.name}
                        </Link>
                        <p>
                          Color: {entry.options?.color || product.color}
                          <br />
                          Size: {entry.options?.size || product.size}
                          {entry.options?.type && (
                            <>
                              <br />
                              Product Type: {entry.options.type}
                            </>
                          )}
                        </p>
                        {entry.quantity > product.stock && (
                          <p className="checkout-error">
                            Only {product.stock} available.
                          </p>
                        )}
                      </div>
                      <strong className="checkout-item-price">
                        {money(product.price * entry.quantity)}
                      </strong>
                    </>
                  ) : (
                    <p className="checkout-error">
                      Product unavailable. Remove it from your cart.
                    </p>
                  )}
                </article>
              ))}
            </div>
            <dl className="checkout-totals">
              <div>
                <dt>Total item price</dt>
                <dd>{money(subtotal)}</dd>
              </div>
              <div className="checkout-saving">
                <dt>Product discounts</dt>
                <dd>−{money(subtotal - total)}</dd>
              </div>
              {coupon && <CouponDiscount coupon={coupon} definitionList />}
              <div>
                <dt>Delivery</dt>
                <dd>Included</dd>
              </div>
              <div className="store-coupon-total">
                <dt>Total</dt>
                <dd className="store-coupon-total-values">
                  {subtotal > total - (coupon?.discount || 0) && (
                    <del>{money(subtotal)}</del>
                  )}
                  <strong>{money(total - (coupon?.discount || 0))}</strong>
                </dd>
              </div>
            </dl>
            {coupon && <CouponApplied coupon={coupon} />}{" "}
            {blocked && (
              <p className="checkout-error">
                Please update your cart before continuing.
              </p>
            )}
            <CouponField subtotal={total} />
          </aside>
        </div>
      )}
    </section>
  );
}
