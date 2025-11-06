import { useEffect, useRef, useState, useCallback } from "react";
import "./fb-socials.scss";

const FBSocials = () => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  // Load Facebook SDK
  useEffect(() => {
    if (!window.FB) {
      const script = document.createElement("script");
      script.src =
        "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v17.0";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);

      script.onload = () => {
        if (window.FB) {
          window.FB.XFBML.parse();
        }
      };
    } else {
      window.FB.XFBML.parse();
    }
  }, []);

  // Handle scroll animation
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const isInView = rect.top <= windowHeight && rect.bottom >= 0;
      setIsVisible(isInView);
    }
  }, []);

  useEffect(() => {
    handleScroll(); // Check initial position
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div ref={containerRef} className="fb-socials">
      <div
        className={`fb-socials__container ig-social ${
          isVisible ? "fb-socials__container--visible" : ""
        }`}
      >
        <div className="fb-socials__embed">
          <div
            className="fb-page"
            data-href="https://www.facebook.com/britishspringawka"
            data-tabs="timeline"
            data-height=""
            data-small-header="false"
            data-adapt-container-width="true"
            data-hide-cover="false"
            data-show-facepile="true"
          >
            <blockquote
              cite="https://www.facebook.com/britishspringawka"
              className="fb-xfbml-parse-ignore"
            >
              <a href="https://www.facebook.com/britishspringawka">
                British Spring College
              </a>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FBSocials;
