import React, { useState, useEffect } from "react";
import { getApiUrl } from "../../Utils/apiConfig";

interface Wholesale {
  id: number;
  businessName: string;
  companyLogo?: string;
  website?: string;
  city: string;
  state: string;
  country: string;
  businessTypes: string[];
  aboutBusiness: string;
  formType: string;
}

const WholesaleCarousel: React.FC = () => {
  const [wholesale, setWholesale] = useState<Wholesale[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 820);
  const autoPlayInterval = 5000; // Auto-play interval (in milliseconds)
  
  // Handle window resize to update mobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 820);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchWholesale = async () => {
      try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/wholesale.php?status=approved&limit=20`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setWholesale(data.data);
        } else {
          console.error("Error fetching wholesale applications:", data.message);
          setWholesale([]);
        }
      } catch (error) {
        console.error("Error fetching wholesale applications:", error);
        setWholesale([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWholesale();
  }, []);

  useEffect(() => {
    if (wholesale.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % wholesale.length);
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [wholesale.length]);

  const nextSlide = () => {
    if (wholesale.length > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % wholesale.length);
      setTimeout(() => setIsTransitioning(false), 600);
    }
  };

  const prevSlide = () => {
    if (wholesale.length > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(
        (prevIndex) => (prevIndex - 1 + wholesale.length) % wholesale.length
      );
      setTimeout(() => setIsTransitioning(false), 600);
    }
  };

  const goToSlide = (index: number) => {
    if (!isTransitioning && index !== currentIndex) {
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 600);
    }
  };

  const getVisibleWholesale = () => {
    if (wholesale.length === 0) return [];
    const total = wholesale.length;
    
    if (isMobile) {
      // On mobile, show only 3 items: prev, current, next
      const prevIndex = (currentIndex - 1 + total) % total;
      const nextIndex = (currentIndex + 1) % total;
      return [
        wholesale[prevIndex],
        wholesale[currentIndex],
        wholesale[nextIndex],
      ];
    } else {
      // On desktop, show 5 items: 2 before, current, 2 after
      const prev2Index = (currentIndex - 2 + total) % total;
      const prevIndex = (currentIndex - 1 + total) % total;
      const nextIndex = (currentIndex + 1) % total;
      const next2Index = (currentIndex + 2) % total;
      return [
        wholesale[prev2Index],
        wholesale[prevIndex],
        wholesale[currentIndex],
        wholesale[nextIndex],
        wholesale[next2Index],
      ];
    }
  };

  const handleCardClick = (wholesaleItem: Wholesale) => {
    if (wholesaleItem.website) {
      // Open website in new tab
      const url = wholesaleItem.website.startsWith('http') 
        ? wholesaleItem.website 
        : `https://${wholesaleItem.website}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return <div className="wholesale-carousel-loading">Loading partners...</div>;
  }

  if (wholesale.length === 0) {
    return null; // Don't show anything if no approved wholesale applications
  }

  const visibleItems = getVisibleWholesale();

  return (
    <div className="wholesale-carousel-div">
      <div className="wholesale-carousel">
        <div className={`wholesale-wrapper ${isTransitioning ? 'transitioning' : ''}`}>
          {visibleItems.map((item, index) => {
            // Determine active card index based on mobile state
            const activeIndex = isMobile ? 1 : 2; // Center card on mobile (index 1), desktop (index 2)
            const isActive = index === activeIndex;
            // Position calculation: mobile uses -1, 0, 1; desktop uses -2, -1, 0, 1, 2
            const position = isMobile ? (index - 1) : (index - 2);
            const positionClass = position < 0 ? `position-neg${Math.abs(position)}` : `position-${position}`;
            return (
              <div
                key={`${item.id}-${index}-${currentIndex}`}
                className={`wholesale-card ${isActive ? "active" : ""} ${isTransitioning ? "sliding" : ""} ${positionClass}`}
                style={{
                  cursor: item.website && isActive ? "pointer" : "default",
                }}
                onClick={() => isActive && handleCardClick(item)}
              >
                {item.companyLogo && (
                  <div className="wholesale-logo">
                    <img 
                      src={item.companyLogo} 
                      alt={item.businessName}
                      onError={(e) => {
                        // Hide image if it fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <h3>{item.businessName}</h3>
                <p>{item.city}, {item.state}, {item.country}</p>
                {item.businessTypes && item.businessTypes.length > 0 && (
                  <div className="business-types">
                    {item.businessTypes.join(", ")}
                  </div>
                )}
                {item.website && isActive && (
                  <div className="website-link">
                    Visit Website →
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Dots for navigation */}
        <div className="dots">
          {wholesale.map((_, index) => (
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

export default WholesaleCarousel;

