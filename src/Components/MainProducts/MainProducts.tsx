import { useEffect, useRef, useState } from "react";
import { Offcanvas } from "react-bootstrap"; // Assuming you're using Bootstrap's Offcanvas component
import { Link } from "react-router-dom";
import { Desktop } from "../../Utils/mediaQueries";
import "./main-product.scss";

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
         
        <h6 style={{color:"grey"}}>{rating}</h6>
        </div>

        <h6 style={{color:"grey"}}>{formatCurrency(productPrice)}</h6>
      </div>  </div>

      
    </>
  );
};

export default MainProduct;
