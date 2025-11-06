import { useState, useEffect, useRef } from "react";
import { YoutubePosts } from "../../TestData/YoutubePosts";

const YouTube = () => {
  const [featuredIndex, setFeaturedIndex] = useState(0); // Index of the featured video
  const [inViewHeading, setInViewHeading] = useState(false); // Track if the heading is in view
  const headingRef = useRef(null); // Reference for the heading

  useEffect(() => {
    // Calculate the current week number
    const currentWeek = Math.floor(
      (new Date().getTime() / (1000 * 60 * 60 * 24 * 7)) % YoutubePosts.length
    );
    setFeaturedIndex(currentWeek); // Set the index of the featured video based on the week number
  }, []);
  //   useEffect(() => {
  //     // TEMPORARY: Manually set the week number to simulate rotation
  //     const testWeek = 1; // Change this number between 0 and 2 to test different videos (for example, 0 for first, 1 for second)
  //     setFeaturedIndex(testWeek); // Set the index of the featured video based on the test week number
  //   }, []);

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

  const getYouTubeEmbedUrl = (url) => {
    const urlObj = new URL(url);
    const videoId = urlObj.searchParams.get("v");
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const featuredPost = YoutubePosts[featuredIndex]; // Featured video based on current week

  return (
    <>
      <div ref={headingRef} style={{ overflow: "hidden" }}>
        {" "}
        <div
          className="ig-social twitter"
          style={{
            width: "100%",

            transform: inViewHeading ? "translateX(0)" : "translateX(100px)",
            opacity: inViewHeading ? 1 : 0,
            transition: "transform 2s ease, opacity 2s ease",
          }}
        >
          {featuredPost && (
            <div>
              <iframe
                width="100%"
                height="350"
                src={getYouTubeEmbedUrl(featuredPost.url)}
                title={`Featured YouTube video ${featuredPost.id}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>

              <p>{featuredPost.caption}</p>
              <p style={{ fontSize: "12px" }}>{featuredPost.description}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default YouTube;
