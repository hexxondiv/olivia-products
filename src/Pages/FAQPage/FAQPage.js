import React, { useState, useEffect } from "react";
import "./faq-page.scss";
import { IoSearch } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { Spinner } from "react-bootstrap";
import AskQuestion from "./AskQuestion";
import Questions from "./Questions";
import { SEO } from "../../Components/SEO/SEO";
import { getApiUrl } from "../../Utils/apiConfig";

export const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState([]);

  useEffect(() => {
    fetchFAQs();
  }, []);

  useEffect(() => {
    // Filter FAQs based on search term
    if (!searchTerm.trim()) {
      setFilteredFaqs(faqs);
    } else {
      const search = searchTerm.toLowerCase();
      const filtered = faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(search) ||
          faq.answer.toLowerCase().includes(search)
      );
      setFilteredFaqs(filtered);
    }
  }, [searchTerm, faqs]);

  const fetchFAQs = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/faqs.php?activeOnly=true`);
      const data = await response.json();

      if (data.success) {
        // Map API data to component format
        const formattedFaqs = (data.data || []).map((faq) => ({
          question: faq.question,
          answer: faq.answer,
          bg1: faq.backgroundColor || "#f5f7fa",
        }));
        setFaqs(formattedFaqs);
        setFilteredFaqs(formattedFaqs);
      } else {
        console.error("Failed to load FAQs");
        // Fallback to empty array
        setFaqs([]);
        setFilteredFaqs([]);
      }
    } catch (err) {
      console.error("Failed to load FAQs:", err);
      // Fallback to empty array
      setFaqs([]);
      setFilteredFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    // Get WhatsApp number from environment variable, same as other pages
    const envWhatsApp = process.env.REACT_APP_SALES_WHATSAPP_NUMBER;
    const whatsAppNumber = (envWhatsApp && envWhatsApp.trim() !== "") 
      ? envWhatsApp.trim() 
      : "+2348068527731";
    
    // Create a simple message for FAQ page
    let message = "Hello, Olivia Products!\n\n";
    message += "I have a question and would like to chat with your team.\n\n";
    message += "Thank you!";
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${whatsAppNumber.replace(/[^0-9]/g, "")}?text=${encodedMessage}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, "_blank");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <>
      <SEO
        title="Frequently Asked Questions"
        description="Find answers to common questions about Olivia Fresh products, ordering, shipping, returns, and more. Get help with your questions about our laundry, hygiene, and hair care products."
        keywords="Olivia Fresh FAQ, frequently asked questions, product questions, shipping questions, return policy, customer support"
        url="/faqs"
        type="website"
      />
      <div className="faq-div container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-11">
            <div className="faq-banner d-md-flex align-items-center">
              <div className="col-md-8">
                <h1>
                  Looking for help? Here are our most frequently asked questions.
                </h1>
                <p>
                  Everything you need to know about Olivia Products. Can't find the
                  answer to a question you have? No worries, just click "I have got a
                  question" or "Chat with our team!"
                </p>
              </div>
              <div className="offset-md-1 col-md-3 input-divd d-flex align-items-center">
                <IoSearch className="icon" />
                <input
                  type="search"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="row row-cols-1 row-cols-md-2 g-3 g-md-4 action-buttons">
              <div className="col">
                <AskQuestion onQuestionSubmitted={fetchFAQs} />
              </div>
              <div className="col">
                <div className="d-flex question-btn whatsapp-btn" onClick={handleWhatsAppClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleWhatsAppClick(); } }}>
                  <FaWhatsapp className="whatsapp-icon" />
                  <span className="whatsapp-text">Chat with our team</span>
                </div>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="text-center py-5">
                <p>No FAQs found{searchTerm ? ` matching "${searchTerm}"` : ""}.</p>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-md-2 g-2 g-lg-3 questions-cover">
                {filteredFaqs.map((faq, index) => (
                  <div key={index} className="col">
                    <Questions
                      question={faq.question}
                      answer={faq.answer}
                      bg1={faq.bg1}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
