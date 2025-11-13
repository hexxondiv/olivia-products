<?php
/**
 * Public Image Upload API for Wholesale Logos
 * Handles company logo uploads for wholesale applications
 * 
 * POST /api/upload-wholesale-logo.php
 * Requires: multipart/form-data with 'logo' field
 */

ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

ob_clean();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_clean();
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    ob_end_flush();
    exit();
}

try {
    // Check if file was uploaded
    if (!isset($_FILES['logo']) || $_FILES['logo']['error'] !== UPLOAD_ERR_OK) {
        $errorMsg = 'No file uploaded';
        if (isset($_FILES['logo']['error'])) {
            switch ($_FILES['logo']['error']) {
                case UPLOAD_ERR_INI_SIZE:
                case UPLOAD_ERR_FORM_SIZE:
                    $errorMsg = 'File too large. Maximum size is 5MB';
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
    
    $file = $_FILES['logo'];
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.']);
        ob_end_flush();
        exit();
    }
    
    // Validate file size - max 5MB for logos
    $maxSizeBytes = 5 * 1024 * 1024; // 5MB
    
    if ($file['size'] > $maxSizeBytes) {
        $fileSizeMB = round($file['size'] / (1024 * 1024), 2);
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => "File too large. File size: {$fileSizeMB}MB, Maximum allowed: 5MB"
        ]);
        ob_end_flush();
        exit();
    }
    
    // Get original filename and extension
    $originalName = $file['name'];
    $pathInfo = pathinfo($originalName);
    $extension = strtolower($pathInfo['extension'] ?? '');
    
    // Generate unique filename with 'wholesale_logo' prefix
    $baseName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $pathInfo['filename']);
    $uniqueName = 'wholesale_logo_' . time() . '_' . uniqid() . '.' . $extension;
    
    // Determine upload directory (public/assets/images)
    $uploadDir = dirname(__DIR__) . '/public/assets/images/';
    
    // Create directory if it doesn't exist
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0775, true)) {
            $error = error_get_last();
            throw new Exception('Failed to create upload directory: ' . ($error['message'] ?? 'Unknown error'));
        }
    }
    
    // Check if directory is writable
    if (!is_writable($uploadDir)) {
        $perms = substr(sprintf('%o', fileperms($uploadDir)), -4);
        throw new Exception("Upload directory is not writable. Directory: $uploadDir, Permissions: $perms");
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
        throw new Exception($errorMsg);
    }
    
    // Return success with file path
    // Path relative to public directory for use in frontend
    $relativePath = '/assets/images/' . $uniqueName;
    
    ob_clean();
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Logo uploaded successfully',
        'filename' => $uniqueName,
        'originalName' => $originalName,
        'path' => $relativePath,
        'fullPath' => $relativePath,
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
    error_log('Wholesale logo upload error: ' . $e->getMessage());
}

ob_end_flush();

