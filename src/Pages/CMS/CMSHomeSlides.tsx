import React, { useState, useEffect } from 'react';
import { CMSLayout } from './CMSLayout';
import { Table, Button, Badge, Modal, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaImage, FaLink } from 'react-icons/fa';
import { getApiUrl } from '../../Utils/apiConfig';
import { SearchableSelect } from '../../Components/SearchableSelect/SearchableSelect';
import './cms-modals.scss';
import './cms-products.scss';

interface HomeSlide {
  id?: number;
  mainPicture: string;
  text: string;
  targetImg: string;
  linkType: 'category' | 'product' | 'none';
  linkValue?: string | null;
  displayOrder: number;
  isActive: boolean;
}

interface Product {
  id: number;
  name: string;
  heading: string;
  firstImg: string;
  isActive: boolean;
}

const PRODUCT_CATEGORIES = [
  { value: 'hand-soap', label: 'Hand Wash' },
  { value: 'dish-wash', label: 'Dish Wash' },
  { value: 'air-freshener', label: 'Air Freshener' },
  { value: 'hair-care', label: 'Hair Care' },
  { value: 'car-wash', label: 'Car Wash' },
  { value: 'toilet-wash', label: 'Toilet Wash' },
  { value: 'window-cleaner', label: 'Window Cleaner' },
  { value: 'personal-care', label: 'Skin Care' },
  { value: 'tile-cleaner', label: 'Tile / Floor Cleaner' },
  { value: 'fabric-wash', label: 'Fabric Wash' }
];

export const CMSHomeSlides: React.FC = () => {
  const [slides, setSlides] = useState<HomeSlide[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<HomeSlide | null>(null);
  const [formData, setFormData] = useState<Partial<HomeSlide>>({
    mainPicture: '',
    text: '',
    targetImg: '',
    linkType: 'none',
    linkValue: null,
    displayOrder: 0,
    isActive: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadingMainPic, setUploadingMainPic] = useState(false);
  const [uploadingTargetImg, setUploadingTargetImg] = useState(false);

  useEffect(() => {
    fetchSlides();
    fetchProducts();
  }, []);

  const fetchSlides = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/home-slides.php`);
      const data = await response.json();
      
      if (data.success) {
        setSlides(data.data || []);
      } else {
        setError('Failed to load home slides');
      }
    } catch (err) {
      setError('Failed to load home slides');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/products.php?activeOnly=true`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const handleDeleteClick = (id: number) => {
    setSlideToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async (hardDelete: boolean = false) => {
    if (!slideToDelete) return;

    setDeleting(true);
    setError('');

    try {
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();
      const url = hardDelete 
        ? `${apiUrl}/home-slides.php?id=${slideToDelete}&hard=true`
        : `${apiUrl}/home-slides.php?id=${slideToDelete}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setShowDeleteModal(false);
        setSlideToDelete(null);
        fetchSlides();
        setError('');
      } else {
        setError(data.message || 'Failed to delete home slide');
      }
    } catch (err) {
      setError('Failed to delete home slide');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleting) {
      setShowDeleteModal(false);
      setSlideToDelete(null);
    }
  };

  const handleOpenModal = (slide?: HomeSlide) => {
    if (slide) {
      setSelectedSlide(slide);
      setFormData({
        mainPicture: slide.mainPicture || '',
        text: slide.text || '',
        targetImg: slide.targetImg || '',
        linkType: slide.linkType || 'none',
        linkValue: slide.linkValue || null,
        displayOrder: slide.displayOrder || 0,
        isActive: slide.isActive !== undefined ? slide.isActive : true
      });
    } else {
      setSelectedSlide(null);
      setFormData({
        mainPicture: '',
        text: '',
        targetImg: '',
        linkType: 'none',
        linkValue: null,
        displayOrder: 0,
        isActive: true
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSlide(null);
    setFormData({
      mainPicture: '',
      text: '',
      targetImg: '',
      linkType: 'none',
      linkValue: null,
      displayOrder: 0,
      isActive: true
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.mainPicture?.trim()) {
      errors.mainPicture = 'Main picture is required';
    }
    
    if (!formData.text?.trim()) {
      errors.text = 'Text is required';
    }
    
    if (!formData.targetImg?.trim()) {
      errors.targetImg = 'Target image is required';
    }
    
    if (formData.linkType && formData.linkType !== 'none' && !formData.linkValue?.trim()) {
      errors.linkValue = 'Link value is required when link type is not "none"';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof HomeSlide, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear linkValue when linkType is set to 'none'
    if (field === 'linkType' && value === 'none') {
      setFormData(prev => ({ ...prev, linkValue: null }));
    }
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageUpload = async (file: File, type: 'mainPicture' | 'targetImg') => {
    const maxSizeBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSizeBytes) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setError(`File too large. File size: ${fileSizeMB}MB, Maximum allowed: 2MB.`);
      return;
    }
    
    try {
      if (type === 'mainPicture') {
        setUploadingMainPic(true);
      } else {
        setUploadingTargetImg(true);
      }
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
        handleInputChange(type, data.path);
        setError('');
      } else {
        const errorMsg = data.message || 'Failed to upload image';
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
      if (type === 'mainPicture') {
        setUploadingMainPic(false);
      } else {
        setUploadingTargetImg(false);
      }
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
        mainPicture: formData.mainPicture,
        text: formData.text,
        targetImg: formData.targetImg,
        linkType: formData.linkType || 'none',
        linkValue: formData.linkType === 'none' ? null : formData.linkValue,
        displayOrder: parseInt(formData.displayOrder as any) || 0,
        isActive: formData.isActive !== undefined ? formData.isActive : true
      };
      
      const url = selectedSlide 
        ? `${apiUrl}/home-slides.php?id=${selectedSlide.id}`
        : `${apiUrl}/home-slides.php`;
      
      const method = selectedSlide ? 'PUT' : 'POST';
      
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
        fetchSlides();
      } else {
        setError(data.message || `Failed to ${selectedSlide ? 'update' : 'create'} home slide`);
      }
    } catch (err) {
      setError(`Failed to ${selectedSlide ? 'update' : 'create'} home slide`);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSlides = slides.filter(slide =>
    slide.text.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1>Home Slides Management</h1>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <FaPlus className="me-2" />
            Add Home Slide
          </Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <InputGroup className="search-input-group">
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search home slides..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <div className="cms-table">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Text</th>
                <th>Main Picture</th>
                <th>Target Image</th>
                <th>Link</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSlides.map((slide) => (
                <tr key={slide.id}>
                  <td>{slide.id}</td>
                  <td style={{ maxWidth: '200px' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {slide.text}
                    </div>
                  </td>
                  <td>
                    {slide.mainPicture ? (
                      <img 
                        src={slide.mainPicture} 
                        alt="Main"
                        style={{ maxWidth: '100px', maxHeight: '50px', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-muted">No image</span>
                    )}
                  </td>
                  <td>
                    {slide.targetImg ? (
                      <img 
                        src={slide.targetImg} 
                        alt="Target"
                        style={{ maxWidth: '100px', maxHeight: '50px', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-muted">No image</span>
                    )}
                  </td>
                  <td>
                    {slide.linkType !== 'none' ? (
                      <Badge bg="info">
                        <FaLink className="me-1" />
                        {slide.linkType}: {slide.linkValue}
                      </Badge>
                    ) : (
                      <span className="text-muted">None</span>
                    )}
                  </td>
                  <td>{slide.displayOrder}</td>
                  <td>
                    <Badge bg={slide.isActive ? 'success' : 'secondary'}>
                      {slide.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleOpenModal(slide)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => slide.id && handleDeleteClick(slide.id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {filteredSlides.length === 0 && (
          <div className="empty-state">
            <p>No home slides found</p>
          </div>
        )}
      </div>

      <Modal show={showModal} onHide={handleCloseModal} size="lg" className="cms-modal-product-form">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {selectedSlide ? 'Edit Home Slide' : 'Add New Home Slide'}
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
              <Form.Label>Main Picture (Background) *</Form.Label>
              <div className="d-flex gap-2 mb-2">
                <Form.Control
                  type="text"
                  value={formData.mainPicture || ''}
                  onChange={(e) => handleInputChange('mainPicture', e.target.value)}
                  isInvalid={!!formErrors.mainPicture}
                  placeholder="Enter image URL or upload file..."
                  required
                />
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      handleImageUpload(file, 'mainPicture');
                    }
                  }}
                  disabled={uploadingMainPic}
                />
              </div>
              {uploadingMainPic && (
                <div className="mb-2">
                  <Spinner size="sm" className="me-2" />
                  Uploading...
                </div>
              )}
              {formData.mainPicture && (
                <div className="mt-2">
                  <img 
                    src={formData.mainPicture} 
                    alt="Main preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '4px', padding: '4px' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <Form.Control.Feedback type="invalid">
                {formErrors.mainPicture}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Text *</Form.Label>
              <Form.Control
                type="text"
                value={formData.text || ''}
                onChange={(e) => handleInputChange('text', e.target.value)}
                isInvalid={!!formErrors.text}
                required
                placeholder="Enter slide text..."
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.text}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Target Image (Overlay) *</Form.Label>
              <div className="d-flex gap-2 mb-2">
                <Form.Control
                  type="text"
                  value={formData.targetImg || ''}
                  onChange={(e) => handleInputChange('targetImg', e.target.value)}
                  isInvalid={!!formErrors.targetImg}
                  placeholder="Enter image URL or upload file..."
                  required
                />
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      handleImageUpload(file, 'targetImg');
                    }
                  }}
                  disabled={uploadingTargetImg}
                />
              </div>
              {uploadingTargetImg && (
                <div className="mb-2">
                  <Spinner size="sm" className="me-2" />
                  Uploading...
                </div>
              )}
              {formData.targetImg && (
                <div className="mt-2">
                  <img 
                    src={formData.targetImg} 
                    alt="Target preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '4px', padding: '4px' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <Form.Control.Feedback type="invalid">
                {formErrors.targetImg}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Link Type</Form.Label>
              <Form.Select
                value={formData.linkType || 'none'}
                onChange={(e) => handleInputChange('linkType', e.target.value)}
              >
                <option value="none">No Link</option>
                <option value="category">Category</option>
                <option value="product">Product</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Select whether this slide should link to a category or product
              </Form.Text>
            </Form.Group>

            {formData.linkType && formData.linkType === 'category' && (
              <Form.Group className="mb-3">
                <SearchableSelect
                  value={formData.linkValue || null}
                  onChange={(val) => handleInputChange('linkValue', val)}
                  options={PRODUCT_CATEGORIES.map(cat => ({
                    value: cat.value,
                    label: cat.label
                  }))}
                  placeholder="Select a category"
                  label="Category"
                  isInvalid={!!formErrors.linkValue}
                  required
                  errorMessage={formErrors.linkValue}
                />
              </Form.Group>
            )}

            {formData.linkType && formData.linkType === 'product' && (
              <Form.Group className="mb-3">
                <SearchableSelect
                  value={formData.linkValue || null}
                  onChange={(val) => handleInputChange('linkValue', val)}
                  options={products
                    .filter(p => p.isActive)
                    .map((product) => ({
                      value: product.id.toString(),
                      label: product.heading || product.name,
                      image: product.firstImg,
                      metadata: `ID: ${product.id}`
                    }))}
                  placeholder="Select a product"
                  label="Product"
                  isInvalid={!!formErrors.linkValue}
                  required
                  errorMessage={formErrors.linkValue}
                />
                {formData.linkValue && (() => {
                  const selectedProduct = products.find(p => p.id.toString() === formData.linkValue);
                  return selectedProduct && selectedProduct.firstImg ? (
                    <div className="mt-2 p-2 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                      <div className="d-flex align-items-center gap-3">
                        <img 
                          src={selectedProduct.firstImg} 
                          alt={selectedProduct.heading || selectedProduct.name}
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            objectFit: 'contain', 
                            border: '1px solid #ddd', 
                            borderRadius: '4px', 
                            padding: '4px',
                            backgroundColor: '#fff'
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <div className="fw-bold">
                            {selectedProduct.heading || selectedProduct.name}
                          </div>
                          <div className="small text-muted">
                            Product ID: {selectedProduct.id}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
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
              <Form.Check
                type="switch"
                id="isActive"
                label="Active"
                checked={formData.isActive !== undefined ? formData.isActive : true}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
              />
              <Form.Text className="text-muted">
                Inactive slides won't be displayed on the website
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <div className="btn-group">
              <Button variant="secondary" onClick={handleCloseModal} disabled={submitting || uploadingMainPic || uploadingTargetImg}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting || uploadingMainPic || uploadingTargetImg}>
                {submitting ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    {selectedSlide ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  selectedSlide ? 'Update Home Slide' : 'Create Home Slide'
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
            Delete Home Slide
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

