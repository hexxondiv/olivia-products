import React, { useState, useEffect } from 'react';
import { CMSLayout } from './CMSLayout';
import { Table, Button, Badge, Modal, Form, Alert, Spinner, InputGroup, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUpload, FaTimes } from 'react-icons/fa';
import { getApiUrl } from '../../Utils/apiConfig';
import './cms-modals.scss';
import './cms-products.scss';

interface Product {
  id?: number;
  name: string;
  heading: string;
  sufix?: string;
  price: number;
  rating: number;
  color?: string;
  detail?: string;
  moreDetail?: string;
  tagline?: string;
  firstImg: string;
  hoverImg?: string;
  additionalImgs?: string[];
  category: string[];
  flavours?: Array<{ id: number; name: string }>;
  bestSeller: boolean;
  isActive: boolean;
  // Tiered pricing fields
  retailPrice?: number | null;
  retailMinQty?: number;
  wholesalePrice?: number | null;
  wholesaleMinQty?: number | null;
  distributorPrice?: number | null;
  distributorMinQty?: number | null;
}

const PRODUCT_CATEGORIES = [
  'hand-soap',
  'dish-wash',
  'air-freshener',
  'hair-care',
  'car-wash',
  'toilet-wash',
  'window-cleaner',
  'personal-care',
  'tile-cleaner',
  'fabric-wash'
];

export const CMSProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    heading: '',
    name: '',
    sufix: '',
    price: 0,
    rating: 0,
    color: '',
    detail: '',
    moreDetail: '',
    tagline: '',
    firstImg: '',
    hoverImg: '',
    additionalImgs: [],
    category: [],
    flavours: [],
    bestSeller: false,
    isActive: true,
    retailPrice: null,
    retailMinQty: 1,
    wholesalePrice: null,
    wholesaleMinQty: null,
    distributorPrice: null,
    distributorMinQty: null
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/products.php`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data || []);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async (hardDelete: boolean = false) => {
    if (!productToDelete) return;

    setDeleting(true);
    setError('');

    try {
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();
      const url = hardDelete 
        ? `${apiUrl}/products.php?id=${productToDelete}&hard=true`
        : `${apiUrl}/products.php?id=${productToDelete}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setShowDeleteModal(false);
        setProductToDelete(null);
        fetchProducts();
        setError('');
      } else {
        setError(data.message || 'Failed to delete product');
      }
    } catch (err) {
      setError('Failed to delete product');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleting) {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        heading: product.heading || '',
        name: product.name || '',
        sufix: product.sufix || '',
        price: product.price || 0,
        rating: product.rating || 0,
        color: product.color || '',
        detail: product.detail || '',
        moreDetail: product.moreDetail || '',
        tagline: product.tagline || '',
        firstImg: product.firstImg || '',
        hoverImg: product.hoverImg || '',
        additionalImgs: product.additionalImgs || [],
        category: product.category || [],
        flavours: product.flavours || [],
        bestSeller: product.bestSeller || false,
        isActive: product.isActive !== undefined ? product.isActive : true,
        retailPrice: product.retailPrice ?? null,
        retailMinQty: product.retailMinQty ?? 1,
        wholesalePrice: product.wholesalePrice ?? null,
        wholesaleMinQty: product.wholesaleMinQty ?? null,
        distributorPrice: product.distributorPrice ?? null,
        distributorMinQty: product.distributorMinQty ?? null
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        heading: '',
        name: '',
        sufix: '',
        price: 0,
        rating: 0,
        color: '',
        detail: '',
        moreDetail: '',
        tagline: '',
        firstImg: '',
        hoverImg: '',
        additionalImgs: [],
        category: [],
        flavours: [],
        bestSeller: false,
        isActive: true,
        retailPrice: null,
        retailMinQty: 1,
        wholesalePrice: null,
        wholesaleMinQty: null,
        distributorPrice: null,
        distributorMinQty: null
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setFormData({
      heading: '',
      name: '',
      sufix: '',
      price: 0,
      rating: 0,
      color: '',
      detail: '',
      moreDetail: '',
      tagline: '',
      firstImg: '',
      hoverImg: '',
      additionalImgs: [],
      category: [],
      flavours: [],
      bestSeller: false,
      isActive: true,
      retailPrice: null,
      retailMinQty: 1,
      wholesalePrice: null,
      wholesaleMinQty: null,
      distributorPrice: null,
      distributorMinQty: null
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.heading?.trim()) {
      errors.heading = 'Heading is required';
    }
    if (!formData.name?.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.price || formData.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    if (!formData.firstImg?.trim()) {
      errors.firstImg = 'First image is required';
    }
    if (!formData.category || formData.category.length === 0) {
      errors.category = 'At least one category is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCategoryToggle = (category: string) => {
    const currentCategories = formData.category || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    handleInputChange('category', newCategories);
  };

  const handleImageUpload = async (field: 'firstImg' | 'hoverImg' | 'additionalImgs', file: File) => {
    // Check file size before upload (2MB limit based on PHP default)
    const maxSizeBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSizeBytes) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(0);
      setError(`File too large. File size: ${fileSizeMB}MB, Maximum allowed: ${maxSizeMB}MB. Please compress the image or use a smaller file.`);
      return;
    }
    
    try {
      setUploadingImage(field);
      setError(''); // Clear previous errors
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
        if (field === 'additionalImgs') {
          const currentImgs = formData.additionalImgs || [];
          handleInputChange('additionalImgs', [...currentImgs, data.path]);
        } else {
          handleInputChange(field, data.path);
        }
        // Clear any previous errors on success
        setError('');
      } else {
        const errorMsg = data.message || `Failed to upload image${response.status ? ` (Status: ${response.status})` : ''}`;
        setError(errorMsg);
        // Keep error visible for 5 seconds, then allow it to be cleared
        setTimeout(() => {
          setError(prev => prev === errorMsg ? '' : prev);
        }, 5000);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload image. Please check your connection and try again.';
      setError(errorMsg);
      console.error('Image upload error:', err);
      // Keep error visible for 5 seconds
      setTimeout(() => {
        setError(prev => prev === errorMsg ? '' : prev);
      }, 5000);
    } finally {
      setUploadingImage(null);
    }
  };

  const handleRemoveAdditionalImage = (index: number) => {
    const currentImgs = formData.additionalImgs || [];
    handleInputChange('additionalImgs', currentImgs.filter((_, i) => i !== index));
  };

  const handleAddFlavour = () => {
    const currentFlavours = formData.flavours || [];
    const newId = currentFlavours.length > 0 
      ? Math.max(...currentFlavours.map(f => f.id)) + 1 
      : 1;
    handleInputChange('flavours', [...currentFlavours, { id: newId, name: '' }]);
  };

  const handleFlavourChange = (index: number, value: string) => {
    const currentFlavours = formData.flavours || [];
    const newFlavours = [...currentFlavours];
    newFlavours[index] = { ...newFlavours[index], name: value };
    handleInputChange('flavours', newFlavours);
  };

  const handleRemoveFlavour = (index: number) => {
    const currentFlavours = formData.flavours || [];
    handleInputChange('flavours', currentFlavours.filter((_, i) => i !== index));
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
        price: parseFloat(formData.price as any),
        rating: parseFloat(formData.rating as any) || 0,
      };
      
      const url = selectedProduct 
        ? `${apiUrl}/products.php?id=${selectedProduct.id}`
        : `${apiUrl}/products.php`;
      
      const method = selectedProduct ? 'PUT' : 'POST';
      
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
        fetchProducts();
      } else {
        setError(data.message || `Failed to ${selectedProduct ? 'update' : 'create'} product`);
      }
    } catch (err) {
      setError(`Failed to ${selectedProduct ? 'update' : 'create'} product`);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.heading.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1>Products Management</h1>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <FaPlus className="me-2" />
            Add Product
          </Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <InputGroup className="search-input-group">
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        {/* Desktop Table View */}
        <div className="cms-table">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Image</th>
                <th>ID</th>
                <th>Name</th>
                <th>Heading</th>
                <th>Price</th>
                <th>Rating</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    {product.firstImg ? (
                      <img 
                        src={product.firstImg} 
                        alt={product.name}
                        className="product-thumbnail"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="product-thumbnail-placeholder">No Image</div>
                    )}
                  </td>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.heading}</td>
                  <td>₦{product.price.toLocaleString()}</td>
                  <td>{product.rating}</td>
                  <td>
                    {product.category && product.category.length > 0
                      ? product.category.join(', ')
                      : '-'}
                  </td>
                  <td>
                    <Badge bg={product.isActive ? 'success' : 'secondary'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {product.bestSeller && (
                      <Badge bg="warning" className="ms-1">Best Seller</Badge>
                    )}
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleOpenModal(product)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => product.id && handleDeleteClick(product.id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="products-mobile-view">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              {product.firstImg && (
                <div className="product-image">
                  <img 
                    src={product.firstImg} 
                    alt={product.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="product-header">
                <div className="product-title">
                  <h3>{product.name}</h3>
                  <div className="product-heading">{product.heading}</div>
                </div>
                <div className="product-id">ID: {product.id}</div>
              </div>
              
              <div className="product-details">
                <div className="detail-item">
                  <div className="label">Price</div>
                  <div className="value">₦{product.price.toLocaleString()}</div>
                </div>
                <div className="detail-item">
                  <div className="label">Rating</div>
                  <div className="value">{product.rating}</div>
                </div>
              </div>

              {product.category && product.category.length > 0 && (
                <div className="product-categories">
                  <div className="label">Categories</div>
                  <div className="categories-list">
                    {product.category.join(', ')}
                  </div>
                </div>
              )}

              <div className="product-status">
                <Badge bg={product.isActive ? 'success' : 'secondary'}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {product.bestSeller && (
                  <Badge bg="warning">Best Seller</Badge>
                )}
              </div>

              <div className="product-actions">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleOpenModal(product)}
                >
                  <FaEdit className="me-1" />
                  Edit
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => product.id && handleDeleteClick(product.id)}
                >
                  <FaTrash className="me-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="empty-state">
            <p>No products found</p>
          </div>
        )}
      </div>

      <Modal show={showModal} onHide={handleCloseModal} size="xl" className="cms-modal-product-form">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {selectedProduct ? 'Edit Product' : 'Add New Product'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                <Alert.Heading>Error</Alert.Heading>
                {error}
              </Alert>
            )}
            
            <div className="form-section">
              <h6 className="section-title">Basic Information</h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Heading *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.heading || ''}
                      onChange={(e) => handleInputChange('heading', e.target.value)}
                      isInvalid={!!formErrors.heading}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.heading}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
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
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Suffix</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.sufix || ''}
                      onChange={(e) => handleInputChange('sufix', e.target.value)}
                      placeholder="e.g., Hand Wash"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Color</Form.Label>
                    <Form.Control
                      type="color"
                      value={formData.color || '#000000'}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Price (₦) *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price || 0}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      isInvalid={!!formErrors.price}
                      required
                    />
                    <Form.Text className="text-muted">Legacy price field (for backward compatibility)</Form.Text>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.price}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Rating</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating || 0}
                      onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className="form-section">
              <h6 className="section-title">Tiered Pricing</h6>
              <p className="text-muted small mb-3">
                Set up pricing tiers based on minimum purchase quantities. The system will automatically apply the highest tier that the customer's quantity qualifies for.
              </p>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Retail Price (₦) *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.retailPrice ?? ''}
                      onChange={(e) => handleInputChange('retailPrice', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="Enter retail price"
                    />
                    <Form.Text className="text-muted">Price for retail customers</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Retail Minimum Quantity *</Form.Label>
                    <Form.Control
                      type="number"
                      step="1"
                      min="1"
                      value={formData.retailMinQty ?? 1}
                      onChange={(e) => handleInputChange('retailMinQty', parseInt(e.target.value) || 1)}
                    />
                    <Form.Text className="text-muted">Minimum quantity for retail pricing (default: 1)</Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Wholesale Price (₦)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.wholesalePrice ?? ''}
                      onChange={(e) => handleInputChange('wholesalePrice', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="Enter wholesale price (optional)"
                    />
                    <Form.Text className="text-muted">Price for wholesale customers</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Wholesale Minimum Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      step="1"
                      min="1"
                      value={formData.wholesaleMinQty ?? ''}
                      onChange={(e) => handleInputChange('wholesaleMinQty', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Enter minimum quantity (optional)"
                    />
                    <Form.Text className="text-muted">Minimum quantity to qualify for wholesale pricing</Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Distributor Price (₦)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.distributorPrice ?? ''}
                      onChange={(e) => handleInputChange('distributorPrice', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="Enter distributor price (optional)"
                    />
                    <Form.Text className="text-muted">Price for distributor customers</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Distributor Minimum Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      step="1"
                      min="1"
                      value={formData.distributorMinQty ?? ''}
                      onChange={(e) => handleInputChange('distributorMinQty', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Enter minimum quantity (optional)"
                    />
                    <Form.Text className="text-muted">Minimum quantity to qualify for distributor pricing</Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className="form-section">
              <h6 className="section-title">Description</h6>
              <Form.Group className="mb-3">
                <Form.Label>Tagline</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.tagline || ''}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  placeholder="A short catchy tagline"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Detail</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.detail || ''}
                  onChange={(e) => handleInputChange('detail', e.target.value)}
                  placeholder="Short product description"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>More Detail</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={formData.moreDetail || ''}
                  onChange={(e) => handleInputChange('moreDetail', e.target.value)}
                  placeholder="Detailed product description"
                />
              </Form.Group>
            </div>

            <div className="form-section">
              <h6 className="section-title">Images</h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Image *</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        value={formData.firstImg || ''}
                        onChange={(e) => handleInputChange('firstImg', e.target.value)}
                        isInvalid={!!formErrors.firstImg}
                        placeholder="/assets/images/product.png"
                        required
                      />
                      <InputGroup.Text>
                        <label className="mb-0" style={{ cursor: 'pointer' }}>
                          <FaUpload />
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload('firstImg', file);
                            }}
                            disabled={uploadingImage === 'firstImg'}
                          />
                        </label>
                      </InputGroup.Text>
                    </InputGroup>
                    {uploadingImage === 'firstImg' && <Spinner size="sm" className="mt-2" />}
                    <Form.Control.Feedback type="invalid">
                      {formErrors.firstImg}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Hover Image</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        value={formData.hoverImg || ''}
                        onChange={(e) => handleInputChange('hoverImg', e.target.value)}
                        placeholder="/assets/images/product-hover.png"
                      />
                      <InputGroup.Text>
                        <label className="mb-0" style={{ cursor: 'pointer' }}>
                          <FaUpload />
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload('hoverImg', file);
                            }}
                            disabled={uploadingImage === 'hoverImg'}
                          />
                        </label>
                      </InputGroup.Text>
                    </InputGroup>
                    {uploadingImage === 'hoverImg' && <Spinner size="sm" className="mt-2" />}
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Additional Images</Form.Label>
                <div className="mb-2 additional-images-list">
                  {formData.additionalImgs?.map((img, index) => (
                    <InputGroup key={index} className="mb-2">
                      <Form.Control
                        type="text"
                        value={img}
                        onChange={(e) => {
                          const newImgs = [...(formData.additionalImgs || [])];
                          newImgs[index] = e.target.value;
                          handleInputChange('additionalImgs', newImgs);
                        }}
                        placeholder="/assets/images/product-additional.png"
                      />
                      <InputGroup.Text>
                        <label className="mb-0" style={{ cursor: 'pointer' }}>
                          <FaUpload />
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload('additionalImgs', file);
                            }}
                            disabled={uploadingImage === 'additionalImgs'}
                          />
                        </label>
                      </InputGroup.Text>
                      <Button
                        variant="outline-danger"
                        onClick={() => handleRemoveAdditionalImage(index)}
                      >
                        <FaTimes />
                      </Button>
                    </InputGroup>
                  ))}
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleInputChange('additionalImgs', [...(formData.additionalImgs || []), ''])}
                  >
                    Add Image URL
                  </Button>
                  {uploadingImage === 'additionalImgs' && <Spinner size="sm" />}
                </div>
              </Form.Group>
            </div>

            <div className="form-section">
              <h6 className="section-title">Categories *</h6>
              <Form.Group className="mb-3">
                <Row className="categories-grid">
                  {PRODUCT_CATEGORIES.map(cat => (
                    <Col key={cat} xs={6} sm={4} md={3} lg={3}>
                      <Form.Check
                        type="checkbox"
                        id={`category-${cat}`}
                        label={cat.replace(/-/g, ' ')}
                        checked={(formData.category || []).includes(cat)}
                        onChange={() => handleCategoryToggle(cat)}
                      />
                    </Col>
                  ))}
                </Row>
                {formErrors.category && (
                  <div className="text-danger small mt-1">{formErrors.category}</div>
                )}
              </Form.Group>
            </div>

            <div className="form-section">
              <h6 className="section-title">Flavours</h6>
              <div className="flavours-list">
                {formData.flavours?.map((flavour, index) => (
                  <div key={index} className="d-flex align-items-center mb-2">
                    <Form.Control
                      type="text"
                      value={flavour.name}
                      onChange={(e) => handleFlavourChange(index, e.target.value)}
                      placeholder="e.g., 🍌 Banana"
                      className="me-2"
                    />
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveFlavour(index)}
                    >
                      <FaTimes />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleAddFlavour}
                >
                  Add Flavour
                </Button>
              </div>
            </div>

            <div className="form-section">
              <h6 className="section-title">Settings</h6>
              <Row>
                <Col md={6}>
                  <Form.Check
                    type="switch"
                    id="bestSeller"
                    label="Best Seller"
                    checked={formData.bestSeller || false}
                    onChange={(e) => handleInputChange('bestSeller', e.target.checked)}
                  />
                </Col>
                <Col md={6}>
                  <Form.Check
                    type="switch"
                    id="isActive"
                    label="Active"
                    checked={formData.isActive !== undefined ? formData.isActive : true}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  />
                </Col>
              </Row>
            </div>
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
                    {selectedProduct ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  selectedProduct ? 'Update Product' : 'Create Product'
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
            Delete Product
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
              <p className="delete-option-desc">Hide from store, keep in database</p>
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

