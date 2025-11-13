import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  product?: {
    name?: string;
    price?: number;
    currency?: string;
    availability?: string;
    brand?: string;
    category?: string;
  };
  structuredData?: object;
  noindex?: boolean;
  canonical?: string;
}

const defaultTitle = 'Olivia Fresh - Premium Laundry, Hygiene & Hair Care Products in Nigeria';
const defaultDescription = 'One of the largest manufacturer and distributor of Laundry, Hygiene and Hair Care products in Nigeria. Shop premium quality products including hair care, skin care, dish wash, fabric cleaner, and more.';
const defaultKeywords = 'Olivia Fresh, laundry products, hygiene products, hair care, Nigeria, fabric cleaner, dish wash, car wash, air fresheners, cleaning products';
const defaultImage = '/assets/images/logo512.png';
const siteUrl = 'https://celineolivia.com';

// Helper function to update or create meta tag
const updateMetaTag = (property: string, content: string, isProperty = false) => {
  const attribute = isProperty ? 'property' : 'name';
  let element = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, property);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
};

// Helper function to update or create link tag
const updateLinkTag = (rel: string, href: string) => {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  
  element.setAttribute('href', href);
};

// Helper function to add structured data
const addStructuredData = (data: object, id: string) => {
  // Remove existing script with same id
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }

  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

export const SEO: React.FC<SEOProps> = ({
  title,
  description = defaultDescription,
  keywords = defaultKeywords,
  image = defaultImage,
  url,
  type = 'website',
  product,
  structuredData,
  noindex = false,
  canonical,
}) => {
  const fullTitle = title ? `${title} | Olivia Fresh` : defaultTitle;
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  useEffect(() => {
    // Update title
    document.title = fullTitle;

    // Primary Meta Tags
    updateMetaTag('title', fullTitle);
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', 'Olivia Fresh');
    updateMetaTag('language', 'English');
    updateMetaTag('geo.region', 'NG');
    updateMetaTag('geo.placename', 'Nigeria');

    // Robots meta
    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // Canonical URL
    updateLinkTag('canonical', canonical || fullUrl);

    // Open Graph / Facebook
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', fullImage, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
    updateMetaTag('og:site_name', 'Olivia Fresh', true);
    updateMetaTag('og:locale', 'en_NG', true);

    // Twitter
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:url', fullUrl);
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', fullImage);

    // Default structured data for organization
    const organizationStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Olivia Fresh',
      url: siteUrl,
      logo: `${siteUrl}/assets/images/logo512.png`,
      description: defaultDescription,
      sameAs: [
        // Add social media URLs here when available
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        url: `${siteUrl}/contact-us`,
      },
    };

    // Product structured data
    const productStructuredData = product
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: description,
          image: fullImage,
          brand: {
            '@type': 'Brand',
            name: product.brand || 'Olivia Fresh',
          },
          category: product.category,
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: product.currency || 'NGN',
            availability: product.availability
              ? `https://schema.org/${product.availability}`
              : 'https://schema.org/InStock',
            url: fullUrl,
          },
        }
      : null;

    // Website structured data
    const websiteStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Olivia Fresh',
      url: siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/collections?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };

    // Add structured data
    addStructuredData(organizationStructuredData, 'seo-organization');
    addStructuredData(websiteStructuredData, 'seo-website');
    
    if (productStructuredData) {
      addStructuredData(productStructuredData, 'seo-product');
    }
    
    if (structuredData) {
      addStructuredData(structuredData, 'seo-custom');
    }
  }, [title, description, keywords, image, url, type, product, structuredData, noindex, canonical, fullTitle, fullUrl, fullImage]);

  return null;
};

