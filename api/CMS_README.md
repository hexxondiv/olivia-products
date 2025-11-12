# Olivia Products CMS API Documentation

This CMS provides RESTful API endpoints for managing products, orders, contact submissions, and wholesale applications.

## Setup

### 1. Database Setup

1. Create the database and tables by running the SQL schema:
```bash
mysql -u your_username -p < api/schema.sql
```

Or import via phpMyAdmin or your preferred MySQL client.

### 2. Configuration

Update `api/config.php` with your database credentials:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'olivia_products');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
```

### 3. Seed Products

Run the seed script to import products from `allProductsData.tsx`:
```bash
php api/seed-products.php
```

Or via web browser:
```
http://your-domain.com/api/seed-products.php?run=1
```

**Note:** Make sure to copy product images from `src/assets/images/` to `public/assets/images/` directory.

## Authentication

### Login
**POST** `/api/auth.php`

Request:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@celineolivia.com",
    "fullName": "Administrator",
    "role": "admin",
    "token": "base64_encoded_token"
  }
}
```

### Get Current User
**GET** `/api/auth.php?action=me`

Requires: `Authorization: Bearer {token}` header

### Default Admin Credentials
- Username: `admin`
- Password: `admin123` (CHANGE THIS IMMEDIATELY!)

## Products API

### List Products
**GET** `/api/products.php`

Query Parameters:
- `id` - Get single product
- `category` - Filter by category
- `activeOnly` - Filter active products only (true/false)

### Create Product
**POST** `/api/products.php`

Requires: Authentication (admin/manager role)

Request:
```json
{
  "heading": "Hand Wash",
  "name": "TropiGlow",
  "sufix": "Hand Wash",
  "price": 16000,
  "rating": 4.2,
  "color": "#511375",
  "detail": "Product detail",
  "moreDetail": "Extended description",
  "tagline": "Tagline text",
  "firstImg": "/assets/images/hand-wash1.png",
  "hoverImg": "/assets/images/hand-wash11.png",
  "additionalImgs": ["/assets/images/hand-wash111.png"],
  "category": ["hand-soap"],
  "flavours": [
    {"id": 1, "name": "🍌 Banana"}
  ],
  "bestSeller": true,
  "isActive": true
}
```

### Update Product
**PUT** `/api/products.php?id={id}`

Requires: Authentication (admin/manager role)

### Delete Product
**DELETE** `/api/products.php?id={id}`

Requires: Authentication (admin role)

Query Parameters:
- `hard=true` - Hard delete (default is soft delete)

## Image Upload

### Upload Image
**POST** `/api/upload-image.php`

Requires: Authentication

Request: `multipart/form-data` with `image` field

Response:
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "filename": "product_1234567890_abc123.png",
  "originalName": "product.png",
  "path": "/assets/images/product_1234567890_abc123.png",
  "size": 123456,
  "mimeType": "image/png"
}
```

**Supported formats:** JPEG, PNG, GIF, WebP, AVIF
**Max size:** 10MB

## Orders API

### List Orders
**GET** `/api/orders.php`

Query Parameters:
- `id` - Get single order with items
- `status` - Filter by status (pending, processing, shipped, delivered, cancelled)
- `limit` - Results per page (default: 100)
- `offset` - Pagination offset (default: 0)

### Update Order
**PUT** `/api/orders.php?id={orderId}`

Requires: Authentication (admin/manager role)

Request:
```json
{
  "status": "processing",
  "customerName": "John Doe",
  "totalAmount": 50000
}
```

### Delete Order
**DELETE** `/api/orders.php?id={orderId}`

Requires: Authentication (admin role)

## Contact Submissions API

### List Contact Submissions
**GET** `/api/contacts.php`

Query Parameters:
- `id` - Get single submission
- `status` - Filter by status (new, read, replied, archived)
- `limit` - Results per page
- `offset` - Pagination offset

### Update Contact Submission
**PUT** `/api/contacts.php?id={id}`

Requires: Authentication (admin/manager role)

Request:
```json
{
  "status": "read",
  "fullName": "John Doe",
  "message": "Updated message"
}
```

### Delete Contact Submission
**DELETE** `/api/contacts.php?id={id}`

Requires: Authentication (admin role)

## Wholesale Submissions API

### List Wholesale Submissions
**GET** `/api/wholesale.php`

Query Parameters:
- `id` - Get single submission
- `status` - Filter by status (new, reviewing, approved, rejected, archived)
- `formType` - Filter by type (wholesale, distribution, retail)
- `limit` - Results per page
- `offset` - Pagination offset

### Update Wholesale Submission
**PUT** `/api/wholesale.php?id={id}`

Requires: Authentication (admin/manager role)

Request:
```json
{
  "status": "reviewing",
  "notes": "Internal notes",
  "businessName": "Updated Business Name"
}
```

### Delete Wholesale Submission
**DELETE** `/api/wholesale.php?id={id}`

Requires: Authentication (admin role)

## Form Submission Endpoints

These endpoints are used by the frontend forms and automatically save to database:

### Submit Order
**POST** `/api/submit-order.php`

Saves order to database and sends emails.

### Submit Contact
**POST** `/api/submit-contact.php`

Saves contact submission to database and sends emails.

### Submit Wholesale
**POST** `/api/submit-wholesale.php`

Saves wholesale submission to database and sends emails.

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

## CORS

All endpoints support CORS and can be accessed from any origin. For production, restrict this in the API files.

## Security Notes

1. **Change default admin password** immediately after setup
2. **Use HTTPS** in production
3. **Implement rate limiting** for production
4. **Upgrade token system** to JWT for production
5. **Validate and sanitize** all inputs (currently basic validation)
6. **Restrict CORS** to your frontend domain in production

## Database Schema

See `api/schema.sql` for complete database structure.

## Image Storage

- Images are stored in `public/assets/images/`
- Uploaded images get unique filenames to prevent conflicts
- Original images from `src/assets/images/` should be copied to `public/assets/images/` for web access

