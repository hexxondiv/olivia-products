# CMS User Manual

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Roles and Permissions](#user-roles-and-permissions)
4. [Dashboard](#dashboard)
5. [Products Management](#products-management)
6. [Orders Management](#orders-management)
7. [Contacts Management](#contacts-management)
8. [Wholesale Applications](#wholesale-applications)
9. [Stock Management](#stock-management)
10. [FAQs Management](#faqs-management)
11. [Testimonials Management](#testimonials-management)
12. [Flash Info Management](#flash-info-management)
13. [Admin Users Management](#admin-users-management)
14. [Profile Management](#profile-management)
15. [Troubleshooting](#troubleshooting)

---

## Introduction

The Olivia Content Management System (CMS) is a comprehensive platform for managing your e-commerce website. It allows you to manage products, orders, customer inquiries, wholesale applications, inventory, and website content all from one centralized location.

### Key Features

- **Product Management**: Create, edit, and manage product listings with images, pricing, and inventory
- **Order Processing**: Track and manage customer orders with status updates
- **Customer Communication**: Handle contact submissions and respond via email or WhatsApp
- **Wholesale Management**: Review and process wholesale/distributor applications
- **Inventory Control**: Track stock levels, receive alerts, and manage inventory movements
- **Content Management**: Manage FAQs, testimonials, and promotional flash information
- **User Management**: Control access with role-based permissions

---

## Getting Started

### Accessing the CMS

1. Navigate to your website's CMS login page: `/cms/login`
2. Enter your username and password
3. Click "Login" to access the dashboard

### Default Login Credentials

**⚠️ IMPORTANT**: Change the default password immediately after first login!

- **Username**: `admin`
- **Password**: `admin123`

### Navigation

Once logged in, you'll see a navigation menu on the left side with the following sections:

- **Dashboard** - Overview of key metrics
- **Products** - Manage product catalog
- **Orders** - View and process orders
- **Contacts** - Handle customer inquiries
- **Wholesale** - Review wholesale applications
- **Stock** - Inventory management
- **FAQs** - Manage frequently asked questions
- **Testimonials** - Manage customer testimonials
- **Flash Info** - Manage promotional popups
- **Admin Users** - User management (Admin only)
- **Profile** - Your account settings

---

## User Roles and Permissions

The CMS uses a role-based access control system with three roles:

### Admin
- **Full access** to all features
- Can manage users, products, orders, and all content
- Can delete records permanently
- Can access Admin Users section

### Sales
- Can manage products, orders, wholesale applications, and stock
- Can view and reply to contacts
- Cannot delete records permanently
- Cannot manage users or content (FAQs, testimonials, flash info)

### Support
- Can view dashboard and manage profile
- Can view and reply to contacts
- Can manage FAQs, testimonials, and flash info
- Cannot access products, orders, wholesale, or stock management

### Permission Summary

| Feature | Admin | Sales | Support |
|---------|-------|-------|---------|
| Dashboard | ✅ | ✅ | ✅ |
| Products | ✅ | ✅ | ❌ |
| Orders | ✅ | ✅ | ❌ |
| Contacts | ✅ | ✅ | ✅ |
| Wholesale | ✅ | ✅ | ❌ |
| Stock | ✅ | ✅ | ❌ |
| FAQs | ✅ | ❌ | ✅ |
| Testimonials | ✅ | ❌ | ✅ |
| Flash Info | ✅ | ❌ | ✅ |
| Admin Users | ✅ | ❌ | ❌ |
| Profile | ✅ | ✅ | ✅ |

---

## Dashboard

The dashboard provides an overview of your business metrics and quick access to common tasks.

### Dashboard Features

1. **Statistics Cards**
   - Total products
   - Total orders
   - Pending orders
   - New contacts
   - New wholesale applications

2. **Quick Actions**
   - Direct links to manage products
   - View pending orders
   - Check new contacts
   - Review new wholesale applications

3. **Recent Activity**
   - Latest orders
   - Recent contacts
   - System notifications

---

## Products Management

The Products section allows you to manage your entire product catalog.

### Viewing Products

1. Navigate to **Products** from the main menu
2. Use the search bar to find specific products by name, heading, or barcode
3. View products in a table format with key information:
   - Product image
   - Barcode
   - Name and heading
   - Price
   - Rating
   - Categories
   - Stock status
   - Active/Inactive status

### Adding a New Product

1. Click the **"Add Product"** button
2. Fill in the required fields:

#### Basic Information
- **Heading*** (e.g., "Hand Wash")
- **Name*** (e.g., "TropiGlow")
- **Barcode** (optional - can auto-generate)
- **Suffix** (optional, e.g., "Hand Wash")
- **Color** (for product display)
- **Price*** (in ₦)
- **Rating** (0-5)

#### Tiered Pricing
Set up different pricing tiers based on quantity:
- **Retail Price*** and **Retail Minimum Quantity** (default: 1)
- **Wholesale Price** and **Wholesale Minimum Quantity** (optional)
- **Distributor Price** and **Distributor Minimum Quantity** (optional)

The system automatically applies the highest tier that the customer's quantity qualifies for.

#### Description
- **Tagline** (short catchy phrase)
- **Detail** (short description)
- **More Detail** (extended description)

#### Images
- **First Image*** (main product image - required)
- **Hover Image** (shown on hover)
- **Additional Images** (multiple images supported)

You can:
- Enter image URLs directly
- Upload images using the upload button (max 2MB per image)
- Supported formats: JPEG, PNG, GIF, WebP, AVIF

#### Categories
Select one or more categories:
- Hand Soap
- Dish Wash
- Air Freshener
- Hair Care
- Car Wash
- Toilet Wash
- Window Cleaner
- Personal Care
- Tile Cleaner
- Fabric Wash

#### Flavours
Add product flavours/variants:
1. Click "Add Flavour"
2. Enter flavour name (e.g., "🍌 Banana")
3. Add multiple flavours as needed

#### Stock Management
- **Enable Stock Tracking**: Toggle to enable inventory tracking
- **Current Stock Quantity**: Current available units
- **Low Stock Threshold**: Alert when stock falls below this number (default: 10)
- **Allow Backorders**: Allow customers to order when stock is 0
- **Stock Status**: Automatically calculated (In Stock, Low Stock, Out of Stock, On Backorder)

#### Settings
- **Best Seller**: Mark as best-selling product
- **Active**: Toggle to show/hide product on website

3. Click **"Create Product"** to save

### Editing a Product

1. Click the **Edit** button (pencil icon) next to the product
2. Modify any fields as needed
3. Click **"Update Product"** to save changes

### Stock Adjustments

For products with stock tracking enabled:

1. Click the **"+"** button to add stock (purchase)
2. Click the **"±"** button to manually adjust stock
3. Enter quantity and notes
4. Select movement type:
   - **Purchase**: Adding stock from supplier
   - **Adjustment**: Manual correction
   - **Return**: Stock being returned
   - **Damaged**: Removing damaged items

### Viewing Stock History

1. Click the **search icon** next to stock quantity
2. View complete history of stock movements
3. See who made changes and when

### Deleting a Product

1. Click the **Delete** button (trash icon)
2. Choose deletion method:
   - **Deactivate**: Hide from website, keep in database (reversible)
   - **Force Delete**: Permanently remove from database (irreversible)

---

## Orders Management

The Orders section helps you track and process customer orders.

### Viewing Orders

1. Navigate to **Orders** from the main menu
2. Use filters to view specific orders:
   - **All**: All orders
   - **Pending**: Orders awaiting processing
   - **Processing**: Orders being prepared
   - **Shipped**: Orders that have been shipped
   - **Delivered**: Completed orders
   - **Cancelled**: Cancelled orders
   - **Paid/Not Paid**: Filter by payment status

3. Search by Order ID using the search bar

### Order Information

Each order displays:
- **Order ID**: Unique order identifier
- **Customer Name**: Customer's full name
- **Email**: Customer's email address
- **Total Amount**: Order total in ₦
- **Status**: Current order status
- **Date**: Order creation date
- **Payment Status**: Whether order is paid

### Updating Order Status

1. Use the dropdown menu in the Actions column
2. Select new status:
   - **Pending**: Initial order state
   - **Processing**: Order is being prepared
   - **Shipped**: Order has been dispatched
   - **Delivered**: Order completed
   - **Cancelled**: Order cancelled

3. Status updates automatically

### Marking Orders as Paid

1. Check the **"Paid"** checkbox next to the order
2. Payment status updates immediately
3. Uncheck to mark as unpaid

### Viewing Order Details

1. Click the **eye icon** next to an order
2. View complete order information:
   - Customer details
   - Order items with images
   - Pricing tier information (if applicable)
   - Quantities and prices
   - Total amount

### Order Items

Order details show:
- Product images
- Product names
- Pricing tier (Retail, Wholesale, or Distributor)
- Quantity and unit price
- Line totals

---

## Contacts Management

The Contacts section manages customer inquiries and messages.

### Viewing Contacts

1. Navigate to **Contacts** from the main menu
2. Filter by status:
   - **All**: All contact submissions
   - **New**: Unread messages
   - **Read**: Messages that have been read
   - **Replied**: Messages that have been responded to

### Contact Information

Each contact shows:
- **ID**: Contact submission ID
- **Name**: Customer's full name
- **Email**: Customer's email (if provided)
- **Phone**: Customer's phone number
- **Message**: Customer's message (truncated in list view)
- **Status**: Current status
- **Date**: Submission date

### Updating Contact Status

1. Use the status dropdown in the Actions column
2. Select new status:
   - **New**: Initial submission
   - **Read**: Message has been reviewed
   - **Replied**: Response has been sent
   - **Archived**: Archived for reference

### Viewing Contact Details

1. Click the **eye icon** next to a contact
2. View complete information:
   - Full contact details
   - Complete message
   - Reply history (if any)

### Replying to Contacts

1. Open contact details
2. Click **"Reply"** button
3. Choose reply method:
   - **Email**: Send email response (requires customer email)
   - **WhatsApp**: Open WhatsApp with pre-filled message

4. Enter your reply message
5. Click **"Send Reply"**

**Note**: Email replies are sent automatically. WhatsApp replies open WhatsApp in a new window for you to send manually.

### Viewing Reply History

1. Open contact details
2. Click the **"Replies"** tab
3. View all previous replies:
   - Reply method (Email/WhatsApp)
   - Message content
   - Sent date and time
   - Status (sent/failed/pending)
   - Sent by (admin name)

### Deleting Contacts

1. Click the **Delete** button (trash icon)
2. Confirm deletion
3. Contact is permanently removed

---

## Wholesale Applications

The Wholesale section manages applications from businesses interested in wholesale, distribution, or retail partnerships.

### Viewing Applications

1. Navigate to **Wholesale** from the main menu
2. Filter by status:
   - **All**: All applications
   - **New**: New submissions
   - **Reviewing**: Under review
   - **Approved**: Approved applications
   - **Rejected**: Rejected applications

### Application Information

Each application shows:
- **ID**: Application ID
- **Type**: Wholesale, Distribution, or Retail
- **Name**: Applicant's name
- **Business Name**: Company name
- **Email**: Contact email
- **Location**: City and state
- **Status**: Current status
- **Date**: Submission date

### Viewing Application Details

1. Click the **eye icon** next to an application
2. View complete information:

#### Contact Information
- Full name
- Email (clickable mailto link)
- Phone (with WhatsApp and Call buttons)

#### Business Information
- Business name
- CAC Registration Number (with verification button)
- Website (if provided)
- Company logo (if uploaded)
- Physical address
- City, State, Country

#### Business Details
- Business types/categories
- About business description

#### Application Details
- Submission date and time
- Current status

### Verifying CAC Registration

1. Open application details
2. Click **"Verify"** next to CAC Registration Number
3. System verifies against CAC registry
4. View verification results:
   - **Verified**: Shows company details from CAC
   - **Not Verified**: Registration number not found

### Updating Application Status

1. Use the status dropdown in the Actions column
2. Select new status:
   - **New**: Initial submission
   - **Reviewing**: Under review
   - **Approved**: Application approved
   - **Rejected**: Application rejected
   - **Archived**: Archived for reference

### Contacting Applicants

From application details:
- **Email**: Click email address to send email
- **WhatsApp**: Click WhatsApp button to open chat
- **Call**: Click Call button to make phone call

### Deleting Applications

1. Click the **Delete** button (trash icon)
2. Confirm deletion
3. Application is permanently removed

---

## Stock Management

The Stock section provides comprehensive inventory management and reporting.

### Stock Dashboard

The stock dashboard shows:
- **Products with Stock Tracking**: Total products with inventory enabled
- **Low Stock**: Products below threshold
- **Out of Stock**: Products with zero inventory
- **Active Alerts**: Current stock alerts

### Stock Alerts

View and manage stock alerts:
1. Navigate to **Stock** → **Alerts** tab
2. Filter by alert type:
   - **All Alert Types**
   - **Low Stock**
   - **Out of Stock**
   - **Backorder**

3. View alert details:
   - Product name
   - Alert type
   - Current stock quantity
   - Alert creation date

4. **Resolve Alert**: Click "Resolve" to mark alert as handled
   - Add resolution notes (optional)
   - Alert is marked as resolved

### Stock Movements

Track all inventory changes:
1. Navigate to **Stock** → **Movements** tab
2. View movement history with filters:
   - **Start Date** / **End Date**: Filter by date range
   - **Movement Type**: Filter by type (Purchase, Sale, Adjustment, Return, Damaged, Transfer)
   - **Limit**: Number of records per page

3. Movement details show:
   - Date and time
   - Product name
   - Movement type
   - Quantity change (+/-)
   - Previous quantity
   - New quantity
   - Reference (order ID, etc.)
   - Notes
   - User who made the change

4. **Export to CSV**: Click "Export CSV" to download movement report

### Low Stock Report

1. Navigate to **Stock** → **Low Stock Report** tab
2. View products with low or out of stock:
   - Product name
   - Current stock
   - Low stock threshold
   - Status
   - Recommended order quantity
   - Current inventory value

3. **Export to CSV**: Download report for purchasing decisions

### Stock Value Report

1. Navigate to **Stock** → **Stock Value** tab
2. View inventory valuation:
   - **Total Inventory Value**: Total value of all stock
   - **Status Breakdown**: Value by stock status

3. Product details show:
   - Product name
   - Quantity on hand
   - Unit price
   - Total value
   - Stock status

4. **Export to CSV**: Download valuation report

### Summary Report

1. Navigate to **Stock** → **Summary** tab
2. Set date range (optional)
3. View summary statistics:
   - **Movement Summary by Type**: Count and totals by movement type
   - **Top Products by Movement Activity**: Most active products

### Bulk Stock Adjustment

1. Click **"Bulk Adjust Stock"** button
2. Enter:
   - **Product ID**: Product to adjust
   - **Quantity Change**: Positive to add, negative to subtract
   - **Movement Type**: Purchase, Adjustment, Return, or Damaged
   - **Notes**: Optional notes about the change

3. Click **"Adjust Stock"** to apply

---

## FAQs Management

The FAQs section manages frequently asked questions displayed on your website.

### Viewing FAQs

1. Navigate to **FAQs** from the main menu
2. Use the search bar to find specific FAQs
3. View FAQs in a table:
   - Question
   - Answer (truncated)
   - Display order
   - Active/Inactive status

### Adding a New FAQ

1. Click **"Add FAQ"** button
2. Fill in the form:
   - **Question***: The FAQ question
   - **Answer***: The FAQ answer
   - **Background Color**: Color picker for FAQ display
   - **Display Order**: Lower numbers appear first (0 for default)
   - **Active**: Toggle to show/hide on website

3. Click **"Create"** to save

### Editing an FAQ

1. Click the **Edit** button (pencil icon) next to the FAQ
2. Modify fields as needed
3. Click **"Update"** to save changes

### Deleting an FAQ

1. Click the **Delete** button (trash icon)
2. Choose deletion method:
   - **Deactivate**: Hide from website, keep in database
   - **Hard Delete**: Permanently remove

### Submitted Questions

The **Submitted Questions** tab shows questions submitted by website visitors:

1. View pending questions (marked with badge)
2. Click **"Answer"** button to respond
3. In the answer modal:
   - Enter your answer
   - Check **"Also create as FAQ"** to convert to FAQ
   - Click **"Submit Answer"**

4. Answered questions show the answer in the list

---

## Testimonials Management

The Testimonials section manages customer testimonials displayed on your website.

### Viewing Testimonials

1. Navigate to **Testimonials** from the main menu
2. Use the search bar to find specific testimonials
3. View testimonials in a table:
   - ID
   - Customer name
   - Comment (truncated)
   - Rating (star display)
   - Background color
   - Display order
   - Active/Inactive status

### Adding a New Testimonial

1. Click **"Add Testimonial"** button
2. Fill in the form:
   - **Name***: Customer name
   - **Comment***: Testimonial text
   - **Rating***: 1-5 stars
   - **Background Color**: Color picker for display
   - **Display Order**: Lower numbers appear first
   - **Active**: Toggle to show/hide on website

3. Click **"Create Testimonial"** to save

### Editing a Testimonial

1. Click the **Edit** button (pencil icon)
2. Modify fields as needed
3. Click **"Update Testimonial"** to save

### Deleting a Testimonial

1. Click the **Delete** button (trash icon)
2. Choose deletion method:
   - **Deactivate**: Hide from website
   - **Force Delete**: Permanently remove

---

## Flash Info Management

The Flash Info section manages promotional popups and announcements shown to website visitors.

### Viewing Flash Info

1. Navigate to **Flash Info** from the main menu
2. Use the search bar to find specific items
3. View items in a table:
   - ID
   - Title
   - Content type (Text, Image, GIF, Video)
   - Content preview
   - Display order
   - Active/Inactive status

### Adding New Flash Info

1. Click **"Add Flash Info"** button
2. Fill in the form:

#### Basic Settings
- **Title***: Title for the flash info
- **Content Type***: Choose from:
  - **Text (HTML)**: HTML formatted text
  - **Image**: Image file or URL
  - **GIF**: Animated GIF file or URL
  - **Video**: Video URL (YouTube, Vimeo, or direct link)

#### Content
- **For Text**: Enter HTML formatted text (supports tags like `<strong>`, `<em>`, `<p>`, `<br>`, etc.)
- **For Image/GIF/Video**: 
  - Enter URL directly, OR
  - Upload file (for images/GIFs only, max 2MB)
  - Preview appears after upload/URL entry

#### Display Settings
- **Display Order**: Lower numbers appear first
- **Delay (milliseconds)***: Time before showing popup (default: 3000ms = 3 seconds)
- **Storage Expiry (minutes)***: Minutes before showing again after user closes (default: 1440 = 24 hours)
  - Set to 0 to always show
- **Active**: Toggle to enable/disable

3. Click **"Create Flash Info"** to save

### Editing Flash Info

1. Click the **Edit** button (pencil icon)
2. Modify fields as needed
3. Click **"Update Flash Info"** to save

### Deleting Flash Info

1. Click the **Delete** button (trash icon)
2. Choose deletion method:
   - **Deactivate**: Hide from website
   - **Force Delete**: Permanently remove

---

## Admin Users Management

**Admin Only**: This section is only accessible to users with Admin role.

### Viewing Users

1. Navigate to **Admin Users** from the main menu
2. View all CMS users in a table:
   - ID
   - Username
   - Email
   - Full Name
   - Role (Admin, Sales, Support)
   - Status (Active/Inactive)
   - Last Login
   - Actions

### Adding a New User

1. Click **"Add User"** button
2. Fill in the form:
   - **Username***: Unique username
   - **Email***: User's email address
   - **Full Name**: User's full name (optional)
   - **Password***: Minimum 6 characters
   - **Role***: Admin, Sales, or Support
   - **Active**: Toggle to enable/disable account

3. Click **"Create"** to save

### Editing a User

1. Click the **Edit** button (pencil icon) next to the user
2. Modify fields as needed:
   - **Password**: Leave blank to keep current password, or enter new password
   - **Role**: Change user role
   - **Active**: Enable/disable account

3. Click **"Update"** to save

### Deleting a User

1. Click the **Delete** button (trash icon)
2. Confirm deletion
3. **Note**: The default admin user (ID: 1) cannot be deleted

---

## Profile Management

Manage your own account settings from the Profile section.

### Accessing Profile

1. Navigate to **Profile** from the main menu
2. View your account information

### Updating Your Name

1. In the **"Update Name"** card:
   - **Username**: Displayed (cannot be changed)
   - **Email**: Displayed (cannot be changed)
   - **Full Name**: Enter or update your full name

2. Click **"Update Name"** to save

### Changing Your Password

1. In the **"Change Password"** card:
   - **Current Password***: Enter your current password
   - **New Password***: Enter new password (minimum 6 characters)
   - **Confirm New Password***: Re-enter new password

2. Click **"Update Password"** to save

**Note**: You must know your current password to change it. If you've forgotten your password, contact an administrator.

---

## Troubleshooting

### Common Issues and Solutions

#### Cannot Log In
- **Issue**: Login fails with correct credentials
- **Solution**: 
  - Verify username and password are correct
  - Check if account is active (contact admin)
  - Clear browser cache and cookies
  - Try a different browser

#### Image Upload Fails
- **Issue**: Image upload shows error
- **Solution**:
  - Check file size (max 2MB)
  - Verify file format (JPEG, PNG, GIF, WebP, AVIF)
  - Ensure stable internet connection
  - Try compressing the image

#### Cannot Access a Section
- **Issue**: Section is not visible or shows "Access Denied"
- **Solution**:
  - Check your user role permissions
  - Contact admin if you need access
  - Refer to [User Roles and Permissions](#user-roles-and-permissions) section

#### Stock Not Updating
- **Issue**: Stock quantity doesn't change after adjustment
- **Solution**:
  - Verify stock tracking is enabled for the product
  - Check if you have permission to update stock
  - Refresh the page
  - Check stock history for the change

#### Order Status Not Saving
- **Issue**: Order status reverts after change
- **Solution**:
  - Ensure you have permission to update orders
  - Check internet connection
  - Refresh page and try again
  - Contact admin if issue persists

#### Email Replies Not Sending
- **Issue**: Email reply fails to send
- **Solution**:
  - Verify customer email is valid
  - Check email server configuration (contact admin)
  - Try WhatsApp reply instead

#### CAC Verification Fails
- **Issue**: CAC registration number not verified
- **Solution**:
  - Verify the CAC number is correct
  - Check internet connection
  - CAC registry may be temporarily unavailable
  - Try again later

### Getting Help

If you encounter issues not covered here:

1. **Check Permissions**: Verify your role has access to the feature
2. **Refresh Page**: Simple refresh often resolves display issues
3. **Clear Cache**: Clear browser cache and cookies
4. **Contact Admin**: Reach out to your system administrator
5. **Check Browser**: Ensure you're using a modern, supported browser (Chrome, Firefox, Safari, Edge)

### Best Practices

1. **Regular Backups**: Ensure regular database backups are performed
2. **Password Security**: Use strong, unique passwords
3. **Logout**: Always log out when finished, especially on shared computers
4. **Stock Updates**: Update stock immediately after receiving inventory
5. **Order Processing**: Update order status promptly for better customer experience
6. **Contact Responses**: Reply to customer inquiries within 24 hours
7. **Content Review**: Regularly review and update FAQs, testimonials, and flash info

---

## Appendix

### Keyboard Shortcuts

- **Ctrl/Cmd + K**: Focus search (where applicable)
- **Esc**: Close modals
- **Enter**: Submit forms

### Supported File Formats

- **Images**: JPEG, PNG, GIF, WebP, AVIF
- **Max File Size**: 2MB per image
- **Videos**: YouTube, Vimeo, or direct video links

### Status Definitions

#### Order Status
- **Pending**: Order received, awaiting processing
- **Processing**: Order being prepared
- **Shipped**: Order dispatched to customer
- **Delivered**: Order completed
- **Cancelled**: Order cancelled

#### Contact Status
- **New**: Unread message
- **Read**: Message reviewed
- **Replied**: Response sent
- **Archived**: Archived for reference

#### Wholesale Status
- **New**: New application
- **Reviewing**: Under review
- **Approved**: Application approved
- **Rejected**: Application rejected
- **Archived**: Archived for reference

#### Stock Status
- **In Stock**: Quantity above threshold
- **Low Stock**: Quantity below threshold
- **Out of Stock**: Quantity is zero
- **On Backorder**: Zero stock but backorders allowed

---

**Last Updated**: [Current Date]

**Version**: 1.0

For technical support or feature requests, please contact your system administrator.

