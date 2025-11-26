import React, { useState, useEffect } from 'react';
import { CMSLayout } from './CMSLayout';
import { Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { getApiUrl } from '../../Utils/apiConfig';
import './cms-modals.scss';
import './cms-products.scss';

interface ContactInfo {
  id?: number;
  companyName: string;
  location: string;
  phone?: string;
  whatsapp?: string;
  salesWhatsApp?: string;
  businessHours?: string;
  emailGeneral?: string;
  emailSales?: string;
  emailSupplier?: string;
  mapEmbedUrl?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    [key: string]: string | undefined;
  };
  productBackgroundColor?: string;
}

export const CMSContactInfo: React.FC = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<ContactInfo>({
    companyName: '',
    location: '',
    phone: '',
    whatsapp: '',
    salesWhatsApp: '',
    businessHours: '',
    emailGeneral: '',
    emailSales: '',
    emailSupplier: '',
    mapEmbedUrl: '',
    socialMedia: {},
    productBackgroundColor: '#000000'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/contact-info.php`);
      const data = await response.json();
      
      if (data.success) {
        setContactInfo(data.data);
        setFormData(data.data || {
          companyName: '',
          location: '',
          phone: '',
          whatsapp: '',
          salesWhatsApp: '',
          businessHours: '',
          emailGeneral: '',
          emailSales: '',
          emailSupplier: '',
          mapEmbedUrl: '',
          socialMedia: {},
          productBackgroundColor: '#000000'
        });
      } else {
        setError('Failed to load contact information');
      }
    } catch (err) {
      setError('Failed to load contact information');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    if (contactInfo) {
      setFormData({ ...contactInfo });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.companyName?.trim()) {
      errors.companyName = 'Company name is required';
    }
    
    if (!formData.location?.trim()) {
      errors.location = 'Location is required';
    }
    
    // Validate email formats if provided
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.emailGeneral && !emailRegex.test(formData.emailGeneral)) {
      errors.emailGeneral = 'Invalid email format';
    }
    if (formData.emailSales && !emailRegex.test(formData.emailSales)) {
      errors.emailSales = 'Invalid email format';
    }
    if (formData.emailSupplier && !emailRegex.test(formData.emailSupplier)) {
      errors.emailSupplier = 'Invalid email format';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof ContactInfo, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
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
        companyName: formData.companyName,
        location: formData.location,
        phone: formData.phone || null,
        whatsapp: formData.whatsapp || null,
        salesWhatsApp: formData.salesWhatsApp || null,
        businessHours: formData.businessHours || null,
        emailGeneral: formData.emailGeneral || null,
        emailSales: formData.emailSales || null,
        emailSupplier: formData.emailSupplier || null,
        mapEmbedUrl: formData.mapEmbedUrl || null,
        socialMedia: formData.socialMedia || {},
        productBackgroundColor: formData.productBackgroundColor || '#000000'
      };
      
      const url = contactInfo?.id 
        ? `${apiUrl}/contact-info.php?id=${contactInfo.id}`
        : `${apiUrl}/contact-info.php`;
      
      const method = contactInfo?.id ? 'PUT' : 'POST';
      
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
        fetchContactInfo();
      } else {
        setError(data.message || `Failed to ${contactInfo?.id ? 'update' : 'create'} contact information`);
      }
    } catch (err) {
      setError(`Failed to ${contactInfo?.id ? 'update' : 'create'} contact information`);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
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
      <div className="cms-page">
        <div className="cms-page-header">
          <h1>Contact Information</h1>
          <Button variant="primary" onClick={handleOpenModal}>
            <FaEdit className="me-2" />
            {contactInfo ? 'Edit Contact Information' : 'Create Contact Information'}
          </Button>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {contactInfo && (
          <div className="contact-info-display mt-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{contactInfo.companyName}</h5>
                <div className="row mt-3">
                  <div className="col-md-6">
                    <p><strong>Location:</strong> {contactInfo.location}</p>
                    {contactInfo.phone && (
                      <p><strong>Phone:</strong> {contactInfo.phone}</p>
                    )}
                    {contactInfo.whatsapp && (
                      <p><strong>WhatsApp:</strong> {contactInfo.whatsapp}</p>
                    )}
                    {contactInfo.salesWhatsApp && (
                      <p><strong>Sales WhatsApp:</strong> {contactInfo.salesWhatsApp}</p>
                    )}
                    {contactInfo.businessHours && (
                      <p><strong>Business Hours:</strong> {contactInfo.businessHours}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    {contactInfo.emailGeneral && (
                      <p><strong>General Email:</strong> <a href={`mailto:${contactInfo.emailGeneral}`}>{contactInfo.emailGeneral}</a></p>
                    )}
                    {contactInfo.emailSales && (
                      <p><strong>Sales Email:</strong> <a href={`mailto:${contactInfo.emailSales}`}>{contactInfo.emailSales}</a></p>
                    )}
                    {contactInfo.emailSupplier && (
                      <p><strong>Supplier Email:</strong> <a href={`mailto:${contactInfo.emailSupplier}`}>{contactInfo.emailSupplier}</a></p>
                    )}
                  </div>
                </div>
                {contactInfo.mapEmbedUrl && (
                  <div className="mt-3">
                    <strong>Map URL:</strong> {contactInfo.mapEmbedUrl}
                  </div>
                )}
                {contactInfo.socialMedia && Object.keys(contactInfo.socialMedia).length > 0 && (
                  <div className="mt-3">
                    <strong>Social Media:</strong>
                    <ul>
                      {Object.entries(contactInfo.socialMedia).map(([platform, url]) => (
                        url && <li key={platform}>{platform}: <a href={url} target="_blank" rel="noopener noreferrer">{url}</a></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {contactInfo?.id ? 'Edit Contact Information' : 'Create Contact Information'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Company Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  isInvalid={!!formErrors.companyName}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.companyName}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Location <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  isInvalid={!!formErrors.location}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.location}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="row">
                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>WhatsApp</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.whatsapp || ''}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  />
                </Form.Group>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Sales WhatsApp</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.salesWhatsApp || ''}
                  onChange={(e) => handleInputChange('salesWhatsApp', e.target.value)}
                  placeholder="+2348068527731"
                />
                <Form.Text className="text-muted">
                  This number is used for sales-related WhatsApp links throughout the site
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Business Hours</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.businessHours || ''}
                  onChange={(e) => handleInputChange('businessHours', e.target.value)}
                  placeholder="Monday - Friday: 8am - 5pm"
                />
              </Form.Group>

              <div className="row">
                <Form.Group className="mb-3 col-md-4">
                  <Form.Label>General Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.emailGeneral || ''}
                    onChange={(e) => handleInputChange('emailGeneral', e.target.value)}
                    isInvalid={!!formErrors.emailGeneral}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.emailGeneral}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 col-md-4">
                  <Form.Label>Sales Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.emailSales || ''}
                    onChange={(e) => handleInputChange('emailSales', e.target.value)}
                    isInvalid={!!formErrors.emailSales}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.emailSales}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 col-md-4">
                  <Form.Label>Supplier Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.emailSupplier || ''}
                    onChange={(e) => handleInputChange('emailSupplier', e.target.value)}
                    isInvalid={!!formErrors.emailSupplier}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.emailSupplier}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Map Embed URL</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.mapEmbedUrl || ''}
                  onChange={(e) => handleInputChange('mapEmbedUrl', e.target.value)}
                  placeholder="https://www.google.com/maps?q=..."
                />
              </Form.Group>

              <div className="mb-3">
                <Form.Label>Social Media Links</Form.Label>
                {['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'].map((platform) => (
                  <Form.Group key={platform} className="mb-2">
                    <Form.Control
                      type="url"
                      placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                      value={formData.socialMedia?.[platform] || ''}
                      onChange={(e) => handleSocialMediaChange(platform, e.target.value)}
                    />
                  </Form.Group>
                ))}
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Product Background Color</Form.Label>
                <Form.Control
                  type="color"
                  value={formData.productBackgroundColor || '#000000'}
                  onChange={(e) => handleInputChange('productBackgroundColor', e.target.value)}
                />
                <Form.Text className="text-muted">
                  Background color for product cards in ProductsHolder (applies to all products)
                </Form.Text>
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={handleCloseModal} disabled={submitting}>
                  <FaTimes className="me-2" />
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="me-2" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </CMSLayout>
  );
};

