import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCMSAuth } from '../../Contexts/CMSAuthContext';
import { Container, Navbar, Nav, NavDropdown, Badge } from 'react-bootstrap';
import { 
  FaHome, 
  FaBox, 
  FaShoppingCart, 
  FaEnvelope, 
  FaHandshake, 
  FaSignOutAlt,
  FaChartBar
} from 'react-icons/fa';
import './cms-layout.scss';

interface CMSLayoutProps {
  children: ReactNode;
}

export const CMSLayout: React.FC<CMSLayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useCMSAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/cms/login');
  };

  const closeMenu = () => {
    const toggleButton = document.querySelector('[aria-controls="cms-navbar-nav"]') as HTMLElement;
    if (toggleButton && isMenuOpen) {
      toggleButton.click();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const collapseElement = document.getElementById('cms-navbar-nav');
    if (collapseElement) {
      const observer = new MutationObserver(() => {
        setIsMenuOpen(collapseElement.classList.contains('show'));
      });
      observer.observe(collapseElement, {
        attributes: true,
        attributeFilter: ['class']
      });
      return () => observer.disconnect();
    }
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = () => {
    if (window.innerWidth < 992) {
      closeMenu();
    }
  };

  return (
    <div className="cms-layout">
      {isMenuOpen && <div className="cms-menu-backdrop" onClick={closeMenu} />}
      <Navbar bg="dark" variant="dark" expand="lg" className="cms-navbar" ref={navbarRef}>
        <Container fluid>
          <Navbar.Brand as={Link} to="/cms">
            <FaHome className="me-2" />
            Olivia CMS
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="cms-navbar-nav" />
          <Navbar.Collapse id="cms-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/cms" active={isActive('/cms')} onClick={handleNavClick}>
                <FaChartBar className="me-1" />
                Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/cms/products" active={isActive('/cms/products')} onClick={handleNavClick}>
                <FaBox className="me-1" />
                Products
              </Nav.Link>
              <Nav.Link as={Link} to="/cms/orders" active={isActive('/cms/orders')} onClick={handleNavClick}>
                <FaShoppingCart className="me-1" />
                Orders
              </Nav.Link>
              <Nav.Link as={Link} to="/cms/contacts" active={isActive('/cms/contacts')} onClick={handleNavClick}>
                <FaEnvelope className="me-1" />
                Contacts
              </Nav.Link>
              <Nav.Link as={Link} to="/cms/wholesale" active={isActive('/cms/wholesale')} onClick={handleNavClick}>
                <FaHandshake className="me-1" />
                Wholesale
              </Nav.Link>
            </Nav>
            <Nav>
              <NavDropdown title={
                <>
                  {user?.fullName || user?.username}
                  {user?.role === 'admin' && <Badge bg="danger" className="ms-2">Admin</Badge>}
                </>
              } id="user-dropdown">
                <NavDropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" />
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <div className="cms-content">
        <Container fluid className="py-4">
          {children}
        </Container>
      </div>
    </div>
  );
};

