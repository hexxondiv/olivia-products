import React, { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { allProductsData } from "../../TestData/allProductsData";
import "./success-page.scss";
import { MdCheckCircle, MdShoppingBag, MdHome } from "react-icons/md";

interface OrderItem {
  id: number;
  productName: string;
  productPrice: number;
  firstImg: string;
  quantity: number;
}

interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  notes?: string;
}

interface OrderData {
  customer: CustomerInfo;
  items: OrderItem[];
  total: number;
  orderDate: string;
  orderId?: string;
  salesEmailSent?: boolean;
  customerEmailSent?: boolean;
  submittedVia?: "email" | "whatsapp";
}

export const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state as OrderData | null;

  useEffect(() => {
    // Redirect to home if no order data (direct access)
    if (!orderData) {
      navigate("/");
    }
  }, [orderData, navigate]);

  if (!orderData) {
    return null; // Will redirect
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatProductName = (item: OrderItem): string => {
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

  return (
    <div className="success-page">
      <Container fluid="lg">
        <div className="success-content">
          <div className="success-icon-wrapper">
            <MdCheckCircle className="success-icon" />
          </div>

          <h1 className="success-title">Order Placed Successfully!</h1>
          <p className="success-message">
            Thank you for your order, <strong>{orderData.customer.fullName}</strong>! We've received
            your order and will contact you shortly to confirm the details.
          </p>
          {orderData.submittedVia === "whatsapp" ? (
            <div className="whatsapp-notification">
              <p>
                <strong>📱 Order Submitted via WhatsApp!</strong> Your order has been sent to our sales team via WhatsApp. 
                We'll respond to your message shortly to confirm your order details.
              </p>
            </div>
          ) : (
            <>
              {orderData.customerEmailSent !== false && (
                <div className="email-notification">
                  <p>
                    <strong>📧 Confirmation Email Sent!</strong> We've sent a confirmation email to{" "}
                    <strong>{orderData.customer.email}</strong>. Please check your inbox (and spam folder) 
                    for order details.
                  </p>
                </div>
              )}
              {orderData.customerEmailSent === false && (
                <div className="email-warning">
                  <p>
                    <strong>⚠️ Email Notice:</strong> We were unable to send a confirmation email to{" "}
                    <strong>{orderData.customer.email}</strong>. Don't worry - your order has been received 
                    and we'll contact you via phone to confirm the details.
                  </p>
                </div>
              )}
            </>
          )}

          <div className="order-details-card">
            <div className="order-header">
              <MdShoppingBag className="order-icon" />
              <h2>Order Details</h2>
            </div>

            <Row className="order-info">
              <Col md={6} className="info-section">
                <h3>Shipping Information</h3>
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{orderData.customer.fullName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{orderData.customer.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{orderData.customer.phone}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Address:</span>
                  <span className="info-value">
                    {orderData.customer.address}, {orderData.customer.city}, {orderData.customer.state}
                    {orderData.customer.postalCode && ` ${orderData.customer.postalCode}`}
                  </span>
                </div>
              </Col>

              <Col md={6} className="info-section">
                <h3>Order Summary</h3>
                {orderData.orderId && (
                  <div className="info-item">
                    <span className="info-label">Order ID:</span>
                    <span className="info-value">{orderData.orderId}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-label">Order Date:</span>
                  <span className="info-value">{formatDate(orderData.orderDate)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Items:</span>
                  <span className="info-value">{orderData.items.length} item(s)</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total:</span>
                  <span className="info-value total-amount">{formatCurrency(orderData.total)}</span>
                </div>
              </Col>
            </Row>

            <div className="order-items-section">
              <h3>Order Items</h3>
              <div className="order-items-list">
                {orderData.items.map((item) => (
                  <div key={item.id} className="order-item-card">
                    <img src={item.firstImg} alt={formatProductName(item)} className="item-image" />
                    <div className="item-info">
                      <h4 className="item-name">{formatProductName(item)}</h4>
                      <div className="item-details">
                        <span className="item-quantity">Quantity: {item.quantity}</span>
                        <span className="item-price">{formatCurrency(item.productPrice * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {orderData.customer.notes && (
              <div className="order-notes">
                <h3>Order Notes</h3>
                <p>{orderData.customer.notes}</p>
              </div>
            )}
          </div>

          <div className="success-actions">
            <Link to="/" className="btn-home">
              <MdHome />
              Back to Home
            </Link>
            <Link to="/collections" className="btn-continue">
              Continue Shopping
            </Link>
          </div>

            <div className="next-steps">
              <h3>What's Next?</h3>
              <ul>
                {orderData.submittedVia === "whatsapp" ? (
                  <>
                    <li>Our team will respond to your WhatsApp message within 24 hours to confirm your order</li>
                    <li>We'll process your order and prepare it for shipping</li>
                    <li>You'll receive tracking information once your order ships</li>
                    <li>Keep an eye on your WhatsApp for order updates and confirmation</li>
                  </>
                ) : (
                  <>
                    <li>You will receive an email confirmation shortly - please check your inbox and spam folder</li>
                    <li>Our team will contact you within 24 hours to confirm your order</li>
                    <li>We'll process your order and prepare it for shipping</li>
                    <li>You'll receive tracking information once your order ships</li>
                  </>
                )}
              </ul>
            </div>
        </div>
      </Container>
    </div>
  );
};

