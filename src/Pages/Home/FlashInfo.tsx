import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import { getApiUrl } from "../../Utils/apiConfig";
import "./flash-info.scss";

interface FlashInfo {
  id: number;
  title: string;
  contentType: 'image' | 'video' | 'gif' | 'text';
  contentUrl?: string | null;
  contentText?: string | null;
  displayOrder?: number;
  delayMs?: number;
  storageExpiryMinutes?: number;
  storageExpiryHours?: number; // Legacy field for backward compatibility
}

const FlashInfoModal: React.FC = () => {
  const [flashInfoItems, setFlashInfoItems] = useState<FlashInfo[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasShown, setHasShown] = useState(false);
  
  // Configuration
  const STORAGE_KEY_PREFIX = 'flash_info_shown_'; // localStorage key prefix (will append item ID)

  useEffect(() => {
    const fetchFlashInfo = async () => {
      try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/flash-info.php?activeOnly=true`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          setFlashInfoItems(data.data);
        } else {
          setFlashInfoItems([]);
        }
      } catch (error) {
        console.error("Error fetching flash info:", error);
        setFlashInfoItems([]);
      }
    };

    fetchFlashInfo();
  }, []);

  useEffect(() => {
    if (flashInfoItems.length === 0) return;

    // Get the first item (or item with lowest displayOrder)
    const sortedItems = [...flashInfoItems].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    const firstItem = sortedItems[0];
    
    if (!firstItem) return;

    // Get timing values from the item (with defaults)
    // Support both old (hours) and new (minutes) format for backward compatibility
    const delayMs = firstItem.delayMs !== undefined ? firstItem.delayMs : 3000;
    const storageExpiryMinutes = firstItem.storageExpiryMinutes !== undefined 
      ? firstItem.storageExpiryMinutes 
      : (firstItem.storageExpiryHours !== undefined ? firstItem.storageExpiryHours * 60 : 1440);
    const storageKey = `${STORAGE_KEY_PREFIX}${firstItem.id}`;

    // Check if we should show the modal
    const shouldShow = checkShouldShow(storageKey, storageExpiryMinutes);
    if (!shouldShow) {
      setHasShown(true);
      return;
    }

    // Set timer to show modal after delay
    const timer = setTimeout(() => {
      setShowModal(true);
      setHasShown(true);
      
      // Store in localStorage that we've shown it
      if (storageExpiryMinutes > 0) {
        const expiryTime = new Date().getTime() + (storageExpiryMinutes * 60 * 1000);
        localStorage.setItem(storageKey, expiryTime.toString());
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [flashInfoItems]);

  const checkShouldShow = (storageKey: string, storageExpiryMinutes: number): boolean => {
    // If no expiry, always show
    if (storageExpiryMinutes === 0) return true;
    
    // Check localStorage
    const stored = localStorage.getItem(storageKey);
    if (!stored) return true;
    
    const expiryTime = parseInt(stored, 10);
    const now = new Date().getTime();
    
    // Show if expired
    return now > expiryTime;
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleNext = () => {
    if (flashInfoItems.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % flashInfoItems.length);
    }
  };

  const handlePrev = () => {
    if (flashInfoItems.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + flashInfoItems.length) % flashInfoItems.length);
    }
  };

  const getYouTubeEmbedUrl = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const getVimeoEmbedUrl = (url: string): string | null => {
    const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
    const match = url.match(regExp);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  };

  const renderContent = (item: FlashInfo) => {
    switch (item.contentType) {
      case 'image':
      case 'gif':
        return item.contentUrl ? (
          <img 
            src={item.contentUrl} 
            alt={item.title}
            className="flash-info-media"
          />
        ) : null;
      
      case 'video':
        if (!item.contentUrl) return null;
        
        // Check if it's a YouTube URL
        const youtubeEmbed = getYouTubeEmbedUrl(item.contentUrl);
        if (youtubeEmbed) {
          return (
            <iframe
              src={youtubeEmbed}
              className="flash-info-media flash-info-video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={item.title}
            />
          );
        }
        
        // Check if it's a Vimeo URL
        const vimeoEmbed = getVimeoEmbedUrl(item.contentUrl);
        if (vimeoEmbed) {
          return (
            <iframe
              src={vimeoEmbed}
              className="flash-info-media flash-info-video"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={item.title}
            />
          );
        }
        
        // Regular video file
        return (
          <video 
            src={item.contentUrl} 
            controls
            className="flash-info-media"
          >
            Your browser does not support the video tag.
          </video>
        );
      
      case 'text':
        return item.contentText ? (
          <div 
            className="flash-info-text"
            dangerouslySetInnerHTML={{ __html: item.contentText }}
          />
        ) : null;
      
      default:
        return null;
    }
  };

  if (flashInfoItems.length === 0 || !showModal) {
    return null;
  }

  const currentItem = flashInfoItems[currentIndex];

  return (
    <Modal 
      show={showModal} 
      onHide={handleClose} 
      centered 
      size="lg"
      className="flash-info-modal"
      backdrop={true}
      keyboard={true}
    >
      <Modal.Header className="flash-info-header">
        <Modal.Title className="flash-info-title">{currentItem.title}</Modal.Title>
        <button 
          type="button" 
          className="flash-info-close" 
          onClick={handleClose}
          aria-label="Close"
        >
          <FaTimes />
        </button>
      </Modal.Header>
      <Modal.Body className="flash-info-body">
        <div className="flash-info-content-wrapper">
          {renderContent(currentItem)}
        </div>
      </Modal.Body>
      {flashInfoItems.length > 1 && (
        <Modal.Footer className="flash-info-footer">
          <div className="flash-info-navigation">
            <Button 
              variant="outline-secondary" 
              onClick={handlePrev}
              className="flash-info-nav-btn"
            >
              ← Previous
            </Button>
            <span className="flash-info-counter">
              {currentIndex + 1} / {flashInfoItems.length}
            </span>
            <Button 
              variant="outline-secondary" 
              onClick={handleNext}
              className="flash-info-nav-btn"
            >
              Next →
            </Button>
          </div>
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      )}
      {flashInfoItems.length === 1 && (
        <Modal.Footer className="flash-info-footer">
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default FlashInfoModal;
