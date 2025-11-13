import React, { useState, useEffect } from 'react';
import { CMSLayout } from './CMSLayout';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useCMSAuth } from '../../Contexts/CMSAuthContext';
import { FaUser, FaLock, FaSave } from 'react-icons/fa';
import { getApiUrl } from '../../Utils/apiConfig';
import './cms-profile.scss';

export const CMSProfile: React.FC = () => {
  const { user, updateUser } = useCMSAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Name form state
  const [fullName, setFullName] = useState('');
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
    }
  }, [user]);

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!fullName.trim()) {
      setError('Name cannot be empty');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('cms_token');
      if (!token) {
        setError('Not authenticated');
        return;
      }
      
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/auth.php?action=profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName: fullName.trim() }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess('Name updated successfully');
        if (updateUser && data.user) {
          // Preserve the existing token when updating user data
          updateUser({ ...data.user, token: user?.token || '' });
        }
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update name');
      }
    } catch (err: any) {
      setError(`Failed to update name: ${err.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('cms_token');
      if (!token) {
        setError('Not authenticated');
        return;
      }
      
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/auth.php?action=profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess('Password updated successfully');
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update password');
      }
    } catch (err: any) {
      setError(`Failed to update password: ${err.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <CMSLayout>
        <div className="cms-profile">
          <Alert variant="warning">Please log in to view your profile.</Alert>
        </div>
      </CMSLayout>
    );
  }

  return (
    <CMSLayout>
      <div className="cms-profile">
        <h1>Profile Management</h1>
        
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
        
        <div className="cms-profile-cards">
          {/* Name Update Card */}
          <Card className="cms-profile-card">
            <Card.Header>
              <FaUser className="me-2" />
              Update Name
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleNameUpdate}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={user.username}
                    disabled
                    readOnly
                  />
                  <Form.Text className="text-muted">
                    Username cannot be changed
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={user.email}
                    disabled
                    readOnly
                  />
                  <Form.Text className="text-muted">
                    Email cannot be changed
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </Form.Group>
                
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || !fullName.trim()}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaSave className="me-2" />
                      Update Name
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
          
          {/* Password Update Card */}
          <Card className="cms-profile-card">
            <Card.Header>
              <FaLock className="me-2" />
              Change Password
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handlePasswordUpdate}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    required
                    minLength={6}
                  />
                  <Form.Text className="text-muted">
                    Password must be at least 6 characters long
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                </Form.Group>
                
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaSave className="me-2" />
                      Update Password
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </CMSLayout>
  );
};

