import React, { useState, useEffect } from 'react';
import { CMSLayout } from './CMSLayout';
import { Card, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaBox, FaShoppingCart, FaEnvelope, FaHandshake } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getApiUrl } from '../../Utils/apiConfig';
import './cms-dashboard.scss';

interface DashboardStats {
  products: number;
  orders: number;
  contacts: number;
  wholesale: number;
  pendingOrders: number;
  newContacts: number;
  newWholesale: number;
}

export const CMSDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Use centralized API URL configuration
      const apiUrl = getApiUrl();
      
      const [productsRes, ordersRes, contactsRes, wholesaleRes] = await Promise.all([
        fetch(`${apiUrl}/products.php?activeOnly=true`),
        fetch(`${apiUrl}/orders.php?limit=1`),
        fetch(`${apiUrl}/contacts.php?status=new&limit=1`),
        fetch(`${apiUrl}/wholesale.php?status=new&limit=1`),
      ]);

      const [productsData, ordersData, contactsData, wholesaleData] = await Promise.all([
        productsRes.json(),
        ordersRes.json(),
        contactsRes.json(),
        wholesaleRes.json(),
      ]);

      const pendingOrdersRes = await fetch(`${apiUrl}/orders.php?status=pending&limit=1`);
      const pendingOrdersData = await pendingOrdersRes.json();

      setStats({
        products: productsData.count || 0,
        orders: ordersData.total || 0,
        contacts: contactsData.total || 0,
        wholesale: wholesaleData.total || 0,
        pendingOrders: pendingOrdersData.total || 0,
        newContacts: contactsData.total || 0,
        newWholesale: wholesaleData.total || 0,
      });
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CMSLayout>
        <div className="cms-dashboard">
          <div className="spinner-container">
            <Spinner animation="border" variant="primary" />
          </div>
        </div>
      </CMSLayout>
    );
  }

  if (error) {
    return (
      <CMSLayout>
        <div className="cms-dashboard">
          <Alert variant="danger">{error}</Alert>
        </div>
      </CMSLayout>
    );
  }

  return (
    <CMSLayout>
      <div className="cms-dashboard">
        <h1>Dashboard</h1>

        <Row className="cms-stats">
          <Col xs={12} className="mb-3 mb-lg-0">
            <Link to="/cms/products" className="text-decoration-none">
              <Card className="cms-stat-card stat-products">
                <Card.Body>
                  <div className="stat-icon">
                    <FaBox />
                  </div>
                  <h3>{stats?.products || 0}</h3>
                  <p>Active Products</p>
                  <span className="stat-link">
                    View Products
                  </span>
                </Card.Body>
              </Card>
            </Link>
          </Col>
          <Col xs={12}  className="mb-3 mb-lg-0">
            <Link to="/cms/orders" className="text-decoration-none">
              <Card className="cms-stat-card stat-orders">
                <Card.Body>
                  <div className="stat-icon">
                    <FaShoppingCart />
                  </div>
                  <h3>{stats?.orders || 0}</h3>
                  <p>Total Orders</p>
                  {stats && stats.pendingOrders > 0 && (
                    <Badge className="stat-badge">
                      {stats.pendingOrders} pending
                    </Badge>
                  )}
                  <span className="stat-link">
                    View Orders
                  </span>
                </Card.Body>
              </Card>
            </Link>
          </Col>
          <Col xs={12} className="mb-3 mb-lg-0">
            <Link to="/cms/contacts" className="text-decoration-none">
              <Card className="cms-stat-card stat-contacts">
                <Card.Body>
                  <div className="stat-icon">
                    <FaEnvelope />
                  </div>
                  <h3>{stats?.contacts || 0}</h3>
                  <p>Contact Submissions</p>
                  {stats && stats.newContacts > 0 && (
                    <Badge className="stat-badge">
                      {stats.newContacts} new
                    </Badge>
                  )}
                  <span className="stat-link">
                    View Contacts
                  </span>
                </Card.Body>
              </Card>
            </Link>
          </Col>
          <Col xs={12}className="mb-3 mb-lg-0">
            <Link to="/cms/wholesale" className="text-decoration-none">
              <Card className="cms-stat-card stat-wholesale">
                <Card.Body>
                  <div className="stat-icon">
                    <FaHandshake />
                  </div>
                  <h3>{stats?.wholesale || 0}</h3>
                  <p>Wholesale Applications</p>
                  {stats && stats.newWholesale > 0 && (
                    <Badge className="stat-badge">
                      {stats.newWholesale} new
                    </Badge>
                  )}
                  <span className="stat-link">
                    View Applications
                  </span>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        </Row>

        <Row>
          <Col>
            <div className="cms-quick-actions">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Quick Actions</h5>
                </Card.Header>
                <Card.Body>
                  <div className="cms-btn-group">
                    <Link to="/cms/products" className="btn btn-primary">
                      <FaBox />
                      Manage Products
                    </Link>
                    <Link to="/cms/orders?status=pending" className="btn btn-warning">
                      <FaShoppingCart />
                      Pending Orders
                    </Link>
                    <Link to="/cms/contacts?status=new" className="btn btn-info">
                      <FaEnvelope />
                      New Contacts
                    </Link>
                    <Link to="/cms/wholesale?status=new" className="btn btn-success">
                      <FaHandshake />
                      New Applications
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </CMSLayout>
  );
};

