# Database Setup Guide

This guide explains how to set up the database for the Olivia Products application.

## Quick Setup (Recommended)

### Step 1: Configure Database Credentials

Edit `api/config.php` and update:
```php
define('DB_HOST', 'localhost'); // or your database host
define('DB_NAME', 'olivia_products'); // your database name
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');
```

### Step 2: Run Schema Installation

Visit this URL in your browser:
```
https://celineolivia.com/api/install-schema.php?run=1
```

This will:
- Create the database if it doesn't exist
- Create all required tables
- Insert initial data (testimonials, admin user)
- Show you a summary of what was created

### Step 3: Create Admin User

Visit this URL to create/update the admin user:
```
https://celineolivia.com/api/seed-admin.php?run=1
```

**Important:** Before running seed-admin.php, edit the file to change the default password from `admin123` to a secure password!

## Alternative Setup Methods

### Method 1: phpMyAdmin

1. Log into phpMyAdmin on your hosting server
2. Create a new database (or select existing one)
3. Click on "Import" tab
4. Choose file: `api/schema.sql`
5. Click "Go" to import

### Method 2: Command Line (SSH)

If you have SSH access:

```bash
# Navigate to project directory
cd /path/to/olivia-products

# Run the installation script
php api/install-schema.php

# Or import SQL directly
mysql -u your_username -p your_database < api/schema.sql
```

### Method 3: MySQL Client

```bash
mysql -u your_username -p
```

Then in MySQL:
```sql
source /path/to/olivia-products/api/schema.sql;
```

## What Gets Created

The schema installation creates:

### Tables
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `contact_submissions` - Contact form submissions
- `contact_replies` - Replies to contact submissions
- `wholesale_submissions` - Wholesale application forms
- `admin_users` - CMS admin users
- `stock_movements` - Stock change history
- `stock_alerts` - Low stock alerts
- `testimonials` - Customer testimonials
- `flash_info` - Flash info modal content
- `product_reviews` - Product reviews (if migration is run)

### Initial Data
- 5 sample testimonials
- 1 default admin user (username: `admin`, password: `admin123` - **CHANGE THIS!**)

## Post-Installation Steps

### 1. Update Admin Password

**Before running seed-admin.php**, edit `api/seed-admin.php` and change:
```php
$password = 'admin123'; // CHANGE THIS!
```

Then visit: `https://celineolivia.com/api/seed-admin.php?run=1`

### 2. Secure Installation Scripts

After installation, protect or remove installation scripts:

**Option A: Delete the files**
```bash
rm api/install-schema.php
rm api/seed-admin.php
```

**Option B: Protect with .htaccess**
Uncomment these lines in `.htaccess`:
```apache
<FilesMatch "^(install-schema\.php|seed-admin\.php)$">
  Order allow,deny
  Deny from all
</FilesMatch>
```

**Option C: Move outside web root**
Move the files to a directory outside `public_html/`

### 3. Verify Installation

Check that tables were created:
- Visit phpMyAdmin
- Select your database
- Verify all tables are listed

Or test via your application:
- Try logging into CMS: `/cms`
- Check if products page loads

## Troubleshooting

### "Access Denied" Error

If you see "Access Denied" when visiting the URL:
- Make sure you added `?run=1` to the URL
- Check file permissions (should be 644)

### "Database connection failed"

- Verify database credentials in `api/config.php`
- Check if database exists (or let script create it)
- Verify database user has CREATE DATABASE and CREATE TABLE permissions
- Check if database host is correct (some hosts use `localhost`, others use a specific hostname)

### "Table already exists" Warnings

These are normal if you're re-running the installation. The script uses `CREATE TABLE IF NOT EXISTS` so it won't overwrite existing data.

### "Permission denied" Errors

- Check database user permissions
- User needs: CREATE, DROP, INSERT, UPDATE, DELETE, SELECT, INDEX
- Some hosts require you to grant permissions via cPanel

### Installation Script Not Found

- Verify `api/install-schema.php` was uploaded to the server
- Check file path: should be at `public_html/api/install-schema.php`
- Verify file permissions (644 or 755)

## Database Migrations

After initial setup, you may need to run additional migrations:

- `migrate-add-product-reviews.php` - Adds product reviews table
- `migrate-add-wholesale-logo.php` - Adds logo field to wholesale table
- `migrate-add-wholesale-cac.php` - Adds CAC registration field
- `migrate-add-business-physical-address.php` - Adds physical address field
- `migrate-add-tiered-pricing.php` - Adds tiered pricing fields
- `migrate-add-stock-management.php` - Adds stock management fields
- `migrate-add-testimonials.php` - Adds testimonials table
- `migrate-add-flash-info.php` - Adds flash info table

Most migrations can be run via URL:
```
https://celineolivia.com/api/migrate-[name].php
```

## Backup Recommendations

Before running any installation or migration:

1. **Backup Database:**
   ```bash
   mysqldump -u username -p database_name > backup.sql
   ```

2. **Backup Files:**
   - Backup `api/config.php` (contains credentials)
   - Backup uploaded images in `public_html/assets/images/`

3. **Regular Backups:**
   - Set up automated database backups
   - Backup uploaded files regularly

## Security Notes

1. **Never commit `config.php` to git** - It contains sensitive credentials
2. **Change default admin password** immediately after installation
3. **Protect installation scripts** after use (delete or restrict access)
4. **Use strong database passwords**
5. **Limit database user permissions** to only what's needed
6. **Enable SSL/HTTPS** for database connections if possible

