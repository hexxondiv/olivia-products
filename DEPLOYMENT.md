# Deployment Guide for celineolivia.com

This guide will help you deploy the Olivia Products application to a shared hosting server.

## Prerequisites

- Node.js and npm/yarn installed on your local machine (for building)
- Access to shared hosting server via FTP/SFTP or cPanel
- PHP 7.4 or higher on the server
- MySQL/MariaDB database access
- Apache web server with mod_rewrite enabled

## Pre-Deployment Checklist

### 1. Build the React Application

On your local machine, run:

```bash
npm install
# or
yarn install

npm run build
# or
yarn build
```

This will create a `build` directory with optimized production files.

### 2. Configure Database

1. Create a MySQL database on your shared hosting server (or let the script create it)
2. Update database credentials in `api/config.php`
3. Import the database schema using one of these methods:

   **Option A: Via URL (Easiest)**
   - Visit: `https://celineolivia.com/api/install-schema.php?run=1`
   - This will create the database and all tables automatically
   - Make sure `api/config.php` has correct database credentials first
   
   **Option B: Via phpMyAdmin**
   - Log into phpMyAdmin
   - Select or create your database
   - Go to "Import" tab
   - Choose `api/schema.sql` file
   - Click "Go"
   
   **Option C: Via Command Line**
   ```bash
   mysql -u your_username -p your_database < api/schema.sql
   ```
   
   **Option D: Via PHP Script (Command Line)**
   ```bash
   php api/install-schema.php
   ```

3. Run any necessary migrations (check `api/` directory for migration files)

### 3. Configure API Settings

Update `api/config.php` with your production values:

```php
// Mailgun Configuration
define('MAILGUN_DOMAIN', 'your-mailgun-domain.com');
define('MAILGUN_PRIVATE_KEY', 'your-private-api-key');
define('MAILGUN_PUBLIC_KEY', 'your-public-api-key');
define('MAILGUN_FROM_ADDRESS', 'info@celineolivia.com');
define('MAILGUN_FROM_NAME', 'Olivia Products');
define('MAILGUN_REPLY_TO', 'info@celineolivia.com');
define('MAILGUN_FORCE_FROM_ADDRESS', 'info@celineolivia.com');
define('SALES_EMAIL', 'sales@celineolivia.com');
define('CONTACT_EMAIL', 'contact@celineolivia.com');

// Database Configuration
define('DB_HOST', 'localhost'); // or your database host
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');
```

**Important:** Never commit `config.php` to version control. It should be in `.gitignore`.

### 4. Set Up File Permissions

Ensure the following directories are writable by the web server:
- `api/` (for uploads)
- Any upload directories used by the application

On most shared hosts, this is typically handled automatically, but you may need to set permissions to 755 for directories and 644 for files.

## Deployment Steps

### Option 1: Deploy to Root Domain (celineolivia.com)

If deploying to the root of your domain:

1. **Upload Files:**
   - Upload the entire `build` directory contents to your web root
     - **Most shared hosts**: `public_html/` (this is the most common)
     - **Alternative names**: `www/`, `htdocs/`, or `httpdocs/`
     - Check your hosting control panel to confirm the exact directory name
   - Upload the `api` directory to your web root
   - Upload the `.htaccess` file to your web root
   - **Important for media files:**
     - `build/static/` → contains processed React component images
     - `build/assets/` → contains static images (and will store user uploads)
     - Ensure `assets/images/` directory is writable (755 or 775 permissions) for CMS uploads
     - See `MEDIA_FILES_GUIDE.md` for detailed media file information

2. **Directory Structure:**
   ```
   public_html/  (or www/, htdocs/, httpdocs/ - depends on your host)
   ├── .htaccess
   ├── index.html (from build/)
   ├── static/ (from build/static/)
   ├── assets/ (from build/assets/)
   └── api/
       ├── config.php
       ├── products.php
       └── ... (all other PHP files)
   ```

3. **Update .htaccess:**
   The `.htaccess` file is already configured, but verify the RewriteBase matches your setup.

### Option 2: Deploy to Subdirectory

If deploying to a subdirectory (e.g., `celineolivia.com/olivia-products/`):

1. **Update package.json:**
   Add homepage field:
   ```json
   {
     "homepage": "/olivia-products"
   }
   ```

2. **Rebuild:**
   ```bash
   npm run build
   ```

3. **Upload Files:**
   - Upload `build` directory contents to `public_html/olivia-products/`
   - Upload `api` directory to `public_html/olivia-products/api/`
   - Upload `.htaccess` to `public_html/olivia-products/`

4. **Update .htaccess RewriteBase:**
   Change `RewriteBase /` to `RewriteBase /olivia-products/`

## Post-Deployment

### 1. Verify API Endpoints

Test that API endpoints are accessible:
- `https://celineolivia.com/api/products.php`
- `https://celineolivia.com/api/contacts.php`

### 2. Test React Router

Navigate to different pages to ensure client-side routing works:
- `https://celineolivia.com/`
- `https://celineolivia.com/about`
- `https://celineolivia.com/collections`
- etc.

### 3. Test CMS Access

1. Navigate to `https://celineolivia.com/cms`
2. Log in with admin credentials
3. Verify all CMS features work correctly

### 4. Test Form Submissions

- Test contact form
- Test order submission
- Test wholesale application

### 5. Verify Email Configuration

Send test emails to ensure Mailgun is configured correctly.

## Troubleshooting

### React Router 404 Errors

If you get 404 errors on direct page access:
- Verify `.htaccess` is uploaded and active
- Check that `mod_rewrite` is enabled on Apache
- Verify RewriteBase is correct for your directory structure

### API Calls Failing

1. Check browser console for CORS errors
2. Verify API files are accessible directly
3. Check PHP error logs on the server
4. Verify database connection in `config.php`

### Build Files Not Loading

1. Verify all files from `build/` directory are uploaded
2. Check file permissions (should be 644 for files, 755 for directories)
3. Verify `.htaccess` is not blocking static files

### Database Connection Issues

1. Verify database credentials in `config.php`
2. Check if database host allows connections from your web server
3. Some shared hosts require `localhost` or a specific database hostname

## Environment Variables (Optional)

If you prefer using environment variables instead of hardcoding in `config.php`, you can set them in your hosting control panel or `.htaccess`:

```apache
SetEnv DB_HOST "localhost"
SetEnv DB_NAME "your_database"
SetEnv DB_USER "your_user"
SetEnv DB_PASS "your_password"
```

## Security Recommendations

1. **Protect config.php:**
   - Ensure `config.php` is not publicly accessible
   - The `.htaccess` file includes rules to protect it

2. **Use HTTPS:**
   - Enable SSL certificate for celineolivia.com
   - Update any hardcoded HTTP URLs to HTTPS

3. **Database Security:**
   - Use strong database passwords
   - Limit database user permissions to only what's needed

4. **File Uploads:**
   - Verify upload file types and sizes
   - Store uploads outside web root if possible

## Maintenance

### Updating the Application

1. Make changes locally
2. Test thoroughly
3. Build: `npm run build`
4. Upload only changed files (or entire `build` directory)
5. Clear browser cache if needed

### Database Backups

Regularly backup your database:
```bash
mysqldump -u username -p database_name > backup.sql
```

## Support

For issues specific to:
- **React/Frontend:** Check browser console and network tab
- **PHP/Backend:** Check server error logs
- **Database:** Check MySQL error logs
- **Email:** Verify Mailgun configuration and check Mailgun dashboard

