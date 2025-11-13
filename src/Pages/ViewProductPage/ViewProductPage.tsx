
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useProducts } from "../../ProductsContext";
import { useCart } from "../../CartContext";
import { calculatePriceForQuantity } from "../../Utils/pricingUtils";
import "./view-product.scss";
import { Desktop, TabletAndBelow } from "../../Utils/mediaQueries";
import { Spinner, Alert } from "react-bootstrap";
import { ProductReviews } from "./ProductReviews";
import { ReviewForm } from "./ReviewForm";

const PRODUCT_DETAIL_BASE = "/product";

export const ViewProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeImage, setActiveImage] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState<"left" | "right">("right");
  const [quantity, setQuantity] = useState(1);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);
  const [isProductDetailsExpanded, setIsProductDetailsExpanded] = useState(false);
  const { addToCart, cart, updateQuantity } = useCart();
  const { getProductById, products: allProductsData, loading, error } = useProducts();

  // Always call hooks before any early returns
  const product = useMemo(() => {
    const pid = Number(id);
    if (Number.isNaN(pid)) return undefined;
    return getProductById(pid);
  }, [id, getProductById]);

  const images = useMemo(() => {
    if (!product) return [];
    return [product.firstImg, product.hoverImg, ...(product.additionalImgs || [])].filter(Boolean);
  }, [product]);

  // Clean categories (ignore empty strings)
  const cleanCats = useMemo<string[]>(() => {
    const cats = (product?.category || []).filter(Boolean);
    return cats.map((c) => c.toLowerCase());
  }, [product]);

  const related = useMemo(() => {
    if (!product || cleanCats.length === 0) return [];
    const set = new Set(cleanCats);
    return allProductsData
      .filter((p) => p.id !== product.id)
      .filter((p) =>
        (p.category || [])
          .filter(Boolean)
          .map((c) => c.toLowerCase())
          .some((c) => set.has(c))
      )
      .slice(0, 8);
  }, [product, cleanCats, allProductsData]);

  useEffect(() => {
    setActiveImage(0);
    setIsProductDetailsExpanded(false);
    // Sync quantity with cart item if it exists
    if (product) {
      const cartItem = cart.find((item) => item.id === product.id);
      setQuantity(cartItem ? cartItem.quantity : 1);
    } else {
      setQuantity(1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, product, cart]);

  const primaryCategory = cleanCats[0] || "";

  // Handle loading state
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading product...</p>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container py-5">
        <Alert variant="danger">
          <Alert.Heading>Error loading product</Alert.Heading>
          <p>{error}</p>
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            Go back
          </button>
        </Alert>
      </div>
    );
  }

  // EARLY RETURN — make sure we return JSX or null
  if (!product) {
    return (
      <div className="container py-5">
        <p>That product wasn't found.</p>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    );
  }

  const formatProductName = () => {
    // Format as "Olivia {name} {sufix}" - trim both name and sufix, ensure proper spacing
    const name = (product.name || "").trim();
    const sufix = (product.sufix || "").trim();
    return `Olivia ${name}${sufix ? ` ${sufix}` : ""}`;
  };

  const handleAddToCart = async () => {
    const priceForQuantity = calculatePriceForQuantity(product, quantity);
    await addToCart({
      id: product.id,
      productName: formatProductName(),
      productPrice: priceForQuantity,
      firstImg: product.firstImg,
      quantity,
    });
  };

  const dec = () => {
    setQuantity((q) => {
      const newQty = q > 1 ? q - 1 : q;
      // Update cart if item exists
      if (product) {
        const cartItem = cart.find((item) => item.id === product.id);
        if (cartItem) {
          const newPrice = calculatePriceForQuantity(product, newQty);
          updateQuantity(product.id, newQty);
          // Update price in cart
          addToCart({
            id: product.id,
            productName: formatProductName(),
            productPrice: newPrice,
            firstImg: product.firstImg,
            quantity: newQty,
          });
        }
      }
      return newQty;
    });
  };

  const inc = () => {
    setQuantity((q) => {
      // Check stock limit if stock tracking is enabled
      let maxQty = Infinity;
      if (product.stockEnabled && product.stockQuantity !== undefined) {
        maxQty = product.stockQuantity;
        // Allow backorders if enabled
        if (product.allowBackorders && product.stockQuantity === 0) {
          maxQty = Infinity;
        }
      }
      
      const newQty = Math.min(q + 1, maxQty);
      // Update cart if item exists
      if (product) {
        const cartItem = cart.find((item) => item.id === product.id);
        if (cartItem) {
          const newPrice = calculatePriceForQuantity(product, newQty);
          updateQuantity(product.id, newQty);
          // Update price in cart
          addToCart({
            id: product.id,
            productName: formatProductName(),
            productPrice: newPrice,
            firstImg: product.firstImg,
            quantity: newQty,
          });
        }
      }
      return newQty;
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty input while typing
    if (inputValue === '') {
      setQuantity(1);
      return;
    }
    
    const numValue = parseInt(inputValue, 10);
    
    // Check if it's a valid number
    if (isNaN(numValue) || numValue < 1) {
      return;
    }
    
    // Check stock limit if stock tracking is enabled
    let maxQty = Infinity;
    if (product.stockEnabled && product.stockQuantity !== undefined) {
      maxQty = product.stockQuantity;
      // Allow backorders if enabled
      if (product.allowBackorders && product.stockQuantity === 0) {
        maxQty = Infinity;
      }
    }
    
    const newQty = Math.min(Math.max(1, numValue), maxQty);
    
    // Update cart if item exists
    if (product) {
      const cartItem = cart.find((item) => item.id === product.id);
      if (cartItem) {
        const newPrice = calculatePriceForQuantity(product, newQty);
        updateQuantity(product.id, newQty);
        // Update price in cart
        addToCart({
          id: product.id,
          productName: formatProductName(),
          productPrice: newPrice,
          firstImg: product.firstImg,
          quantity: newQty,
        });
      }
    }
    
    setQuantity(newQty);
  };

  const getMaxQuantity = () => {
    if (!product.stockEnabled) return undefined;
    if (product.stockQuantity === undefined) return undefined;
    if (product.allowBackorders && product.stockQuantity === 0) return undefined;
    return product.stockQuantity;
  };
  
  // Check if product is available for purchase
  const isAvailable = () => {
    if (!product.stockEnabled) return true; // Unlimited stock
    if (product.stockQuantity === undefined) return true;
    if (product.stockQuantity > 0) return true;
    if (product.allowBackorders) return true; // Backorders allowed
    return false; // Out of stock
  };
  
  // Get stock status message
  const getStockMessage = () => {
    if (!product.stockEnabled) return null;
    
    const stockQty = product.stockQuantity ?? 0;
    const status = product.stockStatus;
    
    if (status === 'out_of_stock' && !product.allowBackorders) {
      return { text: 'Out of Stock', type: 'danger' };
    }
    if (status === 'low_stock' && stockQty > 0) {
      return { text: `Only ${stockQty} left!`, type: 'warning' };
    }
    if (status === 'on_backorder') {
      return { text: 'Available for Backorder', type: 'info' };
    }
    if (status === 'in_stock') {
      return null; // No message needed for in stock
    }
    return null;
  };

  return (
    <>
      <div className="product-detail d-md-flex col-md-10 offset-md-1">
        <TabletAndBelow> {primaryCategory && (
            <div className="mt-3 all-sections">
              <Link to={`/collections?category=${encodeURIComponent(primaryCategory)}`} style={{ color: product.color }}>
                ← Back to all in “{primaryCategory}”
              </Link>
            </div>
          )}</TabletAndBelow>
        {/* Images */}
        <div className="product-images col-md-6 d-md-flex flex-md-column">
          <div className="d-md-flex">
            <div className="image-thumbnails col-2">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className={`thumbnail ${index === activeImage ? "active" : ""}`}
                  onClick={() => {
                    setTransitionDirection(index > activeImage ? "right" : "left");
                    setActiveImage(index);
                  }}
                />
              ))}
            </div>

            <div className="main-carousel col-md-10">
              <Desktop> {primaryCategory && (
              <div className="mt-3 all-sections">
                <Link to={`/collections?category=${encodeURIComponent(primaryCategory)}`} style={{ color: product.color }}>
                  ← Back to all in "{primaryCategory}"
                </Link>
              </div>
            )}</Desktop>
              <div
                className={`image-container ${transitionDirection}`}
                style={{ transform: `translateX(-${activeImage * 100}%)` }}
              >
                {images.map((img, idx) => (
                  <img key={idx} src={img} alt="" className="main-image" width="100%" />
                ))}
              </div>

              <button
                className="prev-arrow"
                onClick={() => setActiveImage((prev) => (prev - 1 + images.length) % images.length)}
                aria-label="Previous image"
              >
                <span className="arrow-icon">←</span>
              </button>

              <button
                className="next-arrow"
                onClick={() => setActiveImage((prev) => (prev + 1) % images.length)}
                aria-label="Next image"
              >
                <span className="arrow-icon">→</span>
              </button>
            </div>
          </div>

          {/* Reviews Section - Desktop only, under images */}
          <Desktop>
            <div className="reviews-section-desktop mt-4">
              <ProductReviews productId={product.id} refreshTrigger={reviewRefreshTrigger} />
              <ReviewForm 
                productId={product.id} 
                productName={formatProductName()}
                onReviewSubmitted={() => {
                  setReviewRefreshTrigger(prev => prev + 1);
                }}
              />
            </div>
          </Desktop>
        </div>

        {/* Details */}
        <div className="product-info col-md-5 offset-md-0 col-12">
          <h1>
            Olivia <span style={{ color: product.color }}>{(product.name || "").trim()}</span>
            {(product.sufix || "").trim() ? ` ${(product.sufix || "").trim()}` : ""}
          </h1>

        <em>  {product.tagline && <p>{product.tagline}</p>}</em>

          {/* Collapsible Product Details */}
          {product.moreDetail && (
            <div className="product-details-section">
              <button
                type="button"
                className="product-details-toggle"
                onClick={() => setIsProductDetailsExpanded(!isProductDetailsExpanded)}
                aria-expanded={isProductDetailsExpanded}
              >
                <span>Product Details</span>
                <span className={`toggle-icon ${isProductDetailsExpanded ? "expanded" : ""}`}>
                  ▼
                </span>
              </button>
              <div className={`product-details-content ${isProductDetailsExpanded ? "expanded" : ""}`}>
                <div className="product-details-content-inner">
                  <p className="product-details-text" style={{ whiteSpace: 'pre-line' }}>
                    {product.moreDetail}
                  </p>
                </div>
              </div>
            </div>
          )}

          <h5>Fruity Ingredients:</h5>
          <ul className="list-unstyled">
            {(product.flavours ?? []).map((item: any) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
          
          {/* Stock Status */}
          {product.stockEnabled && (
            <div className="mb-3">
              {(() => {
                const stockMsg = getStockMessage();
                if (stockMsg) {
                  return (
                    <Alert variant={stockMsg.type as any} className="mb-2 py-2">
                      <strong>{stockMsg.text}</strong>
                    </Alert>
                  );
                }
                return null;
              })()}
            </div>
          )}
          
          <div className="d-flex"><h6>Select Quantity</h6>
          <div className="quantity-controls" aria-label="Quantity selector">
            <span onClick={dec} className="decrement-btn" style={{ cursor: "pointer" }}>
              –
            </span>
            <input
              type="number"
              min="1"
              max={getMaxQuantity()}
              value={quantity}
              onChange={handleQuantityChange}
              onBlur={(e) => {
                // Ensure minimum of 1 on blur
                if (e.target.value === '' || parseInt(e.target.value, 10) < 1) {
                  setQuantity(1);
                }
              }}
              className="quantity-input"
              aria-label="Quantity"
            />
            <span 
              onClick={inc} 
              className="increment-btn" 
              style={{ 
                cursor: product.stockEnabled && product.stockQuantity !== undefined && 
                        !product.allowBackorders && quantity >= (product.stockQuantity || 0) 
                        ? "not-allowed" : "pointer",
                opacity: product.stockEnabled && product.stockQuantity !== undefined && 
                         !product.allowBackorders && quantity >= (product.stockQuantity || 0) 
                         ? 0.5 : 1
              }}
            >
              +
            </span>
          </div></div>

          <button 
            className="add-to-cart2" 
            onClick={handleAddToCart}
            disabled={!isAvailable()}
            style={{
              opacity: isAvailable() ? 1 : 0.5,
              cursor: isAvailable() ? "pointer" : "not-allowed"
            }}
          >
            {isAvailable() 
              ? `Add to Cart | ₦${(calculatePriceForQuantity(product, quantity) * quantity).toLocaleString()}`
              : "Out of Stock"
            }
          </button>


{/* More in this category */}
      {related.length > 0 ? (
        <div className="mt-4">
          <h5 className="mb-3">
            More in {primaryCategory ? `“${primaryCategory}”` : "this category"}
          </h5>
          <div className="row g-3">
            {related.map((rp) => (
              <div className="col-4 col-md-2" key={rp.id}>
                <Link
                  to={`${PRODUCT_DETAIL_BASE}/${rp.id}`}
                  className="d-block text-decoration-none border rounded p-2 h-100 related-card"
                  onClick={() => setActiveImage(0)}
                >
                  <img src={rp.firstImg} alt={rp.name} className="img-fluid mb-2" />
                  <div className="small fw-semibold">{rp.name}</div>
                  {rp.price !== undefined && (
                    <div className="small text-muted">
                      ₦{Number(rp.price).toLocaleString()}
                    </div>
                  )}
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : null}

        </div>
      </div>

      {/* Reviews Section - Mobile/Tablet only */}
      <TabletAndBelow>
        <div className="container col-md-10 offset-md-1 mt-5">
          <ProductReviews productId={product.id} refreshTrigger={reviewRefreshTrigger} />
          <ReviewForm 
            productId={product.id} 
            productName={formatProductName()}
            onReviewSubmitted={() => {
              setReviewRefreshTrigger(prev => prev + 1);
            }}
          />
        </div>
      </TabletAndBelow>
      
    </>
  );
};
