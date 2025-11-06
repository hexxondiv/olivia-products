import React from "react";
import Video from "../../assets/images/home-video.mp4";

import Testifier from "../../assets/images/fast.avif";
import Testifier2 from "../../assets/images/oprah.avif";
import Testifier3 from "../../assets/images/corp.avif";
import Testifier4 from "../../assets/images/today.avif";
import MissionImg from "../../assets/images/group6.png";
import CountUp from "react-countup";
import { ProductsSlide } from "./ProductsSlide/ProductsSlide";
import { ProductsHolder } from "./ProductsHolder";
import { FaAngleRight } from "react-icons/fa";
import Carousel from "react-bootstrap/Carousel";

import "./home.scss";
import { Link } from "react-router-dom";
import TestimonialCarousel from "./Testimonials";
import { TabletAndBelow } from "../../Utils/mediaQueries";
import { HomeSlide } from "./HomeSlide/HomeSlide";
import FBSocials from "./FBSocials";
import TwitterHandle from "./TwitterHandle/TwitterHandle";
import YouTube from "./Youtube";
import SampleSlide from "./ProductsSlide/ProductsSlide";
const OPTIONS = { loop: true };
const SLIDE_COUNT = 5;
const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

export const Home = () => {
  return (
    <div className="home-div">
      <HomeSlide />

      <div className=" d-md-flex abt-div col-md-12 container">
        <div className=" col-md-6 ">
          <h6>ABOUT US</h6>
          <h5 className="col-md-12">
            One of the largest manufacturer and distributor of Laundry, Hygiene
            and Hair Care products in Nigeria.
          </h5>
        </div>
        <div className="col-md-6">
          <p>
            At Olivia Products, we take pride in redefining everyday care
            through innovation, quality, and trust. Our growing portfolio spans
            across hair care, skin care, dish wash, fabric cleaner, tile and
            toilet wash, car wash, window cleaner, and air fresheners—each
            crafted to bring freshness, brilliance, and protection to your daily
            life. Guided by a commitment to excellence, we create products that
            combine powerful performance with gentle care, ensuring every Olivia
            experience leaves your home, your car, and your family feeling
            renewed.
          </p>
          <Link to={"/about-us"}>
            {" "}
            <button>Explore More</button>
          </Link>
        </div>
      </div>

      <div className="products-intro-corner">
        {" "}
        <center>
          <div className="col-md-6 home-prd">
            <h6>OUR PRODUCTS</h6>
            <h2>Millions trust our touch. Every day begins with Olivia.</h2>
            <p>
              At Olivia Products, quality is never compromised. Every item we
              produce undergoes rigorous testing to ensure purity, safety, and
              exceptional performance. From formulation to packaging, each
              product meets the highest standards before leaving our factory —
              because we believe our customers deserve nothing less than
              perfection. It’s this unwavering commitment to excellence that has
              made Olivia Products a trusted name in homes across Nigeria.
            </p>
            <h5>From homes to hearts — Olivia makes a difference every day.</h5>
          </div>
        </center>
        <SampleSlide />
      </div>

      {/* Testifiers Section */}
      <div className="testifiers-div d-md-flex">
        <div className="col-12 col-md-6 d-flex">
          <div className="col-6 testifiers">
            <center>
              <h5>"Best sustainable cleaning products”</h5>
              <img src={Testifier} alt="Testifier 1" width="154px" />
            </center>
          </div>
          <div className="col-6  testifiers">
            <center>
              <h5>Best for the Environment</h5>
              <img src={Testifier2} alt="Testifier 2" width="154px" />
            </center>
          </div>
        </div>
        <div className="col-12 col-md-6 d-flex">
          {" "}
          <div className="col-6 testifiers">
            <center>
              <h5>
                "Tried the whole line and absolutely love it. It's genius"
              </h5>
              <img src={Testifier3} alt="Testifier 3" width="104px" />
            </center>
          </div>
          <div className="col-6 testifiers">
            <center>
              <h5>World Changing Ideas</h5>
              <img src={Testifier4} alt="Testifier 4" width="104px" />
            </center>
          </div>
        </div>
      </div>

      {/* Bestsellers Section */}
      <center>
        <h1>Our Bestsellers</h1>
      </center>
      <ProductsHolder showOnlyBestSellers={true} />
      <center style={{ marginTop: "30px", marginBottom: "50px" }}>
        <Link to={"/collections?category=*"}>
          <button className="view-more-btn">View more</button>
        </Link>
      </center>

      <div className=" col-md-10 offset-md-1 d-md-flex mt-5">
        <div className="col-md-6 mission-vision">
          <img src={MissionImg} width="100%" alt="" />
        </div>
        <div className="col-md-6 statement">
          <h5>OLIVIACARE</h5>

          <h2>
            Make A Difference With <span>Olivia Products</span>
          </h2>
          <p>
            At Olivia Products, making a difference goes beyond what we create —
            it’s about how we care. We’re dedicated to enriching everyday lives
            and uplifting communities through purposeful action. Our focus
            remains on empowering the youth, nurturing talent, and supporting
            education — helping tomorrow’s leaders build brighter futures, one
            opportunity at a time.
          </p>
          <Link to={"/our-mission"}>
            Our Mission <FaAngleRight />
          </Link>
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
      <div className="news-div">
        <center>
          <h6>NEWS AND EVENTS</h6>
          <div className="col-md-6">
            <h3>Get To Know More About Us From The Media</h3>
            <p>
              Get to know more about Olivia – the leading personal care product
              suppliers in Nigeria – with news and stories appearing in
              prominent media.
            </p>
          </div>
        </center>
        <div className="news-inner">
          <div className=" container d-md-flex ">
            <div className="col-md-4">
              <FBSocials />
            </div>
            <div className="col-md-4">
              <TwitterHandle />
            </div>{" "}
            <div className="col-md-4">
              <YouTube />
            </div>
          </div>
        </div>
      </div>

      <center>
        <h2>Over 100,000 5-Star Reviews</h2>
      </center>
      <TestimonialCarousel />
    </div>
  );
};
