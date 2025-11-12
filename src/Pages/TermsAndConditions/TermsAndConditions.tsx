import React from "react";
import { Link } from "react-router-dom";
import "./terms-and-conditions.scss";

export const TermsAndConditions: React.FC = () => {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <div className="terms-header">
          <h1>Partnership Terms and Conditions</h1>
          <p className="last-updated">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="terms-content">
          <section className="terms-section">
            <h2>1. Introduction</h2>
            <p>
              Welcome to Olivia Products Nigeria Ltd Partnership Program. These Terms and Conditions ("Terms") govern your participation in our Wholesale, Distribution, and Retail partnership programs. By submitting a partnership application or entering into a partnership agreement with Olivia Products, you agree to be bound by these Terms.
            </p>
            <p>
              Please read these Terms carefully before applying for or entering into a partnership with us. If you do not agree with any part of these Terms, you should not proceed with the partnership application.
            </p>
          </section>

          <section className="terms-section">
            <h2>2. Partnership Types</h2>
            <div className="terms-subsection">
              <h3>2.1 Wholesale Partners</h3>
              <ul>
                <li>Wholesale partners purchase products in bulk at wholesale prices</li>
                <li>Minimum order quantities apply as specified in the partnership agreement</li>
                <li>Products are intended for resale or corporate use</li>
                <li>Pricing is subject to volume discounts and may vary based on order size</li>
              </ul>
            </div>
            <div className="terms-subsection">
              <h3>2.2 Distribution Partners</h3>
              <ul>
                <li>Distribution partners operate within exclusive or non-exclusive territories</li>
                <li>Territory assignments are determined by Olivia Products at our sole discretion</li>
                <li>Distribution partners must meet minimum sales targets as specified in the agreement</li>
                <li>Special pricing and support are provided to qualified distribution partners</li>
              </ul>
            </div>
            <div className="terms-subsection">
              <h3>2.3 Retail Partners</h3>
              <ul>
                <li>Retail partners stock and sell Olivia Products in their retail locations</li>
                <li>Retail partners must maintain appropriate inventory levels</li>
                <li>Products must be displayed and marketed in accordance with our brand guidelines</li>
                <li>Retail partners may be required to participate in promotional activities</li>
              </ul>
            </div>
          </section>

          <section className="terms-section">
            <h2>3. Application and Approval Process</h2>
            <ul>
              <li>All partnership applications are subject to review and approval by Olivia Products</li>
              <li>We reserve the right to accept or reject any application at our sole discretion</li>
              <li>Review process typically takes 5-7 business days</li>
              <li>Approved partners will receive a formal partnership agreement</li>
              <li>Partnership agreements must be signed and returned within 30 days of approval</li>
              <li>We may request additional information or documentation during the review process</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>4. Pricing and Payment Terms</h2>
            <div className="terms-subsection">
              <h3>4.1 Pricing</h3>
              <ul>
                <li>All prices are quoted in Nigerian Naira (₦) unless otherwise specified</li>
                <li>Prices are subject to change with 30 days written notice</li>
                <li>Volume discounts apply based on order quantities</li>
                <li>Special pricing may be available for qualified partners</li>
              </ul>
            </div>
            <div className="terms-subsection">
              <h3>4.2 Payment Terms</h3>
              <ul>
                <li>Payment terms are specified in the individual partnership agreement</li>
                <li>Standard payment terms: Net 30 days from invoice date</li>
                <li>Credit terms may be available to qualified partners</li>
                <li>Late payments may result in suspension of partnership privileges</li>
                <li>All payments must be made in the currency specified in the agreement</li>
              </ul>
            </div>
          </section>

          <section className="terms-section">
            <h2>5. Ordering and Delivery</h2>
            <ul>
              <li>Orders must be placed through approved channels as specified in the partnership agreement</li>
              <li>Minimum order quantities apply and vary by product and partnership type</li>
              <li>Delivery times are estimates and not guaranteed</li>
              <li>Shipping costs are the responsibility of the partner unless otherwise specified</li>
              <li>Partners are responsible for inspecting goods upon delivery</li>
              <li>Claims for damaged or incorrect shipments must be reported within 48 hours of delivery</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>6. Product Quality and Warranties</h2>
            <ul>
              <li>Olivia Products guarantees that all products meet our quality standards</li>
              <li>Products are manufactured in accordance with applicable regulations and standards</li>
              <li>Warranties are limited to those specified in the product documentation</li>
              <li>Partners must handle and store products in accordance with our guidelines</li>
              <li>We reserve the right to inspect partner facilities for compliance</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>7. Marketing and Brand Guidelines</h2>
            <ul>
              <li>Partners must use Olivia Products branding and marketing materials in accordance with our brand guidelines</li>
              <li>Unauthorized use of our trademarks, logos, or intellectual property is prohibited</li>
              <li>Marketing materials must be approved by Olivia Products before use</li>
              <li>Partners may be required to participate in joint marketing activities</li>
              <li>False or misleading advertising about our products is strictly prohibited</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>8. Sales Targets and Performance</h2>
            <ul>
              <li>Partners may be required to meet minimum sales targets as specified in the agreement</li>
              <li>Performance reviews are conducted periodically</li>
              <li>Failure to meet performance standards may result in partnership termination</li>
              <li>Partners must provide regular sales reports as requested</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>9. Intellectual Property</h2>
            <ul>
              <li>All intellectual property rights in Olivia Products, including trademarks, logos, and product designs, remain the property of Olivia Products</li>
              <li>Partners are granted a limited, non-exclusive license to use our intellectual property solely for the purpose of the partnership</li>
              <li>This license terminates upon termination of the partnership</li>
              <li>Partners may not register or claim ownership of any Olivia Products intellectual property</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>10. Confidentiality</h2>
            <ul>
              <li>Partners agree to keep confidential all proprietary information disclosed by Olivia Products</li>
              <li>Confidential information includes pricing, product specifications, marketing strategies, and business plans</li>
              <li>Confidentiality obligations survive termination of the partnership</li>
              <li>Partners may not disclose confidential information to third parties without written consent</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>11. Termination</h2>
            <div className="terms-subsection">
              <h3>11.1 Termination by Olivia Products</h3>
              <p>We may terminate a partnership agreement immediately if:</p>
              <ul>
                <li>The partner breaches any material term of the agreement</li>
                <li>The partner fails to meet performance standards</li>
                <li>The partner engages in fraudulent or illegal activities</li>
                <li>The partner violates our brand guidelines or intellectual property rights</li>
              </ul>
            </div>
            <div className="terms-subsection">
              <h3>11.2 Termination by Partner</h3>
              <p>Partners may terminate the agreement with 90 days written notice, subject to:</p>
              <ul>
                <li>Fulfillment of all outstanding orders</li>
                <li>Payment of all amounts due</li>
                <li>Return or disposal of marketing materials as directed</li>
              </ul>
            </div>
          </section>

          <section className="terms-section">
            <h2>12. Limitation of Liability</h2>
            <ul>
              <li>Olivia Products' liability is limited to the value of products purchased by the partner</li>
              <li>We are not liable for indirect, consequential, or incidental damages</li>
              <li>Partners are responsible for their own business decisions and operations</li>
              <li>Our liability is limited to the maximum extent permitted by law</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>13. Dispute Resolution</h2>
            <ul>
              <li>Disputes will first be addressed through good faith negotiations</li>
              <li>If negotiations fail, disputes will be resolved through mediation</li>
              <li>Mediation will be conducted in Lagos, Nigeria</li>
              <li>If mediation fails, disputes will be resolved through binding arbitration</li>
              <li>Arbitration will be conducted in accordance with Nigerian arbitration laws</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>14. Governing Law</h2>
            <p>
              These Terms and any partnership agreements are governed by the laws of the Federal Republic of Nigeria. Any legal proceedings shall be conducted in the courts of Lagos, Nigeria.
            </p>
          </section>

          <section className="terms-section">
            <h2>15. Modifications to Terms</h2>
            <ul>
              <li>Olivia Products reserves the right to modify these Terms at any time</li>
              <li>Partners will be notified of material changes with 30 days notice</li>
              <li>Continued partnership after changes constitutes acceptance of modified Terms</li>
              <li>Partners may terminate the agreement if they do not agree to modifications</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>16. Contact Information</h2>
            <p>For questions about these Terms or partnership inquiries, please contact:</p>
            <div className="contact-info">
              <p><strong>Olivia Products Nigeria Ltd</strong></p>
              <p>Okaka plaza suite 1 first Avenue festac town, Lagos State</p>
              <p><strong>Email:</strong> <a href="mailto:Info@celineolivia.com">Info@celineolivia.com</a></p>
              <p><strong>Phone (Lagos):</strong> +234 901 419 6902</p>
              <p><strong>WhatsApp:</strong> +234 912 350 9090</p>
              <p><strong>Business Hours:</strong> Monday - Friday, 8am - 5pm</p>
            </div>
          </section>

          <section className="terms-section">
            <h2>17. Acceptance</h2>
            <p>
              By submitting a partnership application or signing a partnership agreement, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these Terms, you should not proceed with the partnership application.
            </p>
          </section>

          <div className="terms-footer">
            <Link to="/wholesale-page" className="back-link">
              ← Back to Partnership Application
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

