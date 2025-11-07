<?php
// Suppress any output from included files
@require_once __DIR__ . '/config.php';
@require_once __DIR__ . '/email-templates.php';

/**
 * Send email using Mailgun API
 */
function sendMailgunEmail($to, $subject, $htmlBody, $textBody = '') {
    // Validate email address
    if (empty($to) || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email address: $to");
    }
    
    // Validate required fields
    if (empty($subject)) {
        throw new Exception("Email subject is required");
    }
    
    if (empty($htmlBody)) {
        throw new Exception("Email body is required");
    }
    
    // Log email attempt
    error_log("Attempting to send email to: $to, Subject: $subject");
    
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, MAILGUN_API_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_USERPWD, 'api:' . MAILGUN_PRIVATE_KEY);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $postData = [
        'from' => MAILGUN_FROM_NAME . ' <' . MAILGUN_FROM_ADDRESS . '>',
        'to' => $to,
        'subject' => $subject,
        'html' => $htmlBody,
        'text' => $textBody ?: strip_tags($htmlBody),
        'h:Reply-To' => MAILGUN_REPLY_TO
    ];
    
    // Log post data (without sensitive info)
    error_log("Mailgun POST Data - To: $to, From: " . MAILGUN_FROM_ADDRESS . ", Subject: $subject");
    
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    $curlErrorNo = curl_errno($ch);
    curl_close($ch);
    
    // Log response details
    error_log("Mailgun API Response - HTTP Code: $httpCode, cURL Error: " . ($error ?: 'None'));
    if ($response) {
        error_log("Mailgun API Response Body: " . substr($response, 0, 500));
    }
    
    if ($curlErrorNo !== 0) {
        throw new Exception("cURL Error ($curlErrorNo): $error");
    }
    
    if ($error) {
        throw new Exception("cURL Error: $error");
    }
    
    if ($httpCode !== 200) {
        $responseData = json_decode($response, true);
        $errorMessage = 'Unknown error';
        
        if ($responseData && isset($responseData['message'])) {
            $errorMessage = $responseData['message'];
        } elseif ($response) {
            $errorMessage = "HTTP $httpCode: " . substr($response, 0, 200);
        }
        
        throw new Exception("Mailgun API Error ($httpCode): $errorMessage");
    }
    
    // Log success
    error_log("Email sent successfully to: $to");
    
    return true;
}

/**
 * Send order email to sales team
 */
function sendOrderEmailToSales($orderData) {
    $subject = 'New Order Received - ' . $orderData['orderId'];
    $htmlBody = getSalesOrderEmailTemplate($orderData);
    $textBody = getSalesOrderEmailTextTemplate($orderData);
    
    return sendMailgunEmail(SALES_EMAIL, $subject, $htmlBody, $textBody);
}

/**
 * Send order confirmation email to customer
 */
function sendOrderConfirmationToCustomer($orderData) {
    // Validate order data
    if (!isset($orderData['customer']['email'])) {
        throw new Exception("Customer email is required");
    }
    
    if (!isset($orderData['orderId'])) {
        throw new Exception("Order ID is required");
    }
    
    $customerEmail = $orderData['customer']['email'];
    $customerName = $orderData['customer']['fullName'] ?? 'Customer';
    $subject = 'Order Confirmation - ' . $orderData['orderId'];
    
    // Generate email templates
    $htmlBody = getCustomerOrderEmailTemplate($orderData);
    $textBody = getCustomerOrderEmailTextTemplate($orderData);
    
    // Validate templates were generated
    if (empty($htmlBody)) {
        throw new Exception("Failed to generate customer email HTML template");
    }
    
    if (empty($textBody)) {
        throw new Exception("Failed to generate customer email text template");
    }
    
    error_log("Sending customer confirmation email to: $customerEmail");
    error_log("Email subject: $subject");
    error_log("HTML body length: " . strlen($htmlBody) . " characters");
    error_log("Text body length: " . strlen($textBody) . " characters");
    
    return sendMailgunEmail($customerEmail, $subject, $htmlBody, $textBody);
}

/**
 * Send contact form email to team
 */
function sendContactEmailToTeam($contactData) {
    $subject = 'New Contact Form Submission - ' . $contactData['fullName'];
    $htmlBody = getContactFormEmailTemplate($contactData);
    $textBody = getContactFormEmailTextTemplate($contactData);
    
    return sendMailgunEmail(CONTACT_EMAIL, $subject, $htmlBody, $textBody);
}

/**
 * Send contact form acknowledgement email to customer
 */
function sendContactAcknowledgementToCustomer($contactData) {
    // Validate contact data
    if (!isset($contactData['email'])) {
        throw new Exception("Customer email is required for acknowledgement");
    }
    
    if (empty($contactData['email'])) {
        throw new Exception("Customer email cannot be empty");
    }
    
    $customerEmail = $contactData['email'];
    $customerName = $contactData['fullName'] ?? 'Customer';
    $subject = 'Thank You for Contacting Olivia Products';
    
    // Generate email templates
    $htmlBody = getContactAcknowledgementEmailTemplate($contactData);
    $textBody = getContactAcknowledgementEmailTextTemplate($contactData);
    
    // Validate templates were generated
    if (empty($htmlBody)) {
        throw new Exception("Failed to generate acknowledgement email HTML template");
    }
    
    if (empty($textBody)) {
        throw new Exception("Failed to generate acknowledgement email text template");
    }
    
    error_log("Sending contact acknowledgement email to: $customerEmail");
    error_log("Email subject: $subject");
    error_log("HTML body length: " . strlen($htmlBody) . " characters");
    error_log("Text body length: " . strlen($textBody) . " characters");
    
    return sendMailgunEmail($customerEmail, $subject, $htmlBody, $textBody);
}

/**
 * Send wholesale form email to team
 */
function sendWholesaleEmailToTeam($wholesaleData) {
    $formType = ucfirst(strtolower($wholesaleData['formType']));
    $subject = 'New ' . $formType . ' Partnership Inquiry - ' . $wholesaleData['businessName'];
    $htmlBody = getWholesaleFormEmailTemplate($wholesaleData);
    $textBody = getWholesaleFormEmailTextTemplate($wholesaleData);
    
    return sendMailgunEmail(CONTACT_EMAIL, $subject, $htmlBody, $textBody);
}

/**
 * Send wholesale form acknowledgement email to customer
 */
function sendWholesaleAcknowledgementToCustomer($wholesaleData) {
    // Validate wholesale data
    if (!isset($wholesaleData['email'])) {
        throw new Exception("Customer email is required for acknowledgement");
    }
    
    if (empty($wholesaleData['email'])) {
        throw new Exception("Customer email cannot be empty");
    }
    
    $customerEmail = $wholesaleData['email'];
    $formType = ucfirst(strtolower($wholesaleData['formType']));
    $subject = 'Thank You for Your ' . $formType . ' Partnership Inquiry - Olivia Products';
    
    // Generate email templates
    $htmlBody = getWholesaleAcknowledgementEmailTemplate($wholesaleData);
    $textBody = getWholesaleAcknowledgementEmailTextTemplate($wholesaleData);
    
    // Validate templates were generated
    if (empty($htmlBody)) {
        throw new Exception("Failed to generate acknowledgement email HTML template");
    }
    
    if (empty($textBody)) {
        throw new Exception("Failed to generate acknowledgement email text template");
    }
    
    error_log("Sending wholesale acknowledgement email to: $customerEmail");
    error_log("Email subject: $subject");
    error_log("HTML body length: " . strlen($htmlBody) . " characters");
    error_log("Text body length: " . strlen($textBody) . " characters");
    
    return sendMailgunEmail($customerEmail, $subject, $htmlBody, $textBody);
}

/**
 * Send order status update email to customer
 */
function sendOrderStatusUpdateToCustomer($orderData, $newStatus, $oldStatus = null) {
    // Validate order data
    if (!isset($orderData['customer']['email'])) {
        throw new Exception("Customer email is required");
    }
    
    if (!isset($orderData['orderId'])) {
        throw new Exception("Order ID is required");
    }
    
    $customerEmail = $orderData['customer']['email'];
    $customerName = $orderData['customer']['fullName'] ?? 'Customer';
    $orderId = $orderData['orderId'];
    
    // Status-specific subject lines
    $statusSubjects = [
        'pending' => 'Order Received - ' . $orderId,
        'processing' => 'Your Order is Being Processed - ' . $orderId,
        'shipped' => 'Your Order Has Shipped! - ' . $orderId,
        'delivered' => 'Your Order Has Been Delivered! - ' . $orderId,
        'cancelled' => 'Order Cancellation Notice - ' . $orderId
    ];
    
    $subject = $statusSubjects[$newStatus] ?? 'Order Status Update - ' . $orderId;
    
    // Generate email templates
    $htmlBody = getCustomerStatusUpdateEmailTemplate($orderData, $newStatus, $oldStatus);
    $textBody = getCustomerStatusUpdateEmailTextTemplate($orderData, $newStatus, $oldStatus);
    
    // Validate templates were generated
    if (empty($htmlBody)) {
        throw new Exception("Failed to generate status update email HTML template");
    }
    
    if (empty($textBody)) {
        throw new Exception("Failed to generate status update email text template");
    }
    
    error_log("Sending status update email to: $customerEmail");
    error_log("Email subject: $subject");
    error_log("Status changed from: " . ($oldStatus ?? 'N/A') . " to: $newStatus");
    
    return sendMailgunEmail($customerEmail, $subject, $htmlBody, $textBody);
}

/**
 * Send payment status update email to customer
 */
function sendPaymentStatusUpdateToCustomer($orderData, $isPaid) {
    // Validate order data
    if (!isset($orderData['customer']['email'])) {
        throw new Exception("Customer email is required");
    }
    
    if (!isset($orderData['orderId'])) {
        throw new Exception("Order ID is required");
    }
    
    $customerEmail = $orderData['customer']['email'];
    $customerName = $orderData['customer']['fullName'] ?? 'Customer';
    $orderId = $orderData['orderId'];
    
    // Payment status-specific subject lines
    $subject = $isPaid 
        ? 'Payment Received - ' . $orderId 
        : 'Payment Status Update - ' . $orderId;
    
    // Generate email templates
    $htmlBody = getCustomerPaymentStatusEmailTemplate($orderData, $isPaid);
    $textBody = getCustomerPaymentStatusEmailTextTemplate($orderData, $isPaid);
    
    // Validate templates were generated
    if (empty($htmlBody)) {
        throw new Exception("Failed to generate payment status email HTML template");
    }
    
    if (empty($textBody)) {
        throw new Exception("Failed to generate payment status email text template");
    }
    
    error_log("Sending payment status update email to: $customerEmail");
    error_log("Email subject: $subject");
    error_log("Payment status: " . ($isPaid ? 'Paid' : 'Not Paid'));
    
    return sendMailgunEmail($customerEmail, $subject, $htmlBody, $textBody);
}

