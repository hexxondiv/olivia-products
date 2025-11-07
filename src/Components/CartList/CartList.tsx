import React, { useState, useMemo } from "react";
import { Offcanvas } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../CartContext";
import { useProducts } from "../../ProductsContext";
import { calculatePriceForQuantity } from "../../Utils/pricingUtils";
import "./cart-list.scss";
import { MdDelete } from "react-icons/md";
import { BiSearch } from "react-icons/bi";

const CartOffcanvas: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    isOffCanvasOpen,
    setIsOffCanvasOpen,
    removeFromCart,
    clearCart,
    incrementQuantity,
    decrementQuantity,
    addToCart,
  } = useCart();
  const { getProductById } = useProducts();

  const [searchQuery, setSearchQuery] = useState("");

  const formatProductName = (item: any): string => {
    // Look up the full product data to get name and sufix
    const product = getProductById(item.id);
    if (product) {
      // Format as "Olivia {name} {sufix}" - trim both name and sufix, ensure proper spacing
      const name = (product.name || "").trim();
      const sufix = (product.sufix || "").trim();
      return `Olivia ${name}${sufix ? ` ${sufix}` : ""}`;
    }
    // Fallback to cart item name if product not found
    return item.productName.trim();
  };

  const filteredCart = useMemo(() => {
    if (!searchQuery.trim()) {
      return cart;
    }
    const query = searchQuery.toLowerCase().trim();
    return cart.filter((item) => {
      const formattedName = formatProductName(item);
      return formattedName.toLowerCase().includes(query);
    });
  }, [cart, searchQuery]);

  const calculateTotalPrice = () => {
    return filteredCart.reduce((total, item) => {
      const product = getProductById(item.id);
      if (product) {
        const pricePerUnit = calculatePriceForQuantity(product, item.quantity);
        return total + pricePerUnit * item.quantity;
      }
      // Fallback to stored price if product not found
      return total + item.productPrice * item.quantity;
    }, 0);
  };

  const getItemPrice = (item: any) => {
    const product = getProductById(item.id);
    if (product) {
      return calculatePriceForQuantity(product, item.quantity);
    }
    return item.productPrice;
  };

  const handleIncrement = (item: any) => {
    const product = getProductById(item.id);
    if (product) {
      const newQuantity = item.quantity + 1;
      const newPrice = calculatePriceForQuantity(product, newQuantity);
      addToCart({
        id: item.id,
        productName: item.productName,
        productPrice: newPrice,
        firstImg: item.firstImg,
        quantity: newQuantity,
      });
    } else {
      incrementQuantity(item.id);
    }
  };

  const handleDecrement = (item: any) => {
    if (item.quantity <= 1) return;
    const product = getProductById(item.id);
    if (product) {
      const newQuantity = item.quantity - 1;
      const newPrice = calculatePriceForQuantity(product, newQuantity);
      addToCart({
        id: item.id,
        productName: item.productName,
        productPrice: newPrice,
        firstImg: item.firstImg,
        quantity: newQuantity,
      });
    } else {
      decrementQuantity(item.id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleClose = () => {
    setIsOffCanvasOpen(false);
    setSearchQuery(""); // Clear search when cart closes
  };

  const handleItemClick = () => {
    setIsOffCanvasOpen(false); // Close cart when navigating to product page
    setSearchQuery(""); // Clear search
  };

  const handleCheckout = () => {
    setIsOffCanvasOpen(false); // Close cart
    setSearchQuery(""); // Clear search
    navigate("/checkout"); // Navigate to checkout page
  };

  return (
    <Offcanvas
      show={isOffCanvasOpen}
      onHide={handleClose}
      placement="end"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          <h3>Your Cart</h3>
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {cart.length > 0 && (
          <div className="cart-search-container">
            <BiSearch className="search-icon" />
            <input
              type="text"
              className="cart-search-input"
              placeholder="Search cart items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search cart items"
            />
          </div>
        )}
        <div className="cart-items-container">
          {cart.length === 0 ? (
            <h5>Your cart is empty!</h5>
          ) : filteredCart.length === 0 ? (
            <h5>No items found matching "{searchQuery}"</h5>
          ) : (
            filteredCart.map((item) => (
              <div
                key={item.id}
                className="item-list"
              >
                <MdDelete
                  onClick={() => removeFromCart(item.id)}
                  className="remove-btn"
                  title="remove"
                  aria-label="Remove item"
                />
                <Link
                  to={`/product/${item.id}`}
                  onClick={handleItemClick}
                  className="item-list-content"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <img
                    className="item-image"
                    src={item.firstImg}
                    alt={formatProductName(item)}
                  />
                  <div className="item-details">
                    <p className="item-name">{formatProductName(item)}</p>
                  </div>
                </Link>
                <div className="item-actions">
                  <p className="item-price">{formatCurrency(getItemPrice(item) * item.quantity)}</p>
                  <div className="increments">
                    <button
                      type="button"
                      className="increment-btn"
                      onClick={() => handleIncrement(item)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      type="button"
                      className="increment-btn"
                      onClick={() => handleDecrement(item)}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-total-row">
            <div className="cart-total">
              <h5>Total: {formatCurrency(calculateTotalPrice())}</h5>
            </div>
            {cart.length > 1 && (
              <button onClick={clearCart} className="clear-all" type="button">
                Clear All
              </button>
            )}
          </div>
          {filteredCart.length > 0 && (
            <button className="checkout-btn" type="button" onClick={handleCheckout}>
              Checkout
            </button>
          )}
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default CartOffcanvas;
