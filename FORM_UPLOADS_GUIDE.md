# Form Uploads Guide

This document explains how file uploads from forms are handled and where they're stored.

## Upload Types

### 1. **Wholesale Application Logo Upload**
**Form:** Wholesale Application Form (`/wholesale`)  
**API Endpoint:** `/api/upload-wholesale-logo.php`  
**Upload Directory:** `public_html/assets/images/`  
**File Naming:** `wholesale_logo_{timestamp}_{uniqid}.{ext}`  
**Max File Size:** 5MB  
**Allowed Types:** JPEG, PNG, GIF, WebP

**How it works:**
1. User selects logo file in wholesale form
2. File is uploaded immediately when selected (before form submission)
3. Upload API returns path: `/assets/images/wholesale_logo_1234567890_abc123.png`
4. Path is stored in form data and submitted with the application
5. Path is saved in database with the wholesale application record

**Example uploaded filename:**
```
wholesale_logo_1762991231_69151c7f599f7.png
```

### 2. **CMS Product Image Upload**
**Form:** CMS Product Management (`/cms/products`)  
**API Endpoint:** `/api/upload-image.php`  
**Upload Directory:** `public_html/assets/images/`  
**File Naming:** `{sanitized_original_name}_{timestamp}_{uniqid}.{ext}`  
**Max File Size:** Based on PHP `upload_max_filesize` setting  
**Allowed Types:** JPEG, PNG, GIF, WebP, AVIF

**How it works:**
1. Admin uploads product images through CMS
2. Images are uploaded for: first image, hover image, additional images
3. Upload API returns path: `/assets/images/product_name_1234567890_abc123.png`
4. Paths are saved in product record in database

**Example uploaded filename:**
```
shampoo_1762999168_69153b804b96b.png
```

### 3. **CMS Flash Info Content Upload**
**Form:** CMS Flash Info Management (`/cms/flash-info`)  
**API Endpoint:** `/api/upload-image.php` (same as product images)  
**Upload Directory:** `public_html/assets/images/`  
**File Naming:** Same as product images  
**Max File Size:** Based on PHP `upload_max_filesize` setting  
**Allowed Types:** JPEG, PNG, GIF, WebP, AVIF

**How it works:**
1. Admin uploads images/GIFs for flash info content
2. Can also use external URLs (YouTube, Vimeo, or direct image URLs)
3. If uploading file, uses same upload API as product images
4. Path or URL is saved in flash_info table

## Upload Directory Structure

All form uploads go to the **same directory**:

```
public_html/assets/images/
├── static-image1.png                    ← Pre-deployed static images
├── static-image2.png                    ← Pre-deployed static images
├── wholesale_logo_1234567890_abc.png    ← Wholesale form upload
├── wholesale_logo_1234567891_def.png    ← Another wholesale upload
├── product_1234567892_ghi.png          ← CMS product image
├── product_1234567893_jkl.png          ← CMS product image
├── flash_1234567894_mno.png            ← CMS flash info image
└── ...
```

## Production Setup Requirements

### 1. Directory Permissions
The `public_html/assets/images/` directory must be **writable** by the web server:

```bash
# Set permissions (755 for most cases, 775 if web server needs write access)
chmod 755 public_html/assets/images/
# Or
chmod 775 public_html/assets/images/
```

### 2. PHP Configuration
Ensure PHP allows file uploads:

```php
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
```

These settings are typically in `php.ini` or can be set in `.htaccess` (already configured in the project's `.htaccess`).

### 3. Directory Creation
The upload scripts will attempt to create the directory if it doesn't exist, but it's better to ensure it exists before deployment:

```bash
mkdir -p public_html/assets/images/
chmod 755 public_html/assets/images/
```

## Upload API Responses

### Successful Upload Response
```json
{
  "success": true,
  "message": "Logo uploaded successfully",
  "filename": "wholesale_logo_1234567890_abc123.png",
  "originalName": "company-logo.png",
  "path": "/assets/images/wholesale_logo_1234567890_abc123.png",
  "fullPath": "/assets/images/wholesale_logo_1234567890_abc123.png",
  "size": 245678,
  "mimeType": "image/png"
}
```

### Error Response
```json
{
  "success": false,
  "message": "File too large. Maximum size is 5MB"
}
```

## Accessing Uploaded Files

Uploaded files are accessible via their path:

```
https://celineolivia.com/assets/images/wholesale_logo_1234567890_abc123.png
https://celineolivia.com/assets/images/product_1234567892_ghi.png
```

The path returned from the upload API can be used directly in:
- Image `<img>` tags
- CSS `background-image` URLs
- Database storage (saved as-is)

## Database Storage

Uploaded file paths are stored in the database:

- **Wholesale applications:** `companyLogo` field in `wholesale_applications` table
- **Products:** `firstImg`, `hoverImg`, `additionalImgs` fields in `products` table
- **Flash Info:** `contentUrl` field in `flash_info` table

## Backup Considerations

**Important:** User-uploaded files are NOT in your git repository!

1. **Regular Backups:**
   - Backup `public_html/assets/images/` directory regularly
   - Include in your backup strategy alongside database backups

2. **Migration:**
   - When migrating servers, copy `public_html/assets/images/` directory
   - Export database to get all file paths
   - Ensure all referenced files are copied

3. **Cleanup:**
   - Consider implementing cleanup for orphaned files (files not referenced in database)
   - This can be done via a maintenance script

## Troubleshooting

### Uploads Failing

1. **Check Directory Permissions:**
   ```bash
   ls -la public_html/assets/images/
   # Should show drwxr-xr-x or drwxrwxr-x
   ```

2. **Check PHP Error Logs:**
   - Look for upload-related errors
   - Check `upload_max_filesize` and `post_max_size`

3. **Test Directory Write Access:**
   ```bash
   touch public_html/assets/images/test.txt
   # If this fails, directory is not writable
   ```

### Files Not Displaying

1. **Check File Paths:**
   - Verify paths in database match actual file locations
   - Check for typos or incorrect paths

2. **Check File Permissions:**
   ```bash
   ls -la public_html/assets/images/wholesale_logo_*.png
   # Files should be readable (644 permissions)
   ```

3. **Check .htaccess:**
   - Ensure `.htaccess` doesn't block image files
   - Verify static file serving is working

## Security Notes

1. **File Type Validation:**
   - Both upload APIs validate MIME types
   - Only image types are allowed

2. **File Size Limits:**
   - Wholesale logos: 5MB max
   - CMS uploads: Based on PHP settings (default 10MB in `.htaccess`)

3. **Filename Sanitization:**
   - Original filenames are sanitized
   - Unique timestamps prevent conflicts
   - Prevents directory traversal attacks

4. **Authentication:**
   - CMS uploads require authentication (Bearer token)
   - Wholesale logo uploads are public (but validated)

