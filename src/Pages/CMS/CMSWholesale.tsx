import React, { useState, useEffect } from 'react';
import { CMSLayout } from './CMSLayout';
import { Table, Button, Badge, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { FaEye, FaTrash, FaPhone, FaWhatsapp } from 'react-icons/fa';
import { getApiUrl } from '../../Utils/apiConfig';
import './cms-modals.scss';
import './cms-wholesale.scss';

interface Wholesale {
  id: number;
  formType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  website?: string;
  companyLogo?: string;
  cacRegistrationNumber?: string;
  city: string;
  state: string;
  country: string;
  aboutBusiness: string;
  businessTypes: string[];
  status: string;
  createdAt: string;
}

export const CMSWholesale: React.FC = () => {
  const [wholesale, setWholesale] = useState<Wholesale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedWholesale, setSelectedWholesale] = useState<Wholesale | null>(null);
  const statusFilter = searchParams.get('status') || '';
  const typeFilter = searchParams.get('formType') || '';

  useEffect(() => {
    fetchWholesale();
  }, [statusFilter, typeFilter]);

  const fetchWholesale = async () => {
    try {
      const apiUrl = getApiUrl();
      let url = `${apiUrl}/wholesale.php`;
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('formType', typeFilter);
      if (params.toString()) url += '?' + params.toString();
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setWholesale(data.data || []);
      } else {
        setError('Failed to load wholesale applications');
      }
    } catch (err) {
      setError('Failed to load wholesale applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/wholesale.php?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchWholesale();
      } else {
        alert('Failed to update application status');
      }
    } catch (err) {
      alert('Failed to update application status');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/wholesale.php?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchWholesale();
      } else {
        alert('Failed to delete application');
      }
    } catch (err) {
      alert('Failed to delete application');
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      new: 'primary',
      reviewing: 'info',
      approved: 'success',
      rejected: 'danger',
      archived: 'secondary',
    };
    return variants[status] || 'secondary';
  };

  // Format phone number for links in international format (+234 by default if not included)
  const formatPhoneForLink = (phone: string): string => {
    if (!phone) return '';
    
    // Remove all non-numeric characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // If empty, return empty
    if (!cleaned) return '';
    
    // If already starts with +, validate and return as is if valid
    if (cleaned.startsWith('+')) {
      const digits = cleaned.substring(1);
      // If it's a valid international number (at least 10 digits total), return as is
      if (digits.length >= 10) {
        return cleaned;
      }
      // If invalid, remove + and continue processing
      cleaned = digits;
    }
    
    // Remove leading 0 if present (common in Nigerian numbers like 08012345678)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // If it already starts with 234 (without +), add +
    if (cleaned.startsWith('234')) {
      return '+' + cleaned;
    }
    
    // Otherwise, add +234 prefix (Nigeria country code)
    return '+234' + cleaned;
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
      <div className="cms-wholesale-page">
        <div className="cms-wholesale-header">
          <div className="header-row">
            <h1>Wholesale Applications</h1>
          </div>
          <div className="cms-btn-group">
            <Button
              variant={statusFilter === '' ? 'primary' : 'outline-primary'}
              onClick={() => setSearchParams({})}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'new' ? 'primary' : 'outline-primary'}
              onClick={() => setSearchParams({ status: 'new' })}
            >
              New
            </Button>
            <Button
              variant={statusFilter === 'reviewing' ? 'info' : 'outline-info'}
              onClick={() => setSearchParams({ status: 'reviewing' })}
            >
              Reviewing
            </Button>
            <Button
              variant={statusFilter === 'approved' ? 'success' : 'outline-success'}
              onClick={() => setSearchParams({ status: 'approved' })}
            >
              Approved
            </Button>
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <div className="cms-table">
          {/* Desktop Table View */}
          <div className="table-responsive d-none d-md-block">
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Business</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wholesale.map((app) => (
                  <tr key={app.id}>
                    <td>{app.id}</td>
                    <td>
                      <Badge bg="secondary">{app.formType}</Badge>
                    </td>
                    <td>{app.firstName} {app.lastName}</td>
                    <td>{app.businessName}</td>
                    <td>{app.email}</td>
                    <td>{app.city}, {app.state}</td>
                    <td>
                      <Badge bg={getStatusBadge(app.status)}>
                        {app.status}
                      </Badge>
                    </td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Form.Select
                          size="sm"
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          style={{ minWidth: '120px' }}
                        >
                          <option value="new">New</option>
                          <option value="reviewing">Reviewing</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="archived">Archived</option>
                        </Form.Select>
                        <Button
                          variant="outline-info"
                          size="sm"
                          className="ms-2"
                          onClick={() => setSelectedWholesale(app)}
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="ms-2"
                          onClick={() => handleDelete(app.id)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="d-md-none">
            {wholesale.map((app) => (
              <div key={app.id} className="mobile-wholesale-card">
                <div className="application-header">
                  <div className="application-id">#{app.id}</div>
                  <div className="application-type">
                    <Badge bg="secondary">{app.formType}</Badge>
                  </div>
                  <div className="application-status">
                    <Badge bg={getStatusBadge(app.status)}>
                      {app.status}
                    </Badge>
                  </div>
                </div>
                <div className="application-details">
                  <div className="detail-row">
                    <span className="detail-label">Name</span>
                    <span className="detail-value">{app.firstName} {app.lastName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Business</span>
                    <span className="detail-value">{app.businessName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{app.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{app.city}, {app.state}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">{new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="application-actions">
                  <Form.Select
                    size="sm"
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  >
                    <option value="new">New</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="archived">Archived</option>
                  </Form.Select>
                  <div className="action-buttons">
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => setSelectedWholesale(app)}
                    >
                      <FaEye className="me-1" />
                      View
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(app.id)}
                    >
                      <FaTrash className="me-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {wholesale.length === 0 && (
          <div className="cms-empty-state">
            <p>No applications found</p>
          </div>
        )}
      </div>

      {selectedWholesale && (() => {
        const phoneNumber = formatPhoneForLink(selectedWholesale.phone);
        // For WhatsApp, remove + and keep only digits
        const whatsappNumber = phoneNumber ? phoneNumber.replace(/[^0-9]/g, '') : '';
        const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '#';
        // For tel: links, keep the + sign
        const callUrl = phoneNumber ? `tel:${phoneNumber}` : '#';

        return (
          <Modal 
            show={!!selectedWholesale} 
            onHide={() => setSelectedWholesale(null)} 
            size="lg" 
            className="cms-modal-wholesale-details"
          >
            <Modal.Header closeButton>
              <Modal.Title>Application Details - {selectedWholesale.formType}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="wholesale-modal-body">
              <div className="wholesale-modal-content">
                <div className="wholesale-modal-main">
                  <p><strong>Name:</strong> {selectedWholesale.firstName} {selectedWholesale.lastName || <em className="text-muted">*Not Provided*</em>}</p>
                  <p><strong>Email:</strong> {selectedWholesale.email}</p>
                  <p className="phone-row">
                    <strong>Phone:</strong> {selectedWholesale.phone}
                    {phoneNumber && (
                      <span className="phone-actions">
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="phone-action-btn whatsapp-btn"
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open WhatsApp"
                          as="a"
                        >
                          <FaWhatsapp /> WhatsApp
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="phone-action-btn call-btn"
                          href={callUrl}
                          title="Call"
                          as="a"
                        >
                          <FaPhone /> Call
                        </Button>
                      </span>
                    )}
                  </p>
                  <p><strong>Business Name:</strong> {selectedWholesale.businessName}</p>
                  <p><strong>CAC Registration Number:</strong> {selectedWholesale.cacRegistrationNumber ? (
                    <a 
                      href={`https://icrp.cac.gov.ng/public-search`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Verify on CAC Portal"
                    >
                      {selectedWholesale.cacRegistrationNumber}
                    </a>
                  ) : (
                    <em className="text-muted">*Not Provided*</em>
                  )}</p>
                  <p><strong>Website:</strong> {selectedWholesale.website ? (
                    <a href={selectedWholesale.website} target="_blank" rel="noopener noreferrer">{selectedWholesale.website}</a>
                  ) : (
                    <em className="text-muted">*Not Provided*</em>
                  )}</p>
                  <p><strong>Location:</strong> {selectedWholesale.city}, {selectedWholesale.state}, {selectedWholesale.country}</p>
                </div>
                <div className="wholesale-modal-logo">
                  <div className="company-logo-display">
                    {selectedWholesale.companyLogo ? (
                      <img 
                        src={selectedWholesale.companyLogo} 
                        alt={`${selectedWholesale.businessName} logo`}
                        className="company-logo-img"
                      />
                    ) : (
                      <div className="company-logo-placeholder">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <path d="M9 9C9 10.1046 9.89543 11 11 11C12.1046 11 13 10.1046 13 9C13 7.89543 12.1046 7 11 7C9.89543 7 9 7.89543 9 9Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <path d="M5 19L8.5 15.5L11 18L15 14L19 18V19H5Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        <span>No Logo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p><strong>Status:</strong> <Badge bg={getStatusBadge(selectedWholesale.status)}>{selectedWholesale.status}</Badge></p>
              <p><strong>Date:</strong> {new Date(selectedWholesale.createdAt).toLocaleString()}</p>
              {selectedWholesale.businessTypes && selectedWholesale.businessTypes.length > 0 && (
                <div className="mt-2">
                  <strong>Business Types:</strong>
                  <div className="business-types">
                    {selectedWholesale.businessTypes.map((type, idx) => (
                      <Badge key={idx} bg="warning" text="dark">{type}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-3">
                <strong>About Business:</strong>
                <div className="business-info">{selectedWholesale.aboutBusiness}</div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setSelectedWholesale(null)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        );
      })()}
    </CMSLayout>
  );
};

