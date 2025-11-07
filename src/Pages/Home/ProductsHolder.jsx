// ProductsHolder.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
// import CartOffcanvas from "../../Components/CartList/CartList";
import MainProduct from "../../Components/MainProducts/MainProducts";
import Carousel from "react-bootstrap/Carousel";
import { Spinner } from "react-bootstrap";

import { useProducts } from "../../ProductsContext";
import { useCart } from "../../CartContext";
import { calculatePriceForQuantity } from "../../Utils/pricingUtils";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { Desktop, TabletAndBelow } from "../../Utils/mediaQueries";
export const ProductsHolder = ({
  category = "",
  viewType = "slide",
  sortType = "",
  showOnlyBestSellers = false,  // <-- new prop
  searchQuery = "",  // <-- new prop for search

}) => {
  const [startIndex, setStartIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sortOrder, setSortOrder] = useState(""); // New state for sorting
  const [visibleItems, setVisibleItems] = useState(
    window.innerWidth < 768 ? 1 : 4
  ); // Initial visibleItems based on screen size

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryFromQuery = queryParams.get("category") || "";

  // Get products from context - MUST be called before any early returns
  const { products: allProductsData, loading, error } = useProducts();
  
  // Get cart context - MUST be called before any early returns
  const {
    cart,
    setIsOffCanvasOpen,
    addToCart: addToCartBase,
    removeFromCart,
    clearCart,
    incrementQuantity,
    decrementQuantity,
  } = useCart();

  // Wrapper for addToCart that calculates price based on quantity
  const addToCart = (item) => {
    const product = allProductsData.find(p => p.id === item.id);
    if (product) {
      const quantity = item.quantity || 1;
      const priceForQuantity = calculatePriceForQuantity(product, quantity);
      addToCartBase({
        ...item,
        productPrice: priceForQuantity,
        quantity: quantity,
      });
    } else {
      // Fallback if product not found
      addToCartBase(item);
    }
  };

  // Step 1: Optionally filter for best sellers
  let productsToDisplay = allProductsData;
  if (showOnlyBestSellers) {
    productsToDisplay = allProductsData.filter(product => product.bestSeller);
  }

  // Step 2: Category filtering
  let categoryFiltered = categoryFromQuery === "*" || categoryFromQuery === ""
    ? productsToDisplay
    : productsToDisplay.filter((product) =>
        product.category.some(
          (cat) => cat.toLowerCase() === categoryFromQuery.toLowerCase()
        )
      );

  // Step 3: Search filtering
  const filteredProducts = searchQuery.trim()
    ? categoryFiltered.filter((product) => {
        const query = searchQuery.toLowerCase().trim();
        const searchableText = [
          product.name || "",
          product.heading || "",
          product.detail || "",
          product.moreDetail || "",
          product.sufix || "",
          ...(product.category || []),
        ]
          .join(" ")
          .toLowerCase();
        return searchableText.includes(query);
      })
    : categoryFiltered;

  // Sorting logic based on sortType
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortType) {
      // Old format support
      case "low-high-price":
      case "price-asc":
        return a.price - b.price;
      case "high-low-price":
      case "price-desc":
        return b.price - a.price;
      case "high-low-rating":
      case "rating-desc":
        return (b.rating || 0) - (a.rating || 0);
      case "low-high-rating":
      case "rating-asc":
        return (a.rating || 0) - (b.rating || 0);
      default:
        return 0;
    }
  });

  // For sliding view - use sorted products if sortType is provided, otherwise use filtered
  const productsForSliding = sortType ? sortedProducts : filteredProducts;
  const extendedProducts = [
    ...productsForSliding.slice(-visibleItems),
    ...productsForSliding,
    ...productsForSliding.slice(0, visibleItems),
  ];
  const actualStartIndex = startIndex + visibleItems;

  // useEffect MUST be called before any early returns
  useEffect(() => {
    if (isTransitioning) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        if (startIndex === -1) {
          setStartIndex(filteredProducts.length - 1);
        } else if (startIndex === filteredProducts.length) {
          setStartIndex(0);
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isTransitioning, startIndex, filteredProducts.length]);

  const handleNext = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setStartIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrev = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setStartIndex((prevIndex) => prevIndex - 1);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading products...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center py-5">
        <p className="text-danger">Error loading products: {error}</p>
        <p className="text-muted">Please refresh the page or contact support.</p>
      </div>
    );
  }


  // Render logic based on viewType
  if (viewType === "grid") {
    return (
      <div className="products-grid-container">
        {/* Sort Dropdown */}

        <div className="products-grid">
          {sortedProducts.map((product, index) => (
            <div key={index} className="mb-4">
              <MainProduct
                productName={product.name}
                productPrice={product.price}
                firstImg={product.firstImg}
                hoverImg={product.hoverImg}
                rating={product.rating}
                id={product.id}
                onAddToCart={addToCart}
              />
            </div>
          ))}
        </div>

        
      </div>
    );
  }

  // Sliding view (default)
  return (
    <center>
      <div className="prod-slide col-md-11">
        {" "}
        <Desktop>
          {showOnlyBestSellers ? (
            <div style={{ position: "relative", display: "flex", alignItems: "center", padding: "0 60px" }}>
              <button
                onClick={handlePrev}
                style={{
                  position: "absolute",
                  left: "0",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                  border: "2px solid #003057",
                  color: "#003057",
                  fontSize: "24px",
                  cursor: "pointer",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  transition: "all 0.3s ease",
                  outline: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#003057";
                  e.currentTarget.style.color = "#ffffff";
                  e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
                  e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.color = "#003057";
                  e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "translateY(-50%) scale(0.95)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
                }}
              >
                <MdNavigateBefore />
              </button>
              <div
                className="carousel"
                style={{
                  display: "flex",
                  transition: isTransitioning ? "transform 1s ease-in-out" : "none",
                  transform: `translateX(-${
                    (100 / visibleItems) * actualStartIndex
                  }%)`,
                  width: `${(extendedProducts.length / visibleItems) * 25}%`,
                }}
              >
                {extendedProducts.map((product, index) => (
                  <div
                    key={index}
                    style={{
                      flex: `0 0 ${100 / visibleItems}%`,
                      boxSizing: "border-box",
                      padding: "10px",
                    }}
                  >
                    <MainProduct
                      productName={product.name}
                      productPrice={product.price}
                      firstImg={product.firstImg}
                      hoverImg={product.hoverImg}
                      rating={product.rating}
                      id={product.id}
                      onAddToCart={addToCart}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleNext}
                style={{
                  position: "absolute",
                  right: "0",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                  border: "2px solid #003057",
                  color: "#003057",
                  fontSize: "24px",
                  cursor: "pointer",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  transition: "all 0.3s ease",
                  outline: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#003057";
                  e.currentTarget.style.color = "#ffffff";
                  e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
                  e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.color = "#003057";
                  e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "translateY(-50%) scale(0.95)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
                }}
              >
                <MdNavigateNext />
              </button>
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <MdNavigateBefore
                  onClick={handlePrev}
                  style={{ color: "#003057 ", fontSize: "38px" }}
                />

                <MdNavigateNext
                  onClick={handleNext}
                  style={{ color: "#003057 ", fontSize: "38px" }}
                />
              </div>{" "}
              <div
                className="carousel"
                style={{
                  display: "flex",
                  transition: isTransitioning ? "transform 1s ease-in-out" : "none",
                  transform: `translateX(-${
                    (100 / visibleItems) * actualStartIndex
                  }%)`,
                  width: `${(extendedProducts.length / visibleItems) * 25}%`,
                }}
              >
                {extendedProducts.map((product, index) => (
                  <div
                    key={index}
                    style={{
                      flex: `0 0 ${100 / visibleItems}%`,
                      boxSizing: "border-box",
                      padding: "10px",
                    }}
                  >
                    <MainProduct
                      productName={product.name}
                      productPrice={product.price}
                      firstImg={product.firstImg}
                      hoverImg={product.hoverImg}
                      rating={product.rating}
                      id={product.id}
                      onAddToCart={addToCart}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </Desktop>
        <TabletAndBelow>
          <Carousel>
            {extendedProducts.map((product, index) => (
              <Carousel.Item key={index}>
                <div
                  style={{
                    flex: "0 0 100%",
                    boxSizing: "border-box",
                    padding: "10px",
                  }}
                >
                  <MainProduct
                    productName={product.name}
                    productPrice={product.price}
                    firstImg={product.firstImg}
                    hoverImg={product.hoverImg}
                    rating={product.rating}
                    id={product.id}
                    onAddToCart={addToCart}
                  />
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </TabletAndBelow>
        {/* Cart Offcanvas */}
        {/* <CartOffcanvas
          show={setIsOffCanvasOpen}
          onClose={() => setIsOffCanvasOpen(false)}
          cart={cart}
          onRemoveFromCart={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onIncrementQuantity={incrementQuantity}
          onDecrementQuantity={decrementQuantity}
        /> */}
      </div>
    </center>
  );
};
