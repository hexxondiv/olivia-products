import React, { useState, ChangeEvent, FormEvent, useRef } from "react";
import "./wholesale-page.scss";
import Logo from "../../assets/images/logo.png";
import { Row, Col, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

interface Option {
  id: string;
  label: string;
}

export const WholeSalePage: React.FC = () => {
  const [formType, setFormType] = useState<string>("wholesale");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    businessName: "",
    website: "",
    cacRegistrationNumber: "",
    city: "",
    state: "",
    country: "",
    aboutBusiness: "",
  });
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<string[]>([]);
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isInfoExpanded, setIsInfoExpanded] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const options: Option[] = [
    { id: "1", label: "Retailer" },
    { id: "2", label: "E-Commerce" },
    { id: "3", label: "Corporate Gifti" },
    { id: "4", label: "Hospitality" },
    { id: "5", label: "Distributor" },
    { id: "6", label: "Janitorial/Cleaning Services" },
    { id: "7", label: "Non-Profit" },
    { id: "8", label: "Government" },
    { id: "9", label: "Approved Broker" },
  ];

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    const option = options.find((opt) => opt.id === id);
    if (option) {
      if (checked) {
        setSelectedBusinessTypes((prev) => [...prev, option.label]);
      } else {
        setSelectedBusinessTypes((prev) => prev.filter((label) => label !== option.label));
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleLogoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setCompanyLogo(null);
      setLogoPreview(null);
      setLogoPath(null);
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        companyLogo: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
      }));
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        companyLogo: 'File too large. Maximum size is 5MB.',
      }));
      return;
    }

    // Clear previous errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.companyLogo;
      return newErrors;
    });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setCompanyLogo(file);
    setLogoUploading(true);

    // Upload logo immediately
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const apiUrl = process.env.REACT_APP_API_URL
        ? process.env.REACT_APP_API_URL.replace(/submit-(order|contact|wholesale)\.php$/, "upload-wholesale-logo.php")
        : "/api/upload-wholesale-logo.php";

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setLogoPath(data.path);
      } else {
        setErrors((prev) => ({
          ...prev,
          companyLogo: data.message || 'Failed to upload logo. Please try again.',
        }));
        setCompanyLogo(null);
        setLogoPreview(null);
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        companyLogo: 'Failed to upload logo. Please try again.',
      }));
      setCompanyLogo(null);
      setLogoPreview(null);
      console.error('Logo upload error:', error);
    } finally {
      setLogoUploading(false);
    }
  };

  const scrollToFirstError = () => {
    // Wait for DOM to update with error classes
    setTimeout(() => {
      // Find the first input or textarea with error class
      const firstErrorField = formRef.current?.querySelector<HTMLElement>('input.error, textarea.error');
      
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
        // Focus the field for better UX
        firstErrorField.focus();
      } else {
        // Fallback: scroll to form top if no error field found
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 100);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formType) {
      newErrors.formType = "Please select a form type";
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    if (!formData.aboutBusiness.trim()) {
      newErrors.aboutBusiness = "About business is required";
    }

    setErrors(newErrors);
    
    // If there are errors, scroll to the first error field
    if (Object.keys(newErrors).length > 0) {
      scrollToFirstError();
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage("");

    try {
      // Determine API endpoint URL - use same pattern as contact form
      const apiUrl = process.env.REACT_APP_API_URL
        ? process.env.REACT_APP_API_URL.replace(/submit-(order|contact)\.php$/, "submit-wholesale.php")
        : "/api/submit-wholesale.php";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formType,
          ...formData,
          businessTypes: selectedBusinessTypes,
          companyLogo: logoPath,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus("success");
        setSubmitMessage(
          data.message ||
            "Thank you for your partnership inquiry! We'll review your application and get back to you soon."
        );
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          businessName: "",
          website: "",
          cacRegistrationNumber: "",
          city: "",
          state: "",
          country: "",
          aboutBusiness: "",
        });
        setSelectedBusinessTypes([]);
        setCompanyLogo(null);
        setLogoPreview(null);
        setLogoPath(null);
        if (logoInputRef.current) {
          logoInputRef.current.value = '';
        }
        setFormType("wholesale");
        
        // Scroll to top to show success message
        setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          // Also scroll window to top as fallback
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
      } else {
        setSubmitStatus("error");
        setSubmitMessage(
          data.message || "Failed to submit your application. Please try again."
        );
        
        // Scroll to top to show error message
        setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
      }
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        "An error occurred while submitting your application. Please try again later."
      );
      console.error("Wholesale form submission error:", error);
      
      // Scroll to top to show error message
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatWholesaleForWhatsApp = () => {
    // Get WhatsApp number from environment variable, same as checkout page
    const envWhatsApp = process.env.REACT_APP_SALES_WHATSAPP_NUMBER;
    // Debug: log the env var (remove in production)
    console.log('REACT_APP_SALES_WHATSAPP_NUMBER:', envWhatsApp);
    const salesWhatsAppNumber = (envWhatsApp && envWhatsApp.trim() !== "") ? envWhatsApp.trim() : "+2348068527731";
    const formTypeLabel = formType.charAt(0).toUpperCase() + formType.slice(1);
    
    let message = `*NEW ${formTypeLabel.toUpperCase()} PARTNERSHIP INQUIRY*\n`;
    message += "==================\n\n";
    message += "Hello, Olivia Products!\n\n";
    message += `I'm interested in becoming a *${formTypeLabel} Partner*. Here are my details:\n\n`;
    
    message += "*PARTNERSHIP TYPE*\n";
    message += `${formTypeLabel}\n\n`;
    
    message += "*CONTACT INFORMATION*\n";
    message += `*Full Name:* ${formData.firstName}${formData.lastName ? ` ${formData.lastName}` : ""}\n`;
    message += `*Email:* ${formData.email}\n`;
    message += `*Phone:* ${formData.phone}\n\n`;
    
    message += "*BUSINESS INFORMATION*\n";
    message += `*Business Name:* ${formData.businessName}\n`;
    if (formData.cacRegistrationNumber) {
      message += `*CAC Registration Number:* ${formData.cacRegistrationNumber}\n`;
    }
    if (formData.website) {
      message += `*Website:* ${formData.website}\n`;
    }
    message += `*Location:* ${formData.city}, ${formData.state}, ${formData.country}\n\n`;
    
    if (selectedBusinessTypes.length > 0) {
      message += "*TYPE OF BUSINESS*\n";
      selectedBusinessTypes.forEach((type, index) => {
        message += `${index + 1}. ${type}\n`;
      });
      message += "\n";
    }
    
    message += "*ABOUT THE BUSINESS*\n";
    message += `_${formData.aboutBusiness}_\n\n`;
    
    message += "Thank you! Looking forward to your response.";
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${salesWhatsAppNumber.replace(/[^0-9]/g, "")}?text=${encodedMessage}`;
    
    return whatsappUrl;
  };

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Open WhatsApp with pre-filled message
    const whatsappUrl = formatWholesaleForWhatsApp();
    window.open(whatsappUrl, "_blank");
    
    // Show success message
    setSubmitStatus("success");
    setSubmitMessage(
      "Thank you for your partnership inquiry! We've opened WhatsApp for you. Please send the message to complete your submission."
    );
    
    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      businessName: "",
      website: "",
      cacRegistrationNumber: "",
      city: "",
      state: "",
      country: "",
      aboutBusiness: "",
    });
    setSelectedBusinessTypes([]);
    setCompanyLogo(null);
    setLogoPreview(null);
    setLogoPath(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
    setFormType("wholesale");
    
    // Scroll to top to show success message
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="app-form-cover">
      <div className="wholesale-page col-md-6 offset-md-3">
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="col-md-2 col-4">
            <img src={Logo} width="70%" alt="Olivia Products" />
          </div>

          {/* Collapsible Information Section */}
          <div className="info-section">
            <button
              type="button"
              className="info-toggle"
              onClick={() => setIsInfoExpanded(!isInfoExpanded)}
            >
              <span>Partnership Information</span>
              <span className={`toggle-icon ${isInfoExpanded ? "expanded" : ""}`}>
                ▼
              </span>
            </button>
            <div className={`info-content ${isInfoExpanded ? "expanded" : ""}`}>
              <div className="info-content-inner">
                <h5>Welcome to Olivia Products Partnership Program</h5>
                <p>
                  We're excited that you're interested in partnering with us! Our partnership program offers opportunities for Wholesale, Distribution, and Retail partners to grow their business with our premium products.
                </p>
                <div className="info-details">
                  <div className="info-item">
                    <strong>Wholesale Partners:</strong>
                    <p>Purchase products in bulk at wholesale prices. Ideal for businesses looking to stock our products for resale or corporate use.</p>
                  </div>
                  <div className="info-item">
                    <strong>Distribution Partners:</strong>
                    <p>Become a regional distributor and help us expand our reach. Distribution partners enjoy exclusive territories and special pricing.</p>
                  </div>
                  <div className="info-item">
                    <strong>Retail Partners:</strong>
                    <p>Stock our products in your retail store. Perfect for stores looking to offer premium quality products to their customers.</p>
                  </div>
                </div>
                <div className="info-benefits">
                  <h6>Partnership Benefits:</h6>
                  <ul>
                    <li>Competitive pricing and volume discounts</li>
                    <li>Marketing support and promotional materials</li>
                    <li>Dedicated account management</li>
                    <li>Flexible payment terms</li>
                    <li>Product training and support</li>
                  </ul>
                </div>
                <p className="info-note">
                  <strong>Note:</strong> All partnership applications are reviewed within 5-7 business days. Our team will contact you to discuss partnership terms and next steps.
                </p>
                <div className="info-link">
                  <Link to="/terms-and-conditions" target="_blank" rel="noopener noreferrer">
                    Read Full Terms and Conditions →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <h6>
            Partnership Type<span>*</span>
          </h6>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="formType"
                value="wholesale"
                checked={formType === "wholesale"}
                onChange={(e) => setFormType(e.target.value)}
              />
              <span>Wholesale</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="formType"
                value="distribution"
                checked={formType === "distribution"}
                onChange={(e) => setFormType(e.target.value)}
              />
              <span>Distribution</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="formType"
                value="retail"
                checked={formType === "retail"}
                onChange={(e) => setFormType(e.target.value)}
              />
              <span>Retail</span>
            </label>
          </div>
          {errors.formType && (
            <span className="error-message">{errors.formType}</span>
          )}

          {submitStatus && (
            <Alert
              variant={submitStatus === "success" ? "success" : "danger"}
              onClose={() => setSubmitStatus(null)}
              dismissible
              style={{ marginTop: "20px" }}
            >
              {submitMessage}
            </Alert>
          )}

          <h6>
            Name<span>*</span>
          </h6>
          <Row>
            <Col>
              <input
                placeholder="First Name"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? "error" : ""}
              />
              {errors.firstName && (
                <span className="error-message">{errors.firstName}</span>
              )}
            </Col>
            <Col>
              <input
                placeholder="Last Name"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Col>
          </Row>
          <h6>
            Contact<span>*</span>
          </h6>
          <Row>
            <Col>
              <input
                placeholder="Email"
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
            <Col>
              <input
                placeholder="Phone Num"
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
          </Row>
          <h6>
            Business Info <span>*</span>
          </h6>
          <input
            placeholder="Registered business name"
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            className={errors.businessName ? "error" : ""}
          />
          {errors.businessName && (
            <span className="error-message">{errors.businessName}</span>
          )}
          <h6>CAC Registration Number (Optional)</h6>
          <input
            placeholder="Company registration number (CAC)"
            type="text"
            name="cacRegistrationNumber"
            value={formData.cacRegistrationNumber}
            onChange={handleChange}
          />
          <h6>Company Logo (Optional)</h6>
          <div className="logo-upload-container">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleLogoChange}
              className="logo-input"
              disabled={logoUploading}
            />
            {logoPreview && (
              <div className="logo-preview">
                <img src={logoPreview} alt="Company logo preview" />
                <button
                  type="button"
                  className="remove-logo-btn"
                  onClick={() => {
                    setCompanyLogo(null);
                    setLogoPreview(null);
                    setLogoPath(null);
                    if (logoInputRef.current) {
                      logoInputRef.current.value = '';
                    }
                  }}
                >
                  Remove
                </button>
              </div>
            )}
            {logoUploading && (
              <span className="upload-status">Uploading logo...</span>
            )}
            {errors.companyLogo && (
              <span className="error-message">{errors.companyLogo}</span>
            )}
            <small className="logo-hint">Maximum file size: 5MB. Supported formats: JPEG, PNG, GIF, WebP</small>
          </div>
        <h6>Type of business</h6>
        <div className="chec-body col-md-12">
          <div className="check-group">
            {options.map((option) => (
              <label key={option.id} htmlFor={option.id} className="checkbox">
                <input
                  className="checkbox__input"
                  type="checkbox"
                  id={option.id}
                  checked={selectedBusinessTypes.includes(option.label)}
                  onChange={handleCheckboxChange}
                />
                <svg
                  className="checkbox__icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 22 22"
                >
                  <rect
                    width="21"
                    height="21"
                    x=".5"
                    y=".5"
                    fill="#FFF"
                    stroke="#006F94"
                    rx="3"
                  />
                  <path
                    className="tick"
                    stroke="#6EA340"
                    fill="none"
                    strokeLinecap="round"
                    strokeWidth="4"
                    d="M4 10l5 5 9-9"
                  />
                </svg>
                <small className="checkbox__label">{option.label}</small>
              </label>
            ))}

            <div className="check-group__result">
              <p>
                Options chosen: {selectedBusinessTypes.length} of {options.length}
              </p>
            </div>
          </div>
        </div>
          <Row>
            <Col>
              <h6>Website (If any)</h6>
              <input
                placeholder="Online representation"
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
              />
            </Col>
            <Col>
              <h6>
                City <span>*</span>
              </h6>
              <input
                placeholder="Your base city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={errors.city ? "error" : ""}
              />
              {errors.city && (
                <span className="error-message">{errors.city}</span>
              )}
            </Col>
          </Row>
          <Row>
            <Col>
              <h6>
                State <span>*</span>
              </h6>
              <input
                placeholder="Your State"
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={errors.state ? "error" : ""}
              />
              {errors.state && (
                <span className="error-message">{errors.state}</span>
              )}
            </Col>
            <Col>
              <h6>
                Country <span>*</span>
              </h6>
              <input
                placeholder="Your Country"
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={errors.country ? "error" : ""}
              />
              {errors.country && (
                <span className="error-message">{errors.country}</span>
              )}
            </Col>
          </Row>
          <h6>
            About the Business <span>*</span>
          </h6>
          <textarea
            placeholder="Briefly describe the nature of your business"
            name="aboutBusiness"
            value={formData.aboutBusiness}
            onChange={handleChange}
            className={errors.aboutBusiness ? "error" : ""}
            rows={5}
          />
          {errors.aboutBusiness && (
            <span className="error-message">{errors.aboutBusiness}</span>
          )}
          <p>
            By submitting this form, I agree to the{" "}
            <Link to="/terms-and-conditions" target="_blank" rel="noopener noreferrer">
              Terms and Conditions
            </Link>{" "}
            of Olivia Products Partnership Program.
          </p>
          <p>
            Thank you for your interest in Olivia Products. If partnership is
            approved someone will reach out shortly to discuss next steps.
          </p>
          <div className="form-actions">
            <button type="submit" disabled={isSubmitting} className="submit-btn email-btn">
              {isSubmitting ? "Submitting..." : "Submit via Email"}
            </button>
            <button 
              type="button" 
              className="submit-btn whatsapp-btn"
              onClick={handleWhatsAppSubmit}
              disabled={isSubmitting}
            >
              <FaWhatsapp className="btn-icon" />
              <span>Submit via WhatsApp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
