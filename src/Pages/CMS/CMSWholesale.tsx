import React, { useState, useEffect } from 'react';
import { CMSLayout } from './CMSLayout';
import { Table, Button, Badge, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { FaEye, FaTrash, FaPhone, FaWhatsapp, FaUser, FaEnvelope, FaBuilding, FaGlobe, FaMapMarkerAlt, FaCalendarAlt, FaTag, FaFileAlt, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
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
  businessPhysicalAddress?: string;
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
  const [cacVerifying, setCacVerifying] = useState(false);
  const [cacResult, setCacResult] = useState<any>(null);
  const [showCacModal, setShowCacModal] = useState(false);
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

  const verifyCAC = async (cacNumber: string, searchType: string = 'ALL') => {
    setCacVerifying(true);
    setCacResult(null);
    
    // Validate and trim the CAC number
    if (!cacNumber || !cacNumber.trim()) {
      setCacResult({
        success: false,
        error: 'CAC registration number is required',
      });
      setShowCacModal(true);
      setCacVerifying(false);
      return;
    }
    
    const trimmedCacNumber = cacNumber.trim();
    console.log('Verifying CAC number:', trimmedCacNumber);
    
    try {
      const apiUrl = getApiUrl();
      const requestBody = {
        action: 'verifyCAC',
        searchType: searchType,
        searchTerm: trimmedCacNumber,
      };
      
      console.log('Sending CAC verification request:', requestBody);
      
      const response = await fetch(`${apiUrl}/wholesale.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Parse response even if status is not OK to get error details
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, treat as not verified
        setCacResult({
          success: false,
          notVerified: true,
          error: 'CAC registration number could not be verified',
          message: `Failed to parse response: ${response.status} ${response.statusText}`,
        });
        setShowCacModal(true);
        setCacVerifying(false);
        return;
      }
      
      if (data.success) {
        // Check if data is empty array or null/empty
        const responseData = data.data;
        if (Array.isArray(responseData) && responseData.length === 0) {
          // Empty data array means not verified
          setCacResult({
            success: false,
            notVerified: true,
            error: 'CAC registration number not found',
            message: data.message || 'No matching records found in CAC registry',
          });
        } else if (!responseData || responseData === '') {
          // Null or empty data means not verified
          setCacResult({
            success: false,
            notVerified: true,
            error: 'CAC registration number not found',
            message: data.message || 'No matching records found in CAC registry',
          });
        } else {
          // Valid data found
          setCacResult({
            success: true,
            message: data.message,
            data: responseData,
          });
        }
      } else {
        // Check if this is a "not verified" case
        setCacResult({
          success: false,
          notVerified: data.notVerified || false,
          error: data.error || data.message || 'Search failed',
          message: data.message || data.error || 'CAC registration number could not be verified',
        });
      }
      setShowCacModal(true);
    } catch (err) {
      console.error('CAC verification error:', err);
      setCacResult({
        success: false,
        notVerified: true,
        error: 'CAC registration number could not be verified',
        message: err instanceof Error ? err.message : 'Failed to verify CAC registration number. Please try again later.',
      });
      setShowCacModal(true);
    } finally {
      setCacVerifying(false);
    }
  };

  // Format classification name - remove underscores, convert to title case
  const formatClassification = (classification: string | null | undefined): string => {
    if (!classification) return 'N/A';
    
    // Replace underscores with spaces
    let formatted = classification.replace(/_/g, ' ');
    
    // Convert to title case (capitalize first letter of each word)
    formatted = formatted.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return formatted;
  };

  // Format location with proper structure
  const formatLocation = (wholesale: Wholesale): React.ReactNode => {
    const parts: string[] = [];
    
    if (wholesale.businessPhysicalAddress) {
      parts.push(wholesale.businessPhysicalAddress);
    }
    
    if (wholesale.city) {
      parts.push(wholesale.city);
    }
    
    if (wholesale.state) {
      parts.push(wholesale.state);
    }
    
    if (wholesale.country) {
      parts.push(wholesale.country);
    }
    
    if (parts.length === 0) {
      return <em className="text-muted">*Not Provided*</em>;
    }
    
    // Format with line breaks for better readability
    return (
      <div style={{ lineHeight: '1.6' }}>
        {wholesale.businessPhysicalAddress && (
          <div>{wholesale.businessPhysicalAddress}</div>
        )}
        <div>
          {[wholesale.city, wholesale.state, wholesale.country]
            .filter(Boolean)
            .join(', ')}
        </div>
      </div>
    );
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
                    <span className="detail-value">
                      {app.city && app.state ? `${app.city}, ${app.state}` : 
                       app.city ? app.city : 
                       app.state ? app.state : 
                       <em className="text-muted">*Not Provided*</em>}
                    </span>
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
            <Modal.Header closeButton className="wholesale-modal-header">
              <div className="wholesale-modal-header-content">
                <div className="wholesale-modal-header-main">
                  <Modal.Title className="wholesale-modal-title">
                    <FaBuilding className="me-2" />
                    {selectedWholesale.businessName}
                  </Modal.Title>
                  <div className="wholesale-modal-subtitle">
                    <Badge bg="secondary" className="me-2">{selectedWholesale.formType}</Badge>
                    <Badge bg={getStatusBadge(selectedWholesale.status)}>{selectedWholesale.status}</Badge>
                  </div>
                </div>
                {selectedWholesale.companyLogo && (
                  <div className="wholesale-modal-header-logo">
                    <img 
                      src={selectedWholesale.companyLogo} 
                      alt={`${selectedWholesale.businessName} logo`}
                      className="header-logo-img"
                    />
                  </div>
                )}
              </div>
            </Modal.Header>
            <Modal.Body className="wholesale-modal-body">
              <div className="wholesale-modal-sections">
                {/* Contact Information Section */}
                <div className="wholesale-modal-section">
                  <div className="section-header">
                    <FaUser className="section-icon" />
                    <h5 className="section-title">Contact Information</h5>
                  </div>
                  <div className="section-content">
                    <div className="info-item">
                      <div className="info-label">
                        <FaUser className="info-icon" />
                        <span>Name</span>
                      </div>
                      <div className="info-value">
                        {selectedWholesale.firstName} {selectedWholesale.lastName || <em className="text-muted">*Not Provided*</em>}
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">
                        <FaEnvelope className="info-icon" />
                        <span>Email</span>
                      </div>
                      <div className="info-value">
                        <a href={`mailto:${selectedWholesale.email}`}>{selectedWholesale.email}</a>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">
                        <FaPhone className="info-icon" />
                        <span>Phone</span>
                      </div>
                      <div className="info-value">
                        <div className="phone-value-group">
                          <span>{selectedWholesale.phone}</span>
                          {phoneNumber && (
                            <div className="phone-actions">
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
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Information Section */}
                <div className="wholesale-modal-section">
                  <div className="section-header">
                    <FaBuilding className="section-icon" />
                    <h5 className="section-title">Business Information</h5>
                  </div>
                  <div className="section-content">
                    <div className="info-item">
                      <div className="info-label">
                        <FaBuilding className="info-icon" />
                        <span>Business Name</span>
                      </div>
                      <div className="info-value">{selectedWholesale.businessName}</div>
                    </div>
                    {selectedWholesale.cacRegistrationNumber && (
                      <div className="info-item">
                        <div className="info-label">
                          <FaFileAlt className="info-icon" />
                          <span>CAC Registration</span>
                        </div>
                        <div className="info-value">
                          <div className="cac-registration-group">
                            <span>{selectedWholesale.cacRegistrationNumber}</span>
                            <Button
                              variant="outline-info"
                              size="sm"
                              className={`cac-verify-btn ${cacVerifying ? 'cac-verifying' : ''}`}
                              onClick={() => {
                                const cacNumber = selectedWholesale.cacRegistrationNumber;
                                console.log('Button clicked, CAC number:', cacNumber);
                                if (cacNumber) {
                                  verifyCAC(cacNumber);
                                } else {
                                  console.error('CAC number is missing');
                                  setCacResult({
                                    success: false,
                                    error: 'CAC registration number is missing',
                                  });
                                  setShowCacModal(true);
                                }
                              }}
                              disabled={cacVerifying || !selectedWholesale.cacRegistrationNumber}
                              title={cacVerifying ? 'Verifying CAC Registration...' : 'Verify CAC Registration'}
                            >
                              {cacVerifying ? (
                                <>
                                  <Spinner animation="border" size="sm" className="me-1" />
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <FaCheckCircle className="me-1" />
                                  Verify
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedWholesale.website && (
                      <div className="info-item">
                        <div className="info-label">
                          <FaGlobe className="info-icon" />
                          <span>Website</span>
                        </div>
                        <div className="info-value">
                          <a href={selectedWholesale.website} target="_blank" rel="noopener noreferrer">
                            {selectedWholesale.website}
                          </a>
                        </div>
                      </div>
                    )}
                    <div className="info-item">
                      <div className="info-label">
                        <FaMapMarkerAlt className="info-icon" />
                        <span>Location</span>
                      </div>
                      <div className="info-value">{formatLocation(selectedWholesale)}</div>
                    </div>
                  </div>
                </div>

                {/* Business Details Section */}
                {selectedWholesale.businessTypes && selectedWholesale.businessTypes.length > 0 && (
                  <div className="wholesale-modal-section">
                    <div className="section-header">
                      <FaTag className="section-icon" />
                      <h5 className="section-title">Business Types</h5>
                    </div>
                    <div className="section-content">
                      <div className="business-types">
                        {selectedWholesale.businessTypes.map((type, idx) => (
                          <Badge key={idx} bg="warning" text="dark" className="business-type-badge">{type}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* About Business Section */}
                <div className="wholesale-modal-section">
                  <div className="section-header">
                    <FaFileAlt className="section-icon" />
                    <h5 className="section-title">About Business</h5>
                  </div>
                  <div className="section-content">
                    <div className="business-info">{selectedWholesale.aboutBusiness}</div>
                  </div>
                </div>

                {/* Application Details Section */}
                <div className="wholesale-modal-section">
                  <div className="section-header">
                    <FaCalendarAlt className="section-icon" />
                    <h5 className="section-title">Application Details</h5>
                  </div>
                  <div className="section-content">
                    <div className="info-item">
                      <div className="info-label">
                        <FaClock className="info-icon" />
                        <span>Submitted</span>
                      </div>
                      <div className="info-value">
                        {new Date(selectedWholesale.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">
                        {selectedWholesale.status === 'approved' ? (
                          <FaCheckCircle className="info-icon text-success" />
                        ) : selectedWholesale.status === 'rejected' ? (
                          <FaTimesCircle className="info-icon text-danger" />
                        ) : (
                          <FaClock className="info-icon text-warning" />
                        )}
                        <span>Status</span>
                      </div>
                      <div className="info-value">
                        <Badge bg={getStatusBadge(selectedWholesale.status)} className="status-badge-large">
                          {selectedWholesale.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
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

      {/* CAC Verification Result Modal */}
      <Modal 
        show={showCacModal} 
        onHide={() => setShowCacModal(false)} 
        size="lg"
        className="cac-verification-modal"
      >
        <Modal.Header closeButton className="cac-modal-header">
          <Modal.Title>
            <FaFileAlt className="me-2" />
            CAC Verification Result
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cacResult ? (
            cacResult.success ? (
              <div>
                {cacResult.message && (
                  <Alert variant="success" className="mb-3">
                    <strong>✓ {cacResult.message}</strong>
                  </Alert>
                )}
                {cacResult.data ? (
                  <div>
                    {Array.isArray(cacResult.data) && cacResult.data.length > 0 ? (
                      <div className="cac-results-container">
                        {cacResult.data.map((company: any, index: number) => (
                          <div key={company.id || index} className="cac-company-card">
                            <div className="cac-company-header">
                              <h5 className="cac-company-name">{company.approvedName || 'N/A'}</h5>
                              <Badge 
                                bg={company.status === 'ACTIVE' ? 'success' : 'secondary'}
                                className="cac-status-badge"
                              >
                                {company.status || 'UNKNOWN'}
                              </Badge>
                            </div>
                            
                            <div className="cac-company-details">
                              <div className="cac-detail-row">
                                <span className="cac-detail-label">RC Number:</span>
                                <span className="cac-detail-value">{company.rcNumber || 'N/A'}</span>
                              </div>
                              
                              <div className="cac-detail-row">
                                <span className="cac-detail-label">Company ID:</span>
                                <span className="cac-detail-value">{company.companyId || company.id || 'N/A'}</span>
                              </div>
                              
                              <div className="cac-detail-row">
                                <span className="cac-detail-label">Nature of Business:</span>
                                <span className="cac-detail-value">{company.natureOfBusiness || 'N/A'}</span>
                              </div>
                              
                              <div className="cac-detail-row">
                                <span className="cac-detail-label">Classification:</span>
                                <span className="cac-detail-value">
                                  {formatClassification(company.classificationName)}
                                </span>
                              </div>
                              
                              {company.companyRegistrationDate && (
                                <div className="cac-detail-row">
                                  <span className="cac-detail-label">Registration Date:</span>
                                  <span className="cac-detail-value">
                                    {new Date(company.companyRegistrationDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="cac-results-container">
                        <div className="cac-company-card">
                          <div className="cac-company-details">
                            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', margin: 0 }}>
                              {JSON.stringify(cacResult.data, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Alert variant="info">No data returned from search.</Alert>
                )}
              </div>
            ) : (
              <div>
                {cacResult.notVerified ? (
                  <Alert variant="warning" className="cac-not-verified-alert">
                    <div className="d-flex align-items-center mb-2">
                      <FaTimesCircle className="me-2" style={{ fontSize: '1.5rem' }} />
                      <strong style={{ fontSize: '1.125rem' }}>Not Verified</strong>
                    </div>
                    <div className="mt-2">
                      <p className="mb-1"><strong>Status:</strong> CAC registration number could not be verified</p>
                      <p className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
                        {cacResult.message || cacResult.error || 'The provided CAC registration number was not found in the CAC registry or could not be verified at this time.'}
                      </p>
                    </div>
                  </Alert>
                ) : (
                  <Alert variant="danger">
                    <strong>✗ Verification Failed</strong>
                    <div className="mt-2">{cacResult.error || cacResult.message || 'Verification failed'}</div>
                  </Alert>
                )}
              </div>
            )
          ) : (
            <div>No results available</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCacModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </CMSLayout>
  );
};

