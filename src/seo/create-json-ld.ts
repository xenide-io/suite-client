export interface JsonLdConfig {
  name: string;
  url: string;
  description: string;
  applicationCategory?: string;
  applicationSubCategory?: string;
  operatingSystem?: string;
  softwareVersion?: string;
  price?: string;
  priceCurrency?: string;
  inLanguage?: string;
  publisherName?: string;
  publisherUrl?: string;
}

/** Build a schema.org SoftwareApplication JSON-LD string for a product page. */
export function createJsonLd(config: JsonLdConfig): string {
  const publisherName = config.publisherName ?? 'Xenide';
  const publisherUrl = config.publisherUrl ?? 'https://xenide.io';

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: config.name,
    url: config.url,
    description: config.description,
    applicationCategory: config.applicationCategory ?? 'BusinessApplication',
    ...(config.applicationSubCategory
      ? { applicationSubCategory: config.applicationSubCategory }
      : {}),
    operatingSystem: config.operatingSystem ?? 'Web',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: config.softwareVersion ?? '1.0',
    offers: {
      '@type': 'Offer',
      price: config.price ?? '0',
      priceCurrency: config.priceCurrency ?? 'AUD',
    },
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      url: publisherUrl,
    },
    author: {
      '@type': 'Organization',
      name: publisherName,
      url: publisherUrl,
    },
    inLanguage: config.inLanguage ?? 'en-AU',
  });
}
