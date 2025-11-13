import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Alert, Spinner } from "react-bootstrap";
import { FaArrowRight } from "react-icons/fa6";
import { getApiUrl } from "../../Utils/apiConfig";

function AskQuestion({ onQuestionSubmitted }) {
  const [show, setShow] = useState(false);
  const [question, setQuestion] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    setShow(false);
    // Reset form after a delay to allow modal close animation
    setTimeout(() => {
      setQuestion("");
      setName("");
      setEmail("");
      setPhone("");
      setError("");
      setSuccess(false);
    }, 300);
  };

  const handleShow = () => setShow(true);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      setError("Please enter your question");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/submit-question.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
          name: name.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        // Close modal after 2 seconds
        setTimeout(() => {
          handleClose();
          // Callback to refresh FAQs if provided
          if (onQuestionSubmitted) {
            onQuestionSubmitted();
          }
        }, 2000);
      } else {
        setError(data.message || "Failed to submit question. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting question:", err);
      setError("Failed to submit question. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className=" d-flex question-btn  box-1" onClick={handleShow}>
        <p style={{ flexGrow: "1" }}>I've got a question</p>
        <span>
          <FaArrowRight className="icon" />
        </span>
      </div>
      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <h5>Kindly send us your question</h5>
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError("")}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert variant="success">
                Question submitted successfully! We will get back to you soon.
              </Alert>
            )}
            <div className="question-body">
              <div className="mb-3">
                <label htmlFor="question" className="form-label">
                  Your Question *
                </label>
                <textarea
                  id="question"
                  className="form-control"
                  placeholder="Type your question here"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={4}
                  required
                  autoFocus
                  disabled={submitting || success}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Your Name (Optional)
                </label>
                <input
                  id="name"
                  type="text"
                  className="form-control"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting || success}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Your Email (Optional)
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting || success}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="phone" className="form-label">
                  Your Phone (Optional)
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="form-control"
                  placeholder="Your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={submitting || success}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={handleClose}
              className="act-btn1"
              disabled={submitting || success}
            >
              Close
            </Button>
            <Button
              type="submit"
              className="act-btn"
              disabled={submitting || success || !question.trim()}
            >
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}

export default AskQuestion;
