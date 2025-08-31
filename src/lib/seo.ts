import type { Metadata } from 'next';
import { APP_NAME, APP_URL, SUPPORT_EMAIL, WHATSAPP_NUMBER } from './config';

// Base SEO configuration
const baseSEO = {
  metadataBase: new URL(APP_URL),
  applicationName: APP_NAME,
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  other: {
    'theme-color': '#3b82f6',
    'color-scheme': 'light',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
};

// Common Open Graph configuration
const baseOpenGraph = {
  type: 'website' as const,
  siteName: APP_NAME,
  locale: 'en_US',
  url: APP_URL,
};

// Common Twitter configuration
const baseTwitter = {
  card: 'summary_large_image' as const,
  site: '@EinsteinEssayTutors',
  creator: '@EinsteinEssayTutors',
};

// Common structured data for organization
export const baseOrganizationData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": APP_NAME,
  "url": APP_URL,
  "logo": `${APP_URL}/images/logo.png`,
  "description": "Professional academic writing services with expert tutors, delivering quality work on time",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": WHATSAPP_NUMBER,
    "email": SUPPORT_EMAIL,
    "contactType": "customer support",
    "availableLanguage": "English",
    "hoursAvailable": "Mo-Su 00:00-23:59"
  },
  "sameAs": [
    "https://twitter.com/EinsteinEssayTutors",
    "https://facebook.com/EinsteinEssayTutors",
    "https://linkedin.com/company/einstein-essay-tutors"
  ],
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "US",
    "addressRegion": "WA"
  }
};

// Common academic writing keywords
export const commonKeywords = [
  'academic writing services',
  'essay writing help',
  'research paper assistance',
  'dissertation support',
  'professional writing tutors',
  'academic editing',
  'college essay help',
  'university writing support',
  'custom essays',
  'academic proofreading',
  'writing consultation',
  'academic success',
];

interface SEOPageConfig {
  title: string;
  description: string;
  keywords?: string[];
  path: string;
  ogImage?: string;
  twitterImage?: string;
  noIndex?: boolean;
  canonical?: string;
}

// Helper function to generate dynamic OG image URL
function generateOGImageUrl(title: string, description: string, type: string = 'default'): string {
  const params = new URLSearchParams({
    title: title.replace(` | ${APP_NAME}`, ''),
    description,
    type,
  });
  return `/api/og?${params.toString()}`;
}

export function generateSEO(config: SEOPageConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    path,
    ogImage,
    twitterImage,
    noIndex = false,
    canonical
  } = config;

  const fullTitle = title.includes(APP_NAME) ? title : `${title} | ${APP_NAME}`;
  const fullUrl = `${APP_URL}${path}`;
  const canonicalUrl = canonical || fullUrl;

  // Determine page type for dynamic OG image
  let pageType = 'default';
  if (path === '/') pageType = 'home';
  else if (path.includes('/services')) pageType = 'services';
  else if (path === '/about') pageType = 'about';
  else if (path === '/contact') pageType = 'contact';
  else if (path === '/404') pageType = '404';

  // Use dynamic OG image if no custom image is provided
  const dynamicOGImage = ogImage || generateOGImageUrl(title, description, pageType);
  const dynamicTwitterImage = twitterImage || dynamicOGImage;

  return {
    ...baseSEO,
    title: fullTitle,
    description,
    keywords: [...commonKeywords, ...keywords],
    robots: {
      index: !noIndex,
      follow: true,
      googleBot: {
        index: !noIndex,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      ...baseOpenGraph,
      title: fullTitle,
      description,
      url: fullUrl,
      images: [
        {
          url: dynamicOGImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
          type: 'image/jpeg',
        }
      ],
    },
    twitter: {
      ...baseTwitter,
      title: fullTitle,
      description,
      images: [dynamicTwitterImage],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

// Pre-configured SEO for common pages
export const seoConfigs = {
  home: {
    title: 'Professional Academic Writing Services & Expert Essay Help',
    description: 'Get expert academic writing help from professional tutors. Quality essays, research papers, dissertations, and more. Available 24/7 with guaranteed on-time delivery.',
    keywords: [
      'academic writing services',
      'essay writing help',
      'professional tutors',
      'research papers',
      'dissertations',
      '24/7 support',
      'quality writing',
      'on-time delivery'
    ],
    path: '/',
  },
  
  about: {
    title: 'About Einstein Essay Tutors - Professional Academic Writing Team',
    description: 'Learn about our team of expert academic writers and tutors. Discover our mission to provide high-quality writing services and academic support to students worldwide.',
    keywords: [
      'about us',
      'expert writers',
      'academic tutors',
      'professional team',
      'writing expertise',
      'academic credentials'
    ],
    path: '/about',
  },
  
  services: {
    title: 'Academic Writing Services - Essays, Research Papers & More',
    description: 'Comprehensive academic writing services including essay writing, research papers, dissertations, editing, and proofreading. Expert help for all academic levels.',
    keywords: [
      'writing services',
      'academic services',
      'essay writing',
      'research papers',
      'dissertations',
      'editing services',
      'proofreading'
    ],
    path: '/services',
  },
  
  contact: {
    title: 'Contact Einstein Essay Tutors - 24/7 Academic Writing Support',
    description: 'Get in touch with our academic writing experts. Available 24/7 via phone, email, or live chat. Fast response times and friendly customer support.',
    keywords: [
      'contact us',
      'customer support',
      '24/7 support',
      'academic help',
      'writing assistance',
      'live chat',
      'phone support'
    ],
    path: '/contact',
  },
  
  faq: {
    title: 'Frequently Asked Questions - Academic Writing Help',
    description: 'Find answers to common questions about our academic writing services, ordering process, pricing, revisions, and more. Get the help you need.',
    keywords: [
      'FAQ',
      'frequently asked questions',
      'academic writing help',
      'service questions',
      'ordering process',
      'pricing information'
    ],
    path: '/faq',
    ogImage: '/images/faq-og-image.jpg',
    twitterImage: '/images/faq-twitter-card.jpg',
  },
  
  terms: {
    title: 'Terms of Service - Einstein Essay Tutors',
    description: 'Read our terms of service and conditions for using Einstein Essay Tutors academic writing services. Important information about our policies and procedures.',
    keywords: [
      'terms of service',
      'terms and conditions',
      'service agreement',
      'policies',
      'legal information'
    ],
    path: '/terms',
    ogImage: '/images/legal-og-image.jpg',
    twitterImage: '/images/legal-twitter-card.jpg',
    noIndex: true,
  },
  
  privacy: {
    title: 'Privacy Policy - Einstein Essay Tutors',
    description: 'Our privacy policy explains how we collect, use, and protect your personal information when using our academic writing services. Your privacy matters to us.',
    keywords: [
      'privacy policy',
      'data protection',
      'personal information',
      'privacy rights',
      'data security'
    ],
    path: '/privacy',
    ogImage: '/images/legal-og-image.jpg',
    twitterImage: '/images/legal-twitter-card.jpg',
    noIndex: true,
  },
  
  blog: {
    title: 'Academic Writing Blog - Tips, Guides & Resources',
    description: 'Expert tips and guides for academic writing success. Learn about essay structure, research methods, citation styles, and improve your writing skills.',
    keywords: [
      'academic writing blog',
      'writing tips',
      'essay guides',
      'research methods',
      'citation styles',
      'writing resources'
    ],
    path: '/blog',
    ogImage: '/images/blog-og-image.jpg',
    twitterImage: '/images/blog-twitter-card.jpg',
  },
  
  // Service-specific pages
  essayWriting: {
    title: 'Professional Essay Writing Services - Custom Essays by Experts',
    description: 'Expert essay writing help for all academic levels. Custom essays written by professional tutors. Original content, proper citations, and on-time delivery guaranteed.',
    keywords: [
      'essay writing service',
      'custom essays',
      'professional essay writers',
      'academic essays',
      'college essays',
      'university essays'
    ],
    path: '/services/essay-writing',
    ogImage: '/images/essay-writing-og-image.jpg',
    twitterImage: '/images/essay-writing-twitter-card.jpg',
  },
  
  researchPapers: {
    title: 'Research Paper Writing Services - Expert Academic Research',
    description: 'Professional research paper writing assistance. Expert researchers and writers help with topic selection, research, analysis, and writing. All academic fields covered.',
    keywords: [
      'research paper writing',
      'academic research',
      'research assistance',
      'scholarly papers',
      'research methodology',
      'data analysis'
    ],
    path: '/services/research-papers',
    ogImage: '/images/research-papers-og-image.jpg',
    twitterImage: '/images/research-papers-twitter-card.jpg',
  },
  
  dissertations: {
    title: 'Dissertation Writing Services - PhD & Masters Thesis Help',
    description: 'Comprehensive dissertation and thesis writing support. Expert help with proposal writing, research, methodology, analysis, and final writing. PhD and Masters level.',
    keywords: [
      'dissertation writing',
      'thesis writing',
      'PhD dissertation',
      'masters thesis',
      'dissertation help',
      'academic research'
    ],
    path: '/services/dissertations',
    ogImage: '/images/dissertations-og-image.jpg',
    twitterImage: '/images/dissertations-twitter-card.jpg',
  },
  
  editing: {
    title: 'Academic Editing & Proofreading Services - Professional Review',
    description: 'Professional editing and proofreading for academic papers. Grammar correction, style improvement, structure enhancement, and formatting. Fast turnaround times.',
    keywords: [
      'academic editing',
      'proofreading services',
      'grammar correction',
      'style editing',
      'academic proofreading',
      'paper review'
    ],
    path: '/services/editing',
    ogImage: '/images/editing-og-image.jpg',
    twitterImage: '/images/editing-twitter-card.jpg',
  },
  
  gmatPrep: {
    title: 'GMAT Prep Tutoring - Expert Test Preparation & Strategy',
    description: 'Comprehensive GMAT preparation with expert tutors. Personalized study plans, practice tests, and proven strategies to boost your GMAT score.',
    keywords: [
      'GMAT prep',
      'GMAT tutoring',
      'GMAT test preparation',
      'GMAT strategy',
      'MBA admissions',
      'GMAT score improvement'
    ],
    path: '/services/gmat-prep',
  },
  
  nclexPrep: {
    title: 'NCLEX Prep Tutoring - Nursing Board Exam Preparation',
    description: 'Expert NCLEX-RN and NCLEX-PN preparation. Practice questions, test strategies, and comprehensive content review to help you pass your nursing boards.',
    keywords: [
      'NCLEX prep',
      'NCLEX tutoring',
      'nursing board exam',
      'NCLEX-RN preparation',
      'NCLEX-PN prep',
      'nursing test prep'
    ],
    path: '/services/nclex-prep',
  },
  
  // Order and auth pages (noindex)
  newOrder: {
    title: 'Place New Order - Einstein Essay Tutors',
    description: 'Start your academic writing project with our expert tutors. Easy ordering process with instant quotes and 24/7 support.',
    path: '/orders/new',
    noIndex: true,
  },
  
  login: {
    title: 'Login - Einstein Essay Tutors',
    description: 'Login to your Einstein Essay Tutors account to access your orders, communicate with writers, and manage your academic projects.',
    path: '/auth/login',
    noIndex: true,
  },
  
  register: {
    title: 'Register - Einstein Essay Tutors',
    description: 'Create your Einstein Essay Tutors account to start ordering professional academic writing services and get expert help with your projects.',
    path: '/auth/register',
    noIndex: true,
  },
  
  support: {
    title: 'Customer Support - Einstein Essay Tutors Help Center',
    description: 'Get help with your academic writing projects. Contact our support team via live chat, email, or phone. Available 24/7 to assist with all your needs.',
    keywords: [
      'customer support',
      'help center',
      'academic support',
      'technical support',
      'order assistance',
      '24/7 help'
    ],
    path: '/support',
    ogImage: '/images/support-og-image.jpg',
    twitterImage: '/images/support-twitter-card.jpg',
  },
};

// Utility function to create breadcrumb structured data
export function createBreadcrumbData(items: Array<{ name: string; url?: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      ...(item.url && { "item": item.url })
    }))
  };
}

// Utility function to create service structured data
export function createServiceData(service: {
  name: string;
  description: string;
  url: string;
  category: string;
  offers?: Array<{ name: string; price?: string; description: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "description": service.description,
    "url": service.url,
    "category": service.category,
    "provider": baseOrganizationData,
    "areaServed": "Worldwide",
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": service.url,
      "availableLanguage": "English"
    },
    ...(service.offers && {
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": `${service.name} Options`,
        "itemListElement": service.offers.map((offer, index) => ({
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": offer.name,
            "description": offer.description
          },
          ...(offer.price && { "price": offer.price })
        }))
      }
    })
  };
}