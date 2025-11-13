# Deployment Checklist for celineolivia.com

Use this checklist to ensure a smooth deployment.

## Pre-Deployment

- [ ] **Build React Application**
  - [ ] Run `npm install` or `yarn install`
  - [ ] Run `npm run build` or `yarn build`
  - [ ] Verify `build` directory was created successfully

- [ ] **Database Setup**
  - [ ] Create MySQL database on hosting server
  - [ ] Import `api/schema.sql`
  - [ ] Run any necessary migration scripts
  - [ ] Test database connection

- [ ] **Configuration Files**
  - [ ] Update `api/config.php` with production values:
    - [ ] Mailgun domain (currently shows 'educare.school' - update if needed)
    - [ ] Mailgun API keys
    - [ ] Email addresses (already set to celineolivia.com)
    - [ ] Database credentials
  - [ ] Verify `api/config.php` is in `.gitignore` (already configured)

## File Upload

- [ ] **Upload Build Files**
  - [ ] Upload all contents of `build/` directory to web root
  - [ ] Verify `index.html` is in the root
  - [ ] Verify `static/` directory is uploaded

- [ ] **Upload API Files**
  - [ ] Upload entire `api/` directory
  - [ ] Verify `config.php` is uploaded (but not committed to git)
  - [ ] Set appropriate file permissions (755 for directories, 644 for files)

- [ ] **Upload Configuration**
  - [ ] Upload `.htaccess` file to web root
  - [ ] Verify `.htaccess` is active (check Apache error logs if issues)

## Post-Deployment Testing

- [ ] **Basic Functionality**
  - [ ] Homepage loads correctly
  - [ ] Navigation works
  - [ ] All pages accessible via React Router
  - [ ] No 404 errors on direct page access

- [ ] **API Endpoints**
  - [ ] Test: `https://celineolivia.com/api/products.php`
  - [ ] Test: `https://celineolivia.com/api/contacts.php`
  - [ ] Verify API returns JSON responses

- [ ] **Forms**
  - [ ] Contact form submission
  - [ ] Order form submission
  - [ ] Wholesale application form
  - [ ] Verify email notifications are sent

- [ ] **CMS Access**
  - [ ] Navigate to `/cms`
  - [ ] Login works
  - [ ] Dashboard loads
  - [ ] Product management works
  - [ ] Order management works
  - [ ] Contact management works

- [ ] **Static Assets**
  - [ ] Images load correctly
  - [ ] Fonts load correctly
  - [ ] CSS styles applied
  - [ ] JavaScript executes without errors

- [ ] **Security**
  - [ ] HTTPS is enabled (if available)
  - [ ] `config.php` is not publicly accessible
  - [ ] Database credentials are secure
  - [ ] File uploads are restricted appropriately

## Configuration Verification

- [ ] **Mailgun**
  - [ ] MAILGUN_DOMAIN is correct (currently 'educare.school' - verify this is correct)
  - [ ] API keys are valid
  - [ ] From addresses use celineolivia.com domain
  - [ ] Test email sending

- [ ] **Database**
  - [ ] Connection works
  - [ ] All tables exist
  - [ ] Admin user exists (run `api/seed-admin.php` if needed)

- [ ] **File Permissions**
  - [ ] Upload directories are writable
  - [ ] PHP files are executable
  - [ ] Static files are readable

## Performance

- [ ] **Caching**
  - [ ] Browser caching headers work (check Network tab)
  - [ ] Static assets are cached

- [ ] **Compression**
  - [ ] Gzip compression is enabled (check in Network tab)

- [ ] **Load Time**
  - [ ] Homepage loads in reasonable time
  - [ ] Images are optimized
  - [ ] No console errors

## Final Steps

- [ ] **Documentation**
  - [ ] Document any custom configurations
  - [ ] Save database credentials securely
  - [ ] Note any server-specific settings

- [ ] **Monitoring**
  - [ ] Set up error logging
  - [ ] Monitor email delivery
  - [ ] Check server logs regularly

## Rollback Plan

If issues occur:
- [ ] Keep backup of previous version
- [ ] Document rollback procedure
- [ ] Test rollback process

## Notes

- Domain: **celineolivia.com**
- Current Mailgun domain in config: **educare.school** (verify if this needs updating)
- Email addresses: Already configured for celineolivia.com
- Build output: `build/` directory
- API location: `/api/` directory

