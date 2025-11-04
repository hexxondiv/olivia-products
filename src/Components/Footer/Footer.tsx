import React from "react";
import { BsArrowRight } from "react-icons/bs";
import { FaFacebook } from "react-icons/fa";
import { FaSquareInstagram, FaTiktok } from "react-icons/fa6";
import { Link, NavLink } from "react-router-dom";
import {
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Stack,
} from "react-bootstrap";
import "./footer.scss";

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__top-gradient" />
      <Container className="footer__inner">
        <Row className="gy-5 align-items-start">
          <Col lg={5}>
            <h3 className="mb-3">Our emails are zero waste, too</h3>
            <p className="mb-4">
              Subscribe to get exclusive deals, zero waste tips, and product
              launches—no spam, no waste.
            </p>
            <Form className="footer__form">
              <InputGroup className="footer__subscribe">
                <Form.Control
                  type="email"
                  placeholder="Email address"
                  aria-label="Email address"
                />
                <Button variant="success" type="submit" className="footer__subscribe-btn">
                  <BsArrowRight aria-hidden="true" />
                  <span className="visually-hidden">Subscribe</span>
                </Button>
              </InputGroup>
            </Form>
            <small className="d-block mt-3 footer__legal">
              By signing up, you consent to our <Link to="">Privacy Policy</Link>. You may
              unsubscribe at any time.
            </small>
            <Stack direction="horizontal" gap={3} className="mt-4 footer__socials">
              <Link to="" aria-label="Instagram">
                <FaSquareInstagram />
              </Link>
              <Link to="" aria-label="Facebook">
                <FaFacebook />
              </Link>
              <Link to="" aria-label="TikTok">
                <FaTiktok />
              </Link>
            </Stack>
          </Col>
          <Col lg={6} className="ms-lg-auto">
            <Row className="g-4">
              <Col xs={6} md={4}>
                <ul className="list-unstyled footer__links">
                  <h5>Shop</h5>
                  <li>
                    <NavLink to="/collections?category=*">All</NavLink>
                  </li>
                  <li>
                    <NavLink to="/collections?category=dish-wash">Dish Wash</NavLink>
                  </li>
                  <li>
                    <NavLink to="/collections?category=air-freshener">Air Fresheners</NavLink>
                  </li>
                  <li>
                    <NavLink to="/collections?category=shampoo">Hair Care</NavLink>
                  </li>
                </ul>
              </Col>
              <Col xs={6} md={4}>
                <ul className="list-unstyled footer__links">
                  <h5>About</h5>
                  <li>
                    <NavLink to="/our-mission">Our Mission</NavLink>
                  </li>
                  <li>
                    <NavLink to="/our-mission">Careers</NavLink>
                  </li>
                  <li>
                    <NavLink to="/wholesale-page">Wholesale Inquiries</NavLink>
                  </li>
                </ul>
              </Col>
              <Col xs={6} md={4}>
                <ul className="list-unstyled footer__links">
                  <h5>Help</h5>
                  <li>
                    <NavLink to="/contact-us">Contact Us</NavLink>
                  </li>
                  <li>
                    <NavLink to="">Returns & Exchanges</NavLink>
                  </li>
                  <li>
                    <NavLink to="/faqs">FAQ</NavLink>
                  </li>
                </ul>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="pt-5 mt-4 border-top border-secondary-subtle align-items-center">
          <Col lg="auto">
            <p className="mb-0 footer__credits">Powered by Hexxondiv Tech Hub</p>
          </Col>
          <Col>
            <ul className="list-unstyled d-flex flex-wrap gap-3 mb-0 footer__policies">
              <li>&copy; {new Date().getFullYear()} Olivia Products</li>
              <li>
                <NavLink to="">Terms & Conditions</NavLink>
              </li>
              <li>
                <NavLink to="">Privacy Policy</NavLink>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};
