/**
 * Central brand identity for Nivro.
 * Import from here instead of hardcoding company details in components.
 */

export const brand = {
  name: "nivro",
  displayName: "Nivro",
  domain: "nivro.co.uk",
  url: "https://nivro.co.uk",
  tagline: "Bright, honest electronics retail.",
  description:
    "Nivro — a bright, high-trust electronics retailer. Audio, laptops, smartphones, TV & video, cameras, smart home, gaming, wearables and accessories. Shipped from the United Kingdom.",
  applicationName: "Nivro",

  company: {
    legalName: "EDGEBRAY LIMITED",
    number: "15854749",
    address: {
      line1: "Academy House",
      line2: "11 Dunraven Place",
      city: "Bridgend",
      region: "Mid Glamorgan",
      postcode: "CF31 1JF",
      country: "United Kingdom",
    },
  },

  contact: {
    email: "info@nivro.co.uk",
    emailB2B: "b2b@nivro.co.uk",
    phone: "+44 7412 839910",
    phoneHref: "tel:+447412839910",
    contactPage: "/en/contact",
  },

  social: {
    linkedin: "https://www.linkedin.com/company/nivro-uk/",
    instagram: "https://www.instagram.com/nivro.uk/",
    twitter: "@nivro",
  },
} as const;

export const brandAddressLine = [
  brand.company.address.line1,
  brand.company.address.line2,
  brand.company.address.city,
  brand.company.address.region,
  brand.company.address.postcode,
  brand.company.address.country,
].join(", ");

export const brandLegalLine = `${brand.company.legalName} · Company No. ${brand.company.number} · ${brand.company.address.line1}, ${brand.company.address.line2}, ${brand.company.address.city}, ${brand.company.address.postcode}, ${brand.company.address.country}`;
