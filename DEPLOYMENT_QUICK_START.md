# Quick Start Deployment Guide

## For Root Domain Deployment (celineolivia.com)

### 1. Build the Application
```bash
npm install
npm run build
```

### 2. Upload Files Structure
```
public_html/  ← Most common name (check your hosting control panel)
              Alternative names: www/, htdocs/, httpdocs/
├── .htaccess                    ← Upload from project root
├── index.html                   ← From build/ directory
├── static/                      ← From build/static/
│   ├── css/
│   ├── js/
│   └── media/
├── assets/                      ← From build/assets/ (if exists)
└── api/                         ← Upload entire api/ directory
    ├── config.php               ← Update with production values
    ├── products.php
    ├── contacts.php
    └── ... (all other PHP files)
```

### 3. Configure Database
1. Create database on hosting server
2. Import `api/schema.sql`
3. Update `api/config.php` with database credentials

### 4. Update API Configuration
Edit `api/config.php`:
- Database credentials (DB_HOST, DB_NAME, DB_USER, DB_PASS)
- Mailgun settings (verify MAILGUN_DOMAIN - currently 'educare.school')
- Email addresses (already set to celineolivia.com)

### 5. Test
- Visit: `https://celineolivia.com`
- Test API: `https://celineolivia.com/api/products.php`
- Test CMS: `https://celineolivia.com/cms`

## Important Notes

- The `.htaccess` file handles React Router routing automatically
- API calls use `/api` path (no proxy needed in production)
- Ensure `mod_rewrite` is enabled on Apache
- File permissions: 755 for directories, 644 for files

## Troubleshooting

**404 errors on page refresh:**
- Check `.htaccess` is uploaded
- Verify `mod_rewrite` is enabled

**API not working:**
- Check PHP error logs
- Verify database connection
- Test API endpoint directly in browser

**Static files not loading:**
- Verify all files from `build/` are uploaded
- Check file permissions

See `DEPLOYMENT.md` for detailed instructions.

