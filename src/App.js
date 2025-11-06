import React from "react";

import { Routes, Route } from "react-router-dom";
import { Home } from "./Pages/Home/Home";
import ScrollToTop from "./scrollToTop";
import { ViewProductPage } from "./Pages/ViewProductPage/ViewProductPage";
import { CartProvider, useCart } from "./CartContext";
import { Footer } from "./Components/Footer/Footer";
import { ContactUs } from "./Pages/ContactUs/ContactUs";
import { OrderForm } from "./Pages/ContactUs/OrderForm";
import { WholeSalePage } from "./Pages/WholeSalePage/WholeSalePage";
import { OurMission } from "./Pages/OurMission/OurMission";
import { Collections } from "./Pages/Collections/Collections";
import { About } from "./Pages/About/About";
import { FAQPage } from "./Pages/FAQPage/FAQPage";
import { CheckoutPage } from "./Pages/CheckoutPage/CheckoutPage";
import { SuccessPage } from "./Pages/SuccessPage/SuccessPage";
import { TopNav } from "./Components/TopNav/TopNav";
import { MdOutlineVerticalAlignTop } from "react-icons/md";
import CartOffcanvas from "./Components/CartList/CartList";

function GlobalCart() {
  const {
    isOffCanvasOpen,
    closeCart,
    cart,
    removeFromCart,
    clearCart,
    incrementQuantity,
    decrementQuantity,
  } = useCart();

  return (
    <CartOffcanvas
      show={isOffCanvasOpen}
      onClose={closeCart}
      cart={cart}
      onRemoveFromCart={removeFromCart}
      onClearCart={clearCart}
      onIncrementQuantity={incrementQuantity}
      onDecrementQuantity={decrementQuantity}
    />
  );
}

function App() {
  return (
    <>
      {/* <SmoothScroll> */}
      <div id="top" />
      <CartProvider>
        <GlobalCart /> <ScrollToTop />
        <TopNav />
        <Routes>
          <Route path="/" element={<Home />} />{" "}
          <Route path="/product/:id" element={<ViewProductPage />} />{" "}
          <Route path="/contact-us" element={<ContactUs />} />{" "}
          <Route path="/order-form" element={<OrderForm />} />{" "}
          <Route path="/wholesale-page" element={<WholeSalePage />} />{" "}
          <Route path="/about-us" element={<About />} />{" "}
          <Route path="/our-mission" element={<OurMission />} />{" "}
          <Route path="/collections" element={<Collections />} />{" "}
          <Route path="/faqs" element={<FAQPage />} />{" "}
          <Route path="/checkout" element={<CheckoutPage />} />{" "}
          <Route path="/order-success" element={<SuccessPage />} />{" "}
        </Routes>
        <Footer />
      </CartProvider>{" "}
      {/* </SmoothScroll> */}
      <div className="bck-to-top">
        <a href="#top">
          <MdOutlineVerticalAlignTop />
        </a>
      </div>
    </>
  );
}

export default App;
