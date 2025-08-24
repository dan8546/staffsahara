import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

interface SeoProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: string;
  noindex?: boolean;
  lang?: string;
  alternateHreflangs?: Array<{ hrefLang: string; href: string }>;
  jsonld?: object;
}

export const Seo = ({
  title,
  description,
  canonical,
  image = "/og-image.jpg",
  type = "website",
  noindex = false,
  lang,
  alternateHreflangs,
  jsonld
}: SeoProps) => {
  const { i18n } = useTranslation();
  
  const baseUrl = "https://staff-sahara.com";
  const currentLang = lang || i18n.language;
  
  // Default values
  const defaultTitle = "Staff Sahara - Solutions RH Premium";
  const defaultDescription = "Votre partenaire de confiance pour des solutions RH sur mesure dans la région MENA";
  
  const finalTitle = title ? `${title} | Staff Sahara` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalCanonical = canonical || `${baseUrl}${window.location.pathname}`;
  const finalImage = image.startsWith('http') ? image : `${baseUrl}${image}`;

  // Generate hreflang URLs - use provided alternates or generate defaults
  const hreflangs = alternateHreflangs || [
    { hrefLang: 'fr', href: finalCanonical.replace(`/${currentLang}`, '/fr') },
    { hrefLang: 'en', href: finalCanonical.replace(`/${currentLang}`, '/en') },
    { hrefLang: 'ar', href: finalCanonical.replace(`/${currentLang}`, '/ar') },
    { hrefLang: 'x-default', href: finalCanonical.replace(`/${currentLang}`, '') }
  ];

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <link rel="canonical" href={finalCanonical} />
      
      {/* Language Alternates */}
      {hreflangs.map(({ hrefLang, href }) => (
        <link key={hrefLang} rel="alternate" hrefLang={hrefLang} href={href} />
      ))}
      
      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Staff Sahara - Solutions RH Premium" />
      <meta property="og:site_name" content="Staff Sahara" />
      <meta property="og:locale" content={currentLang === 'fr' ? 'fr_FR' : currentLang === 'ar' ? 'ar_DZ' : 'en_US'} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:image:alt" content="Staff Sahara - Solutions RH Premium" />
      <meta name="twitter:site" content="@staff_sahara" />
      <meta name="twitter:creator" content="@staff_sahara" />
      
      {/* Additional SEO */}
      <meta name="author" content="Staff Sahara" />
      <meta name="copyright" content="© Staff Sahara - RedMed Group" />
      <meta name="language" content={currentLang} />
      <meta name="geo.region" content="DZ" />
      <meta name="geo.placename" content="Algeria" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Staff Sahara",
          "description": finalDescription,
          "url": baseUrl,
          "logo": `${baseUrl}/logo.png`,
          "image": finalImage,
          "sameAs": [
            "https://linkedin.com/company/staff-sahara",
            "https://facebook.com/staffsahara"
          ],
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "DZ",
            "addressRegion": "Adrar",
            "addressLocality": "Adrar"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+213-29-XX-XX-XX",
            "contactType": "customer service",
            "availableLanguage": ["French", "English", "Arabic"]
          },
          "parentOrganization": {
            "@type": "Organization",
            "name": "RedMed Group"
          }
        })}
      </script>
      
      {/* Custom JSON-LD */}
      {jsonld && (
        <script type="application/ld+json">
          {JSON.stringify(jsonld)}
        </script>
      )}
    </Helmet>
  );
};