import React, { useState, useEffect } from 'react';
import { CMSLayout } from './CMSLayout';
import { Table, Button, Badge, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';
import { getApiUrl } from '../../Utils/apiConfig';
import './cms-modals.scss';

interface Order {
  id: number;
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
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

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const apiUrl = getApiUrl();
      const url = statusFilter
        ? `${apiUrl}/orders.php?status=${statusFilter}`
        : `${apiUrl}/orders.php`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data || []);
      } else {
        setError('Failed to load orders');
      }
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      pending: 'warning',
      processing: 'info',
      paid: 'success',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'danger',
    };
    return variants[status] || 'secondary';
  };

  if (loading) {
    return (
      <CMSLayout>
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      </CMSLayout>
    );
  }

  return (
    <CMSLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Orders Management</h1>
        <div className="cms-btn-group">
          <Button
            variant={statusFilter === '' ? 'primary' : 'outline-primary'}
            onClick={() => setSearchParams({})}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'warning' : 'outline-warning'}
            onClick={() => setSearchParams({ status: 'pending' })}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === 'processing' ? 'info' : 'outline-info'}
            onClick={() => setSearchParams({ status: 'processing' })}
          >
            Processing
          </Button>
          <Button
            variant={statusFilter === 'paid' ? 'success' : 'outline-success'}
            onClick={() => setSearchParams({ status: 'paid' })}
          >
            Paid
          </Button>
          <Button
            variant={statusFilter === 'shipped' ? 'primary' : 'outline-primary'}
            onClick={() => setSearchParams({ status: 'shipped' })}
          >
            Shipped
          </Button>
          <Button
            variant={statusFilter === 'delivered' ? 'success' : 'outline-success'}
            onClick={() => setSearchParams({ status: 'delivered' })}
          >
            Delivered
          </Button>
          <Button
            variant={statusFilter === 'cancelled' ? 'danger' : 'outline-danger'}
            onClick={() => setSearchParams({ status: 'cancelled' })}
          >
            Cancelled
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="cms-table">
        <Table striped bordered hover>
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
                  <Form.Select
                    size="sm"
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                    style={{ width: 'auto', display: 'inline-block' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                  <Button
                    variant="outline-info"
                    size="sm"
                    className="ms-2"
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
                    <FaEye />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-5">
          <p>No orders found</p>
        </div>
      )}

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

