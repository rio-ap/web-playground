const PRODUCTS = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 79.99,
    image: 'https://placehold.co/300x300/e2e8f0/475569?text=Headphones',
    description: 'Premium wireless headphones with noise cancellation.',
  },
  {
    id: 2,
    name: 'Smart Watch',
    price: 199.99,
    image: 'https://placehold.co/300x300/e2e8f0/475569?text=Smart+Watch',
    description: 'Fitness tracker with heart rate monitoring and GPS.',
  },
  {
    id: 3,
    name: 'USB-C Hub',
    price: 34.99,
    image: 'https://placehold.co/300x300/e2e8f0/475569?text=USB-C+Hub',
    description: '7-in-1 USB-C hub with HDMI, SD card, and USB 3.0 ports.',
  },
  {
    id: 4,
    name: 'Mechanical Keyboard',
    price: 129.99,
    image: 'https://placehold.co/300x300/e2e8f0/475569?text=Keyboard',
    description: 'RGB mechanical keyboard with Cherry MX switches.',
  },
  {
    id: 5,
    name: 'Portable Speaker',
    price: 49.99,
    image: 'https://placehold.co/300x300/e2e8f0/475569?text=Speaker',
    description: 'Waterproof Bluetooth speaker with 12-hour battery life.',
  },
  {
    id: 6,
    name: 'Laptop Stand',
    price: 24.99,
    image: 'https://placehold.co/300x300/e2e8f0/475569?text=Stand',
    description: 'Adjustable aluminum laptop stand for better ergonomics.',
  },
];

export function getProducts() {
  return PRODUCTS;
}

export function formatPrice(amount) {
  return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}
