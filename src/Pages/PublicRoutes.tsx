import React from "react";
import { Routes, Route } from "react-router-dom";
import { Home } from "./Home/Home";
import { ViewProductPage } from "./ViewProductPage/ViewProductPage";
import { ContactUs } from "./ContactUs/ContactUs";
import { OrderForm } from "./ContactUs/OrderForm";
import { WholeSalePage } from "./WholeSalePage/WholeSalePage";
import { OurMission } from "./OurMission/OurMission";
import { Careers } from "./Careers/Careers";
import { Collections } from "./Collections/Collections";
import { About } from "./About/About";
import { FAQPage } from "./FAQPage/FAQPage";
import { CheckoutPage } from "./CheckoutPage/CheckoutPage";
import { SuccessPage } from "./SuccessPage/SuccessPage";
import { TermsAndConditions } from "./TermsAndConditions/TermsAndConditions";

export const PublicRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<ViewProductPage />} />
      <Route path="/contact-us" element={<ContactUs />} />
      <Route path="/order-form" element={<OrderForm />} />
      <Route path="/wholesale-page" element={<WholeSalePage />} />
      <Route path="/about-us" element={<About />} />
      <Route path="/our-mission" element={<OurMission />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/collections" element={<Collections />} />
      <Route path="/faqs" element={<FAQPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-success" element={<SuccessPage />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
    </Routes>
  );
};

