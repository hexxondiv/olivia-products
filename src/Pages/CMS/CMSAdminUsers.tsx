import React, { useState, useEffect } from 'react';
import { CMSLayout } from './CMSLayout';
import { Table, Button, Badge, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import { useCMSAuth } from '../../Contexts/CMSAuthContext';
import { FaPlus, FaEdit, FaTrash, FaUser, FaLock } from 'react-icons/fa';
import { getApiUrl } from '../../Utils/apiConfig';
import './cms-admin-users.scss';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'sales' | 'support';
  roleId?: number;
  roleName?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export const CMSAdminUsers: React.FC = () => {
  const { user: currentUser } = useCMSAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: 'support' as 'admin' | 'sales' | 'support',
    isActive: true,
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    } else {
      setError('Access denied. Admin role required.');
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('cms_token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/admin-users.php`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUsers(data.users || []);
      } else {
        setError(data.message || 'Failed to load users');
      }
    } catch (err: any) {
      setError(`Failed to load users: ${err.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: AdminUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        fullName: user.fullName || '',
        password: '',
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        fullName: '',
        password: '',
        role: 'support',
        isActive: true,
      });
    }
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const token = localStorage.getItem('cms_token');
      if (!token) {
        setFormError('Not authenticated');
        return;
      }

      const apiUrl = getApiUrl();
      const isEdit = !!editingUser;
      const url = isEdit
        ? `${apiUrl}/admin-users.php?id=${editingUser.id}`
        : `${apiUrl}/admin-users.php`;

      // Prepare data - don't send password if editing and password is empty
      const submitData: any = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        role: formData.role,
        isActive: formData.isActive,
      };

      if (isEdit) {
        // For edit, only include password if provided
        if (formData.password) {
          submitData.password = formData.password;
        }
      } else {
        // For create, password is required
        if (!formData.password || formData.password.length < 6) {
          setFormError('Password is required and must be at least 6 characters');
          setSubmitting(false);
          return;
        }
        submitData.password = formData.password;
      }

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(isEdit ? 'User updated successfully' : 'User created successfully');
        handleCloseModal();
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setFormError(data.message || `Failed to ${isEdit ? 'update' : 'create'} user`);
      }
    } catch (err: any) {
      setFormError(`Failed to ${editingUser ? 'update' : 'create'} user: ${err.message || 'Network error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (user: AdminUser) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('cms_token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/admin-users.php?id=${deletingUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('User deleted successfully');
        setShowDeleteModal(false);
        setDeletingUser(null);
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to delete user');
      }
    } catch (err: any) {
      setError(`Failed to delete user: ${err.message || 'Network error'}`);
    } finally {
      setDeleting(false);
    }
  };

  if (!isAdmin) {
    return (
      <CMSLayout>
        <div className="cms-admin-users">
          <Alert variant="danger">Access denied. Admin role required to manage users.</Alert>
        </div>
      </CMSLayout>
    );
  }

  if (loading) {
    return (
      <CMSLayout>
        <div className="cms-admin-users">
          <div className="spinner-container">
            <Spinner animation="border" variant="primary" />
          </div>
        </div>
      </CMSLayout>
    );
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'sales':
        return 'warning';
      case 'support':
        return 'info';
      default:
        return 'secondary';
    }
  };

  return (
    <CMSLayout>
      <div className="cms-admin-users">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Admin Users</h1>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <FaPlus className="me-2" />
            Add User
          </Button>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.fullName || '-'}</td>
                  <td>
                    <Badge bg={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={user.isActive ? 'success' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : 'Never'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleOpenModal(user)}
                        className="me-2"
                      >
                        <FaEdit />
                      </Button>
                      {user.id !== 1 && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteClick(user)}
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {/* Create/Edit Modal */}
        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {editingUser ? (
                <>
                  <FaEdit className="me-2" />
                  Edit User
                </>
              ) : (
                <>
                  <FaPlus className="me-2" />
                  Add New User
                </>
              )}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              {formError && (
                <Alert variant="danger" dismissible onClose={() => setFormError('')}>
                  {formError}
                </Alert>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Username *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={submitting}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={submitting}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={submitting}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  Password {editingUser ? '(leave blank to keep current)' : '*'}
                </Form.Label>
                <Form.Control
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  minLength={6}
                  disabled={submitting}
                />
                <Form.Text className="text-muted">
                  Password must be at least 6 characters long
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Role *</Form.Label>
                <Form.Select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as 'admin' | 'sales' | 'support',
                    })
                  }
                  required
                  disabled={submitting}
                >
                  <option value="admin">Admin</option>
                  <option value="sales">Sales</option>
                  <option value="support">Support</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Active"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  disabled={submitting}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    {editingUser ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingUser ? 'Update' : 'Create'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete user <strong>{deletingUser?.username}</strong>?
            This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </CMSLayout>
  );
};

