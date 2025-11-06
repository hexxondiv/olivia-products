import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Product1 from "../../../assets/images/air-group-no-bg.png";
import Product2 from "../../../assets/images/hand-group-no-bg.png";
import Product3 from "../../../assets/images/dish-group-no-bg.png";
import Product4 from "../../../assets/images/car-group-no-bg.png";
import Product5 from "../../../assets/images/liquid-no-bg.png";
import Bg from "../../../assets/images/flower5.jpg";
import Bg2 from "../../../assets/images/flower2.jpeg";
import Bg3 from "../../../assets/images/flower4.webp";
import Bg4 from "../../../assets/images/flower-bg.jpg";
import "./products-slide.scss";
const backgrounds = [Bg4, Bg2, Bg, Bg3, Bg2];
// const backgrounds = [];
const images = [Product1, Product2, Product3, Product4, Product5];
const ProductsSlide = () => {
  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const next = () => setCurrent((prev) => (prev + 1) % images.length);
  const prev = () =>
    setCurrent((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    const interval = setInterval(next, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={styles.container} className="prd-slide-cont">
      <div style={styles.slider}>
        {images.map((_, index) => {
          const offset = (index - current + images.length) % images.length;
          let position = offset;
          if (offset > Math.floor(images.length / 2)) {
            position = offset - images.length;
          }

          return (
            <motion.div
              key={index}
              initial={false}
              animate={{
                // On desktop → show multiple slides
                // On mobile → only show the current slide
                x: window.innerWidth < 768 ? 0 : position * 400, // horizontal spacing
                scale:
                  window.innerWidth < 768
                    ? position === 0
                      ? 0.6
                      : 0
                    : position === 0
                    ? 1.3
                    : 0.7,
                opacity:
                  window.innerWidth < 768
                    ? position === 0
                      ? 1
                      : 0
                    : Math.abs(position) > 1
                    ? 0
                    : 1,
                zIndex: position === 0 ? 2 : 1,
              }}
              transition={{ duration: 0.5 }}
              style={{
                ...styles.box,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundImage: `url(${
                  backgrounds[index % backgrounds.length]
                })`,
              }}
            >
              <center>
                <img
                  width="80%"
                  src={images[index % images.length]}
                  alt="products"
                  style={styles.image}
                />
              </center>
            </motion.div>
          );
        })}

        {/* Controls */}
        {isMobile ? (
          <div style={styles.mobileControls} className="mobile-dots">
            <button onClick={prev} style={styles.button}>
              ◀
            </button>
            <div style={styles.dots}>
              {images.map((_, index) => (
                <span
                  key={index}
                  onClick={() => setCurrent(index)}
                  style={{
                    ...styles.dot,
                    background: current === index ? "#333" : "#bbb",
                    transform: current === index ? "scale(1.2)" : "scale(1)",
                  }}
                />
              ))}
            </div>
            <button onClick={next} style={styles.button}>
              ▶
            </button>
          </div>
        ) : (
          <>
            {/* Left Arrow */}
            <button
              onClick={prev}
              style={{ ...styles.sideButton, left: "20px" }}
            >
              ◀
            </button>
            {/* Right Arrow */}
            <button
              onClick={next}
              style={{ ...styles.sideButton, right: "20px" }}
            >
              ▶
            </button>

            {/* Dots centered at bottom */}
            <div style={styles.desktopDots}>
              {images.map((_, index) => (
                <span
                  key={index}
                  onClick={() => setCurrent(index)}
                  style={{
                    ...styles.dot,
                    background: current === index ? "#333" : "#bbb",
                    transform: current === index ? "scale(1.2)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "75vh",
  },
  slider: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    height: "950px",
    position: "relative",
    overflow: "hidden",
  },
  box: {
    position: "absolute",
    width: "600px",
    minHeight: "450px",
    borderRadius: "12px",
    boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
    // padding: "5px",
    marginTop: "50px",
  },
  image: {
    objectFit: "cover",
    alignItems: "center",
  },
  button: {
    fontSize: "2rem",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  sideButton: {
    fontSize: "2rem",
    background: "none",
    border: "none",
    cursor: "pointer",
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 3,
  },
  dots: {
    display: "flex",
    gap: "8px",
  },
  desktopDots: {
    display: "flex",
    gap: "8px",
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
  },
  dot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#bbb",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  mobileControls: {
    position: "absolute",
    bottom: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    zIndex: 3,
  },
};

export default ProductsSlide;
