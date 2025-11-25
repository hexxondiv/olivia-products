import React, { useEffect, useState } from "react";
import "./home-slide.scss";
import Carousel from "react-bootstrap/Carousel";
import { Link } from "react-router-dom";
import { getApiUrl } from "../../../Utils/apiConfig";

export const HomeSlide = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/home-slides.php?activeOnly=true`);
      const data = await response.json();
      
      if (data.success) {
        setSlides(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load home slides:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLinkUrl = (slide) => {
    if (!slide.linkType || slide.linkType === 'none') {
      return null;
    }
    
    if (slide.linkType === 'category') {
      return `/collections?category=${encodeURIComponent(slide.linkValue)}`;
    }
    
    if (slide.linkType === 'product') {
      return `/product/${slide.linkValue}`;
    }
    
    return null;
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  if (slides.length === 0) {
    return null; // No slides to display
  }

  return (
    <>
      <div className="journey-carousel">
        <Carousel fade>
          {slides.map((slide) => {
            const linkUrl = getLinkUrl(slide);
            const slideContent = (
              <div className="journey-div col-md-12">
                <img src={slide.mainPicture} width="100%" alt="" className="bg-img" />
                <div className="journey-cova">
                  <div className="d-md-flex">
                    <div className="col-md-4 offset-md-2">
                      <p>{slide.text}</p>
                    </div>
                    <div className="col-md-5 offset-md- target-img">
                      <img src={slide.targetImg} width="100%" alt="" />
                    </div>
                  </div>
                </div>
              </div>
            );

            return (
              <Carousel.Item key={slide.id}>
                {linkUrl ? (
                  <Link to={linkUrl} style={{ textDecoration: 'none', display: 'block' }}>
                    {slideContent}
                  </Link>
                ) : (
                  slideContent
                )}
              </Carousel.Item>
            );
          })}
        </Carousel>
      </div>
    </>
  );
};
