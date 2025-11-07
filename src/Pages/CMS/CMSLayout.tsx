import React, { ReactNode } from 'react';
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

  const handleLogout = () => {
    logout();
    navigate('/cms/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="cms-layout">
      <Navbar bg="dark" variant="dark" expand="lg" className="cms-navbar">
        <Container fluid>
          <Navbar.Brand as={Link} to="/cms">
            <FaHome className="me-2" />
            Olivia CMS
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="cms-navbar-nav" />
          <Navbar.Collapse id="cms-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/cms" active={isActive('/cms')}>
                <FaChartBar className="me-1" />
                Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/cms/products" active={isActive('/cms/products')}>
                <FaBox className="me-1" />
                Products
              </Nav.Link>
              <Nav.Link as={Link} to="/cms/orders" active={isActive('/cms/orders')}>
                <FaShoppingCart className="me-1" />
                Orders
              </Nav.Link>
              <Nav.Link as={Link} to="/cms/contacts" active={isActive('/cms/contacts')}>
                <FaEnvelope className="me-1" />
                Contacts
              </Nav.Link>
              <Nav.Link as={Link} to="/cms/wholesale" active={isActive('/cms/wholesale')}>
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

