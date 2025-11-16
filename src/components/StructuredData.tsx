import { useEffect } from 'react';

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'Product';
  data: Record<string, any>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data
    };
    
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, [type, data]);
  
  return null;
}

// Organization Schema for homepage
export function OrganizationSchema() {
  return (
    <StructuredData
      type="Organization"
      data={{
        name: 'ALDENAIR',
        url: 'https://aldenairperfumes.de',
        logo: 'https://aldenairperfumes.de/lovable-uploads/6b3ca60c-7598-4385-8d87-42839dc00836.png',
        description: 'Premium Parfüms und exklusive Duftkreationen von ALDENAIR',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Service',
          availableLanguage: ['German']
        }
      }}
    />
  );
}

// Website Schema
export function WebsiteSchema() {
  return (
    <StructuredData
      type="WebSite"
      data={{
        name: 'ALDENAIR',
        url: 'https://aldenairperfumes.de',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://aldenairperfumes.de/products?search={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }}
    />
  );
}
