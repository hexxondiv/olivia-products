<?php

/**
 * Format product name for display
 * Ensures "Olivia" prefix and proper formatting
 */
function formatProductName($productName) {
    $name = trim($productName);
    
    // If name doesn't start with "Olivia", add it
    if (stripos($name, 'Olivia') !== 0) {
        $name = 'Olivia ' . $name;
    }
    
    return $name;
}

/**
 * Get sales team order email template (HTML with Bootstrap)
 */
function getSalesOrderEmailTemplate($orderData) {
    $orderId = $orderData['orderId'];
    $orderDate = date('F j, Y \a\t g:i A', strtotime($orderData['orderDate']));
    $customer = $orderData['customer'];
    $items = $orderData['items'];
    $total = number_format($orderData['total'], 2);
    
    $itemsHtml = '';
    foreach ($items as $item) {
        $itemTotal = number_format($item['productPrice'] * $item['quantity'], 2);
        $formattedName = formatProductName($item['productName']);
        $itemsHtml .= '
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
                <img src="' . htmlspecialchars($item['firstImg']) . '" alt="' . htmlspecialchars($formattedName) . '" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e0e0e0;">
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
                <strong>' . htmlspecialchars($formattedName) . '</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">
                ' . htmlspecialchars($item['quantity']) . '
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">
                ₦' . number_format($item['productPrice'], 2) . '
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">
                <strong>₦' . $itemTotal . '</strong>
            </td>
        </tr>';
    }
    
    $shippingAddress = htmlspecialchars($customer['address']) . ', ' . 
                      htmlspecialchars($customer['city']) . ', ' . 
                      htmlspecialchars($customer['state']) . 
                      (!empty($customer['postalCode']) ? ' ' . htmlspecialchars($customer['postalCode']) : '');
    
    return '
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order - ' . $orderId . '</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .email-container { max-width: 800px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #003057 0%, #4b3d97 100%); color: #ffffff; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .order-badge { display: inline-block; background-color: #7bbd21; color: #ffffff; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-bottom: 20px; }
        .info-box { background-color: #f5f9ff; border-left: 4px solid #003057; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th { background-color: #003057; color: #ffffff; padding: 12px; text-align: left; font-weight: 600; }
        .total-row { background-color: #f5f9ff; font-weight: bold; font-size: 1.1em; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">New Order Received</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Order #' . htmlspecialchars($orderId) . '</p>
        </div>
        
        <div class="content">
            <div class="order-badge">Order ID: ' . htmlspecialchars($orderId) . '</div>
            <p style="color: #6c757d; margin-bottom: 20px;">Order Date: ' . $orderDate . '</p>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="info-box">
                        <h3 style="margin-top: 0; color: #003057;">Customer Information</h3>
                        <p><strong>Name:</strong> ' . htmlspecialchars($customer['fullName']) . '</p>
                        <p><strong>Email:</strong> <a href="mailto:' . htmlspecialchars($customer['email']) . '">' . htmlspecialchars($customer['email']) . '</a></p>
                        <p><strong>Phone:</strong> <a href="tel:' . htmlspecialchars($customer['phone']) . '">' . htmlspecialchars($customer['phone']) . '</a></p>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="info-box">
                        <h3 style="margin-top: 0; color: #003057;">Shipping Address</h3>
                        <p>' . $shippingAddress . '</p>
                    </div>
                </div>
            </div>
            
            <h3 style="color: #003057; margin-top: 30px;">Order Items</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Product</th>
                        <th style="text-align: center;">Quantity</th>
                        <th style="text-align: right;">Unit Price</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ' . $itemsHtml . '
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="4" style="text-align: right; padding: 15px;">Total Amount:</td>
                        <td style="text-align: right; padding: 15px; font-size: 1.2em;">₦' . $total . '</td>
                    </tr>
                </tfoot>
            </table>
            
            ' . (!empty($customer['notes']) ? '
            <div class="info-box">
                <h4 style="margin-top: 0; color: #003057;">Customer Notes</h4>
                <p style="margin: 0;">' . nl2br(htmlspecialchars($customer['notes'])) . '</p>
            </div>
            ' : '') . '
        </div>
        
        <div class="footer">
            <p style="margin: 0;">This is an automated email from Olivia Products order system.</p>
            <p style="margin: 5px 0 0 0;">Please process this order promptly.</p>
        </div>
    </div>
</body>
</html>';
}

/**
 * Get sales team order email template (Plain Text)
 */
function getSalesOrderEmailTextTemplate($orderData) {
    $orderId = $orderData['orderId'];
    $orderDate = date('F j, Y \a\t g:i A', strtotime($orderData['orderDate']));
    $customer = $orderData['customer'];
    $items = $orderData['items'];
    $total = number_format($orderData['total'], 2);
    
    $text = "NEW ORDER RECEIVED\n";
    $text .= "==================\n\n";
    $text .= "Order ID: $orderId\n";
    $text .= "Order Date: $orderDate\n\n";
    
    $text .= "CUSTOMER INFORMATION\n";
    $text .= "--------------------\n";
    $text .= "Name: {$customer['fullName']}\n";
    $text .= "Email: {$customer['email']}\n";
    $text .= "Phone: {$customer['phone']}\n\n";
    
    $text .= "SHIPPING ADDRESS\n";
    $text .= "----------------\n";
    $text .= $customer['address'] . ", " . $customer['city'] . ", " . $customer['state'];
    if (!empty($customer['postalCode'])) {
        $text .= " " . $customer['postalCode'];
    }
    $text .= "\n\n";
    
    $text .= "ORDER ITEMS\n";
    $text .= "-----------\n";
    foreach ($items as $item) {
        $itemTotal = number_format($item['productPrice'] * $item['quantity'], 2);
        $formattedName = formatProductName($item['productName']);
        $text .= "- {$formattedName} (Qty: {$item['quantity']}) - ₦{$itemTotal}\n";
    }
    $text .= "\n";
    $text .= "TOTAL: ₦$total\n\n";
    
    if (!empty($customer['notes'])) {
        $text .= "CUSTOMER NOTES\n";
        $text .= "--------------\n";
        $text .= $customer['notes'] . "\n\n";
    }
    
    return $text;
}

/**
 * Get customer order confirmation email template (HTML with Bootstrap)
 */
function getCustomerOrderEmailTemplate($orderData) {
    $orderId = $orderData['orderId'];
    $orderDate = date('F j, Y \a\t g:i A', strtotime($orderData['orderDate']));
    $customer = $orderData['customer'];
    $items = $orderData['items'];
    $total = number_format($orderData['total'], 2);
    
    $itemsHtml = '';
    foreach ($items as $item) {
        $itemTotal = number_format($item['productPrice'] * $item['quantity'], 2);
        $formattedName = formatProductName($item['productName']);
        $itemsHtml .= '
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
                <img src="' . htmlspecialchars($item['firstImg']) . '" alt="' . htmlspecialchars($formattedName) . '" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e0e0e0;">
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
                <strong>' . htmlspecialchars($formattedName) . '</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">
                ' . htmlspecialchars($item['quantity']) . '
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">
                ₦' . number_format($item['productPrice'], 2) . '
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">
                <strong>₦' . $itemTotal . '</strong>
            </td>
        </tr>';
    }
    
    return '
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - ' . $orderId . '</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .email-container { max-width: 800px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #003057 0%, #4b3d97 100%); color: #ffffff; padding: 40px 30px; text-align: center; }
        .success-icon { font-size: 60px; color: #7bbd21; margin-bottom: 20px; }
        .content { padding: 30px; }
        .order-badge { display: inline-block; background-color: #7bbd21; color: #ffffff; padding: 10px 20px; border-radius: 25px; font-weight: bold; margin-bottom: 20px; font-size: 1.1em; }
        .info-box { background-color: #f5f9ff; border-left: 4px solid #7bbd21; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th { background-color: #003057; color: #ffffff; padding: 12px; text-align: left; font-weight: 600; }
        .total-row { background-color: #f5f9ff; font-weight: bold; font-size: 1.2em; color: #7bbd21; }
        .next-steps { background-color: #fff9e6; border: 2px solid #ffc857; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; }
        .btn { display: inline-block; padding: 12px 30px; background-color: #7bbd21; color: #ffffff; text-decoration: none; border-radius: 25px; font-weight: 600; margin: 10px 5px; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="success-icon">✓</div>
            <h1 style="margin: 0; font-size: 32px;">Thank You for Your Order!</h1>
            <p style="margin: 15px 0 0 0; font-size: 18px;">We\'ve received your order and will process it shortly</p>
        </div>
        
        <div class="content">
            <div style="text-align: center; margin-bottom: 30px;">
                <div class="order-badge">Order #' . htmlspecialchars($orderId) . '</div>
                <p style="color: #6c757d; margin: 10px 0;">Order Date: ' . $orderDate . '</p>
            </div>
            
            <div class="info-box">
                <h3 style="margin-top: 0; color: #003057;">Hello ' . htmlspecialchars($customer['fullName']) . '!</h3>
                <p style="margin: 0; line-height: 1.6;">Thank you for choosing Olivia Products. We have successfully received your order and our team will contact you within 24 hours to confirm the details and arrange for delivery.</p>
            </div>
            
            <h3 style="color: #003057; margin-top: 30px;">Order Summary</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Product</th>
                        <th style="text-align: center;">Quantity</th>
                        <th style="text-align: right;">Unit Price</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ' . $itemsHtml . '
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="4" style="text-align: right; padding: 15px;">Total Amount:</td>
                        <td style="text-align: right; padding: 15px;">₦' . $total . '</td>
                    </tr>
                </tfoot>
            </table>
            
            <div class="info-box">
                <h4 style="margin-top: 0; color: #003057;">Shipping Address</h4>
                <p style="margin: 0;">
                    ' . htmlspecialchars($customer['fullName']) . '<br>
                    ' . htmlspecialchars($customer['address']) . '<br>
                    ' . htmlspecialchars($customer['city']) . ', ' . htmlspecialchars($customer['state']) . 
                    (!empty($customer['postalCode']) ? ' ' . htmlspecialchars($customer['postalCode']) : '') . '<br>
                    Phone: ' . htmlspecialchars($customer['phone']) . '
                </p>
            </div>
            
            <div class="next-steps">
                <h4 style="margin-top: 0; color: #003057;">What\'s Next?</h4>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>You will receive a confirmation call from our team within 24 hours</li>
                    <li>We\'ll process your order and prepare it for shipping</li>
                    <li>You\'ll receive tracking information once your order ships</li>
                    <li>If you have any questions, please contact us at ' . MAILGUN_REPLY_TO . '</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://oliviaproducts.com" class="btn">Visit Our Website</a>
                <a href="mailto:' . MAILGUN_REPLY_TO . '" class="btn" style="background-color: #003057;">Contact Us</a>
            </div>
        </div>
        
        <div class="footer">
            <p style="margin: 0; font-weight: 600; color: #003057;">Olivia Products</p>
            <p style="margin: 5px 0;">Thank you for your business!</p>
            <p style="margin: 10px 0 0 0; font-size: 0.9em;">This is an automated confirmation email. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>';
}

/**
 * Get customer order confirmation email template (Plain Text)
 */
function getCustomerOrderEmailTextTemplate($orderData) {
    $orderId = $orderData['orderId'];
    $orderDate = date('F j, Y \a\t g:i A', strtotime($orderData['orderDate']));
    $customer = $orderData['customer'];
    $items = $orderData['items'];
    $total = number_format($orderData['total'], 2);
    
    $text = "THANK YOU FOR YOUR ORDER!\n";
    $text .= "========================\n\n";
    $text .= "Hello {$customer['fullName']}!\n\n";
    $text .= "Thank you for choosing Olivia Products. We have successfully received your order and our team will contact you within 24 hours to confirm the details and arrange for delivery.\n\n";
    
    $text .= "ORDER DETAILS\n";
    $text .= "-------------\n";
    $text .= "Order ID: $orderId\n";
    $text .= "Order Date: $orderDate\n\n";
    
    $text .= "ORDER ITEMS\n";
    $text .= "-----------\n";
    foreach ($items as $item) {
        $itemTotal = number_format($item['productPrice'] * $item['quantity'], 2);
        $formattedName = formatProductName($item['productName']);
        $text .= "- {$formattedName} (Qty: {$item['quantity']}) - ₦{$itemTotal}\n";
    }
    $text .= "\n";
    $text .= "TOTAL: ₦$total\n\n";
    
    $text .= "SHIPPING ADDRESS\n";
    $text .= "---------------\n";
    $text .= "{$customer['fullName']}\n";
    $text .= "{$customer['address']}\n";
    $text .= "{$customer['city']}, {$customer['state']}";
    if (!empty($customer['postalCode'])) {
        $text .= " {$customer['postalCode']}";
    }
    $text .= "\n";
    $text .= "Phone: {$customer['phone']}\n\n";
    
    $text .= "WHAT'S NEXT?\n";
    $text .= "------------\n";
    $text .= "- You will receive a confirmation call from our team within 24 hours\n";
    $text .= "- We'll process your order and prepare it for shipping\n";
    $text .= "- You'll receive tracking information once your order ships\n";
    $text .= "- If you have any questions, please contact us at " . MAILGUN_REPLY_TO . "\n\n";
    
    $text .= "Thank you for your business!\n\n";
    $text .= "Olivia Products\n";
    $text .= "This is an automated confirmation email. Please do not reply to this email.\n";
    
    return $text;
}

/**
 * Get contact form email template for team (HTML with Bootstrap)
 */
function getContactFormEmailTemplate($contactData) {
    $submittedAt = date('F j, Y \a\t g:i A', strtotime($contactData['submittedAt']));
    $fullName = htmlspecialchars($contactData['fullName']);
    $email = !empty($contactData['email']) ? htmlspecialchars($contactData['email']) : 'Not provided';
    $phone = htmlspecialchars($contactData['phone']);
    $address = !empty($contactData['address']) ? htmlspecialchars($contactData['address']) : 'Not provided';
    $message = nl2br(htmlspecialchars($contactData['message']));
    
    return '
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .email-container { max-width: 800px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #003057 0%, #4b3d97 100%); color: #ffffff; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .contact-badge { display: inline-block; background-color: #7bbd21; color: #ffffff; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-bottom: 20px; }
        .info-box { background-color: #f5f9ff; border-left: 4px solid #003057; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .message-box { background-color: #ffffff; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0; min-height: 100px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 0.9em; }
        .info-row { margin-bottom: 15px; }
        .info-label { font-weight: 600; color: #003057; display: inline-block; min-width: 120px; }
        .info-value { color: #333333; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">New Contact Form Submission</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Someone has contacted you through the website</p>
        </div>
        
        <div class="content">
            <div class="contact-badge">Contact Form Submission</div>
            <p style="color: #6c757d; margin-bottom: 20px;">Submitted: ' . $submittedAt . '</p>
            
            <div class="row">
                <div class="col-md-12">
                    <div class="info-box">
                        <h3 style="margin-top: 0; color: #003057;">Contact Information</h3>
                        <div class="info-row">
                            <span class="info-label">Full Name:</span>
                            <span class="info-value">' . $fullName . '</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Email:</span>
                            <span class="info-value">' . ($email !== 'Not provided' ? '<a href="mailto:' . $email . '">' . $email . '</a>' : $email) . '</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Phone:</span>
                            <span class="info-value"><a href="tel:' . $phone . '">' . $phone . '</a></span>
                        </div>
                        ' . ($address !== 'Not provided' ? '
                        <div class="info-row">
                            <span class="info-label">Address:</span>
                            <span class="info-value">' . $address . '</span>
                        </div>
                        ' : '') . '
                    </div>
                </div>
            </div>
            
            <div class="info-box">
                <h3 style="margin-top: 0; color: #003057;">Message</h3>
                <div class="message-box">
                    ' . $message . '
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="mailto:' . ($email !== 'Not provided' ? htmlspecialchars($email) : htmlspecialchars(CONTACT_EMAIL)) . '" style="display: inline-block; padding: 12px 30px; background-color: #7bbd21; color: #ffffff; text-decoration: none; border-radius: 25px; font-weight: 600;">Reply to Contact</a>
            </div>
        </div>
        
        <div class="footer">
            <p style="margin: 0;">This is an automated email from Olivia Products contact form system.</p>
            <p style="margin: 5px 0 0 0;">Please respond to this inquiry promptly.</p>
        </div>
    </div>
</body>
</html>';
}

/**
 * Get contact form email template for team (Plain Text)
 */
function getContactFormEmailTextTemplate($contactData) {
    $submittedAt = date('F j, Y \a\t g:i A', strtotime($contactData['submittedAt']));
    $fullName = $contactData['fullName'];
    $email = !empty($contactData['email']) ? $contactData['email'] : 'Not provided';
    $phone = $contactData['phone'];
    $address = !empty($contactData['address']) ? $contactData['address'] : 'Not provided';
    $message = $contactData['message'];
    
    $text = "NEW CONTACT FORM SUBMISSION\n";
    $text .= "==========================\n\n";
    $text .= "Submitted: $submittedAt\n\n";
    
    $text .= "CONTACT INFORMATION\n";
    $text .= "-------------------\n";
    $text .= "Full Name: $fullName\n";
    $text .= "Email: $email\n";
    $text .= "Phone: $phone\n";
    if ($address !== 'Not provided') {
        $text .= "Address: $address\n";
    }
    $text .= "\n";
    
    $text .= "MESSAGE\n";
    $text .= "-------\n";
    $text .= "$message\n\n";
    
    $text .= "This is an automated email from Olivia Products contact form system.\n";
    $text .= "Please respond to this inquiry promptly.\n";
    
    return $text;
}

/**
 * Get contact form acknowledgement email template for customer (HTML with Bootstrap)
 */
function getContactAcknowledgementEmailTemplate($contactData) {
    $fullName = htmlspecialchars($contactData['fullName']);
    $submittedAt = date('F j, Y \a\t g:i A', strtotime($contactData['submittedAt']));
    
    return '
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Contacting Us</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .email-container { max-width: 800px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #003057 0%, #4b3d97 100%); color: #ffffff; padding: 40px 30px; text-align: center; }
        .success-icon { font-size: 60px; color: #7bbd21; margin-bottom: 20px; }
        .content { padding: 30px; }
        .info-box { background-color: #f5f9ff; border-left: 4px solid #7bbd21; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .next-steps { background-color: #fff9e6; border: 2px solid #ffc857; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; }
        .btn { display: inline-block; padding: 12px 30px; background-color: #7bbd21; color: #ffffff; text-decoration: none; border-radius: 25px; font-weight: 600; margin: 10px 5px; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="success-icon">✓</div>
            <h1 style="margin: 0; font-size: 32px;">Thank You for Contacting Us!</h1>
            <p style="margin: 15px 0 0 0; font-size: 18px;">We\'ve received your message and will get back to you soon</p>
        </div>
        
        <div class="content">
            <div class="info-box">
                <h3 style="margin-top: 0; color: #003057;">Hello ' . $fullName . '!</h3>
                <p style="margin: 0; line-height: 1.6;">Thank you for reaching out to Olivia Products. We have successfully received your message submitted on ' . $submittedAt . ' and our team will review it and respond to you as soon as possible.</p>
            </div>
            
            <div class="next-steps">
                <h4 style="margin-top: 0; color: #003057;">What\'s Next?</h4>
                <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                    <li>Our team will review your message within 24 hours</li>
                    <li>We\'ll respond to your inquiry via email or phone</li>
                    <li>For urgent matters, please call us at +234 901 419 6902</li>
                    <li>You can also reach us via WhatsApp at +234 912 350 9090</li>
                </ul>
            </div>
            
            <div class="info-box">
                <h4 style="margin-top: 0; color: #003057;">Our Contact Information</h4>
                <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:' . MAILGUN_REPLY_TO . '">' . MAILGUN_REPLY_TO . '</a></p>
                <p style="margin: 5px 0;"><strong>Phone (Lagos):</strong> +234 901 419 6902</p>
                <p style="margin: 5px 0;"><strong>WhatsApp:</strong> +234 912 350 9090</p>
                <p style="margin: 5px 0;"><strong>Business Hours:</strong> Monday - Friday, 8am - 5pm</p>
                <p style="margin: 5px 0;"><strong>Location:</strong> Okaka plaza suite 1 first Avenue festac town, Lagos State</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://oliviaproducts.com" class="btn">Visit Our Website</a>
                <a href="mailto:' . MAILGUN_REPLY_TO . '" class="btn" style="background-color: #003057;">Contact Us</a>
            </div>
        </div>
        
        <div class="footer">
            <p style="margin: 0; font-weight: 600; color: #003057;">Olivia Products</p>
            <p style="margin: 5px 0;">We appreciate your interest in our products!</p>
            <p style="margin: 10px 0 0 0; font-size: 0.9em;">This is an automated acknowledgement email. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>';
}

/**
 * Get contact form acknowledgement email template for customer (Plain Text)
 */
function getContactAcknowledgementEmailTextTemplate($contactData) {
    $fullName = $contactData['fullName'];
    $submittedAt = date('F j, Y \a\t g:i A', strtotime($contactData['submittedAt']));
    
    $text = "THANK YOU FOR CONTACTING US!\n";
    $text .= "============================\n\n";
    $text .= "Hello $fullName!\n\n";
    $text .= "Thank you for reaching out to Olivia Products. We have successfully received your message submitted on $submittedAt and our team will review it and respond to you as soon as possible.\n\n";
    
    $text .= "WHAT'S NEXT?\n";
    $text .= "------------\n";
    $text .= "- Our team will review your message within 24 hours\n";
    $text .= "- We'll respond to your inquiry via email or phone\n";
    $text .= "- For urgent matters, please call us at +234 901 419 6902\n";
    $text .= "- You can also reach us via WhatsApp at +234 912 350 9090\n\n";
    
    $text .= "OUR CONTACT INFORMATION\n";
    $text .= "-----------------------\n";
    $text .= "Email: " . MAILGUN_REPLY_TO . "\n";
    $text .= "Phone (Lagos): +234 901 419 6902\n";
    $text .= "WhatsApp: +234 912 350 9090\n";
    $text .= "Business Hours: Monday - Friday, 8am - 5pm\n";
    $text .= "Location: Okaka plaza suite 1 first Avenue festac town, Lagos State\n\n";
    
    $text .= "We appreciate your interest in our products!\n\n";
    $text .= "Olivia Products\n";
    $text .= "This is an automated acknowledgement email. Please do not reply to this email.\n";
    
    return $text;
}

/**
 * Get wholesale form email template for team (HTML with Bootstrap)
 */
function getWholesaleFormEmailTemplate($wholesaleData) {
    $formType = ucfirst(strtolower($wholesaleData['formType']));
    $submittedAt = date('F j, Y \a\t g:i A', strtotime($wholesaleData['submittedAt']));
    $firstName = htmlspecialchars($wholesaleData['firstName']);
    $lastName = !empty($wholesaleData['lastName']) ? htmlspecialchars($wholesaleData['lastName']) : '';
    $fullName = trim($firstName . ' ' . $lastName);
    $email = htmlspecialchars($wholesaleData['email']);
    $phone = htmlspecialchars($wholesaleData['phone']);
    $businessName = htmlspecialchars($wholesaleData['businessName']);
    $website = !empty($wholesaleData['website']) ? htmlspecialchars($wholesaleData['website']) : 'Not provided';
    $city = htmlspecialchars($wholesaleData['city']);
    $state = htmlspecialchars($wholesaleData['state']);
    $country = htmlspecialchars($wholesaleData['country']);
    $aboutBusiness = nl2br(htmlspecialchars($wholesaleData['aboutBusiness']));
    $businessTypes = !empty($wholesaleData['businessTypes']) && is_array($wholesaleData['businessTypes']) 
        ? $wholesaleData['businessTypes'] 
        : [];
    
    $businessTypesHtml = '';
    if (!empty($businessTypes)) {
        $businessTypesHtml = '<ul style="margin: 10px 0; padding-left: 20px;">';
        foreach ($businessTypes as $type) {
            $businessTypesHtml .= '<li>' . htmlspecialchars($type) . '</li>';
        }
        $businessTypesHtml .= '</ul>';
    } else {
        $businessTypesHtml = '<p style="color: #6c757d; font-style: italic;">No business types selected</p>';
    }
    
    return '
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New ' . $formType . ' Form Submission</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .email-container { max-width: 800px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #003057 0%, #4b3d97 100%); color: #ffffff; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .form-badge { display: inline-block; background-color: #7bbd21; color: #ffffff; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-bottom: 20px; }
        .info-box { background-color: #f5f9ff; border-left: 4px solid #003057; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .message-box { background-color: #ffffff; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0; min-height: 100px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 0.9em; }
        .info-row { margin-bottom: 15px; }
        .info-label { font-weight: 600; color: #003057; display: inline-block; min-width: 150px; }
        .info-value { color: #333333; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">New ' . $formType . ' Form Submission</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Someone has submitted a ' . strtolower($formType) . ' partnership inquiry</p>
        </div>
        
        <div class="content">
            <div class="form-badge">' . $formType . ' Partnership Inquiry</div>
            <p style="color: #6c757d; margin-bottom: 20px;">Submitted: ' . $submittedAt . '</p>
            
            <div class="row">
                <div class="col-md-12">
                    <div class="info-box">
                        <h3 style="margin-top: 0; color: #003057;">Contact Information</h3>
                        <div class="info-row">
                            <span class="info-label">Full Name:</span>
                            <span class="info-value">' . $fullName . '</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Email:</span>
                            <span class="info-value"><a href="mailto:' . $email . '">' . $email . '</a></span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Phone:</span>
                            <span class="info-value"><a href="tel:' . $phone . '">' . $phone . '</a></span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-12">
                    <div class="info-box">
                        <h3 style="margin-top: 0; color: #003057;">Business Information</h3>
                        <div class="info-row">
                            <span class="info-label">Business Name:</span>
                            <span class="info-value">' . $businessName . '</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Website:</span>
                            <span class="info-value">' . ($website !== 'Not provided' ? '<a href="' . $website . '" target="_blank">' . $website . '</a>' : $website) . '</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Location:</span>
                            <span class="info-value">' . $city . ', ' . $state . ', ' . $country . '</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="info-box">
                <h3 style="margin-top: 0; color: #003057;">Type of Business</h3>
                ' . $businessTypesHtml . '
            </div>
            
            <div class="info-box">
                <h3 style="margin-top: 0; color: #003057;">About the Business</h3>
                <div class="message-box">
                    ' . $aboutBusiness . '
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="mailto:' . $email . '" style="display: inline-block; padding: 12px 30px; background-color: #7bbd21; color: #ffffff; text-decoration: none; border-radius: 25px; font-weight: 600;">Reply to Inquiry</a>
            </div>
        </div>
        
        <div class="footer">
            <p style="margin: 0;">This is an automated email from Olivia Products ' . strtolower($formType) . ' partnership form system.</p>
            <p style="margin: 5px 0 0 0;">Please respond to this inquiry promptly.</p>
        </div>
    </div>
</body>
</html>';
}

/**
 * Get wholesale form email template for team (Plain Text)
 */
function getWholesaleFormEmailTextTemplate($wholesaleData) {
    $formType = ucfirst(strtolower($wholesaleData['formType']));
    $submittedAt = date('F j, Y \a\t g:i A', strtotime($wholesaleData['submittedAt']));
    $firstName = $wholesaleData['firstName'];
    $lastName = !empty($wholesaleData['lastName']) ? $wholesaleData['lastName'] : '';
    $fullName = trim($firstName . ' ' . $lastName);
    $email = $wholesaleData['email'];
    $phone = $wholesaleData['phone'];
    $businessName = $wholesaleData['businessName'];
    $website = !empty($wholesaleData['website']) ? $wholesaleData['website'] : 'Not provided';
    $city = $wholesaleData['city'];
    $state = $wholesaleData['state'];
    $country = $wholesaleData['country'];
    $aboutBusiness = $wholesaleData['aboutBusiness'];
    $businessTypes = !empty($wholesaleData['businessTypes']) && is_array($wholesaleData['businessTypes']) 
        ? $wholesaleData['businessTypes'] 
        : [];
    
    $text = "NEW " . strtoupper($formType) . " FORM SUBMISSION\n";
    $text .= str_repeat("=", strlen($formType) + 20) . "\n\n";
    $text .= "Submitted: $submittedAt\n\n";
    
    $text .= "CONTACT INFORMATION\n";
    $text .= "-------------------\n";
    $text .= "Full Name: $fullName\n";
    $text .= "Email: $email\n";
    $text .= "Phone: $phone\n\n";
    
    $text .= "BUSINESS INFORMATION\n";
    $text .= "--------------------\n";
    $text .= "Business Name: $businessName\n";
    $text .= "Website: $website\n";
    $text .= "Location: $city, $state, $country\n\n";
    
    if (!empty($businessTypes)) {
        $text .= "TYPE OF BUSINESS\n";
        $text .= "----------------\n";
        foreach ($businessTypes as $type) {
            $text .= "- $type\n";
        }
        $text .= "\n";
    }
    
    $text .= "ABOUT THE BUSINESS\n";
    $text .= "------------------\n";
    $text .= "$aboutBusiness\n\n";
    
    $text .= "This is an automated email from Olivia Products " . strtolower($formType) . " partnership form system.\n";
    $text .= "Please respond to this inquiry promptly.\n";
    
    return $text;
}

/**
 * Get wholesale form acknowledgement email template for customer (HTML with Bootstrap)
 */
function getWholesaleAcknowledgementEmailTemplate($wholesaleData) {
    $formType = ucfirst(strtolower($wholesaleData['formType']));
    $firstName = htmlspecialchars($wholesaleData['firstName']);
    $submittedAt = date('F j, Y \a\t g:i A', strtotime($wholesaleData['submittedAt']));
    
    return '
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Your ' . $formType . ' Partnership Inquiry</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .email-container { max-width: 800px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #003057 0%, #4b3d97 100%); color: #ffffff; padding: 40px 30px; text-align: center; }
        .success-icon { font-size: 60px; color: #7bbd21; margin-bottom: 20px; }
        .content { padding: 30px; }
        .info-box { background-color: #f5f9ff; border-left: 4px solid #7bbd21; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .next-steps { background-color: #fff9e6; border: 2px solid #ffc857; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; }
        .btn { display: inline-block; padding: 12px 30px; background-color: #7bbd21; color: #ffffff; text-decoration: none; border-radius: 25px; font-weight: 600; margin: 10px 5px; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="success-icon">✓</div>
            <h1 style="margin: 0; font-size: 32px;">Thank You for Your ' . $formType . ' Partnership Inquiry!</h1>
            <p style="margin: 15px 0 0 0; font-size: 18px;">We\'ve received your application and will review it soon</p>
        </div>
        
        <div class="content">
            <div class="info-box">
                <h3 style="margin-top: 0; color: #003057;">Hello ' . $firstName . '!</h3>
                <p style="margin: 0; line-height: 1.6;">Thank you for your interest in becoming a ' . strtolower($formType) . ' partner with Olivia Products. We have successfully received your application submitted on ' . $submittedAt . ' and our team will review it and respond to you as soon as possible.</p>
            </div>
            
            <div class="next-steps">
                <h4 style="margin-top: 0; color: #003057;">What\'s Next?</h4>
                <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                    <li>Our partnership team will review your application within 5-7 business days</li>
                    <li>We\'ll evaluate your business profile and partnership potential</li>
                    <li>You\'ll receive a response via email or phone regarding the next steps</li>
                    <li>If approved, we\'ll discuss partnership terms and benefits</li>
                    <li>For urgent inquiries, please call us at +234 901 419 6902</li>
                </ul>
            </div>
            
            <div class="info-box">
                <h4 style="margin-top: 0; color: #003057;">Our Contact Information</h4>
                <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:' . MAILGUN_REPLY_TO . '">' . MAILGUN_REPLY_TO . '</a></p>
                <p style="margin: 5px 0;"><strong>Phone (Lagos):</strong> +234 901 419 6902</p>
                <p style="margin: 5px 0;"><strong>WhatsApp:</strong> +234 912 350 9090</p>
                <p style="margin: 5px 0;"><strong>Business Hours:</strong> Monday - Friday, 8am - 5pm</p>
                <p style="margin: 5px 0;"><strong>Location:</strong> Okaka plaza suite 1 first Avenue festac town, Lagos State</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://oliviaproducts.com" class="btn">Visit Our Website</a>
                <a href="mailto:' . MAILGUN_REPLY_TO . '" class="btn" style="background-color: #003057;">Contact Us</a>
            </div>
        </div>
        
        <div class="footer">
            <p style="margin: 0; font-weight: 600; color: #003057;">Olivia Products</p>
            <p style="margin: 5px 0;">We look forward to the possibility of partnering with you!</p>
            <p style="margin: 10px 0 0 0; font-size: 0.9em;">This is an automated acknowledgement email. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>';
}

/**
 * Get wholesale form acknowledgement email template for customer (Plain Text)
 */
function getWholesaleAcknowledgementEmailTextTemplate($wholesaleData) {
    $formType = ucfirst(strtolower($wholesaleData['formType']));
    $firstName = $wholesaleData['firstName'];
    $submittedAt = date('F j, Y \a\t g:i A', strtotime($wholesaleData['submittedAt']));
    
    $text = "THANK YOU FOR YOUR " . strtoupper($formType) . " PARTNERSHIP INQUIRY!\n";
    $text .= str_repeat("=", strlen($formType) + 35) . "\n\n";
    $text .= "Hello $firstName!\n\n";
    $text .= "Thank you for your interest in becoming a " . strtolower($formType) . " partner with Olivia Products. We have successfully received your application submitted on $submittedAt and our team will review it and respond to you as soon as possible.\n\n";
    
    $text .= "WHAT'S NEXT?\n";
    $text .= "------------\n";
    $text .= "- Our partnership team will review your application within 5-7 business days\n";
    $text .= "- We'll evaluate your business profile and partnership potential\n";
    $text .= "- You'll receive a response via email or phone regarding the next steps\n";
    $text .= "- If approved, we'll discuss partnership terms and benefits\n";
    $text .= "- For urgent inquiries, please call us at +234 901 419 6902\n\n";
    
    $text .= "OUR CONTACT INFORMATION\n";
    $text .= "-----------------------\n";
    $text .= "Email: " . MAILGUN_REPLY_TO . "\n";
    $text .= "Phone (Lagos): +234 901 419 6902\n";
    $text .= "WhatsApp: +234 912 350 9090\n";
    $text .= "Business Hours: Monday - Friday, 8am - 5pm\n";
    $text .= "Location: Okaka plaza suite 1 first Avenue festac town, Lagos State\n\n";
    
    $text .= "We look forward to the possibility of partnering with you!\n\n";
    $text .= "Olivia Products\n";
    $text .= "This is an automated acknowledgement email. Please do not reply to this email.\n";
    
    return $text;
}

/**
 * Get customer order status update email template (HTML with Bootstrap)
 */
function getCustomerStatusUpdateEmailTemplate($orderData, $newStatus, $oldStatus = null) {
    $orderId = $orderData['orderId'];
    $orderDate = date('F j, Y \a\t g:i A', strtotime($orderData['orderDate']));
    $customer = $orderData['customer'];
    $items = $orderData['items'];
    $total = number_format($orderData['total'], 2);
    
    // Status-specific content
    $statusConfig = [
        'pending' => [
            'title' => 'Order Received',
            'icon' => '📋',
            'message' => 'We have received your order and it is currently being reviewed.',
            'nextSteps' => [
                'Our team will review your order within 24 hours',
                'You will receive a confirmation call to verify your details',
                'We\'ll begin processing your order once confirmed'
            ],
            'color' => '#ffc107'
        ],
        'processing' => [
            'title' => 'Order Processing',
            'icon' => '⚙️',
            'message' => 'Great news! Your order is now being processed and prepared for shipment.',
            'nextSteps' => [
                'We\'re carefully preparing your items',
                'Your order will be shipped soon',
                'You\'ll receive tracking information once it ships'
            ],
            'color' => '#17a2b8'
        ],
        'shipped' => [
            'title' => 'Order Shipped!',
            'icon' => '🚚',
            'message' => 'Your order has been shipped and is on its way to you!',
            'nextSteps' => [
                'Your package is now in transit',
                'You can track your shipment using the tracking number provided',
                'Expected delivery: 3-5 business days',
                'Please ensure someone is available to receive the package'
            ],
            'color' => '#007bff'
        ],
        'delivered' => [
            'title' => 'Order Delivered!',
            'icon' => '✓',
            'message' => 'Your order has been successfully delivered!',
            'nextSteps' => [
                'Your package should have arrived at your specified address',
                'Please check your items and ensure everything is correct',
                'If you have any concerns, please contact us immediately',
                'We hope you enjoy your Olivia Products!'
            ],
            'color' => '#28a745'
        ],
        'cancelled' => [
            'title' => 'Order Cancelled',
            'icon' => '❌',
            'message' => 'Your order has been cancelled as requested.',
            'nextSteps' => [
                'If payment was made, refund will be processed within 5-7 business days',
                'If you have any questions about this cancellation, please contact us',
                'We hope to serve you again in the future'
            ],
            'color' => '#dc3545'
        ]
    ];
    
    $config = $statusConfig[$newStatus] ?? $statusConfig['pending'];
    
    $itemsHtml = '';
    foreach ($items as $item) {
        $itemTotal = number_format($item['productPrice'] * $item['quantity'], 2);
        $formattedName = formatProductName($item['productName']);
        $itemsHtml .= '
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
                <img src="' . htmlspecialchars($item['firstImg']) . '" alt="' . htmlspecialchars($formattedName) . '" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 2px solid #e0e0e0;">
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
                <strong>' . htmlspecialchars($formattedName) . '</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">
                ' . htmlspecialchars($item['quantity']) . '
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">
                <strong>₦' . $itemTotal . '</strong>
            </td>
        </tr>';
    }
    
    $nextStepsHtml = '';
    foreach ($config['nextSteps'] as $step) {
        $nextStepsHtml .= '<li style="margin-bottom: 8px;">' . htmlspecialchars($step) . '</li>';
    }
    
    return '
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Update - ' . $orderId . '</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .email-container { max-width: 800px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #003057 0%, #4b3d97 100%); color: #ffffff; padding: 40px 30px; text-align: center; }
        .status-icon { font-size: 60px; margin-bottom: 20px; }
        .content { padding: 30px; }
        .status-badge { display: inline-block; background-color: ' . $config['color'] . '; color: #ffffff; padding: 10px 20px; border-radius: 25px; font-weight: bold; margin-bottom: 20px; font-size: 1.1em; text-transform: uppercase; }
        .info-box { background-color: #f5f9ff; border-left: 4px solid ' . $config['color'] . '; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .next-steps { background-color: #fff9e6; border: 2px solid ' . $config['color'] . '; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th { background-color: #003057; color: #ffffff; padding: 12px; text-align: left; font-weight: 600; }
        .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; }
        .btn { display: inline-block; padding: 12px 30px; background-color: #7bbd21; color: #ffffff; text-decoration: none; border-radius: 25px; font-weight: 600; margin: 10px 5px; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="status-icon">' . $config['icon'] . '</div>
            <h1 style="margin: 0; font-size: 32px;">' . $config['title'] . '</h1>
            <p style="margin: 15px 0 0 0; font-size: 18px;">Order #' . htmlspecialchars($orderId) . '</p>
        </div>
        
        <div class="content">
            <div style="text-align: center; margin-bottom: 30px;">
                <div class="status-badge">' . ucfirst($newStatus) . '</div>
                <p style="color: #6c757d; margin: 10px 0;">Order Date: ' . $orderDate . '</p>
            </div>
            
            <div class="info-box">
                <h3 style="margin-top: 0; color: #003057;">Hello ' . htmlspecialchars($customer['fullName']) . '!</h3>
                <p style="margin: 0; line-height: 1.6; font-size: 1.1em;">' . $config['message'] . '</p>
            </div>
            
            <div class="next-steps">
                <h4 style="margin-top: 0; color: #003057;">What\'s Next?</h4>
                <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                    ' . $nextStepsHtml . '
                </ul>
            </div>
            
            <h3 style="color: #003057; margin-top: 30px;">Order Summary</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Product</th>
                        <th style="text-align: center;">Quantity</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ' . $itemsHtml . '
                </tbody>
                <tfoot>
                    <tr style="background-color: #f5f9ff; font-weight: bold; font-size: 1.2em;">
                        <td colspan="3" style="text-align: right; padding: 15px;">Total Amount:</td>
                        <td style="text-align: right; padding: 15px; color: ' . $config['color'] . ';">₦' . $total . '</td>
                    </tr>
                </tfoot>
            </table>
            
            <div class="info-box">
                <h4 style="margin-top: 0; color: #003057;">Shipping Address</h4>
                <p style="margin: 0;">
                    ' . htmlspecialchars($customer['fullName']) . '<br>
                    ' . htmlspecialchars($customer['address']) . '<br>
                    ' . htmlspecialchars($customer['city']) . ', ' . htmlspecialchars($customer['state']) . 
                    (!empty($customer['postalCode']) ? ' ' . htmlspecialchars($customer['postalCode']) : '') . '<br>
                    Phone: ' . htmlspecialchars($customer['phone']) . '
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://oliviaproducts.com" class="btn">Visit Our Website</a>
                <a href="mailto:' . MAILGUN_REPLY_TO . '" class="btn" style="background-color: #003057;">Contact Us</a>
            </div>
        </div>
        
        <div class="footer">
            <p style="margin: 0; font-weight: 600; color: #003057;">Olivia Products</p>
            <p style="margin: 5px 0;">Thank you for your business!</p>
            <p style="margin: 10px 0 0 0; font-size: 0.9em;">This is an automated status update email. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>';
}

/**
 * Get customer order status update email template (Plain Text)
 */
function getCustomerStatusUpdateEmailTextTemplate($orderData, $newStatus, $oldStatus = null) {
    $orderId = $orderData['orderId'];
    $orderDate = date('F j, Y \a\t g:i A', strtotime($orderData['orderDate']));
    $customer = $orderData['customer'];
    $items = $orderData['items'];
    $total = number_format($orderData['total'], 2);
    
    // Status-specific content
    $statusConfig = [
        'pending' => [
            'title' => 'ORDER RECEIVED',
            'message' => 'We have received your order and it is currently being reviewed.',
            'nextSteps' => [
                'Our team will review your order within 24 hours',
                'You will receive a confirmation call to verify your details',
                'We\'ll begin processing your order once confirmed'
            ]
        ],
        'processing' => [
            'title' => 'ORDER PROCESSING',
            'message' => 'Great news! Your order is now being processed and prepared for shipment.',
            'nextSteps' => [
                'We\'re carefully preparing your items',
                'Your order will be shipped soon',
                'You\'ll receive tracking information once it ships'
            ]
        ],
        'shipped' => [
            'title' => 'ORDER SHIPPED!',
            'message' => 'Your order has been shipped and is on its way to you!',
            'nextSteps' => [
                'Your package is now in transit',
                'You can track your shipment using the tracking number provided',
                'Expected delivery: 3-5 business days',
                'Please ensure someone is available to receive the package'
            ]
        ],
        'delivered' => [
            'title' => 'ORDER DELIVERED!',
            'message' => 'Your order has been successfully delivered!',
            'nextSteps' => [
                'Your package should have arrived at your specified address',
                'Please check your items and ensure everything is correct',
                'If you have any concerns, please contact us immediately',
                'We hope you enjoy your Olivia Products!'
            ]
        ],
        'cancelled' => [
            'title' => 'ORDER CANCELLED',
            'message' => 'Your order has been cancelled as requested.',
            'nextSteps' => [
                'If payment was made, refund will be processed within 5-7 business days',
                'If you have any questions about this cancellation, please contact us',
                'We hope to serve you again in the future'
            ]
        ]
    ];
    
    $config = $statusConfig[$newStatus] ?? $statusConfig['pending'];
    
    $text = $config['title'] . "\n";
    $text .= str_repeat("=", strlen($config['title'])) . "\n\n";
    $text .= "Hello {$customer['fullName']}!\n\n";
    $text .= $config['message'] . "\n\n";
    
    $text .= "ORDER DETAILS\n";
    $text .= "-------------\n";
    $text .= "Order ID: $orderId\n";
    $text .= "Order Date: $orderDate\n";
    $text .= "Status: " . ucfirst($newStatus) . "\n\n";
    
    $text .= "ORDER ITEMS\n";
    $text .= "-----------\n";
    foreach ($items as $item) {
        $itemTotal = number_format($item['productPrice'] * $item['quantity'], 2);
        $formattedName = formatProductName($item['productName']);
        $text .= "- {$formattedName} (Qty: {$item['quantity']}) - ₦{$itemTotal}\n";
    }
    $text .= "\n";
    $text .= "TOTAL: ₦$total\n\n";
    
    $text .= "SHIPPING ADDRESS\n";
    $text .= "---------------\n";
    $text .= "{$customer['fullName']}\n";
    $text .= "{$customer['address']}\n";
    $text .= "{$customer['city']}, {$customer['state']}";
    if (!empty($customer['postalCode'])) {
        $text .= " {$customer['postalCode']}";
    }
    $text .= "\n";
    $text .= "Phone: {$customer['phone']}\n\n";
    
    $text .= "WHAT'S NEXT?\n";
    $text .= "------------\n";
    foreach ($config['nextSteps'] as $step) {
        $text .= "- $step\n";
    }
    $text .= "\n";
    
    $text .= "If you have any questions, please contact us at " . MAILGUN_REPLY_TO . "\n";
    $text .= "Phone: +234 901 419 6902\n";
    $text .= "WhatsApp: +234 912 350 9090\n\n";
    
    $text .= "Thank you for your business!\n\n";
    $text .= "Olivia Products\n";
    $text .= "This is an automated status update email. Please do not reply to this email.\n";
    
    return $text;
}

/**
 * Get customer payment status update email template (HTML with Bootstrap)
 */
function getCustomerPaymentStatusEmailTemplate($orderData, $isPaid) {
    $orderId = $orderData['orderId'];
    $orderDate = date('F j, Y \a\t g:i A', strtotime($orderData['orderDate']));
    $customer = $orderData['customer'];
    $items = $orderData['items'];
    $total = number_format($orderData['total'], 2);
    
    if ($isPaid) {
        $title = 'Payment Received';
        $icon = '✓';
        $message = 'Great news! We have received your payment for this order.';
        $nextSteps = [
            'Your payment has been successfully processed',
            'Your order will now proceed to processing',
            'You will receive updates as your order progresses',
            'Thank you for your prompt payment!'
        ];
        $color = '#28a745';
        $badgeText = 'PAID';
    } else {
        $title = 'Payment Status Updated';
        $icon = 'ℹ️';
        $message = 'The payment status for your order has been updated.';
        $nextSteps = [
            'Please ensure payment is completed to proceed with your order',
            'If you have already made payment, please contact us with proof of payment',
            'We will process your order once payment is confirmed',
            'If you need assistance, please contact us'
        ];
        $color = '#ffc107';
        $badgeText = 'PENDING PAYMENT';
    }
    
    $itemsHtml = '';
    foreach ($items as $item) {
        $itemTotal = number_format($item['productPrice'] * $item['quantity'], 2);
        $formattedName = formatProductName($item['productName']);
        $itemsHtml .= '
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
                <img src="' . htmlspecialchars($item['firstImg']) . '" alt="' . htmlspecialchars($formattedName) . '" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 2px solid #e0e0e0;">
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
                <strong>' . htmlspecialchars($formattedName) . '</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">
                ' . htmlspecialchars($item['quantity']) . '
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">
                <strong>₦' . $itemTotal . '</strong>
            </td>
        </tr>';
    }
    
    $nextStepsHtml = '';
    foreach ($nextSteps as $step) {
        $nextStepsHtml .= '<li style="margin-bottom: 8px;">' . htmlspecialchars($step) . '</li>';
    }
    
    return '
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Update - ' . $orderId . '</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .email-container { max-width: 800px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #003057 0%, #4b3d97 100%); color: #ffffff; padding: 40px 30px; text-align: center; }
        .payment-icon { font-size: 60px; margin-bottom: 20px; }
        .content { padding: 30px; }
        .payment-badge { display: inline-block; background-color: ' . $color . '; color: #ffffff; padding: 10px 20px; border-radius: 25px; font-weight: bold; margin-bottom: 20px; font-size: 1.1em; text-transform: uppercase; }
        .info-box { background-color: #f5f9ff; border-left: 4px solid ' . $color . '; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .next-steps { background-color: #fff9e6; border: 2px solid ' . $color . '; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th { background-color: #003057; color: #ffffff; padding: 12px; text-align: left; font-weight: 600; }
        .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; }
        .btn { display: inline-block; padding: 12px 30px; background-color: #7bbd21; color: #ffffff; text-decoration: none; border-radius: 25px; font-weight: 600; margin: 10px 5px; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="payment-icon">' . $icon . '</div>
            <h1 style="margin: 0; font-size: 32px;">' . $title . '</h1>
            <p style="margin: 15px 0 0 0; font-size: 18px;">Order #' . htmlspecialchars($orderId) . '</p>
        </div>
        
        <div class="content">
            <div style="text-align: center; margin-bottom: 30px;">
                <div class="payment-badge">' . $badgeText . '</div>
                <p style="color: #6c757d; margin: 10px 0;">Order Date: ' . $orderDate . '</p>
            </div>
            
            <div class="info-box">
                <h3 style="margin-top: 0; color: #003057;">Hello ' . htmlspecialchars($customer['fullName']) . '!</h3>
                <p style="margin: 0; line-height: 1.6; font-size: 1.1em;">' . $message . '</p>
            </div>
            
            <div class="next-steps">
                <h4 style="margin-top: 0; color: #003057;">What\'s Next?</h4>
                <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                    ' . $nextStepsHtml . '
                </ul>
            </div>
            
            <h3 style="color: #003057; margin-top: 30px;">Order Summary</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Product</th>
                        <th style="text-align: center;">Quantity</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ' . $itemsHtml . '
                </tbody>
                <tfoot>
                    <tr style="background-color: #f5f9ff; font-weight: bold; font-size: 1.2em;">
                        <td colspan="3" style="text-align: right; padding: 15px;">Total Amount:</td>
                        <td style="text-align: right; padding: 15px; color: ' . $color . ';">₦' . $total . '</td>
                    </tr>
                </tfoot>
            </table>
            
            <div class="info-box">
                <h4 style="margin-top: 0; color: #003057;">Payment Information</h4>
                <p style="margin: 0;">
                    <strong>Order ID:</strong> ' . htmlspecialchars($orderId) . '<br>
                    <strong>Total Amount:</strong> ₦' . $total . '<br>
                    <strong>Payment Status:</strong> ' . ($isPaid ? '<span style="color: #28a745; font-weight: bold;">Paid</span>' : '<span style="color: #ffc107; font-weight: bold;">Pending</span>') . '
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://oliviaproducts.com" class="btn">Visit Our Website</a>
                <a href="mailto:' . MAILGUN_REPLY_TO . '" class="btn" style="background-color: #003057;">Contact Us</a>
            </div>
        </div>
        
        <div class="footer">
            <p style="margin: 0; font-weight: 600; color: #003057;">Olivia Products</p>
            <p style="margin: 5px 0;">Thank you for your business!</p>
            <p style="margin: 10px 0 0 0; font-size: 0.9em;">This is an automated payment status update email. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>';
}

/**
 * Get customer payment status update email template (Plain Text)
 */
function getCustomerPaymentStatusEmailTextTemplate($orderData, $isPaid) {
    $orderId = $orderData['orderId'];
    $orderDate = date('F j, Y \a\t g:i A', strtotime($orderData['orderDate']));
    $customer = $orderData['customer'];
    $items = $orderData['items'];
    $total = number_format($orderData['total'], 2);
    
    if ($isPaid) {
        $title = 'PAYMENT RECEIVED';
        $message = 'Great news! We have received your payment for this order.';
        $nextSteps = [
            'Your payment has been successfully processed',
            'Your order will now proceed to processing',
            'You will receive updates as your order progresses',
            'Thank you for your prompt payment!'
        ];
    } else {
        $title = 'PAYMENT STATUS UPDATED';
        $message = 'The payment status for your order has been updated.';
        $nextSteps = [
            'Please ensure payment is completed to proceed with your order',
            'If you have already made payment, please contact us with proof of payment',
            'We will process your order once payment is confirmed',
            'If you need assistance, please contact us'
        ];
    }
    
    $text = $title . "\n";
    $text .= str_repeat("=", strlen($title)) . "\n\n";
    $text .= "Hello {$customer['fullName']}!\n\n";
    $text .= $message . "\n\n";
    
    $text .= "ORDER DETAILS\n";
    $text .= "-------------\n";
    $text .= "Order ID: $orderId\n";
    $text .= "Order Date: $orderDate\n";
    $text .= "Payment Status: " . ($isPaid ? "Paid" : "Pending") . "\n\n";
    
    $text .= "ORDER ITEMS\n";
    $text .= "-----------\n";
    foreach ($items as $item) {
        $itemTotal = number_format($item['productPrice'] * $item['quantity'], 2);
        $formattedName = formatProductName($item['productName']);
        $text .= "- {$formattedName} (Qty: {$item['quantity']}) - ₦{$itemTotal}\n";
    }
    $text .= "\n";
    $text .= "TOTAL: ₦$total\n\n";
    
    $text .= "PAYMENT INFORMATION\n";
    $text .= "-------------------\n";
    $text .= "Order ID: $orderId\n";
    $text .= "Total Amount: ₦$total\n";
    $text .= "Payment Status: " . ($isPaid ? "Paid" : "Pending") . "\n\n";
    
    $text .= "WHAT'S NEXT?\n";
    $text .= "------------\n";
    foreach ($nextSteps as $step) {
        $text .= "- $step\n";
    }
    $text .= "\n";
    
    $text .= "If you have any questions, please contact us at " . MAILGUN_REPLY_TO . "\n";
    $text .= "Phone: +234 901 419 6902\n";
    $text .= "WhatsApp: +234 912 350 9090\n\n";
    
    $text .= "Thank you for your business!\n\n";
    $text .= "Olivia Products\n";
    $text .= "This is an automated payment status update email. Please do not reply to this email.\n";
    
    return $text;
}

