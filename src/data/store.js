// Central source of truth for shop identity — PRESERVED DATA.
// Products live in ./products.js, images in /public/images. Do not duplicate
// address/phone here elsewhere; import from this file.
export const STORE = {
  name: 'Pandit Ji Paneer Wale',
  shortName: 'Pandit Ji',
  tagline: 'Fresh paneer, dairy & desi groceries',
  city: 'Abu Dhabi',
  address: 'F9QJ+F6F Abu Dhabi, United Arab Emirates',
  shortAddress: 'F9QJ+F6F Abu Dhabi, UAE',
  phone: '+971 52 467 6306',
  phoneHref: 'tel:+971524676306',
  whatsappNumber: '971524676306',
  email: 'rrc.inttrading@gmail.com',
  mapsUrl: 'https://maps.google.com/?q=F9QJ+F6F+Abu+Dhabi',
  hours: 'Open daily for store visits & delivery',
  deliveryNote: 'Free delivery across Abu Dhabi',
};

export const whatsappLink = (message) =>
  `https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent(message)}`;

export const DEFAULT_WA_HELLO =
  'Hello Pandit Ji! I have a query regarding your products.';
