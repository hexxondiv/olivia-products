// ProductsHolder.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
// import CartOffcanvas from "../../Components/CartList/CartList";
import MainProduct from "../../Components/MainProducts/MainProducts";
import Carousel from "react-bootstrap/Carousel";

import { allProductsData } from "../../TestData/allProductsData";
import { useCart } from "../../CartContext";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { Desktop, TabletAndBelow } from "../../Utils/mediaQueries";
import "./products-holder.scss";

export const ProductsHolder = ({
  category = "",
  viewType = "slide",
  sortType = "",
  showOnlyBestSellers = false,  // <-- new prop

}) => {
  const [startIndex, setStartIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sortOrder, setSortOrder] = useState(""); // New state for sorting
  
  // Calculate visible items based on screen width with proper breakpoints
  const getVisibleItems = useCallback(() => {
    const width = window.innerWidth;
    if (width < 576) return 1;      // Mobile: 1 item
    if (width < 768) return 1;       // Small tablet: 1 item
    if (width < 992) return 2;      // Tablet: 2 items
    if (width < 1200) return 3;     // Small desktop: 3 items
    return 4;                        // Large desktop: 4 items
  }, []);

  const [visibleItems, setVisibleItems] = useState(getVisibleItems);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryFromQuery = queryParams.get("category") || "";

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newVisibleItems = getVisibleItems();
      if (newVisibleItems !== visibleItems) {
        setVisibleItems(newVisibleItems);
        // Reset to first item when breakpoint changes
        setStartIndex(0);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [visibleItems, getVisibleItems]);

// Step 1: Optionally filter for best sellers
let productsToDisplay = allProductsData;
if (showOnlyBestSellers) {
  productsToDisplay = allProductsData.filter(product => product.bestSeller);
}

// Step 2: Category filtering
const filteredProducts =
  categoryFromQuery === "*" || categoryFromQuery === ""
    ? productsToDisplay
    : productsToDisplay.filter((product) =>
        product.category.some(
          (cat) => cat.toLowerCase() === categoryFromQuery.toLowerCase()
        )
      );

  // Sorting logic based on sortOrder
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortType) {
      case "low-high-price":
        return a.price - b.price;
      case "high-low-price":
        return b.price - a.price;
      case "high-low-rating":
        return b.rating - a.rating;
      case "low-high-rating":
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  // For sliding view - only create extended products if we have items
  const extendedProducts = filteredProducts.length > 0
    ? [
        ...filteredProducts.slice(-visibleItems),
        ...filteredProducts,
        ...filteredProducts.slice(0, visibleItems),
      ]
    : [];
  const actualStartIndex = startIndex + visibleItems;

  const handleNext = () => {
    if (!isTransitioning && filteredProducts.length > 0) {
      setIsTransitioning(true);
      setStartIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        return nextIndex >= filteredProducts.length ? 0 : nextIndex;
      });
    }
  };

  const handlePrev = () => {
    if (!isTransitioning && filteredProducts.length > 0) {
      setIsTransitioning(true);
      setStartIndex((prevIndex) => {
        const prevIndexValue = prevIndex - 1;
        return prevIndexValue < 0 ? filteredProducts.length - 1 : prevIndexValue;
      });
    }
  };

  useEffect(() => {
    if (isTransitioning) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        if (startIndex === -1) {
          setStartIndex(filteredProducts.length - 1);
        } else if (startIndex >= filteredProducts.length) {
          setStartIndex(0);
        }
      }, 600); // Reduced transition time for better UX
      return () => clearTimeout(timeout);
    }
  }, [isTransitioning, startIndex, filteredProducts.length]);

  const {
   
  cart,
  setIsOffCanvasOpen,
  addToCart,
  removeFromCart,
  clearCart,
  incrementQuantity,
  decrementQuantity,
} = useCart();


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
  if (filteredProducts.length === 0) {
    return (
      <div className="products-holder">
        <div className="products-holder__empty">
          <p>No products found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-holder">
      <div className="products-holder__container">
        <Desktop>
          <div className="products-holder__carousel-wrapper">
            <button
              type="button"
              className="products-holder__nav-btn products-holder__nav-btn--prev"
              onClick={handlePrev}
              aria-label="Previous products"
              disabled={isTransitioning}
            >
              <MdNavigateBefore />
            </button>
            <div
              className={`products-holder__carousel ${isTransitioning ? "products-holder__carousel--transitioning" : ""}`}
              style={{
                transform: `translateX(-${(100 / visibleItems) * actualStartIndex}%)`,
              }}
            >
              {extendedProducts.map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className="products-holder__item"
                  style={{
                    flexBasis: `${100 / visibleItems}%`,
                    maxWidth: `${100 / visibleItems}%`,
                  }}
                >
                  <MainProduct
                    productName={product.name}
                    productPrice={product.price}
                    firstImg={product.firstImg}
                    hoverImg={product.hoverImg}
                    id={product.id}
                    onAddToCart={addToCart}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              className="products-holder__nav-btn products-holder__nav-btn--next"
              onClick={handleNext}
              aria-label="Next products"
              disabled={isTransitioning}
            >
              <MdNavigateNext />
            </button>
          </div>
        </Desktop>
        <TabletAndBelow>
          <div className="products-holder__mobile-carousel">
            <Carousel
              indicators={false}
              controls={true}
              interval={null}
              touch={true}
            >
              {filteredProducts.map((product, index) => (
                <Carousel.Item key={`${product.id}-${index}`}>
                  <div className="products-holder__mobile-item">
                    <MainProduct
                      productName={product.name}
                      productPrice={product.price}
                      firstImg={product.firstImg}
                      hoverImg={product.hoverImg}
                      id={product.id}
                      onAddToCart={addToCart}
                    />
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
          </div>
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
    </div>
  );
};
