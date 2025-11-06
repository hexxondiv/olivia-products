import { useEffect, useRef, useState } from "react";
import "./twitter-handle.scss";
import { IgPosts } from "../../../TestData/IgPosts";
const TwitterHandle = () => {
  const [inViewParagraph, setInViewParagraph] = useState(false);
  const paragraphRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    // Re-run Instagram embed when component renders
    script.onload = () => {
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      }
    };
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      if (paragraphRef.current) {
        const rect = paragraphRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        if (rect.top <= windowHeight && rect.bottom >= 0) {
          setInViewParagraph(true);
        } else {
          setInViewParagraph(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Run once on load to check initial position
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div ref={paragraphRef}>
      {" "}
      <div
        className="ig-social twitter"
        style={{
          transform: inViewParagraph ? "translateY(0)" : "translateY(100px)",
          opacity: inViewParagraph ? 1 : 0,
          transition: "transform 1s ease, opacity 1s ease",
        }}
      >
        {" "}
        <div className="instagram-embed col-md-12">
          {IgPosts.map((post) => (
            <blockquote
              key={post.id}
              className="instagram-media"
              data-instgrm-permalink={post.url}
              data-instgrm-version="14"
            ></blockquote>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TwitterHandle;
