<?php
// Mailgun Configuration
// Copy this file to config.php and update with your actual Mailgun credentials
// DO NOT commit config.php to the repository

define('MAILGUN_DOMAIN', getenv('MAILGUN_DOMAIN') ?: 'your-mailgun-domain.com');
define('MAILGUN_PRIVATE_KEY', getenv('MAILGUN_PRIVATE') ?: 'your-private-api-key');
define('MAILGUN_PUBLIC_KEY', getenv('MAILGUN_PUBLIC') ?: 'your-public-api-key');
define('MAILGUN_FROM_ADDRESS', getenv('MAILGUN_FROM_ADDRESS') ?: 'info@yourdomain.com');
define('MAILGUN_FROM_NAME', getenv('MAILGUN_FROM_NAME') ?: 'Your Company Name');
define('MAILGUN_REPLY_TO', getenv('MAILGUN_REPLY_TO') ?: 'Info@yourdomain.com');
define('MAILGUN_FORCE_FROM_ADDRESS', getenv('MAILGUN_FORCE_FROM_ADDRESS') ?: 'Info@yourdomain.com');
define('SALES_EMAIL', getenv('SALES_EMAIL') ?: 'sales@yourdomain.com');
define('CONTACT_EMAIL', getenv('CONTACT_EMAIL') ?: 'contact@yourdomain.com');
// Mailgun API endpoint
define('MAILGUN_API_URL', 'https://api.mailgun.net/v3/' . MAILGUN_DOMAIN . '/messages');

