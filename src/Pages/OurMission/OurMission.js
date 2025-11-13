import React from "react";
import "./our-mission.scss";
import LogoAnime from "../../assets/images/logo-anime.gif";
import { SEO } from "../../Components/SEO/SEO";
import MissionImg from "../../assets/images/mission-img.avif";
import Flower1 from "../../assets/images/flower.jpg";
import Flower2 from "../../assets/images/flower2.jpeg";
import Flower3 from "../../assets/images/flower3.jpeg";
import Flower4 from "../../assets/images/flower4.webp";
import Flower5 from "../../assets/images/flower5.jpg";
import Flower6 from "../../assets/images/flower6.jpg";
import Fac1 from "../../assets/images/fac1.jpeg";
import Fac2 from "../../assets/images/fac2.jpeg";
import Fac3 from "../../assets/images/fac3.jpeg";
import Fac4 from "../../assets/images/fac4.jpeg";
import Fac5 from "../../assets/images/fac5.jpeg";
import Fac6 from "../../assets/images/fac6.jpeg";

// Stock images from Africa for education and youth empowerment
// African students in classroom - Education Support (Black students)
// Replace with actual image URL showing black/African students in classroom
// Recommended search: Unsplash "African students" or Pexels "black students classroom"
const EducationSupportImg = "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop&q=80";
// African youth in training/workshop - Youth Empowerment (Black youth)
// Replace with actual image URL showing black/African youth in training
// Recommended search: Unsplash "African youth" or Pexels "black youth training"
const YouthEmpowermentImg = "https://www.dbsa.org/sites/default/files/media/images/2022-06/Ways%20To%20Empower%20Our%20Youth%20to%20Ensure%20Africa%27s%20Ongoing%20Development.jpg";

export const OurMission = () => {
  const communityImages = [
    { src: Flower1, title: "Community Health Initiative", description: "Promoting health and hygiene awareness in local communities" },
    { src: Flower2, title: "Educational Support Program", description: "Supporting education through school rehabilitation projects" },
    { src: Flower3, title: "Youth Empowerment Workshop", description: "Empowering young people with skills and opportunities" },
    { src: Flower4, title: "Family Care Initiative", description: "Supporting families with essential care products" },
    { src: Flower5, title: "Community Outreach", description: "Engaging with communities to understand their needs" },
    { src: Flower6, title: "Social Responsibility", description: "Making a positive impact in society" },
  ];

  const facilityImages = [
    { src: Fac1, title: "Manufacturing Excellence", description: "State-of-the-art production facilities" },
    { src: Fac2, title: "Quality Control", description: "Ensuring the highest standards in every product" },
    { src: Fac3, title: "Innovation Hub", description: "Research and development for better products" },
    { src: Fac4, title: "Sustainable Operations", description: "Environmentally responsible manufacturing" },
    { src: Fac5, title: "Team Collaboration", description: "Our dedicated team working together" },
    { src: Fac6, title: "Production Line", description: "Efficient production processes" },
  ];

  return (
    <>
      <SEO
        title="Our Mission & Impact"
        description="Olivia Products is dedicated to making a difference through Oliviacare. We focus on empowering youth, nurturing talent, and supporting education to help build brighter futures in Nigeria."
        keywords="Olivia Products mission, Oliviacare, community impact, youth empowerment, education support, corporate social responsibility, Nigeria"
        url="/our-mission"
        type="website"
      />
      <div className="home-div">
      <div className="mission-landing">
        <h1 className="col-md-4 offset-md-2">Our Mission & Impact</h1>
      </div>

      <div className="mission-hero-section">
        <div className="col-md-10 offset-md-1">
          <div className="row align-items-center">
            <div className="col-md-6">
              <img src={LogoAnime} alt="Olivia Products" className="mission-logo" />
            </div>
            <div className="col-md-6">
              <h2>Making A Difference With Olivia Products</h2>
              <p className="mission-intro">
                At Olivia Products, making a difference goes beyond what we create — 
                it's about how we care. We're dedicated to enriching everyday lives 
                and uplifting communities through purposeful action. Our focus remains 
                on empowering the youth, nurturing talent, and supporting education — 
                helping tomorrow's leaders build brighter futures, one opportunity at a time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mission-core-section">
        <div className="col-md-10 offset-md-1">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="mission-card">
                <div className="mission-icon">🎯</div>
                <h3>Our Mission</h3>
                <p>
                  To completely transform, make healthy hair, and cleaning easier 
                  for individuals to stay confident, beautiful and hygienic. We 
                  strive to provide standard, reliable and innovative solutions to 
                  our customers through sustainable quality products.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="mission-card">
                <div className="mission-icon">👁️</div>
                <h3>Our Vision</h3>
                <p>
                  To be the number one leading consumer care brand that provides 
                  standard, reliable and innovative solutions to our customers 
                  through our sustainable quality products, while making a positive 
                  impact in the communities we serve.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="mission-card">
                <div className="mission-icon">💚</div>
                <h3>Our Values</h3>
                <ul className="values-list">
                  <li>Quality & Excellence</li>
                  <li>Accountability & Transparency</li>
                  <li>Respect & Family</li>
                  <li>Hardwork & Dedication</li>
                  <li>Community Impact</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="community-initiatives">
        <div className="col-md-10 offset-md-1">
          <h2 className="section-title">Community Initiatives</h2>
          <p className="section-intro">
            Our commitment to society extends beyond manufacturing quality products. 
            We actively engage in programs that develop healthier communities and 
            empower the next generation.
          </p>
          
          <div className="row g-4 mt-4">
            <div className="col-md-6">
              <div className="initiative-card">
                <img src={EducationSupportImg} alt="Education Support - African students in classroom" className="initiative-img" />
                <div className="initiative-content">
                  <h4>Education Support</h4>
                  <p>
                    We believe education is the foundation of a better future. Through 
                    our school rehabilitation programs, we've supported educational 
                    institutions across Nigeria, providing better learning environments 
                    for students and teachers.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="initiative-card">
                <img src={YouthEmpowermentImg} alt="Youth Empowerment - African youth in training" className="initiative-img" />
                <div className="initiative-content">
                  <h4>Youth Empowerment</h4>
                  <p>
                    Empowering young people is at the heart of our social responsibility. 
                    We provide skills training, mentorship programs, and opportunities 
                    that help youth develop their potential and contribute meaningfully 
                    to society.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="initiative-card">
                <img src={MissionImg} alt="Health & Hygiene" className="initiative-img" />
                <div className="initiative-content">
                  <h4>Health & Hygiene Awareness</h4>
                  <p>
                    Promoting health and hygiene awareness in communities is essential 
                    for a healthier nation. We conduct awareness programs and provide 
                    educational resources on proper hygiene practices.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="initiative-card">
                <div className="initiative-content">
                  <h4>Sustainable Development</h4>
                  <p>
                    We're committed to sustainable practices that protect our environment 
                    while meeting the needs of today. Our manufacturing processes prioritize 
                    efficiency and environmental responsibility.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="call-to-action-section">
        <div className="col-md-8 offset-md-2 text-center">
          <h2>Join Us in Making a Difference</h2>
          <p>
            Together, we can build a healthier, more empowered Nigeria. Whether you're 
            a partner, customer, or community member, your support helps us continue 
            our mission of transforming lives and communities.
          </p>
        </div>
      </div>
    </div>
    </>
  );
};
