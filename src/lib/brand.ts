/**
 * Central brand identity for Nivora.
 * Import from here instead of hardcoding company details in components.
 */

export const brand = {
  name: "nivora",
  displayName: "Nivora",
  domain: "nivora.co.uk",
  url: "https://nivora.co.uk",
  tagline: "Bright, honest electronics retail.",
  description:
    "Nivora — a bright, high-trust electronics store. Audio, laptops, smartphones, TV & video, cameras, smart home, gaming, wearables and accessories. Shipped from the United Kingdom.",
  applicationName: "Nivora",

  company: {
    legalName: "NIVORA RETAIL LIMITED",
    number: "15982435",
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
    email: "info@nivora.co.uk",
    emailB2B: "b2b@nivora.co.uk",
    phone: "+44 7463 590620",
    phoneHref: "tel:+447463590620",
  },

  social: {
    twitter: "@nivora",
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
