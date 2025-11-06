<?php
// Mailgun Configuration
define('MAILGUN_DOMAIN', getenv('MAILGUN_DOMAIN') ?: 'educare.school');
define('MAILGUN_PRIVATE_KEY', getenv('MAILGUN_PRIVATE') ?: 'key-3e777634c2d522f0ac0d671365685d34');
define('MAILGUN_PUBLIC_KEY', getenv('MAILGUN_PUBLIC') ?: 'pubkey-0c6af3551a472c507f2066dc1706db42');
define('MAILGUN_FROM_ADDRESS', getenv('MAILGUN_FROM_ADDRESS') ?: 'info@oliviaproducts.com');
define('MAILGUN_FROM_NAME', getenv('MAILGUN_FROM_NAME') ?: 'Olivia Products');
define('MAILGUN_REPLY_TO', getenv('MAILGUN_REPLY_TO') ?: 'Info@oliviaproducts.com');
define('MAILGUN_FORCE_FROM_ADDRESS', getenv('MAILGUN_FORCE_FROM_ADDRESS') ?: 'Info@oliviaproducts.com');
define('SALES_EMAIL', getenv('SALES_EMAIL') ?: 'hexxondiv@gmail.com');

// Mailgun API endpoint
define('MAILGUN_API_URL', 'https://api.mailgun.net/v3/' . MAILGUN_DOMAIN . '/messages');

