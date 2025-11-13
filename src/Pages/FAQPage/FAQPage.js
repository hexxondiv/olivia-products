import React from "react";
import "./faq-page.scss";
import { IoSearch } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import AskQuestion from "./AskQuestion";
import Questions from "./Questions";
import { SEO } from "../../Components/SEO/SEO";
const faqs = [
  {
    question: "How can I track my order?",
    answer:
      "You will receive a tracking number via email once your order ships.",
    bg1: "#F2E7FF",
  },
  {
    question: "What is your return policy?",
    answer: "Our return policy lasts 30 days with a full refund.",
    bg1: "#DEEAFF",
  },
  {
    question: "Do you offer international shipping?",
    answer: "Yes, we ship to over 50 countries worldwide.",
    bg1: "#FFF2DF",
  },
  {
    question: "How can I track my order?",
    answer:
      "You will receive a tracking number via email once your order ships.",
    bg1: "#F2E7FF",
  },
  {
    question: "Do you offer international shipping?",
    answer: "Yes, we ship to over 50 countries worldwide.",
    bg1: "#FFF2DF",
  },
  {
    question: "What is your return policy?",
    answer: "Our return policy lasts 30 days with a full refund.",
    bg1: "#DEEAFF",
  },
  {
    question: "How can I track my order?",
    answer:
      "You will receive a tracking number via email once your order ships.",
    bg1: "#F2E7FF",
  },
  {
    question: "What is your return policy?",
    answer: "Our return policy lasts 30 days with a full refund.",
    bg1: "#C0BFFF",
  },
  {
    question: "What is your return policy?",
    answer: "Our return policy lasts 30 days with a full refund.",
    bg1: "#DEEAFF",
  },
  {
    question: "What is your return policy?",
    answer: "Our return policy lasts 30 days with a full refund.",
    bg1: "#C0BFFF",
  },
  {
    question: "Do you offer international shipping?",
    answer: "Yes, we ship to over 50 countries worldwide.",
    bg1: "#FFF2DF",
  },
];

export const FAQPage = () => {
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
                <input type="search" placeholder="Search" />
              </div>
            </div>
            <div className="row row-cols-1 row-cols-md-2 g-3 g-md-4 action-buttons">
              <div className="col">
                <AskQuestion />
              </div>
              <div className="col">
                <div className="d-flex question-btn whatsapp-btn" onClick={handleWhatsAppClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleWhatsAppClick(); } }}>
                  <FaWhatsapp className="whatsapp-icon" />
                  <span className="whatsapp-text">Chat with our team</span>
                </div>
              </div>
            </div>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3 g-lg-4 questions-cover">
              {faqs.map((faq, index) => (
                <Questions
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  bg1={faq.bg1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
