import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../CartContext";
import { useProducts } from "../../ProductsContext";
import { calculatePriceForQuantity, getPricingTier } from "../../Utils/pricingUtils";
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
    addToCart,
  } = useCart();
  const { getProductById } = useProducts();

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
    return cart.reduce((total, item) => {
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

  const generateOrderId = () => {
    // Generate Order ID similar to PHP backend: ORD-YYYYMMDD-XXXXXXXX
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase(); // 8 random chars
    return `ORD-${dateStr}-${randomStr}`;
  };

  const formatOrderForWhatsApp = (orderId?: string) => {
    const salesWhatsAppNumber = process.env.REACT_APP_SALES_WHATSAPP_NUMBER || "+2348068527731";
    // Use provided orderId or generate a new one (for backwards compatibility)
    const orderIdToUse = orderId || generateOrderId();
    const orderDate = new Date().toLocaleString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    
    let message = "*NEW ORDER PLACED*\n================== \n Hello, Olivia Products!\n";
    message += "I'd like to place a _new order_. Here are the details:\n\n";
    
    message += "*Order ID:* `" + orderIdToUse + "`\n";
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
      const product = getProductById(item.id);
      
      // Calculate tier-corrected price based on quantity (ensures correct pricing tier is applied)
      const pricePerUnit = getItemPrice(item); // This recalculates price based on quantity and tier
      
      // Determine pricing tier for display
      let tierInfo = '';
      if (product) {
        const tier = getPricingTier(product, item.quantity);
        if (tier === 'distributor' && product.distributorMinQty) {
          tierInfo = ` [Distributor Pricing - Min Qty: ${product.distributorMinQty}]`;
        } else if (tier === 'wholesale' && product.wholesaleMinQty) {
          tierInfo = ` [Wholesale Pricing - Min Qty: ${product.wholesaleMinQty}]`;
        } else if (tier === 'retail' && product.retailMinQty) {
          tierInfo = ` [Retail Pricing - Min Qty: ${product.retailMinQty}]`;
        } else if (tier !== 'legacy') {
          tierInfo = ` [${tier.charAt(0).toUpperCase() + tier.slice(1)} Pricing]`;
        }
      }
      
      // Calculate item total using tier-corrected price
      const itemTotal = pricePerUnit * item.quantity;
      
      message += `*${index + 1}. ${formattedName}*${tierInfo}\n`;
      message += `   Qty: *${item.quantity}* × ${formatCurrency(pricePerUnit)} = *${formatCurrency(itemTotal)}*\n\n`;
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

  const handleWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    if (cart.length === 0) {
      alert("Your cart is empty. Please add items to your cart before checkout.");
      navigate("/collections");
      setIsSubmitting(false);
      return;
    }

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    // Prepare order data
    const orderData = {
      customer: formData,
      items: cart,
      total: calculateTotalPrice(),
      orderDate: new Date().toISOString(),
      submittedVia: "whatsapp",
    };

    try {
      // Determine API endpoint URL
      // For submit-order.php, we need the full endpoint URL, not just the base
      const baseApiUrl = process.env.REACT_APP_API_URL || '/api';
      // If it's already a full URL with submit-order.php, use it; otherwise append
      const submitUrl = baseApiUrl.includes('submit-order.php') 
        ? baseApiUrl 
        : baseApiUrl.includes('.php')
          ? baseApiUrl.replace(/[^/]+\.php$/, 'submit-order.php')
          : `${baseApiUrl}/submit-order.php`;
      
      // Send order to PHP backend to save to database
      const response = await fetch(submitUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please try again or contact support.');
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to submit order. Please try again.');
      }

      // Order saved to database successfully
      console.log("Order saved to database:", result);
      
      // Generate order ID from result or create one
      const orderId = result.orderId || generateOrderId();
      
      // Open WhatsApp with pre-filled message (using the orderId from database)
      const whatsappUrl = formatOrderForWhatsApp(orderId);
      window.open(whatsappUrl, "_blank");
      
      // Clear cart after opening WhatsApp
      clearCart();
      
      // Navigate to success page with order data (including orderId from server)
      navigate("/order-success", {
        state: {
          ...orderData,
          orderId: orderId,
          submittedVia: "whatsapp",
          salesEmailSent: result.salesEmailSent,
          customerEmailSent: result.customerEmailSent,
        },
      });
    } catch (error) {
      console.error("Error submitting WhatsApp order:", error);
      
      let errorMessage = 'Failed to submit order. Please try again or contact support.';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error: Unable to connect to server. Please check your connection and try again.';
      } else if (error instanceof SyntaxError) {
        errorMessage = 'Server response error. Please try again or contact support.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setSubmitError(errorMessage);
      setIsSubmitting(false);
    }
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

  const handleQuantityChange = (item: any, e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty input while typing
    if (inputValue === '') {
      return;
    }
    
    const numValue = parseInt(inputValue, 10);
    
    // Check if it's a valid number
    if (isNaN(numValue) || numValue < 1) {
      return;
    }
    
    const product = getProductById(item.id);
    
    // Check stock limit if stock tracking is enabled
    let maxQty = Infinity;
    if (product && product.stockEnabled && product.stockQuantity !== undefined) {
      maxQty = product.stockQuantity;
      // Allow backorders if enabled
      if (product.allowBackorders && product.stockQuantity === 0) {
        maxQty = Infinity;
      }
    }
    
    const newQuantity = Math.min(Math.max(1, numValue), maxQty);
    
    if (product) {
      const newPrice = calculatePriceForQuantity(product, newQuantity);
      addToCart({
        id: item.id,
        productName: item.productName,
        productPrice: newPrice,
        firstImg: item.firstImg,
        quantity: newQuantity,
      });
    } else {
      // Fallback to increment/decrement if product not found
      if (newQuantity > item.quantity) {
        for (let i = item.quantity; i < newQuantity; i++) {
          incrementQuantity(item.id);
        }
      } else if (newQuantity < item.quantity) {
        for (let i = item.quantity; i > newQuantity; i--) {
          if (item.quantity > 1) {
            decrementQuantity(item.id);
          }
        }
      }
    }
  };

  const getMaxQuantity = (item: any) => {
    const product = getProductById(item.id);
    if (!product || !product.stockEnabled) return undefined;
    if (product.stockQuantity === undefined) return undefined;
    if (product.allowBackorders && product.stockQuantity === 0) return undefined;
    return product.stockQuantity;
  };

  // Validate stock availability for all cart items
  const validateStock = () => {
    const stockErrors: Array<{ productName: string; message: string; availableQuantity: number }> = [];
    
    cart.forEach((item) => {
      const product = getProductById(item.id);
      if (product && product.stockEnabled) {
        const stockQty = product.stockQuantity ?? 0;
        const requestedQty = item.quantity;
        
        if (stockQty < requestedQty) {
          if (stockQty === 0 && !product.allowBackorders) {
            stockErrors.push({
              productName: formatProductName(item),
              message: 'Out of stock',
              availableQuantity: 0
            });
          } else if (stockQty > 0) {
            stockErrors.push({
              productName: formatProductName(item),
              message: `Only ${stockQty} available`,
              availableQuantity: stockQty
            });
          }
        }
      }
    });
    
    return stockErrors;
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

    // Validate stock before submitting
    const stockErrors = validateStock();
    if (stockErrors.length > 0) {
      const errorMessages = stockErrors.map(err => 
        `${err.productName}: ${err.message}${err.availableQuantity > 0 ? ` (${err.availableQuantity} available)` : ''}`
      ).join('\n');
      setSubmitError(`Stock validation failed:\n${errorMessages}`);
      setIsSubmitting(false);
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
        // Handle stock validation errors from backend
        if (result.stockErrors && Array.isArray(result.stockErrors)) {
          const stockErrorMessages = result.stockErrors.map((err: any) => 
            `${err.productName}: ${err.message}${err.availableQuantity > 0 ? ` (${err.availableQuantity} available)` : ''}`
          ).join('\n');
          throw new Error(`Stock validation failed:\n${stockErrorMessages}`);
        }
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
                            onClick={() => {
                              if (item.quantity > 1) {
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
                              }
                            }}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={getMaxQuantity(item)}
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item, e)}
                            onBlur={(e) => {
                              // Ensure minimum of 1 on blur
                              if (e.target.value === '' || parseInt(e.target.value, 10) < 1) {
                                const product = getProductById(item.id);
                                if (product) {
                                  const newPrice = calculatePriceForQuantity(product, 1);
                                  addToCart({
                                    id: item.id,
                                    productName: item.productName,
                                    productPrice: newPrice,
                                    firstImg: item.firstImg,
                                    quantity: 1,
                                  });
                                } else {
                                  // Reset to 1 using increment/decrement
                                  while (item.quantity > 1) {
                                    decrementQuantity(item.id);
                                  }
                                }
                              }
                            }}
                            className="quantity-input"
                            aria-label="Quantity"
                          />
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => {
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
                            }}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <div className="item-price">
                          {formatCurrency(getItemPrice(item) * item.quantity)}
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

