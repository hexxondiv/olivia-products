import React, { useState, useEffect } from "react";
import "./contact-us.scss";
import { FaPaperclip, FaWhatsapp, FaFacebook, FaLinkedin, FaYoutube } from "react-icons/fa";
import { FaSquareInstagram, FaXTwitter } from "react-icons/fa6";
import Hero from "../../assets/images/contact-icons.png";
import { SEO } from "../../Components/SEO/SEO";
import { getApiUrl } from "../../Utils/apiConfig";

import { Col, Row, Alert } from "react-bootstrap";
export const ContactUs = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'
  const [submitMessage, setSubmitMessage] = useState("");
  const [contactInfo, setContactInfo] = useState(null);
  const [loadingContactInfo, setLoadingContactInfo] = useState(true);

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
      }
    } catch (error) {
      console.error("Failed to fetch contact information:", error);
    } finally {
      setLoadingContactInfo(false);
    }
  };

  const getSocialMediaIcon = (platform) => {
    const platformLower = platform.toLowerCase();
    switch (platformLower) {
      case 'facebook':
        return <FaFacebook />;
      case 'instagram':
        return <FaSquareInstagram />;
      case 'twitter':
      case 'x':
        return <FaXTwitter />;
      case 'linkedin':
        return <FaLinkedin />;
      case 'youtube':
        return <FaYoutube />;
      default:
        return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage("");

    try {
      // Determine API endpoint URL
      // In production, always use relative path
      let apiUrl = '/api/submit-contact.php';
      if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_API_URL) {
        // Only use env var in development
        apiUrl = process.env.REACT_APP_API_URL.replace(/submit-order\.php$/, 'submit-contact.php') || '/api/submit-contact.php';
      }
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus("success");
        setSubmitMessage(
          data.message || "Thank you for contacting us! We'll get back to you soon."
        );
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          address: "",
          message: "",
        });
      } else {
        setSubmitStatus("error");
        setSubmitMessage(
          data.message || "Failed to submit your message. Please try again."
        );
      }
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        "An error occurred while submitting your message. Please try again later."
      );
      console.error("Contact form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatContactForWhatsApp = () => {
    // Get WhatsApp number from database contact info
    let contactWhatsAppNumber = "+2348068527731"; // Default fallback
    if (contactInfo?.salesWhatsApp && contactInfo.salesWhatsApp.trim() !== "") {
      contactWhatsAppNumber = contactInfo.salesWhatsApp.trim();
    }
    
    let message = "*NEW CONTACT FORM SUBMISSION*\n";
    message += "==================\n\n";
    message += "Hello, @CelineOlivia!\n\n";
    message += "I'd like to get in touch. Here are my details:\n\n";
    
    message += "*CONTACT INFORMATION*\n";
    message += `*Full Name:* ${formData.fullName}\n`;
    if (formData.email) {
      message += `*Email:* ${formData.email}\n`;
    }
    message += `*Phone:* ${formData.phone}\n`;
    if (formData.address) {
      message += `*Address:* ${formData.address}\n`;
    }
    message += "\n";
    
    message += "*MESSAGE*\n";
    message += `_${formData.message}_\n\n`;
    
    message += "Thank you! Looking forward to your response.";
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${contactWhatsAppNumber.replace(/[^0-9]/g, "")}?text=${encodedMessage}`;
    
    return whatsappUrl;
  };

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Open WhatsApp with pre-filled message
    const whatsappUrl = formatContactForWhatsApp();
    window.open(whatsappUrl, "_blank");
    
    // Show success message
    setSubmitStatus("success");
    setSubmitMessage(
      "Thank you for contacting us! We've opened WhatsApp for you. Please send the message to complete your submission."
    );
    
    // Reset form
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      message: "",
    });
    
    // Scroll to top to show success message
    setTimeout(() => {
      const formElement = document.querySelector('.contact-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <>
      <SEO
        title="Contact Us"
        description="Get in touch with Olivia Fresh. Contact us for inquiries about our laundry, hygiene, and hair care products. We're here to help with customer service, wholesale inquiries, and product information."
        keywords="contact Olivia Fresh, customer service, product inquiries, wholesale contact, Nigeria, Olivia Industries Ltd support"
        url="/contact-us"
        type="website"
      />
    <div className="col-md-12">
      <div className="contact-hero d-flex">
        <h1 className="offset-md-1">Contact Us</h1>
      </div>

      <div className=" d-md-flex contact-info col-md-10 offset-md-1">
        <div className="col-md-7">
          <form className="contact-form" onSubmit={handleSubmit}>
            <h2>We Want to hear from you</h2>
            <div className="contact-form-inner">
              {submitStatus && (
                <Alert
                  variant={submitStatus === "success" ? "success" : "danger"}
                  onClose={() => setSubmitStatus(null)}
                  dismissible
                >
                  {submitMessage}
                </Alert>
              )}

              <Row>
                <Col>
                  <h6>
                    Full Name<span>*</span>
                  </h6>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={errors.fullName ? "error" : ""}
                  />
                  {errors.fullName && (
                    <span className="error-message">{errors.fullName}</span>
                  )}
                </Col>
                <Col>
                  <h6>Email</h6>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "error" : ""}
                  />
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </Col>
              </Row>
              <Row>
                <Col>
                  <h6>
                    Phone num<span>*</span>
                  </h6>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? "error" : ""}
                  />
                  {errors.phone && (
                    <span className="error-message">{errors.phone}</span>
                  )}
                </Col>
                <Col>
                  <h6>Address</h6>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </Col>
              </Row>
              <h6>
                Message<span>*</span>
              </h6>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={errors.message ? "error" : ""}
                rows="5"
              />
              {errors.message && (
                <span className="error-message">{errors.message}</span>
              )}
              <div className="form-actions">
                <button type="submit" disabled={isSubmitting} className="submit-btn email-btn">
                  {isSubmitting ? "Sending..." : "Send via Email"}
                </button>
                <button 
                  type="button" 
                  className="submit-btn whatsapp-btn"
                  onClick={handleWhatsAppSubmit}
                  disabled={isSubmitting}
                >
                  <FaWhatsapp className="btn-icon" />
                  <span>Send via WhatsApp</span>
                </button>
              </div>
            </div>
          </form>
        </div>
        <div className="col-md-5 gf-cova" >
          <div className="general-info">
            <h4>{contactInfo?.companyName || "Olivia Industries Ltd"}</h4>
            {contactInfo?.location && (
              <p>Location: {contactInfo.location}</p>
            )}
            <p className="contact-label">Contact:</p>
            <ul>
              {contactInfo?.phone && (
                <li><span>Lagos:</span>{contactInfo.phone}</li>
              )}
              {contactInfo?.whatsapp && (
                <li><span>Whatsapp:</span> {contactInfo.whatsapp}</li>
              )}
              {contactInfo?.businessHours && (
                <li><span>Monday - Friday:</span>{contactInfo.businessHours}</li>
              )}
              <h5>Write to us:</h5>
              {contactInfo?.emailGeneral && (
                <li><span>General Enquiries</span> <a href={`mailto:${contactInfo.emailGeneral}`}>{contactInfo.emailGeneral}</a></li>
              )}
              {contactInfo?.emailSales && (
                <li><span>Sales Enquiries</span> <a href={`mailto:${contactInfo.emailSales}`}>{contactInfo.emailSales}</a></li>
              )}
              {contactInfo?.emailSupplier && (
                <li><span>Supplier Enquiries</span> <a href={`mailto:${contactInfo.emailSupplier}`}>{contactInfo.emailSupplier}</a></li>
              )}
            </ul>
            {contactInfo?.socialMedia && Object.keys(contactInfo.socialMedia).length > 0 && (
              <>
                <h5>Follow us on:</h5>
                <div className="social-media-links">
                  {Object.entries(contactInfo.socialMedia).map(([platform, url]) => {
                    if (!url) return null;
                    const icon = getSocialMediaIcon(platform);
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={platform}
                        className="social-link"
                      >
                        {icon}
                      </a>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {contactInfo?.mapEmbedUrl && (
        <div className="col-md-12">
          <iframe
            src={contactInfo.mapEmbedUrl}
            height="450"
            width="100%"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      )}
    </div>
    </>
  );
};
