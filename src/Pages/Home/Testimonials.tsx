import React, { useState, useEffect } from "react";
import { getApiUrl } from "../../Utils/apiConfig";

interface Testimonial {
  name: string;
  comment: string;
  rating: number;
  backgroundColor: string;
}

const TestimonialCarousel: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoPlayInterval = 5000; // Auto-play interval (in milliseconds)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/testimonials.php?activeOnly=true`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setTestimonials(data.data);
        } else {
          console.error("Error fetching testimonials:", data.message);
          // Fallback to empty array
          setTestimonials([]);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        // Fallback to empty array
        setTestimonials([]);
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length > 0) {
      const interval = setInterval(() => {
        nextSlide();
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [currentIndex, testimonials]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const getVisibleTestimonials = () => {
    const total = testimonials.length;
    const prevIndex = (currentIndex - 1 + total) % total;
    const nextIndex = (currentIndex + 1) % total;
    return [
      testimonials[prevIndex],
      testimonials[currentIndex],
      testimonials[nextIndex],
    ];
  };

  if (testimonials.length === 0) {
    return <div>Loading testimonials...</div>;
  }

  return (
    <div className="testimonial-div">
      <div className="testimonial-carousel">
        <div className="testimonial-wrapper">
          {getVisibleTestimonials().map((testimonial, index) => (
            <div
              key={index}
              className={`testimonial-slide ${index === 1 ? "active" : ""}`}
              style={{
                backgroundColor: testimonial.backgroundColor,
                width: index === 1 ? "70%" : "15%", // Middle one takes 70%, others take 15%
                opacity: index === 1 ? 1 : 0.4,
                transform: index === 1 ? "scale(1.1)" : "scale(0.9)",
                zIndex: index === 1 ? 2 : 1, // Middle one is on top
              }}
            >
              <h3 style={{ fontSize: index == 1 ? "24px" : "14px" }}>
                {testimonial.name}
              </h3>
              <p style={{ fontSize: index == 1 ? "18px" : "11px" }}>
                {testimonial.comment}
              </p>
              <div className="rating">
                {Array(testimonial.rating).fill("⭐").join("")}
              </div>
            </div>
          ))}
        </div>

        {/* Dots for navigation */}
        <div className="dots">
          {testimonials.map((_, index) => (
            <span
              key={index}
              className={`dot ${currentIndex === index ? "active" : ""}`}
              onClick={() => goToSlide(index)}
            ></span>
          ))}
        </div>

        {/* Left and Right Buttons */}
        <button className="arrow left" onClick={prevSlide}>
          &#8592;
        </button>
        <button className="arrow right" onClick={nextSlide}>
          &#8594;
        </button>
      </div>
    </div>
  );
};

export default TestimonialCarousel;
