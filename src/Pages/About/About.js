import React, { useRef, useState } from "react";

import Product1 from "../../assets/images/product1.avif";
import Product2 from "../../assets/images/product2.avif";
import Product3 from "../../assets/images/product3.avif";
import Product4 from "../../assets/images/product4.avif";
import Product5 from "../../assets/images/product5.avif";
import Product6 from "../../assets/images/product6.avif";
import Product7 from "../../assets/images/product7.avif";
import VidBg from "../../assets/images/landscape.png";
import Fac1 from "../../assets/images/fac1.jpeg";
import Fac2 from "../../assets/images/fac2.jpeg";
import Fac3 from "../../assets/images/fac3.jpeg";
import Fac4 from "../../assets/images/fac4.jpeg";
import Fac5 from "../../assets/images/fac5.jpeg";
import Fac6 from "../../assets/images/fac6.jpeg";
import Value from "../../assets/images/values.png";
import { IoPerson } from "react-icons/io5";
import Carousel from "react-bootstrap/Carousel";

import Abt1 from "../../assets/images/abt1.avif";
import Mission from "../../assets/images/mission.png";
import Vision from "../../assets/images/vision.png";
import Abt2 from "../../assets/images/abt2.avif";
import Abt3 from "../../assets/images/abt3.avif";
import "./about.scss";
import { Link } from "react-router-dom";
import FactTab from "../../Components/FactTab/FactTab";
import { VideoSlide } from "./VideoSlide";
import VideoModal from "./VideoModal";

const tabs = [
  {
    label: "Tab 1",
    content: {
      image: Abt1,
      heading: "DID YOU KNOW?",
      heading2: "OUR SOLUTION",
      description: "Only 5% of plastic actually gets recycled.",
      description2:
        "We made sure our bottles would be the last ones you'd ever need - made to be reused and refilled forever with plastic-free tablets.",
    },
  },
  {
    label: "Tab 2",
    content: {
      image: Abt2,
      heading: "DID YOU KNOW?",
      heading2: "OUR SOLUTION",
      description: "Only 5% of plastic actually gets recycled.",
      description2:
        "We made sure our bottles would be the last ones you'd ever need - made to be reused and refilled forever with plastic-free tablets.",
    },
  },
  {
    label: "Tab 3",
    content: {
      image: Abt3,
      heading: "DID YOU KNOW?",
      heading2: "OUR SOLUTION",
      description: "Only 5% of plastic actually gets recycled.",
      description2:
        "We made sure our bottles would be the last ones you'd ever need - made to be reused and refilled forever with plastic-free tablets.",
    },
  },
];

const items = [
  Product1,
  Product2,
  Product3,
  Product4,
  Product5,
  Product6,
  Product7,
];

export const About = () => {
  const images = [Abt3, Abt2, Abt1];
  const [currentImage, setCurrentImage] = useState(images[0]);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [visibleParagraphs, setVisibleParagraphs] = useState([]);
  const containerRef = useRef[null];
  const paragraphsRef = useRef([]);

  return (
    <div className="home-div">
      {/* Video Section */}
      <div className="banner">
        <div className="col-md-5 offset-md-2">
          {" "}
          <h5>About Us</h5>
        </div>
      </div>
      <div className="overview-div d-md-flex">
        <div className="col-md-3  offset-md-2 ">
          <h4>COMPANY OVERVIEW</h4>
          <p>
            Olivia Products Nigeria Ltd is one of the largest manufacturer and
            distributor of Laundry, Hygiene and hair Care products in Nigeria.
          </p>
          <p>
            Olivia Products was established in 2009, having its manufacturing
            plant & HQ based in Lagos-Nigeria, producing various brands of
            consumer products in non-food categories.
          </p>
          <p>
            Our operations in Nigeria span over 15 years, with an enduring
            commitment to consumers’ daily lives. We raise consumer satisfaction
            and market standards by offering world-class products such as Viva,
            Siri, Fizz, Oracare, Biotol, Sabil, Family Care, Baby & Me, Manuka &
            MP3.
          </p>
        </div>
        <div className="col-md-4 offset-md-1 page-video">
          <div className="borders col-md-6 col-6" />
          <div className=" video-holder">
            <img src={VidBg} width="100%" />
            <div className="overlay">
              <div className="justify-content-center d-flex align-items-center">
                <VideoModal />
              </div>
            </div>
          </div>
          <div className="borders2 col-md-6 " />
        </div>
      </div>

      <div className="mission-div">
        <div className="col-md-10 offset-md-1 d-md-flex">
          <div className="col-md-4" style={{ padding: "0px 30px" }}>
            <center>
              <img src={Vision} width="140px" />
              <h3>Our Vision</h3>
              <p>
                To be the number one leading cosmetics brand that provide
                standard, reliable and innovative solutions to our customers
                through our sustainable quality product.
              </p>
            </center>
          </div>{" "}
          <div className="col-md-4 offset-md-" style={{ padding: "0px 30px" }}>
            <center>
              <img src={Mission} width="140px" />
              <h3>Our Mission</h3>
              <p>
                To completely transfrom, make healthy hair, and cleaning easier
                for individuals to stay confident, beautiful and hygienic.
              </p>
            </center>
          </div>
          <div className="col-md-4 offset-md-" style={{ padding: "0px 30px" }}>
            <center>
              <img src={Value} width="140px" style={{ borderRadius: "50%" }} />
              <h3>Our Values</h3>
              <ul className="list-unstyled">
                <li>Quality</li>
                <li>Accountability, Transparency, Professionalism</li>
                <li>Respect, Family, Friendship</li>
                <li>Hardwork Dedication, Achievement</li>
              </ul>{" "}
            </center>
          </div>
        </div>
      </div>

      <div className="col-md-8 d-md-flex offset-md-2 directors-corner">
        <div className="col-md-5">
          <h2>Board of Directors</h2>
          <p>
            Our senior management executives bring tremendous experience in
            diversified business and commitment to excellence, with a great
            vision of touching the consumer’s life with quality products.
          </p>
        </div>
        <div className="col-md-5 offset-md-2">
          <div className="director d-flex">
            <IoPerson className="icon" />
            <div>
              <h6>Mrs Olivia Mbaeme</h6>
              <p>Chairman, Olivia Products Limited</p>
            </div>
          </div>
          <div className="director d-flex">
            <IoPerson className="icon" />
            <div>
              <h6>Mr. Chinedu Okafor</h6>
              <p>Sales and Marketing Director, Olivia Products Limited</p>
            </div>
          </div>
          <div className="director d-flex">
            <IoPerson className="icon" />
            <div>
              <h6>Engr. Emmanuel Okafor</h6>
              <p>Managing Director, Olivia Products Limited</p>
            </div>
          </div>
        </div>{" "}
      </div>

      <div className="facilities-corner">
        <div className="facility-bg"></div>
        <div className="overlay">
          <div className="col-md-10 offset-md-2 d-md-flex">
            <div className="col-md-3">
              <h2>Manufacturing Facility</h2>
              <p>
                Our manufacturing facility includes production of Detergent,
                Soaps, Toothpaste & Dishwashing Liquid. And we are the leading
                manufacturer of petroleum Jelly in Nigeria.
              </p>
            </div>
            <div className="col-md-6 offset-md-1">
              <Carousel>
                <Carousel.Item>
                  <div className="row row-cols-1 row-cols-lg-2 g-2 g-lg-3">
                    <div className="col">
                      <img src={Fac1} width="100%" />
                    </div>
                    <div className="col">
                      {" "}
                      <img src={Fac2} width="100%" />
                    </div>
                  </div>
                </Carousel.Item>
                <Carousel.Item>
                  <div className="row row-cols-1 row-cols-lg-2 g-2 g-lg-3">
                    <div className="col">
                      <img src={Fac3} width="100%" />
                    </div>
                    <div className="col">
                      {" "}
                      <img src={Fac4} width="100%" />
                    </div>
                  </div>
                </Carousel.Item>
                <Carousel.Item>
                  <div className="row row-cols-1 row-cols-lg-2 g-2 g-lg-3">
                    <div className="col">
                      <img src={Fac5} width="100%" />
                    </div>
                    <div className="col">
                      {" "}
                      <img src={Fac6} width="100%" />
                    </div>
                  </div>
                </Carousel.Item>
              </Carousel>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          width: "100%",
          background: "#EFF5FF",
          paddingTop: "120px",
          paddingBottom: "40px",
        }}
      >
        <center>
          <h1>We Reimagined Everything</h1>
        </center>
        <FactTab tabs={tabs} />
      </div>
    </div>
  );
};
