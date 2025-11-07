import React, { useState, useEffect } from 'react';
import { CMSLayout } from './CMSLayout';
import { Table, Button, Badge, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { FaEye, FaTrash } from 'react-icons/fa';
import { getApiUrl } from '../../Utils/apiConfig';
import './cms-modals.scss';

interface Contact {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  createdAt: string;
}

export const CMSContacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
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
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      </CMSLayout>
    );
  }

  return (
    <CMSLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Contact Submissions</h1>
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
        <Table striped bordered hover>
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
                  <Form.Select
                    size="sm"
                    value={contact.status}
                    onChange={(e) => handleStatusChange(contact.id, e.target.value)}
                    style={{ width: 'auto', display: 'inline-block' }}
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </Form.Select>
                  <Button
                    variant="outline-info"
                    size="sm"
                    className="ms-2"
                    onClick={() => setSelectedContact(contact)}
                  >
                    <FaEye />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="ms-2"
                    onClick={() => handleDelete(contact.id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {contacts.length === 0 && (
        <div className="text-center py-5">
          <p>No contacts found</p>
        </div>
      )}

      {selectedContact && (
        <Modal show={!!selectedContact} onHide={() => setSelectedContact(null)} className="cms-modal-contact-details">
          <Modal.Header closeButton>
            <Modal.Title>Contact Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><strong>Name:</strong> {selectedContact.fullName}</p>
            <p><strong>Email:</strong> {selectedContact.email || '-'}</p>
            <p><strong>Phone:</strong> {selectedContact.phone}</p>
            <p><strong>Status:</strong> <Badge bg={getStatusBadge(selectedContact.status)}>{selectedContact.status}</Badge></p>
            <p><strong>Date:</strong> {new Date(selectedContact.createdAt).toLocaleString()}</p>
            <div className="mt-3">
              <strong>Message:</strong>
              <div className="contact-message">{selectedContact.message}</div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setSelectedContact(null)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </CMSLayout>
  );
};

