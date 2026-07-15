const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

const INITIAL_CATEGORIES = [
    { name: 'Women', slug: 'women', description: 'Sophisticated women’s luxury attire.', image: 'https://images.unsplash.com/photo-1515347619362-7104b2b4bc66?q=80&w=600', isActive: true },
    { name: 'Office Kit', slug: 'office-kit', description: 'Polished suits and business casual essentials.', image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=600', isActive: true },
    { name: 'Accessories', slug: 'accessories', description: 'Designer handbags, premium shoes, and elegant jewelry.', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600', isActive: true },
    { name: 'Teen', slug: 'teen', description: 'Trendy and chic streetwear for young adults.', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600', isActive: true },
    { name: 'Casual', slug: 'casual', description: 'Comfortable day-to-day designer wear.', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600', isActive: true }
];

const getProductsData = (categoriesMap) => [
    {
        name: 'Silk Evening Gown',
        description: 'A beautiful double-lined luxury silk gown with detailed back strap design, perfect for galas and official night events.',
        price: 299,
        discountPrice: 249,
        category: categoriesMap['Women'],
        brand: 'Elegance Couture',
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['#0f172a', '#b45309', '#be123c'],
        stock: 12,
        sold: 45,
        isFeatured: true,
        isBestSeller: true,
        tags: ['silk', 'gown', 'evening'],
        images: [{ public_id: 'silk_gown', url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=600' }]
    },
    {
        name: 'Classic Office Blazer',
        description: 'Double-breasted tailor-fit blazer made of fine Italian merino wool. Provides sharp posture and modern elegance.',
        price: 149,
        discountPrice: 129,
        category: categoriesMap['Office Kit'],
        brand: 'Elegance Office',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['#1e293b', '#475569', '#cbd5e1'],
        stock: 22,
        sold: 84,
        isFeatured: true,
        isBestSeller: true,
        tags: ['blazer', 'wool', 'suit'],
        images: [{ public_id: 'classic_blazer', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600' }]
    },
    {
        name: 'Designer Leather Handbag',
        description: 'Premium calfskin handbag with solid gold-plated hardware closures. Features structured handles and an optional shoulder strap.',
        price: 499,
        discountPrice: 449,
        category: categoriesMap['Accessories'],
        brand: 'Elegance Atelier',
        sizes: ['One Size'],
        colors: ['#78350f', '#000000', '#d97706'],
        stock: 4,
        sold: 19,
        isFeatured: true,
        isBestSeller: false,
        tags: ['leather', 'handbag', 'gold', 'bag'],
        images: [{ public_id: 'leather_handbag', url: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=600' }]
    },
    {
        name: 'Casual Denim Overshirt',
        description: 'Heavyweight organic cotton denim overshirt with metal buttons. Hand-washed and styled with slight distress detailing.',
        price: 89,
        discountPrice: 89,
        category: categoriesMap['Casual'],
        brand: 'Elegance Denim',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['#2563eb', '#1d4ed8'],
        stock: 35,
        sold: 112,
        isFeatured: false,
        isBestSeller: true,
        tags: ['denim', 'shirt', 'casual'],
        images: [{ public_id: 'denim_shirt', url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600' }]
    },
    {
        name: 'Velvet Stiletto Heels',
        description: 'Luxury velvet heels with comfortable memory-foam insoles. Designed to stand out while offering long-wear ergonomics.',
        price: 180,
        discountPrice: 150,
        category: categoriesMap['Accessories'],
        brand: 'Elegance Atelier',
        sizes: ['37', '38', '39', '40'],
        colors: ['#be123c', '#000000'],
        stock: 8,
        sold: 37,
        isFeatured: false,
        isBestSeller: false,
        tags: ['shoes', 'heels', 'velvet'],
        images: [{ public_id: 'velvet_heels', url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600' }]
    },
    // Accessories required for Complete Your Look Matching
    {
        name: 'Pearl Drop Earrings',
        description: 'Stunning freshwater pearl drop earrings with 18k gold vermeil hardware hooks.',
        price: 45,
        discountPrice: 40,
        category: categoriesMap['Accessories'],
        brand: 'Elegance Atelier',
        sizes: ['One Size'],
        colors: ['#ffffff'],
        stock: 15,
        sold: 23,
        tags: ['earrings', 'pearl', 'jewelry'],
        images: [{ public_id: 'pearl_earrings', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600' }]
    },
    {
        name: 'Minimalist Gold Necklace',
        description: 'Elegant delicate gold link chain necklace suitable for stacking or single layering.',
        price: 75,
        discountPrice: 69,
        category: categoriesMap['Accessories'],
        brand: 'Elegance Atelier',
        sizes: ['One Size'],
        colors: ['#d97706'],
        stock: 10,
        sold: 15,
        tags: ['necklace', 'gold', 'jewelry'],
        images: [{ public_id: 'gold_necklace', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600' }]
    },
    {
        name: 'Classic Tennis Bracelet',
        description: 'Sparkling diamond-cut tennis link bracelet with double secure clasp locks.',
        price: 60,
        discountPrice: 55,
        category: categoriesMap['Accessories'],
        brand: 'Elegance Atelier',
        sizes: ['One Size'],
        colors: ['#cbd5e1'],
        stock: 20,
        sold: 31,
        tags: ['bracelet', 'jewelry'],
        images: [{ public_id: 'tennis_bracelet', url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600' }]
    },
    {
        name: 'Silk Floral Scarf',
        description: 'Premium mulberry silk scarf featuring hand-painted floral borders and soft edges.',
        price: 35,
        discountPrice: 30,
        category: categoriesMap['Accessories'],
        brand: 'Elegance Atelier',
        sizes: ['One Size'],
        colors: ['#be123c', '#b45309'],
        stock: 25,
        sold: 14,
        tags: ['scarf', 'silk', 'floral'],
        images: [{ public_id: 'silk_scarf', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600' }]
    },
    {
        name: 'Luxury Suede Slippers',
        description: 'Plush suede house slippers lined with cozy merino shearling lining.',
        price: 85,
        discountPrice: 79,
        category: categoriesMap['Accessories'],
        brand: 'Elegance Atelier',
        sizes: ['37', '38', '39', '40'],
        colors: ['#78350f', '#000000'],
        stock: 12,
        sold: 8,
        tags: ['slippers', 'shoes', 'suede'],
        images: [{ public_id: 'suede_slippers', url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600' }]
    }
];

const seedDatabase = async () => {
    try {
        const catCount = await Category.countDocuments();
        const prodCount = await Product.countDocuments();

        if (catCount === 0) {
            console.log('🌱 Seeding default categories in MongoDB...');
            await Category.create(INITIAL_CATEGORIES);
        }

        if (prodCount === 0) {
            console.log('🌱 Seeding default products in MongoDB...');
            const categories = await Category.find();
            const categoriesMap = {};
            categories.forEach(c => {
                categoriesMap[c.name] = c._id;
            });

            const productsData = getProductsData(categoriesMap);
            const createdProducts = await Product.create(productsData);

            // Establish default manual recommendations:
            // Pair "Silk Evening Gown" (index 0) with Handbag (index 2) and Heels (index 4)
            const gown = createdProducts.find(p => p.name === 'Silk Evening Gown');
            const handbag = createdProducts.find(p => p.name === 'Designer Leather Handbag');
            const heels = createdProducts.find(p => p.name === 'Velvet Stiletto Heels');
            const earrings = createdProducts.find(p => p.name === 'Pearl Drop Earrings');
            const necklace = createdProducts.find(p => p.name === 'Minimalist Gold Necklace');

            if (gown && handbag && heels) {
                gown.recommendations = [handbag._id, heels._id, earrings._id, necklace._id];
                await gown.save();
                console.log('🌱 Seeding default pairings complete!');
            }
        }
    } catch (err) {
        console.error('❌ Failed to seed MongoDB:', err.message);
    }
};

module.exports = seedDatabase;
