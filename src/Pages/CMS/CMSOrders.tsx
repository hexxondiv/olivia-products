import React, { useState, useEffect, useCallback } from 'react';
import { CMSLayout } from './CMSLayout';
import { Table, Button, Badge, Form, Alert, Spinner, Modal, InputGroup } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { FaEye, FaSearch } from 'react-icons/fa';
import { getApiUrl } from '../../Utils/apiConfig';
import './cms-modals.scss';
import './cms-orders.scss';

interface Order {
  id: number;
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  isPaid?: boolean;
  paidAt?: string;
  createdAt: string;
  items?: any[];
}

export const CMSOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const statusFilter = searchParams.get('status') || '';
  const paidFilter = searchParams.get('paid') || null; // Can be 'paid', 'pending', or null
  const searchQuery = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(searchQuery);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const params = new URLSearchParams();
      
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      
      if (paidFilter) {
        params.append('paid', paidFilter);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const url = params.toString()
        ? `${apiUrl}/orders.php?${params.toString()}`
        : `${apiUrl}/orders.php`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data || []);
        setError('');
      } else {
        setError('Failed to load orders');
      }
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, paidFilter, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (statusFilter) {
      params.set('status', statusFilter);
    }
    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
    }
    if (paidFilter) {
      params.set('paid', paidFilter);
    }
    setSearchParams(params);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    const params = new URLSearchParams();
    if (statusFilter) {
      params.set('status', statusFilter);
    }
    if (paidFilter) {
      params.set('paid', paidFilter);
    }
    setSearchParams(params);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/orders.php?id=${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOrders();
      } else {
        alert('Failed to update order status');
      }
    } catch (err) {
      alert('Failed to update order status');
      console.error(err);
    }
  };

  const handlePaidToggle = async (orderId: string, isPaid: boolean) => {
    try {
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/orders.php?id=${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isPaid: isPaid }),
      });

      if (response.ok) {
        fetchOrders();
      } else {
        alert('Failed to update payment status');
      }
    } catch (err) {
      alert('Failed to update payment status');
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      pending: 'warning',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'danger',
    };
    return variants[status] || 'secondary';
  };

  if (loading) {
    return (
      <CMSLayout>
        <div className="spinner-container">
          <Spinner animation="border" />
        </div>
      </CMSLayout>
    );
  }

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams();
    if (status) {
      params.set('status', status);
    }
    if (paidFilter) {
      params.set('paid', paidFilter);
    }
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    setSearchParams(params);
  };

  const handlePaidFilter = () => {
    const params = new URLSearchParams();
    if (statusFilter) {
      params.set('status', statusFilter);
    }
    // Cycle through: null -> 'paid' -> 'pending' -> null
    let nextPaidFilter: string | null = null;
    if (paidFilter === null) {
      nextPaidFilter = 'paid';
    } else if (paidFilter === 'paid') {
      nextPaidFilter = 'pending';
    } else {
      nextPaidFilter = null;
    }
    
    if (nextPaidFilter) {
      params.set('paid', nextPaidFilter);
    }
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    setSearchParams(params);
  };

  const getPaidFilterButtonText = () => {
    if (paidFilter === 'paid') return 'Paid';
    if (paidFilter === 'pending') return 'Pending';
    return 'Not Applicable';
  };

  const getPaidFilterButtonVariant = () => {
    if (paidFilter === 'paid') return 'success';
    if (paidFilter === 'pending') return 'warning';
    return 'outline-secondary';
  };

  return (
    <CMSLayout>
      <div className="cms-orders-page">
        <div className="cms-orders-header">
          <div className="header-row">
            <h1>Orders Management</h1>
            <Form onSubmit={handleSearch} className="search-form">
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by Order ID..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="outline-secondary"
                    onClick={handleClearSearch}
                    type="button"
                  >
                    Clear
                  </Button>
                )}
                <Button variant="primary" type="submit">
                  Search
                </Button>
              </InputGroup>
            </Form>
          </div>
          <div className="cms-btn-group">
            <Button
              variant={statusFilter === '' ? 'primary' : 'outline-primary'}
              onClick={() => handleStatusFilter('')}
            >
              All
            </Button>
           
            <Button
              variant={statusFilter === 'pending' ? 'warning' : 'outline-warning'}
              onClick={() => handleStatusFilter('pending')}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === 'processing' ? 'info' : 'outline-info'}
              onClick={() => handleStatusFilter('processing')}
            >
              Processing
            </Button>
            
            <Button
              variant={statusFilter === 'shipped' ? 'primary' : 'outline-primary'}
              onClick={() => handleStatusFilter('shipped')}
            >
              Shipped
            </Button>
            <Button
              variant={statusFilter === 'delivered' ? 'success' : 'outline-success'}
              onClick={() => handleStatusFilter('delivered')}
            >
              Delivered
            </Button>
            <Button
              variant={statusFilter === 'cancelled' ? 'danger' : 'outline-danger'}
              onClick={() => handleStatusFilter('cancelled')}
            >
              Cancelled
            </Button> 
            <Button
              variant={'outline-default'}
            
            >
              |
            </Button>
            <Button
              variant={getPaidFilterButtonVariant()}
              onClick={handlePaidFilter}
            >
              {getPaidFilterButtonText()}
            </Button>
           
          </div>
        </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="cms-table">
        <div className="table-responsive d-none d-md-block">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderId}</td>
                  <td>{order.customerName}</td>
                  <td>{order.customerEmail}</td>
                  <td>₦{order.totalAmount.toLocaleString()}</td>
                  <td>
                    <Badge bg={getStatusBadge(order.status)}>
                      {order.status}
                    </Badge>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Form.Check
                        type="checkbox"
                        checked={order.isPaid || false}
                        onChange={(e) => handlePaidToggle(order.orderId, e.target.checked)}
                        label="Paid"
                        className="me-2"
                      />
                      <InputGroup size="sm" style={{ minWidth: '150px', flex: 1 }}>
                        <Form.Select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                          style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </Form.Select>
                        <Button
                          variant="outline-info"
                          onClick={() => {
                            fetch(`${getApiUrl()}/orders.php?id=${order.orderId}`)
                              .then(res => res.json())
                              .then(data => {
                                if (data.success) {
                                  setSelectedOrder(data.data);
                                }
                              });
                          }}
                          style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeft: 'none' }}
                        >
                          <FaEye />
                        </Button>
                      </InputGroup>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Mobile Card Layout */}
        <div className="d-md-none">
          {orders.map((order) => (
            <div key={order.id} className="mobile-order-card">
              <div className="order-header">
                <div className="order-id">{order.orderId}</div>
                <div className="order-status">
                  <Badge bg={getStatusBadge(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </div>
              <div className="order-details">
                <div className="detail-row">
                  <span className="detail-label">Customer</span>
                  <span className="detail-value">{order.customerName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{order.customerEmail}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Amount</span>
                  <span className="detail-value">₦{order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="order-actions">
                <Form.Check
                  type="checkbox"
                  checked={order.isPaid || false}
                  onChange={(e) => handlePaidToggle(order.orderId, e.target.checked)}
                  label="Paid"
                  className="mb-2"
                />
                <Form.Select
                  size="sm"
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                  className="mb-2"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
                <Button
                  variant="outline-info"
                  size="sm"
                  onClick={() => {
                    fetch(`${getApiUrl()}/orders.php?id=${order.orderId}`)
                      .then(res => res.json())
                      .then(data => {
                        if (data.success) {
                          setSelectedOrder(data.data);
                        }
                      });
                  }}
                >
                  <FaEye className="me-2" />
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {orders.length === 0 && (
        <div className="cms-empty-state">
          <p>No orders found</p>
        </div>
      )}
      </div>

      {selectedOrder && (
        <Modal show={!!selectedOrder} onHide={() => setSelectedOrder(null)} size="lg" className="cms-modal-order-details">
          <Modal.Header closeButton>
            <Modal.Title>Order Details - {selectedOrder.orderId}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
            <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
            <p><strong>Total:</strong> ₦{selectedOrder.totalAmount.toLocaleString()}</p>
            <p><strong>Status:</strong> <Badge bg={getStatusBadge(selectedOrder.status)}>{selectedOrder.status}</Badge></p>
            <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div className="mt-3">
                <h6>Order Items:</h6>
                {selectedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="order-item">
                    <p style={{ marginBottom: '0.5rem' }}>
                      <strong>{item.productName}</strong>
                    </p>
                    <p style={{ marginBottom: 0, fontSize: '0.9rem', color: '#666' }}>
                      Quantity: {item.quantity} × ₦{item.productPrice.toLocaleString()} = ₦{(item.quantity * item.productPrice).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </CMSLayout>
  );
};

