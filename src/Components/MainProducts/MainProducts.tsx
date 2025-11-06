import { useEffect, useRef, useState } from "react";
import { Offcanvas } from "react-bootstrap"; // Assuming you're using Bootstrap's Offcanvas component
import { Link } from "react-router-dom";
import { Desktop } from "../../Utils/mediaQueries";
import "./main-product.scss";

// Star Rating Component
const StarRating: React.FC<{ rating: string | number }> = ({ rating }) => {
  // Validate and clamp rating to 0-5 range
  let numRating = typeof rating === "string" ? parseFloat(rating) : rating;
  if (isNaN(numRating) || numRating < 0) {
    numRating = 0;
  } else if (numRating > 5) {
    numRating = 5;
  }
  
  const fullStars = Math.max(0, Math.min(5, Math.floor(numRating)));
  const hasHalfStar = numRating % 1 >= 0.5 && numRating < 5;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

  return (
    <div className="star-rating" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
      {fullStars > 0 && [...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} style={{ color: "#ffc107", fontSize: "14px" }}>★</span>
      ))}
      {hasHalfStar && (
        <span style={{ position: "relative", display: "inline-block", fontSize: "14px" }}>
          <span style={{ color: "#e0e0e0" }}>★</span>
          <span style={{ 
            position: "absolute", 
            left: 0, 
            top: 0,
            width: "50%", 
            overflow: "hidden", 
            color: "#ffc107",
            whiteSpace: "nowrap"
          }}>★</span>
        </span>
      )}
      {emptyStars > 0 && [...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} style={{ color: "#e0e0e0", fontSize: "14px" }}>★</span>
      ))}
      <span style={{ marginLeft: "4px", fontSize: "12px", color: "grey" }}>({numRating.toFixed(1)})</span>
    </div>
  );
};

export interface ProductProps {
  id: number;
  firstImg: string;
  hoverImg: string;
  productPrice: number;
  productName: string;
  rating: string;
  onAddToCart: (item: {
    id: number;
    firstImg: string;
    hoverImg: string;
    productPrice: number;
    productName: string;
    rating: string;
  }) => void;
}

const MainProduct: React.FC<ProductProps> = ({
  id,
  firstImg,
  hoverImg,
  productPrice,
  productName,
  rating,
  onAddToCart,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = () => {
    onAddToCart({ id, firstImg, hoverImg, productPrice, productName, rating });
  };

  // Format price as currency
  const formatCurrency = (price: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };







  return (
    <>
      <div
        className="product-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="image-wrapper">
          {" "}
          <img
            className={`product-image ${isHovered ? "hidden" : "visible"}`}
            src={firstImg}
            alt="Product"
            width="100%"
          />
          <Link to={`/product/${id}`}>
            <img
              className={`product-image ${isHovered ? "visible" : "hidden"}`}
              src={hoverImg}
              alt="Product Hover"
              width="100%"
            />
          </Link>
        </div>
        <Desktop>
          {isHovered && (
            <button onClick={handleAddToCart} className="cart-btn">
              Add to Cart
            </button>
          )}
        </Desktop>
    <div
        className="d-flex prd-details"
        style={{ textAlign: "left", padding: "5px" }}
      >
        <div style={{ flexGrow: 1 }}>
        <h5 style={{color: "#7bbd21"}}>{productName}</h5>
         
        <StarRating rating={rating} />
        </div>

        <h6 style={{color:"grey"}}>{formatCurrency(productPrice)}</h6>
      </div>  </div>

      
    </>
  );
};

export default MainProduct;
