import React, { useState, useEffect } from 'react';
import { CMSLayout } from './CMSLayout';
import { Table, Button, Badge, Modal, Form, Alert, Spinner, InputGroup, Tabs, Tab } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaQuestionCircle, FaCheckCircle } from 'react-icons/fa';
import { getApiUrl } from '../../Utils/apiConfig';
import './cms-modals.scss';
import './cms-products.scss';

interface FAQ {
  id?: number;
  question: string;
  answer: string;
  backgroundColor: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface SubmittedQuestion {
  id: number;
  question: string;
  email?: string;
  name?: string;
  phone?: string;
  status: 'pending' | 'answered' | 'archived';
  answer?: string;
  answeredBy?: number;
  answeredAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export const CMSFAQs: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [submittedQuestions, setSubmittedQuestions] = useState<SubmittedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('faqs');
  const [showModal, setShowModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<SubmittedQuestion | null>(null);
  const [formData, setFormData] = useState<Partial<FAQ>>({
    question: '',
    answer: '',
    backgroundColor: '#f5f7fa',
    displayOrder: 0,
    isActive: true
  });
  const [answerData, setAnswerData] = useState({
    answer: '',
    convertToFAQ: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchFAQs();
    fetchSubmittedQuestions();
  }, []);

  const fetchFAQs = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/faqs.php`);
      const data = await response.json();
      
      if (data.success) {
        setFaqs(data.data || []);
      } else {
        setError('Failed to load FAQs');
      }
    } catch (err) {
      setError('Failed to load FAQs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmittedQuestions = async () => {
    try {
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/submitted-questions.php`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setSubmittedQuestions(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load submitted questions:', err);
    }
  };

  const handleDeleteClick = (id: number) => {
    setFaqToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async (hardDelete: boolean = false) => {
    if (!faqToDelete) return;

    setDeleting(true);
    setError('');

    try {
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();
      const url = hardDelete 
        ? `${apiUrl}/faqs.php?id=${faqToDelete}&hard=true`
        : `${apiUrl}/faqs.php?id=${faqToDelete}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setShowDeleteModal(false);
        setFaqToDelete(null);
        fetchFAQs();
        setError('');
      } else {
        setError(data.message || 'Failed to delete FAQ');
      }
    } catch (err) {
      setError('Failed to delete FAQ');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleting) {
      setShowDeleteModal(false);
      setFaqToDelete(null);
    }
  };

  const handleOpenModal = (faq?: FAQ) => {
    if (faq) {
      setSelectedFAQ(faq);
      setFormData({
        question: faq.question || '',
        answer: faq.answer || '',
        backgroundColor: faq.backgroundColor || '#f5f7fa',
        displayOrder: faq.displayOrder || 0,
        isActive: faq.isActive !== undefined ? faq.isActive : true
      });
    } else {
      setSelectedFAQ(null);
      setFormData({
        question: '',
        answer: '',
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
    setSelectedFAQ(null);
    setFormData({
      question: '',
      answer: '',
      backgroundColor: '#f5f7fa',
      displayOrder: 0,
      isActive: true
    });
    setFormErrors({});
  };

  const handleOpenAnswerModal = (question: SubmittedQuestion) => {
    setSelectedQuestion(question);
    setAnswerData({
      answer: question.answer || '',
      convertToFAQ: false
    });
    setShowAnswerModal(true);
  };

  const handleCloseAnswerModal = () => {
    setShowAnswerModal(false);
    setSelectedQuestion(null);
    setAnswerData({
      answer: '',
      convertToFAQ: false
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.question || !formData.question.trim()) {
      errors.question = 'Question is required';
    }
    
    if (!formData.answer || !formData.answer.trim()) {
      errors.answer = 'Answer is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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
        question: formData.question,
        answer: formData.answer,
        backgroundColor: formData.backgroundColor || '#f5f7fa',
        displayOrder: parseInt(formData.displayOrder as any) || 0,
        isActive: formData.isActive !== undefined ? formData.isActive : true
      };
      
      const url = selectedFAQ 
        ? `${apiUrl}/faqs.php?id=${selectedFAQ.id}`
        : `${apiUrl}/faqs.php`;
      
      const method = selectedFAQ ? 'PUT' : 'POST';
      
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
        fetchFAQs();
      } else {
        setError(data.message || `Failed to ${selectedFAQ ? 'update' : 'create'} FAQ`);
      }
    } catch (err) {
      setError(`Failed to ${selectedFAQ ? 'update' : 'create'} FAQ`);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!answerData.answer || !answerData.answer.trim()) {
      setError('Answer is required');
      return;
    }
    
    if (!selectedQuestion) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('cms_token');
      const apiUrl = getApiUrl();
      
      const payload: any = {
        answer: answerData.answer.trim(),
        status: 'answered',
        convertToFAQ: answerData.convertToFAQ
      };
      
      const response = await fetch(`${apiUrl}/submitted-questions.php?id=${selectedQuestion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        handleCloseAnswerModal();
        fetchSubmittedQuestions();
        if (answerData.convertToFAQ) {
          fetchFAQs();
          setActiveTab('faqs');
        }
      } else {
        setError(data.message || 'Failed to answer question');
      }
    } catch (err) {
      setError('Failed to answer question');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFAQs = faqs.filter(faq => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return faq.question.toLowerCase().includes(search) || 
           faq.answer.toLowerCase().includes(search);
  });

  const pendingQuestions = submittedQuestions.filter(q => q.status === 'pending');
  const answeredQuestions = submittedQuestions.filter(q => q.status === 'answered');

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
      <div className="cms-faqs">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>FAQ Management</h2>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <FaPlus className="me-2" />
            Add FAQ
          </Button>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'faqs')} className="mb-4">
          <Tab eventKey="faqs" title={
            <>
              FAQs <Badge bg="secondary">{filteredFAQs.length}</Badge>
            </>
          }>
            <div className="mb-3">
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </div>

            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFAQs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center">No FAQs found</td>
                  </tr>
                ) : (
                  filteredFAQs.map((faq) => (
                    <tr key={faq.id}>
                      <td>{faq.question}</td>
                      <td>{faq.answer.substring(0, 100)}...</td>
                      <td>{faq.displayOrder}</td>
                      <td>
                        <Badge bg={faq.isActive ? 'success' : 'secondary'}>
                          {faq.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleOpenModal(faq)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteClick(faq.id!)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Tab>

          <Tab eventKey="submitted" title={
            <>
              Submitted Questions <Badge bg="warning">{pendingQuestions.length}</Badge>
            </>
          }>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Contact Info</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submittedQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center">No submitted questions found</td>
                  </tr>
                ) : (
                  submittedQuestions.map((question) => (
                    <tr key={question.id}>
                      <td>{question.question}</td>
                      <td>
                        {question.name && <div><strong>Name:</strong> {question.name}</div>}
                        {question.email && <div><strong>Email:</strong> {question.email}</div>}
                        {question.phone && <div><strong>Phone:</strong> {question.phone}</div>}
                      </td>
                      <td>
                        <Badge bg={
                          question.status === 'pending' ? 'warning' :
                          question.status === 'answered' ? 'success' : 'secondary'
                        }>
                          {question.status}
                        </Badge>
                      </td>
                      <td>{new Date(question.createdAt).toLocaleDateString()}</td>
                      <td>
                        {question.status === 'pending' && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleOpenAnswerModal(question)}
                          >
                            <FaCheckCircle className="me-1" />
                            Answer
                          </Button>
                        )}
                        {question.status === 'answered' && question.answer && (
                          <div>
                            <strong>Answer:</strong>
                            <p className="small">{question.answer}</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Tab>
        </Tabs>

        {/* FAQ Modal */}
        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{selectedFAQ ? 'Edit FAQ' : 'Add FAQ'}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Question *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  isInvalid={!!formErrors.question}
                  required
                />
                <Form.Control.Feedback type="invalid">{formErrors.question}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Answer *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  isInvalid={!!formErrors.answer}
                  required
                />
                <Form.Control.Feedback type="invalid">{formErrors.answer}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Background Color</Form.Label>
                <Form.Control
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Display Order</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                />
              </Form.Group>

              <Form.Check
                type="switch"
                label="Active"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? <Spinner animation="border" size="sm" className="me-2" /> : null}
                {selectedFAQ ? 'Update' : 'Create'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Answer Question Modal */}
        <Modal show={showAnswerModal} onHide={handleCloseAnswerModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Answer Question</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAnswerSubmit}>
            <Modal.Body>
              {selectedQuestion && (
                <>
                  <div className="mb-3">
                    <strong>Question:</strong>
                    <p>{selectedQuestion.question}</p>
                  </div>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Answer *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      value={answerData.answer}
                      onChange={(e) => setAnswerData({ ...answerData, answer: e.target.value })}
                      required
                    />
                  </Form.Group>

                  <Form.Check
                    type="checkbox"
                    label="Also create as FAQ"
                    checked={answerData.convertToFAQ}
                    onChange={(e) => setAnswerData({ ...answerData, convertToFAQ: e.target.checked })}
                  />
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseAnswerModal} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? <Spinner animation="border" size="sm" className="me-2" /> : null}
                Submit Answer
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
          <Modal.Header closeButton>
            <Modal.Title>Delete FAQ</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this FAQ?</p>
            <p className="text-muted small">This will deactivate the FAQ. Use hard delete to permanently remove it.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDeleteModal} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => handleDelete(false)} disabled={deleting}>
              {deleting ? <Spinner animation="border" size="sm" className="me-2" /> : null}
              Deactivate
            </Button>
            <Button variant="outline-danger" onClick={() => handleDelete(true)} disabled={deleting}>
              {deleting ? <Spinner animation="border" size="sm" className="me-2" /> : null}
              Hard Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </CMSLayout>
  );
};

