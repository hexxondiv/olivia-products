import React from "react";

import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./scrollToTop";
import { CartProvider, useCart } from "./CartContext";
import { ProductsProvider } from "./ProductsContext";
import { Footer } from "./Components/Footer/Footer";
import { TopNav } from "./Components/TopNav/TopNav";
import { MdOutlineVerticalAlignTop } from "react-icons/md";
import CartOffcanvas from "./Components/CartList/CartList";
import { CMSAuthProvider } from "./Contexts/CMSAuthContext";
import { CMSLogin } from "./Pages/CMS/CMSLogin";
import { CMSProtectedRoute } from "./Pages/CMS/CMSProtectedRoute";
import { CMSDashboard } from "./Pages/CMS/CMSDashboard";
import { CMSProducts } from "./Pages/CMS/CMSProducts";
import { CMSOrders } from "./Pages/CMS/CMSOrders";
import { CMSContacts } from "./Pages/CMS/CMSContacts";
import { CMSWholesale } from "./Pages/CMS/CMSWholesale";
import { CMSStock } from "./Pages/CMS/CMSStock";
import { PublicRoutes } from "./Pages/PublicRoutes";

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
      <CMSAuthProvider>
        <Routes>
          {/* CMS Routes */}
          <Route path="/cms/login" element={<CMSLogin />} />
          <Route
            path="/cms"
            element={
              <CMSProtectedRoute>
                <CMSDashboard />
              </CMSProtectedRoute>
            }
          />
          <Route
            path="/cms/products"
            element={
              <CMSProtectedRoute>
                <CMSProducts />
              </CMSProtectedRoute>
            }
          />
          <Route
            path="/cms/orders"
            element={
              <CMSProtectedRoute>
                <CMSOrders />
              </CMSProtectedRoute>
            }
          />
          <Route
            path="/cms/contacts"
            element={
              <CMSProtectedRoute>
                <CMSContacts />
              </CMSProtectedRoute>
            }
          />
          <Route
            path="/cms/wholesale"
            element={
              <CMSProtectedRoute>
                <CMSWholesale />
              </CMSProtectedRoute>
            }
          />
          <Route
            path="/cms/stock"
            element={
              <CMSProtectedRoute>
                <CMSStock />
              </CMSProtectedRoute>
            }
          />

          {/* Public Routes */}
          <Route
            path="/*"
            element={
              <ProductsProvider activeOnly={true}>
                <CartProvider>
                  <GlobalCart /> <ScrollToTop />
                  <TopNav />
                  <PublicRoutes />
                  <Footer />
                </CartProvider>
              </ProductsProvider>
            }
          />
        </Routes>
      </CMSAuthProvider>
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
