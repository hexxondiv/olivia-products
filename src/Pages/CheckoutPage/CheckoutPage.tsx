import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../CartContext";
import { allProductsData } from "../../TestData/allProductsData";
import "./checkout-page.scss";
import { MdDelete, MdEmail } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
  } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + item.productPrice * item.quantity, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatProductName = (item: any): string => {
    // Look up the full product data to get name and sufix
    const product = allProductsData.find((p) => p.id === item.id);
    if (product) {
      // Format as "Olivia {name} {sufix}" - trim both name and sufix, ensure proper spacing
      const name = (product.name || "").trim();
      const sufix = (product.sufix || "").trim();
      return `Olivia ${name}${sufix ? ` ${sufix}` : ""}`;
    }
    // Fallback to cart item name if product not found
    return item.productName.trim();
  };

  const generateOrderId = () => {
    // Generate Order ID similar to PHP backend: ORD-YYYYMMDD-XXXXXXXX
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase(); // 8 random chars
    return `ORD-${dateStr}-${randomStr}`;
  };

  const formatOrderForWhatsApp = () => {
    const salesWhatsAppNumber = "+2348068122576";
    const orderId = generateOrderId();
    const orderDate = new Date().toLocaleString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    
    let message = "*###NEW ORDER###* \n\n Hello, Olivia Products!\n";
    message += "I'd like to place a _new order_. Here are the details:\n\n";
    
    message += "*Order ID:* `" + orderId + "`\n";
    message += "*Order Date:* " + orderDate + "\n\n";
    
    message += "*CUSTOMER INFORMATION*\n";
    message += `*Name:* ${formData.fullName}\n`;
    message += `*Email:* ${formData.email}\n`;
    message += `*Phone:* ${formData.phone}\n\n`;
    
    message += "*SHIPPING ADDRESS*\n";
    message += `${formData.address}\n`;
    message += `${formData.city}, ${formData.state}`;
    if (formData.postalCode) {
      message += ` ${formData.postalCode}`;
    }
    message += "\n\n";
    
    message += "*ORDER ITEMS*\n";
    cart.forEach((item, index) => {
      const formattedName = formatProductName(item);
      message += `*${index + 1}. ${formattedName}*\n`;
      message += `   Qty: *${item.quantity}* × ${formatCurrency(item.productPrice)} = *${formatCurrency(item.productPrice * item.quantity)}*\n\n`;
    });
    
    message += `*TOTAL AMOUNT: ${formatCurrency(calculateTotalPrice())}*\n\n`;
    
    if (formData.notes) {
      message += "*SPECIAL NOTES:*\n";
      message += `_${formData.notes}_\n\n`;
    }
    
    message += "Thank you! Looking forward to your confirmation.";
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${salesWhatsAppNumber.replace(/[^0-9]/g, "")}?text=${encodedMessage}`;
    
    return whatsappUrl;
  };

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (cart.length === 0) {
      alert("Your cart is empty. Please add items to your cart before checkout.");
      navigate("/collections");
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Open WhatsApp with pre-filled message
    const whatsappUrl = formatOrderForWhatsApp();
    window.open(whatsappUrl, "_blank");
    
    // Clear cart after opening WhatsApp
    clearCart();
    
    // Generate order ID for WhatsApp submission
    const orderId = generateOrderId();
    
    // Navigate to success page
    navigate("/order-success", {
      state: {
        customer: formData,
        items: cart,
        total: calculateTotalPrice(),
        orderDate: new Date().toISOString(),
        orderId: orderId,
        submittedVia: "whatsapp",
      },
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (cart.length === 0) {
      alert("Your cart is empty. Please add items to your cart before checkout.");
      navigate("/collections");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Prepare order data
    const orderData = {
      customer: formData,
      items: cart,
      total: calculateTotalPrice(),
      orderDate: new Date().toISOString(),
    };

    try {
      // Determine API endpoint URL
      const apiUrl = process.env.REACT_APP_API_URL || '/api/submit-order.php';
      
      // Send order to PHP backend
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // If not JSON, get text to see what we got
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please try again or contact support.');
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to submit order. Please try again.');
      }

      // Order submitted successfully
      console.log("Order submitted successfully:", result);
      
      // Log email status for debugging
      if (result.customerEmailSent) {
        console.log("✓ Customer confirmation email sent successfully");
      } else {
        console.error("✗ Customer confirmation email failed:", result.customerEmailError);
      }
      
      if (result.salesEmailSent) {
        console.log("✓ Sales notification email sent successfully");
      } else {
        console.error("✗ Sales notification email failed:", result.salesEmailError);
      }
      
      if (result.warnings && result.warnings.length > 0) {
        console.warn("Email warnings:", result.warnings);
      }

      // Clear cart before navigating
      clearCart();

      // Navigate to success page with order data (including orderId from server)
      navigate("/order-success", { 
        state: {
          ...orderData,
          orderId: result.orderId,
          salesEmailSent: result.salesEmailSent,
          customerEmailSent: result.customerEmailSent,
        }
      });
    } catch (error) {
      console.error("Error submitting order:", error);
      
      let errorMessage = 'Failed to submit order. Please try again or contact support.';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error: Unable to connect to server. Please check your connection and try again.';
      } else if (error instanceof SyntaxError) {
        errorMessage = 'Server error: Invalid response from server. Please try again or contact support.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setSubmitError(errorMessage);
      setIsSubmitting(false);
    }
  };

  // Redirect to collections if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate("/collections");
    }
  }, [cart.length, navigate]);

  if (cart.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="checkout-page">
      <Container fluid="lg">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <Link to="/collections" className="continue-shopping">
            ← Continue Shopping
          </Link>
        </div>

        <Row className="checkout-content">
          <Col lg={6} className="checkout-form-section">
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-section">
                <h2>Shipping Information</h2>
                <Row>
                  <Col md={12}>
                    <div className="form-group">
                      <label htmlFor="fullName">
                        Full Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={errors.fullName ? "error" : ""}
                        placeholder="Enter your full name"
                      />
                      {errors.fullName && (
                        <span className="error-message">{errors.fullName}</span>
                      )}
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <div className="form-group">
                      <label htmlFor="email">
                        Email <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={errors.email ? "error" : ""}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <span className="error-message">{errors.email}</span>
                      )}
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="form-group">
                      <label htmlFor="phone">
                        Phone Number <span className="required">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={errors.phone ? "error" : ""}
                        placeholder="+234 901 234 5678"
                      />
                      {errors.phone && (
                        <span className="error-message">{errors.phone}</span>
                      )}
                    </div>
                  </Col>
                </Row>

                <div className="form-group">
                  <label htmlFor="address">
                    Address <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={errors.address ? "error" : ""}
                    placeholder="Street address"
                  />
                  {errors.address && (
                    <span className="error-message">{errors.address}</span>
                  )}
                </div>

                <Row>
                  <Col md={4}>
                    <div className="form-group">
                      <label htmlFor="city">
                        City <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={errors.city ? "error" : ""}
                        placeholder="City"
                      />
                      {errors.city && (
                        <span className="error-message">{errors.city}</span>
                      )}
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="form-group">
                      <label htmlFor="state">
                        State <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={errors.state ? "error" : ""}
                        placeholder="State"
                      />
                      {errors.state && (
                        <span className="error-message">{errors.state}</span>
                      )}
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="form-group">
                      <label htmlFor="postalCode">Postal Code</label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="Postal code"
                      />
                    </div>
                  </Col>
                </Row>

                <div className="form-group">
                  <label htmlFor="notes">Order Notes (Optional)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any special instructions for your order..."
                    rows={4}
                  />
                </div>
              </div>

              {submitError && (
                <div className="submit-error">
                  <span className="error-message">{submitError}</span>
                </div>
              )}
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-order-btn email-btn"
                  disabled={isSubmitting}
                >
                  <MdEmail className="btn-icon" />
                  <span>{isSubmitting ? "Processing..." : "Place Order"}</span>
                </button>
                <button 
                  type="button" 
                  className="submit-order-btn whatsapp-btn"
                  onClick={handleWhatsAppSubmit}
                  disabled={isSubmitting}
                >
                  <FaWhatsapp className="btn-icon" />
                  <span>Submit via WhatsApp</span>
                </button>
              </div>
            </form>
          </Col>

          <Col lg={5} className="order-summary-section">
            <div className="order-summary">
              <h2>Order Summary</h2>

              <div className="order-items">
                {cart.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="item-image-wrapper">
                      <img
                        src={item.firstImg}
                        alt={formatProductName(item)}
                        className="item-image"
                      />
                    </div>
                    <div className="item-details">
                      <h4 className="item-name">{formatProductName(item)}</h4>
                      <div className="item-meta">
                        <div className="quantity-controls">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => decrementQuantity(item.id)}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="quantity-value">{item.quantity}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => incrementQuantity(item.id)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <div className="item-price">
                          {formatCurrency(item.productPrice * item.quantity)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="remove-item-btn"
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove item"
                    >
                      <MdDelete />
                    </button>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(calculateTotalPrice())}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span>Calculated at next step</span>
                </div>
                <div className="total-row final-total">
                  <span>Total</span>
                  <span>{formatCurrency(calculateTotalPrice())}</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

