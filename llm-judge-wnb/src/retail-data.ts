import { Document } from "@langchain/core/documents";

export const retailDocuments: Document[] = [
  {
    pageContent: "Classic Blue Denim Jeans - Premium quality straight-leg jeans made from 100% cotton denim. Perfect for casual everyday wear with a comfortable fit and timeless style. Features five-pocket design and button fly closure.",
    metadata: { 
      product_name: 'Denim Jeans',
      category: 'bottoms', 
      brand: 'UrbanFit',
      price: 79.99,
      sizes: 'XS, S, M, L, XL, XXL',
      colors: 'Dark Blue, Light Blue'
    }
  },
  {
    pageContent: "Elegant Black Cocktail Dress - Sophisticated sleeveless midi dress perfect for evening events and formal occasions. Made from luxurious polyester blend with a flattering A-line silhouette and hidden back zipper.",
    metadata: { 
      product_name: 'Cocktail Dress',
      category: 'dresses', 
      brand: 'GlamourNight',
      price: 149.99,
      sizes: 'XS, S, M, L, XL',
      colors: 'Black, Navy Blue'
    }
  },
  {
    pageContent: "Cozy Winter Wool Sweater - Warm and comfortable crew neck sweater made from soft merino wool blend. Features ribbed cuffs and hem with a relaxed fit perfect for cold weather layering.",
    metadata: { 
      product_name: 'Wool Sweater',
      category: 'tops', 
      brand: 'WarmWear',
      price: 89.99,
      sizes: 'S, M, L, XL',
      colors: 'Charcoal Gray, Cream White, Forest Green'
    }
  },
  {
    pageContent: "Professional Business Blazer - Tailored blazer perfect for office wear and business meetings. Made from premium polyester-wool blend with notched lapels, two-button closure, and functional pockets.",
    metadata: { 
      product_name: 'Blazer',
      category: 'outerwear', 
      brand: 'OfficeElite',
      price: 199.99,
      sizes: 'XS, S, M, L, XL',
      colors: 'Black, Navy Blue, Charcoal Gray'
    }
  },
  {
    pageContent: "Comfortable Running Sneakers - Lightweight athletic shoes designed for running and fitness activities. Features breathable mesh upper, cushioned midsole, and durable rubber outsole for optimal performance.",
    metadata: { 
      product_name: 'Sneakers',
      category: 'shoes', 
      brand: 'SportMax',
      price: 129.99,
      sizes: '6, 7, 8, 9, 10, 11, 12',
      colors: 'White/Blue, Black/Red, Gray/Green'
    }
  },
  {
    pageContent: "Casual Cotton T-Shirt - Soft and breathable basic tee made from 100% organic cotton. Features crew neck design and regular fit, perfect for everyday casual wear or layering under other garments.",
    metadata: { 
      product_name: 'Cotton T-Shirt',
      category: 'tops', 
      brand: 'BasicWear',
      price: 24.99,
      sizes: 'XS, S, M, L, XL, XXL',
      colors: 'White, Black, Gray, Navy Blue, Red'
    }
  },
  {
    pageContent: "Leather Ankle Boots - Stylish and durable boots made from genuine leather with a comfortable low heel. Features side zipper closure and cushioned insole, perfect for both casual and semi-formal occasions.",
    metadata: { 
      product_name: 'Ankle Boots',
      category: 'shoes', 
      brand: 'LeatherCraft',
      price: 159.99,
      sizes: '6, 7, 8, 9, 10, 11',
      colors: 'Black, Brown, Tan'
    }
  },
  {
    pageContent: "Summer Floral Sundress - Light and airy midi dress perfect for warm weather and summer events. Made from breathable cotton blend with a beautiful floral print and adjustable shoulder straps.",
    metadata: { 
      product_name: 'Sundress',
      category: 'dresses', 
      brand: 'SummerVibes',
      price: 69.99,
      sizes: 'XS, S, M, L, XL',
      colors: 'Pink Floral, Blue Floral, Yellow Floral'
    }
  }
];

export const retailQuestions = [
  "I need a black dress for a dinner party",
  "Looking for comfortable shoes for running",
  "Warm sweater for winter",
  "Professional outfit for work meetings",
  "Casual jeans for everyday wear",
  "Something nice for a summer wedding",
  "Comfortable t-shirt for the gym",
  "Boots that go with everything",
  "Business casual blazer",
  "Winter ski jacket" // Edge case: Not in inventory
];
