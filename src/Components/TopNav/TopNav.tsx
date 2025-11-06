import { Badge, Button, Container, Nav, NavDropdown, Navbar } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../../CartContext";
import Logo from "../../assets/images/logo.png";
import { GrCart } from "react-icons/gr";
import "./top-nav.scss";

const productLinks = [
  { to: "/collections?category=*", label: "All Olivia Products" },
  { to: "/collections?category=hand-soap", label: "Hand Wash" },
  { to: "/collections?category=dish-wash", label: "Dish Wash" },
  { to: "/collections?category=air-freshener", label: "Air Freshener" },
  { to: "/collections?category=hair-care", label: "Hair Care" },
  { to: "/collections?category=car-wash", label: "Car Wash" },
  { to: "/collections?category=toilet-Wash", label: "Toilet Wash" },
  { to: "/collections?category=window-cleaner", label: "Window Cleaner" },
  { to: "/collections?category=personal-care", label: "Skin Care" },
  { to: "/collections?category=tile-cleaner", label: "Tile / Floor Cleaner" },
  { to: "/collections?category=fabric-wash", label: "Fabric Wash" },
];

const primaryLinks = [
  { to: "/", label: "Home" },
  { to: "/wholesale-page", label: "Wholesale" },
  { to: "/wholesale-page", label: "Distribution" },
  { to: "/wholesale-page", label: "Retail" },
  { to: "/about-us", label: "About" },
  { to: "/our-mission", label: "OliviaCare" },
  { to: "/our-mission", label: "Careers" },
  { to: "/contact-us", label: "Contact" },
];

export const TopNav = () => {
  const { cart, openCart } = useCart();

  const cartCount = cart.reduce((total, item) => total + (item.quantity ?? 1), 0);

  const CartButton = () => (
    <Button
      variant="success"
      className="top-nav__cart position-relative"
      onClick={openCart}
      aria-label="Open cart"
    >
      <GrCart size={22} />
      {cartCount > 0 && (
        <Badge bg="danger" pill className="top-nav__cart-badge">
          {cartCount}
        </Badge>
      )}
    </Button>
  );

  return (
    <Navbar expand="lg" bg="light" sticky="top" className="top-nav shadow-sm">
      <Container fluid="lg">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <img src={Logo} alt="Olivia Products" className="top-nav__logo" />
        </Navbar.Brand>
        <div className="d-flex align-items-center gap-2">
          <div className="d-lg-none">
            <CartButton />
          </div>
          <Navbar.Toggle aria-controls="main-navbar" />
        </div>
        <Navbar.Collapse id="main-navbar" className="justify-content-lg-end">
          <Nav className="align-items-lg-center gap-lg-3 top-nav__links">
            {primaryLinks.map((link) => (
              <Nav.Link key={link.label} as={NavLink} to={link.to} end>
                {link.label}
              </Nav.Link>
            ))}
            <NavDropdown title="Our Products" id="products-dropdown" menuVariant="light">
              {productLinks.map((link) => (
                <NavDropdown.Item key={link.label} as={NavLink} to={link.to}>
                  {link.label}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
          </Nav>
          <div className="d-none d-lg-inline-block ms-lg-4">
            <CartButton />
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
