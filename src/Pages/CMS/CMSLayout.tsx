import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCMSAuth } from '../../Contexts/CMSAuthContext';
import { Container, Navbar, Nav, NavDropdown, Badge, Toast, ToastContainer } from 'react-bootstrap';
import { 
  FaHome, 
  FaBox, 
  FaShoppingCart, 
  FaEnvelope, 
  FaHandshake, 
  FaSignOutAlt,
  FaChartBar,
  FaExclamationTriangle,
  FaWarehouse,
  FaStar,
  FaBolt,
  FaQuestionCircle
} from 'react-icons/fa';
import { getApiUrl } from '../../Utils/apiConfig';
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
  const [stockAlertsCount, setStockAlertsCount] = useState(0);
  const [newContactsCount, setNewContactsCount] = useState(0);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [newWholesaleCount, setNewWholesaleCount] = useState(0);
  const [toasts, setToasts] = useState<Array<{ id: string; title: string; message: string; variant: string }>>([]);
  const lastCheckedRef = useRef<{ contacts: string; orders: string; wholesale: string }>({
    contacts: new Date().toISOString(),
    orders: new Date().toISOString(),
    wholesale: new Date().toISOString()
  });

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

  useEffect(() => {
    if (isAuthenticated) {
      // Load last checked timestamps from localStorage
      const savedLastChecked = localStorage.getItem('cms_last_checked');
      if (savedLastChecked) {
        try {
          const parsed = JSON.parse(savedLastChecked);
          // Ensure all fields exist (for backward compatibility)
          lastCheckedRef.current = {
            contacts: parsed.contacts || new Date().toISOString(),
            orders: parsed.orders || new Date().toISOString(),
            wholesale: parsed.wholesale || new Date().toISOString()
          };
        } catch (e) {
          // If parsing fails, use current time
          lastCheckedRef.current = {
            contacts: new Date().toISOString(),
            orders: new Date().toISOString(),
            wholesale: new Date().toISOString()
          };
        }
      }

      // Initial fetch
      fetchStockAlerts();
      fetchNotifications();

      // Set up polling intervals
      const stockInterval = setInterval(fetchStockAlerts, 60000); // Every minute
      const notificationInterval = setInterval(fetchNotifications, 30000); // Every 30 seconds

      return () => {
        clearInterval(stockInterval);
        clearInterval(notificationInterval);
      };
    }
  }, [isAuthenticated]);

  // Update last checked time when visiting the respective pages to prevent duplicate toasts
  useEffect(() => {
    if (location.pathname === '/cms/contacts') {
      // Update last checked time to now when visiting contacts page
      // This prevents showing toast notifications for items that were already visible
      const now = new Date().toISOString();
      lastCheckedRef.current.contacts = now;
      localStorage.setItem('cms_last_checked', JSON.stringify(lastCheckedRef.current));
      // Don't reset count - it should reflect actual new items
    } else if (location.pathname === '/cms/orders') {
      // Update last checked time to now when visiting orders page
      const now = new Date().toISOString();
      lastCheckedRef.current.orders = now;
      localStorage.setItem('cms_last_checked', JSON.stringify(lastCheckedRef.current));
      // Don't reset count - it should reflect actual pending orders
    } else if (location.pathname === '/cms/wholesale') {
      // Update last checked time to now when visiting wholesale page
      const now = new Date().toISOString();
      lastCheckedRef.current.wholesale = now;
      localStorage.setItem('cms_last_checked', JSON.stringify(lastCheckedRef.current));
      // Don't reset count - it should reflect actual new wholesale applications
    }
  }, [location.pathname]);

  const fetchStockAlerts = async () => {
    try {
      const token = localStorage.getItem('cms_token');
      if (!token) return;

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/stock.php/alerts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStockAlertsCount(data.count || 0);
        }
      }
    } catch (err) {
      // Silently fail - don't show errors for alerts
      console.error('Failed to fetch stock alerts:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const apiUrl = getApiUrl();
      const now = new Date().toISOString();

      // Fetch new contacts (created after last check)
      const contactsResponse = await fetch(
        `${apiUrl}/contacts.php?status=new&limit=100`
      );
      
      // Fetch new orders (created after last check, status pending)
      const ordersResponse = await fetch(
        `${apiUrl}/orders.php?status=pending&limit=100`
      );

      // Fetch new wholesale applications (created after last check, status new)
      const wholesaleResponse = await fetch(
        `${apiUrl}/wholesale.php?status=new&limit=100`
      );

      if (contactsResponse.ok && ordersResponse.ok && wholesaleResponse.ok) {
        const contactsData = await contactsResponse.json();
        const ordersData = await ordersResponse.json();
        const wholesaleData = await wholesaleResponse.json();

        // Filter contacts created after last check
        const lastContactsCheck = new Date(lastCheckedRef.current.contacts);
        const newContacts = (contactsData.data || []).filter((contact: any) => {
          const createdAt = new Date(contact.createdAt || contact.submittedAt);
          return createdAt > lastContactsCheck;
        });

        // Filter orders created after last check
        const lastOrdersCheck = new Date(lastCheckedRef.current.orders);
        const newOrders = (ordersData.data || []).filter((order: any) => {
          const createdAt = new Date(order.createdAt || order.orderDate);
          return createdAt > lastOrdersCheck;
        });

        // Filter wholesale applications created after last check
        const lastWholesaleCheck = new Date(lastCheckedRef.current.wholesale);
        const newWholesale = (wholesaleData.data || []).filter((wholesale: any) => {
          const createdAt = new Date(wholesale.createdAt || wholesale.submittedAt);
          return createdAt > lastWholesaleCheck;
        });

        // Update counts
        const totalNewContacts = contactsData.total || 0;
        const totalNewOrders = ordersData.total || 0;
        const totalNewWholesale = wholesaleData.total || 0;
        
        setNewContactsCount(totalNewContacts);
        setNewOrdersCount(totalNewOrders);
        setNewWholesaleCount(totalNewWholesale);

        // Show toast notifications for newly arrived items
        if (newContacts.length > 0) {
          addToast(
            'New Contact',
            `${newContacts.length} new contact message${newContacts.length > 1 ? 's' : ''} received`,
            'info'
          );
          lastCheckedRef.current.contacts = now;
        }

        if (newOrders.length > 0) {
          addToast(
            'New Order',
            `${newOrders.length} new order${newOrders.length > 1 ? 's' : ''} placed`,
            'success'
          );
          lastCheckedRef.current.orders = now;
        }

        if (newWholesale.length > 0) {
          addToast(
            'New Wholesale Application',
            `${newWholesale.length} new wholesale application${newWholesale.length > 1 ? 's' : ''} received`,
            'warning'
          );
          lastCheckedRef.current.wholesale = now;
        }

        // Save updated timestamps
        localStorage.setItem('cms_last_checked', JSON.stringify(lastCheckedRef.current));
      }
    } catch (err) {
      // Silently fail - don't show errors for notifications
      console.error('Failed to fetch notifications:', err);
    }
  };

  const addToast = (title: string, message: string, variant: string = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, variant }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

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
                {newOrdersCount > 0 && (
                  <Badge bg="success" className="ms-2" pill>
                    {newOrdersCount}
                  </Badge>
                )}
              </Nav.Link>
              <Nav.Link as={Link} to="/cms/contacts" active={isActive('/cms/contacts')} onClick={handleNavClick}>
                <FaEnvelope className="me-1" />
                Contacts
                {newContactsCount > 0 && (
                  <Badge bg="info" className="ms-2" pill>
                    {newContactsCount}
                  </Badge>
                )}
              </Nav.Link>
              <Nav.Link as={Link} to="/cms/wholesale" active={isActive('/cms/wholesale')} onClick={handleNavClick}>
                <FaHandshake className="me-1" />
                Wholesale
                {newWholesaleCount > 0 && (
                  <Badge bg="warning" className="ms-2" pill>
                    {newWholesaleCount}
                  </Badge>
                )}
              </Nav.Link>
              <Nav.Link as={Link} to="/cms/stock" active={isActive('/cms/stock')} onClick={handleNavClick}>
                <FaWarehouse className="me-1" />
                Stock
                {stockAlertsCount > 0 && (
                  <Badge bg="danger" className="ms-2" pill>
                    {stockAlertsCount}
                  </Badge>
                )}
              </Nav.Link>
              <Nav.Link as={Link} to="/cms/testimonials" active={isActive('/cms/testimonials')} onClick={handleNavClick}>
                <FaStar className="me-1" />
                Testimonials
              </Nav.Link>
              <Nav.Link as={Link} to="/cms/flash-info" active={isActive('/cms/flash-info')} onClick={handleNavClick}>
                <FaBolt className="me-1" />
                Flash Info
              </Nav.Link>
              <Nav.Link as={Link} to="/cms/faqs" active={isActive('/cms/faqs')} onClick={handleNavClick}>
                <FaQuestionCircle className="me-1" />
                FAQs
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
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1060 }}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            onClose={() => removeToast(toast.id)}
            show={true}
            delay={5000}
            autohide
            bg={toast.variant}
          >
            <Toast.Header>
              <strong className="me-auto">{toast.title}</strong>
            </Toast.Header>
            <Toast.Body className="text-white">{toast.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </div>
  );
};

