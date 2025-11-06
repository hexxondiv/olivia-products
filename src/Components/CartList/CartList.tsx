import React, { useState, useMemo } from "react";
import { Offcanvas } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../CartContext";
import { allProductsData } from "../../TestData/allProductsData";
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
  } = useCart();

  const [searchQuery, setSearchQuery] = useState("");

  const formatProductName = (item: any): string => {
    // Look up the full product data to get name and sufix
    const product = allProductsData.find((p) => p.id === item.id);
    if (product) {
      // Format as "Olivia {name}{sufix}" - trim any trailing spaces from name
      const name = (product.name || "").trim();
      const sufix = product.sufix || "";
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

  const calculateTotalPrice = () =>
    filteredCart.reduce((total, item) => total + item.productPrice * item.quantity, 0);

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
                  <p className="item-price">{formatCurrency(item.productPrice * item.quantity)}</p>
                  <div className="increments">
                    <button
                      type="button"
                      className="increment-btn"
                      onClick={() => incrementQuantity(item.id)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      type="button"
                      className="increment-btn"
                      onClick={() => decrementQuantity(item.id)}
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
