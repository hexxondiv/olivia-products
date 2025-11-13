import React, { useState, useEffect } from 'react';
import { CMSLayout } from './CMSLayout';
import { Table, Button, Badge, Modal, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { getApiUrl } from '../../Utils/apiConfig';
import './cms-modals.scss';
import './cms-products.scss';

interface Testimonial {
  id?: number;
  name: string;
  comment: string;
  rating: number;
  backgroundColor: string;
  displayOrder: number;
  isActive: boolean;
}

export const CMSTestimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState<Partial<Testimonial>>({
    name: '',
    comment: '',
    rating: 5,
    backgroundColor: '#f5f7fa',
    displayOrder: 0,
    isActive: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/testimonials.php`);
      const data = await response.json();
      
      if (data.success) {
        setTestimonials(data.data || []);
      } else {
        setError('Failed to load testimonials');
      }
    } catch (err) {
      setError('Failed to load testimonials');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setTestimonialToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async (hardDelete: boolean = false) => {
    if (!testimonialToDelete) return;

    setDeleting(true);
    setError('');

    try {
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();
      const url = hardDelete 
        ? `${apiUrl}/testimonials.php?id=${testimonialToDelete}&hard=true`
        : `${apiUrl}/testimonials.php?id=${testimonialToDelete}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setShowDeleteModal(false);
        setTestimonialToDelete(null);
        fetchTestimonials();
        setError('');
      } else {
        setError(data.message || 'Failed to delete testimonial');
      }
    } catch (err) {
      setError('Failed to delete testimonial');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleting) {
      setShowDeleteModal(false);
      setTestimonialToDelete(null);
    }
  };

  const handleOpenModal = (testimonial?: Testimonial) => {
    if (testimonial) {
      setSelectedTestimonial(testimonial);
      setFormData({
        name: testimonial.name || '',
        comment: testimonial.comment || '',
        rating: testimonial.rating || 5,
        backgroundColor: testimonial.backgroundColor || '#f5f7fa',
        displayOrder: testimonial.displayOrder || 0,
        isActive: testimonial.isActive !== undefined ? testimonial.isActive : true
      });
    } else {
      setSelectedTestimonial(null);
      setFormData({
        name: '',
        comment: '',
        rating: 5,
        backgroundColor: '#f5f7fa',
        displayOrder: 0,
        isActive: true
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTestimonial(null);
    setFormData({
      name: '',
      comment: '',
      rating: 5,
      backgroundColor: '#f5f7fa',
      displayOrder: 0,
      isActive: true
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.comment?.trim()) {
      errors.comment = 'Comment is required';
    }
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      errors.rating = 'Rating must be between 1 and 5';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof Testimonial, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();
      
      const payload = {
        ...formData,
        rating: parseInt(formData.rating as any) || 5,
        displayOrder: parseInt(formData.displayOrder as any) || 0,
      };
      
      const url = selectedTestimonial 
        ? `${apiUrl}/testimonials.php?id=${selectedTestimonial.id}`
        : `${apiUrl}/testimonials.php`;
      
      const method = selectedTestimonial ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        handleCloseModal();
        fetchTestimonials();
      } else {
        setError(data.message || `Failed to ${selectedTestimonial ? 'update' : 'create'} testimonial`);
      }
    } catch (err) {
      setError(`Failed to ${selectedTestimonial ? 'update' : 'create'} testimonial`);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTestimonials = testimonials.filter(testimonial =>
    testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="cms-products-page">
        <div className="products-header">
          <h1>Testimonials Management</h1>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <FaPlus className="me-2" />
            Add Testimonial
          </Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <InputGroup className="search-input-group">
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search testimonials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <div className="cms-table">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Comment</th>
                <th>Rating</th>
                <th>Background</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTestimonials.map((testimonial) => (
                <tr key={testimonial.id}>
                  <td>{testimonial.id}</td>
                  <td>{testimonial.name}</td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {testimonial.comment}
                  </td>
                  <td>{'⭐'.repeat(testimonial.rating)}</td>
                  <td>
                    <div style={{ 
                      width: '30px', 
                      height: '30px', 
                      backgroundColor: testimonial.backgroundColor,
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }} />
                  </td>
                  <td>{testimonial.displayOrder}</td>
                  <td>
                    <Badge bg={testimonial.isActive ? 'success' : 'secondary'}>
                      {testimonial.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleOpenModal(testimonial)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => testimonial.id && handleDeleteClick(testimonial.id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {filteredTestimonials.length === 0 && (
          <div className="empty-state">
            <p>No testimonials found</p>
          </div>
        )}
      </div>

      <Modal show={showModal} onHide={handleCloseModal} size="lg" className="cms-modal-product-form">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {selectedTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                <Alert.Heading>Error</Alert.Heading>
                {error}
              </Alert>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                isInvalid={!!formErrors.name}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Comment *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={formData.comment || ''}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                isInvalid={!!formErrors.comment}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.comment}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rating * (1-5)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="5"
                value={formData.rating || 5}
                onChange={(e) => handleInputChange('rating', parseInt(e.target.value) || 5)}
                isInvalid={!!formErrors.rating}
                required
              />
              <Form.Text className="text-muted">
                Current: {'⭐'.repeat(formData.rating || 5)}
              </Form.Text>
              <Form.Control.Feedback type="invalid">
                {formErrors.rating}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Background Color</Form.Label>
              <div className="d-flex gap-2 align-items-center">
                <Form.Control
                  type="color"
                  value={formData.backgroundColor || '#f5f7fa'}
                  onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                  style={{ width: '80px' }}
                />
                <Form.Control
                  type="text"
                  value={formData.backgroundColor || '#f5f7fa'}
                  onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                  placeholder="#f5f7fa"
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Display Order</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={formData.displayOrder || 0}
                onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0)}
              />
              <Form.Text className="text-muted">
                Lower numbers appear first. Use 0 for default ordering.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="isActive"
                label="Active"
                checked={formData.isActive !== undefined ? formData.isActive : true}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
              />
              <Form.Text className="text-muted">
                Inactive testimonials won't be displayed on the website
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <div className="btn-group">
              <Button variant="secondary" onClick={handleCloseModal} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    {selectedTestimonial ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  selectedTestimonial ? 'Update Testimonial' : 'Create Testimonial'
                )}
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered className="cms-modal-delete">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaTrash className="text-danger" />
            Delete Testimonial
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <p className="mb-3 text-muted">Choose a deletion method:</p>
          <div className="delete-options">
            <button
              type="button"
              className="delete-option delete-option-soft"
              onClick={() => handleDelete(false)}
              disabled={deleting}
            >
              <div className="delete-option-header">
                <span className="delete-option-title">Deactivate</span>
                <Badge bg="warning" className="ms-2">Reversible</Badge>
              </div>
              <p className="delete-option-desc">Hide from website, keep in database</p>
            </button>
            <button
              type="button"
              className="delete-option delete-option-hard"
              onClick={() => handleDelete(true)}
              disabled={deleting}
            >
              <div className="delete-option-header">
                <span className="delete-option-title">Force Delete</span>
                <Badge bg="danger" className="ms-2">Permanent</Badge>
              </div>
              <p className="delete-option-desc">Permanently remove from database</p>
            </button>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={handleCloseDeleteModal} disabled={deleting}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </CMSLayout>
  );
};

