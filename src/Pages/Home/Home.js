import React from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaAngleRight } from "react-icons/fa";

import MissionImg from "../../assets/images/group6.png";
import Testifier from "../../assets/images/fast.avif";
import Testifier2 from "../../assets/images/oprah.avif";
import Testifier3 from "../../assets/images/corp.avif";
import Testifier4 from "../../assets/images/today.avif";

import { ProductsHolder } from "./ProductsHolder";
import SampleSlide from "./ProductsSlide/ProductsSlide";
import TestimonialCarousel from "./Testimonials";
import { HomeSlide } from "./HomeSlide/HomeSlide";
import FBSocials from "./FBSocials";
import TwitterHandle from "./TwitterHandle/TwitterHandle";
import YouTube from "./Youtube";

import "./home.scss";

const pressMentions = [
  {
    quote: '"Best sustainable cleaning products"',
    image: Testifier,
    alt: "Fast Company",
  },
  {
    quote: "Best for the Environment",
    image: Testifier2,
    alt: "Oprah",
  },
  {
    quote: '"Tried the whole line and absolutely love it. It\'s genius"',
    image: Testifier3,
    alt: "Corporate Review",
  },
  {
    quote: "World Changing Ideas",
    image: Testifier4,
    alt: "Today Show",
  },
];

export const Home = () => {
  return (
    <div className="home">
      <HomeSlide />

      <section className="home__section home__section--about">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <span className="home__eyebrow">About Us</span>
              <h2 className="home__headline">
                One of the largest manufacturer and distributor of Laundry,
                Hygiene and Hair Care products in Nigeria.
              </h2>
            </Col>
            <Col lg={6}>
              <p>
                At Olivia Products, we take pride in redefining everyday care
                through innovation, quality, and trust. Our growing portfolio
                spans across hair care, skin care, dish wash, fabric cleaner,
                tile and toilet wash, car wash, window cleaner, and air
                fresheners—each crafted to bring freshness, brilliance, and
                protection to your daily life. Guided by a commitment to
                excellence, we create products that combine powerful performance
                with gentle care, ensuring every Olivia experience leaves your
                home, your car, and your family feeling renewed.
              </p>
              <Button as={Link} to="/about-us" variant="outline-success" className="home__cta">
                Explore More
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="home__section home__section--products text-center">
        <Container className="col-lg-8">
          <span className="home__eyebrow">Our Products</span>
          <h2 className="home__headline">
            Millions trust our touch. Every day begins with Olivia.
          </h2>
          <p>
            At Olivia Products, quality is never compromised. Every item we
            produce undergoes rigorous testing to ensure purity, safety, and
            exceptional performance. From formulation to packaging, each product
            meets the highest standards before leaving our factory — because we
            believe our customers deserve nothing less than perfection. It’s
            this unwavering commitment to excellence that has made Olivia
            Products a trusted name in homes across Nigeria.
          </p>
          <h5 className="home__subhead">
            From homes to hearts — Olivia makes a difference every day.
          </h5>
        </Container>
        <div className="home__carousel">
          <SampleSlide />
        </div>
      </section>

      <section className="home__section home__section--bestsellers text-center">
        <Container>
          <h2 className="home__headline">Our Bestsellers</h2>
        </Container>
        <ProductsHolder showOnlyBestSellers={true} />
      </section>

      <section className="home__section home__section--press">
        <Container>
          <Row className="g-4">
            {pressMentions.map(({ quote, image, alt }) => (
              <Col xs={6} lg={3} key={alt}>
                <Card className="home__press-card h-100 text-center">
                  <Card.Body>
                    <Card.Text className="home__press-quote">{quote}</Card.Text>
                    <img src={image} alt={alt} className="home__press-logo" />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="home__section home__section--mission">
        <Container>
          <Row className="align-items-center g-4">
            <Col lg={6}>
              <div className="home__mission-visual">
                <img src={MissionImg} alt="OliviaCare outreach" className="img-fluid" />
              </div>
            </Col>
            <Col lg={6}>
              <span className="home__eyebrow">OliviaCare</span>
              <h2 className="home__headline">
                Make a Difference with <span>Olivia Products</span>
              </h2>
              <p>
                At Olivia Products, making a difference goes beyond what we
                create — it’s about how we care. We’re dedicated to enriching
                everyday lives and uplifting communities through purposeful
                action. Our focus remains on empowering the youth, nurturing
                talent, and supporting education — helping tomorrow’s leaders
                build brighter futures, one opportunity at a time.
              </p>
              <Button
                as={Link}
                to="/our-mission"
                variant="success"
                className="home__cta-link"
              >
                Our Mission <FaAngleRight />
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="home__section home__section--media text-center">
        <Container>
          <span className="home__eyebrow">News and Events</span>
          <h2 className="home__headline">
            Get to know more about us from the media
          </h2>
          <p className="home__description home__description--media mx-auto">
            Discover how Olivia Products is shaping better homes across
            Nigeria—from community spotlights to innovation features, stay in
            the loop with our latest stories and updates.
          </p>
          <Row className="g-4 mt-4 home__media-row">
            <Col md={4} className="home__media-col">
              <FBSocials />
            </Col>
            <Col md={4} className="home__media-col">
              <TwitterHandle />
            </Col>
            <Col md={4} className="home__media-col">
              <YouTube />
            </Col>
          </Row>
        </Container>
      </section>

      <section className="home__section home__section--testimonials text-center">
        <Container>
          <h2 className="home__headline">Over 100,000 5-star reviews</h2>
        </Container>
        <TestimonialCarousel />
      </section>
    </div>
  );
};
