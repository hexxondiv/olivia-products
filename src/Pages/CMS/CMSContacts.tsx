import React, { useState, useEffect } from 'react';
import { CMSLayout } from './CMSLayout';
import { Table, Button, Badge, Form, Alert, Spinner, Modal, Tabs, Tab } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { FaEye, FaTrash, FaReply, FaEnvelope, FaWhatsapp } from 'react-icons/fa';
import { getApiUrl } from '../../Utils/apiConfig';
import './cms-modals.scss';
import './cms-contacts.scss';

interface Contact {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  createdAt: string;
  replies?: ContactReply[];
}

interface ContactReply {
  id: number;
  contactId: number;
  replyType: 'email' | 'whatsapp';
  message: string;
  sentTo: string;
  sentBy: string;
  sentAt: string;
  status: 'sent' | 'failed' | 'pending';
  errorMessage?: string;
}

export const CMSContacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyType, setReplyType] = useState<'email' | 'whatsapp'>('email');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState('');
  const statusFilter = searchParams.get('status') || '';

  useEffect(() => {
    fetchContacts();
  }, [statusFilter]);

  const fetchContacts = async () => {
    try {
      const apiUrl = getApiUrl();
      const url = statusFilter
        ? `${apiUrl}/contacts.php?status=${statusFilter}`
        : `${apiUrl}/contacts.php`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setContacts(data.data || []);
      } else {
        setError('Failed to load contacts');
      }
    } catch (err) {
      setError('Failed to load contacts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactDetails = async (id: number) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/contacts.php?id=${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cms_token')}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setSelectedContact(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch contact details:', err);
    }
  };

  const handleOpenReplyModal = () => {
    setShowReplyModal(true);
    setReplyMessage('');
    setReplyError('');
    setReplyType(selectedContact?.email ? 'email' : 'whatsapp');
  };

  const handleSendReply = async () => {
    if (!selectedContact || !replyMessage.trim()) {
      setReplyError('Please enter a reply message');
      return;
    }

    if (replyType === 'email' && !selectedContact.email) {
      setReplyError('Contact does not have an email address');
      return;
    }

    setSendingReply(true);
    setReplyError('');

    try {
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/contacts.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          contactId: selectedContact.id,
          replyType: replyType,
          message: replyMessage.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (replyType === 'whatsapp' && data.whatsappUrl) {
          // Open WhatsApp in new window
          window.open(data.whatsappUrl, '_blank');
        }
        
        // Refresh contact details to get updated replies
        await fetchContactDetails(selectedContact.id);
        
        // Refresh contacts list
        await fetchContacts();
        
        // Close modal
        setShowReplyModal(false);
        setReplyMessage('');
      } else {
        setReplyError(data.message || 'Failed to send reply');
      }
    } catch (err) {
      setReplyError('Failed to send reply');
      console.error(err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/contacts.php?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchContacts();
      } else {
        alert('Failed to update contact status');
      }
    } catch (err) {
      alert('Failed to update contact status');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/contacts.php?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchContacts();
      } else {
        alert('Failed to delete contact');
      }
    } catch (err) {
      alert('Failed to delete contact');
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      new: 'primary',
      read: 'info',
      replied: 'success',
      archived: 'secondary',
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

  return (
    <CMSLayout>
      <div className="cms-contacts-page">
        <div className="cms-contacts-header">
          <div className="header-row">
            <h1>Contact Submissions</h1>
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
              variant={statusFilter === 'read' ? 'info' : 'outline-info'}
              onClick={() => setSearchParams({ status: 'read' })}
            >
              Read
            </Button>
            <Button
              variant={statusFilter === 'replied' ? 'success' : 'outline-success'}
              onClick={() => setSearchParams({ status: 'replied' })}
            >
              Replied
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>{contact.id}</td>
                    <td>{contact.fullName}</td>
                    <td>{contact.email || '-'}</td>
                    <td>{contact.phone}</td>
                    <td>
                      {contact.message.length > 50
                        ? `${contact.message.substring(0, 50)}...`
                        : contact.message}
                    </td>
                    <td>
                      <Badge bg={getStatusBadge(contact.status)}>
                        {contact.status}
                      </Badge>
                    </td>
                    <td>{new Date(contact.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <Form.Select
                          size="sm"
                          value={contact.status}
                          onChange={(e) => handleStatusChange(contact.id, e.target.value)}
                          style={{ minWidth: '120px' }}
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                          <option value="archived">Archived</option>
                        </Form.Select>
                  <Button
                    variant="outline-info"
                    size="sm"
                    onClick={() => {
                      setSelectedContact(contact);
                      fetchContactDetails(contact.id);
                    }}
                    title="View Details"
                  >
                    <FaEye />
                  </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(contact.id)}
                          title="Delete"
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
            {contacts.map((contact) => (
              <div key={contact.id} className="mobile-contact-card">
                <div className="contact-header">
                  <div className="contact-id">#{contact.id}</div>
                  <div className="contact-status">
                    <Badge bg={getStatusBadge(contact.status)}>
                      {contact.status}
                    </Badge>
                  </div>
                </div>
                <div className="contact-details">
                  <div className="detail-row">
                    <span className="detail-label">Name</span>
                    <span className="detail-value">{contact.fullName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{contact.email || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{contact.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Message</span>
                    <span className="detail-value message-preview">
                      {contact.message}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="contact-actions">
                  <Form.Select
                    size="sm"
                    value={contact.status}
                    onChange={(e) => handleStatusChange(contact.id, e.target.value)}
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </Form.Select>
                  <div className="action-buttons">
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => {
                        setSelectedContact(contact);
                        fetchContactDetails(contact.id);
                      }}
                    >
                      <FaEye /> View
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(contact.id)}
                    >
                      <FaTrash /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {contacts.length === 0 && (
          <div className="cms-empty-state">
            <p>No contacts found</p>
          </div>
        )}
      </div>

      {selectedContact && (
        <Modal show={!!selectedContact} onHide={() => setSelectedContact(null)} className="cms-modal-contact-details" size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Contact Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Tabs defaultActiveKey="details" className="mb-3">
              <Tab eventKey="details" title="Details">
                <div className="mt-3">
                  <p><strong>Name:</strong> {selectedContact.fullName}</p>
                  <p><strong>Email:</strong> {selectedContact.email || '-'}</p>
                  <p><strong>Phone:</strong> {selectedContact.phone}</p>
                  <p><strong>Status:</strong> <Badge bg={getStatusBadge(selectedContact.status)}>{selectedContact.status}</Badge></p>
                  <p><strong>Date:</strong> {new Date(selectedContact.createdAt).toLocaleString()}</p>
                  <div className="mt-3">
                    <strong>Message:</strong>
                    <div className="contact-message">{selectedContact.message}</div>
                  </div>
                </div>
              </Tab>
              <Tab eventKey="replies" title={`Replies (${selectedContact.replies?.length || 0})`}>
                <div className="mt-3">
                  {selectedContact.replies && selectedContact.replies.length > 0 ? (
                    <div className="reply-history">
                      {selectedContact.replies.map((reply) => (
                        <div key={reply.id} className="reply-item mb-3 p-3 border rounded">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <Badge bg={reply.replyType === 'email' ? 'primary' : 'success'} className="me-2">
                                {reply.replyType === 'email' ? <FaEnvelope /> : <FaWhatsapp />} {reply.replyType.toUpperCase()}
                              </Badge>
                              <Badge bg={reply.status === 'sent' ? 'success' : reply.status === 'failed' ? 'danger' : 'warning'}>
                                {reply.status}
                              </Badge>
                            </div>
                            <small className="text-muted">
                              {new Date(reply.sentAt).toLocaleString()}
                            </small>
                          </div>
                          <div className="mb-2">
                            <strong>Sent to:</strong> {reply.sentTo}
                          </div>
                          <div className="mb-2">
                            <strong>Sent by:</strong> {reply.sentBy}
                          </div>
                          <div className="reply-message p-2 bg-light rounded">
                            {reply.message}
                          </div>
                          {reply.errorMessage && (
                            <Alert variant="danger" className="mt-2 mb-0">
                              <small>Error: {reply.errorMessage}</small>
                            </Alert>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No replies sent yet.</p>
                  )}
                </div>
              </Tab>
            </Tabs>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="success" 
              onClick={handleOpenReplyModal}
            >
              <FaReply /> Reply
            </Button>
            <Button variant="secondary" onClick={() => setSelectedContact(null)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Reply Modal */}
      <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)} className="cms-modal-reply">
        <Modal.Header closeButton>
          <Modal.Title>Send Reply</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {replyError && <Alert variant="danger">{replyError}</Alert>}
          
          <Form.Group className="mb-3">
            <Form.Label>Reply Method</Form.Label>
            <div className="d-flex gap-2">
              <Button
                variant={replyType === 'email' ? 'primary' : 'outline-primary'}
                onClick={() => setReplyType('email')}
                disabled={!selectedContact?.email}
                style={{ flex: 1 }}
              >
                <FaEnvelope /> Email
              </Button>
              <Button
                variant={replyType === 'whatsapp' ? 'success' : 'outline-success'}
                onClick={() => setReplyType('whatsapp')}
                style={{ flex: 1 }}
              >
                <FaWhatsapp /> WhatsApp
              </Button>
            </div>
            {replyType === 'email' && !selectedContact?.email && (
              <Form.Text className="text-danger">
                Contact does not have an email address
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Reply Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Enter your reply message..."
            />
          </Form.Group>

          {selectedContact && (
            <Alert variant="info">
              <strong>Replying to:</strong> {selectedContact.fullName}<br />
              {replyType === 'email' && selectedContact.email && (
                <><strong>Email:</strong> {selectedContact.email}</>
              )}
              {replyType === 'whatsapp' && (
                <><strong>Phone:</strong> {selectedContact.phone}</>
              )}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReplyModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSendReply}
            disabled={sendingReply || !replyMessage.trim() || (replyType === 'email' && !selectedContact?.email)}
          >
            {sendingReply ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Sending...
              </>
            ) : (
              <>
                {replyType === 'email' ? <FaEnvelope /> : <FaWhatsapp />} Send Reply
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </CMSLayout>
  );
};

