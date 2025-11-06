import { useEffect, useRef, useState } from "react";

const FBSocials = () => {
  const [inViewHeading, setInViewHeading] = useState(false); // Track if the heading is in view
  const headingRef = useRef(null); // Reference for the heading

  useEffect(() => {
    if (!window.FB) {
      const script = document.createElement("script");
      script.src =
        "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v17.0";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);
    } else {
      window.FB.XFBML.parse();
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Heading
      if (headingRef.current) {
        const rect = headingRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        if (rect.top <= windowHeight && rect.bottom >= 0) {
          setInViewHeading(true);
        } else {
          setInViewHeading(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Run once on load to check initial position
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={headingRef}>
      {" "}
      <div
        className="ig-social"
        style={{
          width: "100%",
          transform: inViewHeading ? "translateX(0)" : "translateX(-100px)",
          opacity: inViewHeading ? 1 : 0,
          transition: "transform 2s ease, opacity 2s ease",
        }}
      >
        <div
          className="fb-page"
          data-href="https://web.facebook.com/profile.php?id=61583436475101&_rdc=1&_rdr#"
          data-tabs="timeline"
          data-height=""
          data-small-header="false"
          data-adapt-container-width="true"
          data-hide-cover="false"
          data-show-facepile="true"
        >
          <blockquote
            cite="https://web.facebook.com/profile.php?id=61583436475101&_rdc=1&_rdr#"
            className="fb-xfbml-parse-ignore"
            style={{ width: "100%", margin: "20px auto" }}
          >
            <a href="https://web.facebook.com/profile.php?id=61583436475101&_rdc=1&_rdr#">
              British Spring College
            </a>
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default FBSocials;
