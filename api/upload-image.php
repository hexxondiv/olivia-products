<?php
/**
 * Image Upload API for CMS
 * Handles product image uploads to public/assets/images directory
 * 
 * POST /api/upload-image.php
 * Requires: multipart/form-data with 'image' field
 */

ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

ob_clean();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_clean();
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth-helper.php';

// Require authentication for uploads
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    ob_end_flush();
    exit();
}

try {
    // Check if file was uploaded
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        $errorMsg = 'No file uploaded';
        if (isset($_FILES['image']['error'])) {
            switch ($_FILES['image']['error']) {
                case UPLOAD_ERR_INI_SIZE:
                case UPLOAD_ERR_FORM_SIZE:
                    $errorMsg = 'File too large';
                    break;
                case UPLOAD_ERR_PARTIAL:
                    $errorMsg = 'File upload was incomplete';
                    break;
                case UPLOAD_ERR_NO_FILE:
                    $errorMsg = 'No file was uploaded';
                    break;
                case UPLOAD_ERR_NO_TMP_DIR:
                    $errorMsg = 'Missing temporary folder';
                    break;
                case UPLOAD_ERR_CANT_WRITE:
                    $errorMsg = 'Failed to write file to disk';
                    break;
                case UPLOAD_ERR_EXTENSION:
                    $errorMsg = 'File upload stopped by extension';
                    break;
            }
        }
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $errorMsg]);
        ob_end_flush();
        exit();
    }
    
    $file = $_FILES['image'];
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid file type. Only JPEG, PNG, GIF, WebP, and AVIF are allowed.']);
        ob_end_flush();
        exit();
    }
    
    // Validate file size - check against PHP's upload_max_filesize
    $uploadMaxSize = ini_get('upload_max_filesize');
    // Convert PHP ini size (e.g., "2M", "10M") to bytes
    $maxSizeBytes = 0;
    if (preg_match('/(\d+)([KMGT]?)/i', $uploadMaxSize, $matches)) {
        $value = (int)$matches[1];
        $unit = strtoupper($matches[2] ?? '');
        switch ($unit) {
            case 'G': $maxSizeBytes = $value * 1024 * 1024 * 1024; break;
            case 'M': $maxSizeBytes = $value * 1024 * 1024; break;
            case 'K': $maxSizeBytes = $value * 1024; break;
            default: $maxSizeBytes = $value; break;
        }
    } else {
        // Fallback to 2MB if parsing fails
        $maxSizeBytes = 2 * 1024 * 1024;
    }
    
    if ($file['size'] > $maxSizeBytes) {
        $fileSizeMB = round($file['size'] / (1024 * 1024), 2);
        $maxSizeMB = round($maxSizeBytes / (1024 * 1024), 2);
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => "File too large. File size: {$fileSizeMB}MB, Maximum allowed: {$maxSizeMB}MB (PHP upload_max_filesize: {$uploadMaxSize})"
        ]);
        ob_end_flush();
        exit();
    }
    
    // Get original filename and extension
    $originalName = $file['name'];
    $pathInfo = pathinfo($originalName);
    $extension = strtolower($pathInfo['extension'] ?? '');
    
    // Generate unique filename
    $baseName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $pathInfo['filename']);
    $uniqueName = $baseName . '_' . time() . '_' . uniqid() . '.' . $extension;
    
    // Determine upload directory
    // In production: web root/assets/images/ (e.g., /home/user/public_html/assets/images/)
    // In development: project root/public/assets/images/
    $webRoot = dirname(__DIR__); // Go up from api/ to project root
    
    // Try web root/assets/images/ first (production)
    $uploadDir = $webRoot . '/assets/images/';
    if (!is_dir($uploadDir)) {
        // Fallback to public/assets/images/ (development)
        $uploadDir = $webRoot . '/public/assets/images/';
    }
    
    // Create directory if it doesn't exist
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0775, true)) {
            $error = error_get_last();
            throw new Exception('Failed to create upload directory: ' . $uploadDir . '. Error: ' . ($error['message'] ?? 'Unknown error'));
        }
    }
    
    // Check if directory is writable
    if (!is_writable($uploadDir)) {
        $perms = substr(sprintf('%o', fileperms($uploadDir)), -4);
        throw new Exception("Upload directory is not writable. Directory: $uploadDir, Permissions: $perms, Owner: " . fileowner($uploadDir));
    }
    
    // Full path to uploaded file
    $uploadPath = $uploadDir . $uniqueName;
    
    // Check if temp file exists and is readable
    if (!is_uploaded_file($file['tmp_name'])) {
        throw new Exception('Invalid uploaded file or file was not uploaded via POST');
    }
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        $error = error_get_last();
        $errorMsg = 'Failed to move uploaded file';
        if ($error) {
            $errorMsg .= ': ' . $error['message'];
        }
        $errorMsg .= '. Temp file: ' . $file['tmp_name'] . ', Destination: ' . $uploadPath;
        $errorMsg .= ', Directory writable: ' . (is_writable($uploadDir) ? 'yes' : 'no');
        throw new Exception($errorMsg);
    }
    
    // Return success with file path
    // Path relative to public directory for use in frontend
    $relativePath = '/assets/images/' . $uniqueName;
    
    ob_clean();
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Image uploaded successfully',
        'filename' => $uniqueName,
        'originalName' => $originalName,
        'path' => $relativePath,
        'fullPath' => $relativePath, // For compatibility
        'size' => $file['size'],
        'mimeType' => $mimeType
    ]);
    
} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Upload failed: ' . $e->getMessage()
    ]);
    error_log('Image upload error: ' . $e->getMessage());
}

ob_end_flush();

