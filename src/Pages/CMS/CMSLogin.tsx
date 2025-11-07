import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useCMSAuth } from '../../Contexts/CMSAuthContext';
import { FaLock, FaUser } from 'react-icons/fa';
import './cms-login.scss';

export const CMSLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useCMSAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/cms');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/cms');
      } else {
        setError('Invalid username or password. Please check your credentials and ensure the API is accessible.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(`Login failed: ${err.message || 'Please check your connection and try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="cms-login-container">
        <Container>
          <div className="text-center">Loading...</div>
        </Container>
      </div>
    );
  }

  return (
    <div className="cms-login-container">
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <Card className="cms-login-card">
          <Card.Body>
            <div className="text-center mb-4">
              <h2>Olivia Products CMS</h2>
              <p className="text-muted">Sign in to access the admin panel</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaUser className="me-2" />
                  Username
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <FaLock className="me-2" />
                  Password
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Form>

            <div className="text-center mt-3">
              <small className="text-muted">
                Default: admin / admin123 (Change this!)
              </small>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

