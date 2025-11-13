import React, { useState, useEffect } from 'react';
import { CMSLayout } from './CMSLayout';
import { Table, Button, Badge, Modal, Form, Alert, Spinner, InputGroup, Tabs, Tab } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaImage, FaVideo, FaFileImage, FaFileAlt } from 'react-icons/fa';
import { getApiUrl } from '../../Utils/apiConfig';
import './cms-modals.scss';
import './cms-products.scss';

interface FlashInfo {
  id?: number;
  title: string;
  contentType: 'image' | 'video' | 'gif' | 'text';
  contentUrl?: string | null;
  contentText?: string | null;
  displayOrder: number;
  isActive: boolean;
  delayMs?: number;
  storageExpiryMinutes?: number;
  storageExpiryHours?: number; // Legacy field for backward compatibility
}

export const CMSFlashInfo: React.FC = () => {
  const [flashInfoItems, setFlashInfoItems] = useState<FlashInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedFlashInfo, setSelectedFlashInfo] = useState<FlashInfo | null>(null);
  const [formData, setFormData] = useState<Partial<FlashInfo>>({
    title: '',
    contentType: 'text',
    contentUrl: null,
    contentText: null,
    displayOrder: 0,
    isActive: true,
    delayMs: 3000,
    storageExpiryMinutes: 1440
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [flashInfoToDelete, setFlashInfoToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchFlashInfo();
  }, []);

  const fetchFlashInfo = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/flash-info.php`);
      const data = await response.json();
      
      if (data.success) {
        setFlashInfoItems(data.data || []);
      } else {
        setError('Failed to load flash info');
      }
    } catch (err) {
      setError('Failed to load flash info');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setFlashInfoToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async (hardDelete: boolean = false) => {
    if (!flashInfoToDelete) return;

    setDeleting(true);
    setError('');

    try {
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();
      const url = hardDelete 
        ? `${apiUrl}/flash-info.php?id=${flashInfoToDelete}&hard=true`
        : `${apiUrl}/flash-info.php?id=${flashInfoToDelete}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setShowDeleteModal(false);
        setFlashInfoToDelete(null);
        fetchFlashInfo();
        setError('');
      } else {
        setError(data.message || 'Failed to delete flash info');
      }
    } catch (err) {
      setError('Failed to delete flash info');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleting) {
      setShowDeleteModal(false);
      setFlashInfoToDelete(null);
    }
  };

  const handleOpenModal = (flashInfo?: FlashInfo) => {
    if (flashInfo) {
      setSelectedFlashInfo(flashInfo);
      setFormData({
        title: flashInfo.title || '',
        contentType: flashInfo.contentType || 'text',
        contentUrl: flashInfo.contentUrl || null,
        contentText: flashInfo.contentText || null,
        displayOrder: flashInfo.displayOrder || 0,
        isActive: flashInfo.isActive !== undefined ? flashInfo.isActive : true,
        delayMs: flashInfo.delayMs !== undefined ? flashInfo.delayMs : 3000,
        storageExpiryMinutes: flashInfo.storageExpiryMinutes !== undefined ? flashInfo.storageExpiryMinutes : (flashInfo.storageExpiryHours !== undefined ? flashInfo.storageExpiryHours * 60 : 1440)
      });
    } else {
      setSelectedFlashInfo(null);
      setFormData({
        title: '',
        contentType: 'text',
        contentUrl: null,
        contentText: null,
        displayOrder: 0,
        isActive: true,
        delayMs: 3000,
        storageExpiryMinutes: 1440
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFlashInfo(null);
    setFormData({
      title: '',
      contentType: 'text',
      contentUrl: null,
      contentText: null,
      displayOrder: 0,
      isActive: true
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.contentType) {
      errors.contentType = 'Content type is required';
    }
    
    if (formData.contentType === 'text') {
      if (!formData.contentText?.trim()) {
        errors.contentText = 'Content text is required for text type';
      }
    } else {
      if (!formData.contentUrl?.trim()) {
        errors.contentUrl = 'Content URL is required for ' + formData.contentType;
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof FlashInfo, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear related fields when content type changes
    if (field === 'contentType') {
      if (value === 'text') {
        setFormData(prev => ({ ...prev, contentUrl: null }));
      } else {
        setFormData(prev => ({ ...prev, contentText: null }));
      }
    }
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    // Check file size before upload (2MB limit based on PHP default)
    const maxSizeBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSizeBytes) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(0);
      setError(`File too large. File size: ${fileSizeMB}MB, Maximum allowed: ${maxSizeMB}MB. Please compress the image or use a smaller file.`);
      return;
    }
    
    try {
      setUploadingImage(true);
      setError('');
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();
      
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      
      const response = await fetch(`${apiUrl}/upload-image.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadFormData
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        handleInputChange('contentUrl', data.path);
        setError('');
      } else {
        const errorMsg = data.message || `Failed to upload image${response.status ? ` (Status: ${response.status})` : ''}`;
        setError(errorMsg);
        setTimeout(() => {
          setError(prev => prev === errorMsg ? '' : prev);
        }, 5000);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMsg);
      setTimeout(() => {
        setError(prev => prev === errorMsg ? '' : prev);
      }, 5000);
    } finally {
      setUploadingImage(false);
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
      
      const payload: any = {
        title: formData.title,
        contentType: formData.contentType,
        displayOrder: parseInt(formData.displayOrder as any) || 0,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        delayMs: parseInt(formData.delayMs as any) || 3000,
        storageExpiryMinutes: parseInt(formData.storageExpiryMinutes as any) || 1440
      };
      
      // Only include contentUrl or contentText based on contentType
      if (formData.contentType === 'text') {
        payload.contentText = formData.contentText;
        payload.contentUrl = null;
      } else {
        payload.contentUrl = formData.contentUrl;
        payload.contentText = null;
      }
      
      const url = selectedFlashInfo 
        ? `${apiUrl}/flash-info.php?id=${selectedFlashInfo.id}`
        : `${apiUrl}/flash-info.php`;
      
      const method = selectedFlashInfo ? 'PUT' : 'POST';
      
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
        fetchFlashInfo();
      } else {
        setError(data.message || `Failed to ${selectedFlashInfo ? 'update' : 'create'} flash info`);
      }
    } catch (err) {
      setError(`Failed to ${selectedFlashInfo ? 'update' : 'create'} flash info`);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <FaImage className="me-1" />;
      case 'video':
        return <FaVideo className="me-1" />;
      case 'gif':
        return <FaFileImage className="me-1" />;
      case 'text':
        return <FaFileAlt className="me-1" />;
      default:
        return null;
    }
  };

  const filteredFlashInfo = flashInfoItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.contentType.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1>Flash Info Management</h1>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <FaPlus className="me-2" />
            Add Flash Info
          </Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <InputGroup className="search-input-group">
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search flash info..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <div className="cms-table">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Content Preview</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFlashInfo.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.title}</td>
                  <td>
                    <Badge bg="info">
                      {getContentTypeIcon(item.contentType)}
                      {item.contentType}
                    </Badge>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    {item.contentType === 'text' ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: (item.contentText || '').substring(0, 100) + '...' }}
                        style={{ maxHeight: '50px', overflow: 'hidden' }}
                      />
                    ) : item.contentUrl ? (
                      item.contentType === 'video' ? (
                        <span className="text-muted">Video URL: {item.contentUrl.substring(0, 50)}...</span>
                      ) : (
                        <img 
                          src={item.contentUrl} 
                          alt={item.title}
                          style={{ maxWidth: '100px', maxHeight: '50px', objectFit: 'contain' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )
                    ) : (
                      <span className="text-muted">No content</span>
                    )}
                  </td>
                  <td>{item.displayOrder}</td>
                  <td>
                    <Badge bg={item.isActive ? 'success' : 'secondary'}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleOpenModal(item)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => item.id && handleDeleteClick(item.id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {filteredFlashInfo.length === 0 && (
          <div className="empty-state">
            <p>No flash info items found</p>
          </div>
        )}
      </div>

      <Modal show={showModal} onHide={handleCloseModal} size="lg" className="cms-modal-product-form">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {selectedFlashInfo ? 'Edit Flash Info' : 'Add New Flash Info'}
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
              <Form.Label>Title *</Form.Label>
              <Form.Control
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                isInvalid={!!formErrors.title}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.title}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Content Type *</Form.Label>
              <Form.Select
                value={formData.contentType || 'text'}
                onChange={(e) => handleInputChange('contentType', e.target.value)}
                isInvalid={!!formErrors.contentType}
                required
              >
                <option value="text">Text (HTML)</option>
                <option value="image">Image</option>
                <option value="gif">GIF</option>
                <option value="video">Video</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formErrors.contentType}
              </Form.Control.Feedback>
            </Form.Group>

            {formData.contentType === 'text' ? (
              <Form.Group className="mb-3">
                <Form.Label>Content Text (HTML) *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={8}
                  value={formData.contentText || ''}
                  onChange={(e) => handleInputChange('contentText', e.target.value)}
                  isInvalid={!!formErrors.contentText}
                  required
                  placeholder="Enter HTML formatted text..."
                />
                <Form.Text className="text-muted">
                  You can use HTML tags for formatting (e.g., &lt;strong&gt;, &lt;em&gt;, &lt;p&gt;, &lt;br&gt;, etc.)
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  {formErrors.contentText}
                </Form.Control.Feedback>
              </Form.Group>
            ) : (
              <Form.Group className="mb-3">
                <Form.Label>
                  {formData.contentType === 'video' ? 'Video URL' : formData.contentType === 'gif' ? 'GIF URL or Upload' : 'Image URL or Upload'} *
                </Form.Label>
                <div className="d-flex gap-2 mb-2">
                  <Form.Control
                    type="text"
                    value={formData.contentUrl || ''}
                    onChange={(e) => handleInputChange('contentUrl', e.target.value)}
                    isInvalid={!!formErrors.contentUrl}
                    placeholder={`Enter ${formData.contentType} URL or upload file...`}
                    required
                  />
                  {(formData.contentType === 'image' || formData.contentType === 'gif') && (
                    <Form.Control
                      type="file"
                      accept={formData.contentType === 'gif' ? 'image/gif' : 'image/*'}
                      onChange={(e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                      disabled={uploadingImage}
                    />
                  )}
                </div>
                {uploadingImage && (
                  <div className="mb-2">
                    <Spinner size="sm" className="me-2" />
                    Uploading...
                  </div>
                )}
                {formData.contentUrl && (formData.contentType === 'image' || formData.contentType === 'gif') && (
                  <div className="mt-2">
                    <img 
                      src={formData.contentUrl} 
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '4px', padding: '4px' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <Form.Text className="text-muted">
                  {formData.contentType === 'video' 
                    ? 'Enter a video URL (YouTube, Vimeo, or direct video link)'
                    : formData.contentType === 'gif'
                    ? 'Enter a GIF URL or upload a GIF file'
                    : 'Enter an image URL or upload an image file'}
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  {formErrors.contentUrl}
                </Form.Control.Feedback>
              </Form.Group>
            )}

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
              <Form.Label>Delay (milliseconds) *</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="100"
                value={formData.delayMs !== undefined ? formData.delayMs : 3000}
                onChange={(e) => handleInputChange('delayMs', parseInt(e.target.value) || 3000)}
                required
              />
              <Form.Text className="text-muted">
                Time to wait before showing the modal (in milliseconds). Default: 3000ms (3 seconds)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Storage Expiry (minutes) *</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="1"
                value={formData.storageExpiryMinutes !== undefined ? formData.storageExpiryMinutes : 1440}
                onChange={(e) => handleInputChange('storageExpiryMinutes', parseInt(e.target.value) || 1440)}
                required
              />
              <Form.Text className="text-muted">
                Minutes before showing again after user closes it. Set to 0 to always show. Default: 1440 minutes (24 hours)
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
                Inactive flash info won't be displayed on the website
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <div className="btn-group">
              <Button variant="secondary" onClick={handleCloseModal} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting || uploadingImage}>
                {submitting ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    {selectedFlashInfo ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  selectedFlashInfo ? 'Update Flash Info' : 'Create Flash Info'
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
            Delete Flash Info
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

