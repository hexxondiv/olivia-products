import React, { useState } from "react";
import Abt1 from "../../assets/images/abt1.avif";
import Abt2 from "../../assets/images/abt2.avif";
import Abt3 from "../../assets/images/abt3.avif";
import "./fact-tab.scss";

interface TabContent {
  image: string;
  heading: string;
  description: string;
  heading2: string;
  description2: string;
}

interface Tab {
  label: string;
  content: TabContent;
}

const FactTab: React.FC<{ tabs: Tab[] }> = ({ tabs }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [fade, setFade] = useState<boolean>(false);

  const handleTabClick = (index: number) => {
    if (index !== activeIndex) {
      setFade(true); // Trigger fade out
      setTimeout(() => {
        setActiveIndex(index);
        setFade(false); // Trigger fade in after content switches
      }, 500);
    }
  };

  return (
    <div className="fact-tab-container">
      {/* Tab Headers */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <div className="fact-tab-headers d-flex justify-content-center flex-wrap">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => handleTabClick(index)}
                  className={`fact-tab-button ${activeIndex === index ? "active" : ""}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="fact-tab-divider"></div>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <div className={`fact-tab-content ${fade ? "fade-out" : "fade-in"}`}>
              <div className="row g-4">
                <div className="col-12 col-md-5 fact-tab-image-wrapper">
                  <img
                    src={tabs[activeIndex].content.image}
                    alt={tabs[activeIndex].content.heading}
                    className="fact-tab-image img-fluid"
                  />
                </div>
                <div className="col-12 col-md-7 fact-tab-text-wrapper">
                  <h6 className="fact-tab-heading">{tabs[activeIndex].content.heading}</h6>
                  <p className="fact-tab-description">{tabs[activeIndex].content.description}</p>
                  <h6 className="fact-tab-heading">{tabs[activeIndex].content.heading2}</h6>
                  <p className="fact-tab-description">{tabs[activeIndex].content.description2}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactTab;
