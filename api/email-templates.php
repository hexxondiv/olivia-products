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

