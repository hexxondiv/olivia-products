# Order Submission API

This API handles order submissions and sends emails via Mailgun.

## Setup

### 1. Environment Variables

Set the following environment variables (or update `config.php` directly):

```bash
MAILGUN_DOMAIN="educare.school"
MAILGUN_PRIVATE="key-3e777634c2d522f0ac0d671365685d34"
MAILGUN_PUBLIC="pubkey-0c6af3551a472c507f2066dc1706db42"
MAILGUN_FROM_ADDRESS="info@oliviaproducts.com"
MAILGUN_FROM_NAME="Olivia Products"
MAILGUN_REPLY_TO="Info@oliviaproducts.com"
MAILGUN_FORCE_FROM_ADDRESS="Info@oliviaproducts.com"
SALES_EMAIL="hexxondiv@gmail.com"
```

### 2. Server Configuration

Ensure your web server can execute PHP files. For Apache, make sure `mod_php` is enabled.

### 3. CORS Configuration

The API includes CORS headers to allow requests from your React app. If you need to restrict this, update the headers in `submit-order.php`.

## API Endpoint

**POST** `/api/submit-order.php`

### Request Body

```json
{
  "customer": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+234 901 234 5678",
    "address": "123 Main Street",
    "city": "Lagos",
    "state": "Lagos",
    "postalCode": "100001",
    "notes": "Optional notes"
  },
  "items": [
    {
      "id": 1,
      "productName": "Product Name",
      "productPrice": 5000,
      "firstImg": "https://example.com/image.jpg",
      "quantity": 2
    }
  ],
  "total": 10000,
  "orderDate": "2024-01-01T12:00:00.000Z"
}
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Order submitted successfully",
  "orderId": "ORD-20240101-ABC12345",
  "salesEmailSent": true,
  "customerEmailSent": true
}
```

**Error (400/500):**
```json
{
  "success": false,
  "message": "Error message"
}
```

## Email Templates

The API sends two emails:

1. **Sales Team Email** - Sent to `SALES_EMAIL` with complete order details
2. **Customer Confirmation Email** - Sent to customer's email with order confirmation

Both emails use Bootstrap-styled HTML templates for professional appearance.

## Files

- `submit-order.php` - Main API endpoint
- `config.php` - Configuration and environment variables
- `mailgun-helper.php` - Mailgun API integration functions
- `email-templates.php` - HTML and text email templates

## Testing

You can test the API using curl:

```bash
curl -X POST http://your-domain.com/api/submit-order.php \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "fullName": "Test User",
      "email": "test@example.com",
      "phone": "+234 901 234 5678",
      "address": "123 Test St",
      "city": "Lagos",
      "state": "Lagos"
    },
    "items": [
      {
        "id": 1,
        "productName": "Test Product",
        "productPrice": 1000,
        "firstImg": "https://example.com/image.jpg",
        "quantity": 1
      }
    ],
    "total": 1000,
    "orderDate": "2024-01-01T12:00:00.000Z"
  }'
```

