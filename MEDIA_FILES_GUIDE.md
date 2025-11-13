# Media Files Location Guide

This document explains where different types of media files are located and where they should be on the production server.

## Types of Media Files

### 1. **React Component Images** (from `src/assets/images/`)
**Location in source:** `src/assets/images/`  
**Location after build:** `build/static/media/` (with hashed filenames)  
**How they're used:** Imported directly in React components

**Example:**
```javascript
import Logo from "../../assets/images/logo.png";
```

**In Production:**
- These are automatically processed by webpack during `npm run build`
- They end up in `build/static/media/` with hashed filenames
- **Action:** Upload the entire `build/static/` directory to your web root
- **Final location:** `public_html/static/media/` (or `www/static/media/`)

### 2. **Public Static Images** (from `public/assets/images/`)
**Location in source:** `public/assets/images/`  
**Location after build:** `build/assets/images/` (copied as-is)  
**How they're used:** Referenced by URL path (e.g., `/assets/images/product.png`)

**In Production:**
- These are copied directly from `public/` to `build/` during build
- **Action:** Upload `build/assets/` directory to your web root
- **Final location:** `public_html/assets/images/` (or `www/assets/images/`)

### 3. **User-Uploaded Images** (via Forms & CMS)
**Upload location:** `public/assets/images/`  
**Uploaded via:** 
- `api/upload-image.php` - CMS product images, flash info images
- `api/upload-wholesale-logo.php` - Wholesale application logos

**In Production:**
- These are uploaded dynamically through:
  - **CMS forms** (product images, flash info content)
  - **Public forms** (wholesale application logos)
- **Action:** Ensure `public_html/assets/images/` directory exists and is **writable** (permissions 755 or 775)
- **Final location:** `public_html/assets/images/` (same as #2 above)
- **Important:** This directory must be writable by the web server for uploads to work
- **File naming:**
  - CMS uploads: `{original_name}_{timestamp}_{uniqid}.{ext}`
  - Wholesale logos: `wholesale_logo_{timestamp}_{uniqid}.{ext}`

## Production File Structure

After deployment, your media files should be organized like this:

```
public_html/ (or www/)
├── static/
│   └── media/
│       ├── logo.abc123.png          ← From src/assets/images/ (webpack processed)
│       ├── flower.def456.jpg       ← From src/assets/images/ (webpack processed)
│       └── ...
├── assets/
│   └── images/
│       ├── product1.png             ← Static files from public/assets/images/
│       ├── product2.png             ← Static files from public/assets/images/
│       ├── shampoo_1234567890_abc123.png     ← User-uploaded via CMS (product images)
│       ├── wholesale_logo_1234567890_xyz789.png   ← User-uploaded via public form (wholesale logos)
│       └── ...
└── api/
    ├── upload-image.php             ← Handles CMS uploads to ../assets/images/
    └── upload-wholesale-logo.php    ← Handles form uploads to ../assets/images/
```

## Deployment Checklist for Media Files

### During Build
- [ ] Run `npm run build` - this automatically processes `src/assets/images/` into `build/static/media/`
- [ ] Verify `build/assets/images/` contains files from `public/assets/images/`

### During Upload
- [ ] Upload `build/static/` → `public_html/static/`
- [ ] Upload `build/assets/` → `public_html/assets/`
- [ ] Ensure `public_html/assets/images/` directory exists

### Post-Deployment
- [ ] Set permissions on `public_html/assets/images/` to **755** or **775** (writable by web server)
- [ ] Test image uploads via CMS to verify directory is writable
- [ ] Verify static images load correctly (check browser console for 404 errors)

## Important Notes

1. **User-Uploaded Files Persist:**
   - Files uploaded via CMS are saved to `public_html/assets/images/`
   - Files uploaded via public forms (wholesale logos) are also saved to `public_html/assets/images/`
   - These files are NOT in your git repository
   - Make sure to backup this directory regularly

2. **All Form Uploads Go to Same Directory:**
   - **CMS uploads** (product images, flash info): `public_html/assets/images/`
   - **Wholesale form uploads** (company logos): `public_html/assets/images/`
   - Both use the same directory, so ensure it's writable for all upload types

3. **Build vs. Runtime:**
   - `build/static/media/` - Created during build, contains processed React component images
   - `public_html/assets/images/` - Contains both static images AND user uploads

4. **Path References:**
   - React component images: Automatically handled by webpack (no manual path needed)
   - Static/public images: Use `/assets/images/filename.png` in code
   - User-uploaded images: Stored in same location, referenced by filename/path returned from upload API
   - Upload APIs return paths like `/assets/images/filename.png` which can be used directly in the frontend

5. **Permissions:**
   ```bash
   # Set correct permissions for upload directory
   chmod 755 public_html/assets/images/
   # Or if web server needs write access:
   chmod 775 public_html/assets/images/
   ```

## Troubleshooting

**Images not loading:**
- Check browser console for 404 errors
- Verify `static/` and `assets/` directories are uploaded
- Check file paths match the build output

**Uploads not working:**
- Verify `public_html/assets/images/` directory exists
- Check directory permissions (must be writable)
- Check PHP error logs for upload errors
- Verify `upload_max_filesize` in PHP configuration

**Missing images after deployment:**
- User-uploaded images need to be migrated separately (they're not in git)
- Export database to get image filenames
- Manually copy `public/assets/images/` from old server if migrating

