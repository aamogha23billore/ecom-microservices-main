-- =========================================================
-- ECOMMERCE PRODUCT SEED
-- Database: productdb
-- Prices: INR
-- =========================================================

BEGIN;

-- ---------------------------------------------------------
-- ELECTRONICS
-- ---------------------------------------------------------

INSERT INTO products
(name, description, price, stock_quantity, category, image_url, active, created_at, updated_at)
VALUES

    ('Mechanical RGB Gaming Keyboard',
     'Compact mechanical keyboard with RGB backlighting, tactile switches and durable aluminium construction. Ideal for gaming and productivity.',
     4499.00, 35, 'Electronics',
     'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Wireless Ergonomic Mouse',
     'Ergonomic wireless mouse with silent clicks, adjustable DPI and long battery life. Comfortable for extended work sessions.',
     1499.00, 65, 'Electronics',
     'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Portable Bluetooth Speaker',
     'Compact Bluetooth speaker with rich sound, deep bass and up to 12 hours of playback. Water-resistant design for indoor and outdoor use.',
     2999.00, 42, 'Electronics',
     'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('27-inch 4K Monitor',
     'Ultra HD 4K monitor with vibrant colours, slim bezels and multiple connectivity options. Perfect for work, design and entertainment.',
     28999.00, 18, 'Electronics',
     'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('USB-C Fast Charging Hub',
     'Multi-port USB-C hub with HDMI, USB 3.0, SD card and power delivery support. Designed for modern laptops and tablets.',
     2499.00, 55, 'Electronics',
     'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now());

-- ---------------------------------------------------------
-- FASHION
-- ---------------------------------------------------------

INSERT INTO products
(name, description, price, stock_quantity, category, image_url, active, created_at, updated_at)
VALUES

    ('Premium Cotton Oversized T-Shirt',
     'Soft heavyweight cotton oversized T-shirt with a relaxed fit. Designed for everyday casual wear.',
     1299.00, 90, 'Fashion',
     'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Classic Denim Jacket',
     'Timeless denim jacket with a comfortable regular fit. Easy to layer with casual outfits throughout the year.',
     2999.00, 40, 'Fashion',
     'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Minimalist Leather Sneakers',
     'Clean everyday sneakers made with premium leather-inspired material and a cushioned sole for all-day comfort.',
     4499.00, 55, 'Fashion',
     'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Classic Cotton Hoodie',
     'Warm cotton-blend hoodie with a soft interior, adjustable hood and relaxed everyday fit.',
     2499.00, 60, 'Fashion',
     'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Premium Casual Chinos',
     'Versatile slim-fit chinos made from comfortable stretch cotton. Suitable for work and casual occasions.',
     2299.00, 45, 'Fashion',
     'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now());

-- ---------------------------------------------------------
-- HOME & KITCHEN
-- ---------------------------------------------------------

INSERT INTO products
(name, description, price, stock_quantity, category, image_url, active, created_at, updated_at)
VALUES

    ('Ceramic Coffee Mug Set',
     'Set of four minimalist ceramic coffee mugs with a comfortable handle and durable glazed finish.',
     999.00, 75, 'Home & Kitchen',
     'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Stainless Steel Cookware Set',
     'Premium stainless steel cookware set designed for everyday cooking. Durable construction with easy-to-clean surfaces.',
     6999.00, 20, 'Home & Kitchen',
     'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Minimal Table Lamp',
     'Modern table lamp with a warm ambient glow and minimalist design. Perfect for bedrooms, desks and reading corners.',
     1799.00, 38, 'Home & Kitchen',
     'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Cotton Cushion Cover Set',
     'Set of four premium cotton cushion covers with soft textures and modern patterns for everyday home styling.',
     899.00, 70, 'Home & Kitchen',
     'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Wooden Serving Tray',
     'Hand-finished wooden serving tray with raised edges and sturdy handles. Ideal for breakfast, tea and entertaining guests.',
     1299.00, 32, 'Home & Kitchen',
     'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now());

-- ---------------------------------------------------------
-- BEAUTY
-- ---------------------------------------------------------

INSERT INTO products
(name, description, price, stock_quantity, category, image_url, active, created_at, updated_at)
VALUES

    ('Hydrating Face Moisturizer',
     'Lightweight daily moisturizer formulated to provide long-lasting hydration without feeling heavy or greasy.',
     799.00, 50, 'Beauty',
     'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Vitamin C Face Serum',
     'Lightweight vitamin C facial serum designed to support a brighter-looking and more even-looking complexion.',
     999.00, 45, 'Beauty',
     'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Daily Sunscreen SPF 50',
     'Lightweight broad-spectrum SPF 50 sunscreen with a comfortable finish for everyday outdoor protection.',
     699.00, 80, 'Beauty',
     'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Aloe Vera Body Lotion',
     'Soothing daily body lotion with a lightweight texture designed to leave skin feeling soft and hydrated.',
     599.00, 65, 'Beauty',
     'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Natural Lip Balm Set',
     'Set of three nourishing lip balms designed for everyday moisture and protection from dryness.',
     499.00, 100, 'Beauty',
     'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now());

-- ---------------------------------------------------------
-- SPORTS & FITNESS
-- ---------------------------------------------------------

INSERT INTO products
(name, description, price, stock_quantity, category, image_url, active, created_at, updated_at)
VALUES

    ('Performance Yoga Mat',
     'Non-slip exercise mat with comfortable cushioning for yoga, stretching, mobility and home workouts.',
     1499.00, 60, 'Sports & Fitness',
     'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Insulated Sports Bottle',
     'Double-wall insulated stainless steel bottle designed to keep drinks cold or hot for hours.',
     1299.00, 70, 'Sports & Fitness',
     'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Adjustable Dumbbell Set',
     'Compact adjustable dumbbell set for strength training at home. Multiple weight settings in a space-saving design.',
     4999.00, 25, 'Sports & Fitness',
     'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Training Gym Bag',
     'Spacious sports duffel bag with dedicated shoe compartment and multiple pockets for everyday training essentials.',
     1999.00, 45, 'Sports & Fitness',
     'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Resistance Band Kit',
     'Set of resistance bands with different resistance levels for strength training, mobility and rehabilitation exercises.',
     899.00, 85, 'Sports & Fitness',
     'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now());

-- ---------------------------------------------------------
-- BOOKS
-- ---------------------------------------------------------

INSERT INTO products
(name, description, price, stock_quantity, category, image_url, active, created_at, updated_at)
VALUES

    ('The Art of Focus',
     'A practical guide to building concentration, reducing distractions and creating better daily work habits.',
     499.00, 35, 'Books',
     'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Modern Software Engineering',
     'Practical concepts covering software architecture, clean code, system design and modern development practices.',
     899.00, 30, 'Books',
     'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('The Psychology of Money',
     'A practical exploration of behaviour, decision-making and the relationship people have with money.',
     599.00, 50, 'Books',
     'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Travel Photography Guide',
     'A practical guide to capturing memorable landscapes, cities and travel moments with your camera.',
     699.00, 28, 'Books',
     'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('The Complete Recipe Book',
     'A collection of simple and delicious recipes covering everyday meals, snacks, desserts and weekend cooking.',
     799.00, 40, 'Books',
     'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now());

-- ---------------------------------------------------------
-- GROCERY
-- ---------------------------------------------------------

INSERT INTO products
(name, description, price, stock_quantity, category, image_url, active, created_at, updated_at)
VALUES

    ('Premium Arabica Coffee',
     'Freshly roasted 100% Arabica coffee beans with a smooth aroma and balanced flavour. Suitable for multiple brewing methods.',
     649.00, 75, 'Grocery',
     'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Organic Green Tea',
     'Refreshing green tea made from carefully selected tea leaves. Perfect for a relaxing daily beverage.',
     399.00, 90, 'Grocery',
     'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Premium Almonds',
     'Crunchy premium almonds packed fresh for everyday snacking, breakfast and baking.',
     749.00, 65, 'Grocery',
     'https://images.unsplash.com/photo-1574570124395-0f7b4f0b7f4e?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Organic Honey',
     'Natural honey with a rich golden colour and smooth texture. A versatile addition to breakfast and beverages.',
     549.00, 55, 'Grocery',
     'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Dark Chocolate Collection',
     'Assorted premium dark chocolate bars made with rich cocoa for a sophisticated everyday treat.',
     699.00, 45, 'Grocery',
     'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

-- ---------------------------------------------------------
-- ACCESSORIES
-- ---------------------------------------------------------

INSERT INTO products
(name, description, price, stock_quantity, category, image_url, active, created_at, updated_at)
VALUES

    ('Minimal Leather Belt',
     'Classic genuine leather belt with a brushed metal buckle and versatile design for everyday outfits.',
     1499.00, 45, 'Accessories',
     'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Premium Travel Backpack',
     'Large water-resistant travel backpack with padded laptop compartment, luggage strap and multiple organiser pockets.',
     3499.00, 35, 'Accessories',
     'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Classic Leather Card Holder',
     'Slim genuine leather card holder with multiple card slots. Compact enough for everyday carry.',
     999.00, 60, 'Accessories',
     'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Polarized Aviator Sunglasses',
     'Classic aviator sunglasses with polarized lenses and UV protection. Includes a protective case.',
     2299.00, 40, 'Accessories',
     'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now()),

    ('Classic Canvas Cap',
     'Minimal everyday cap made from durable cotton canvas with an adjustable strap at the back.',
     799.00, 75, 'Accessories',
     'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=800&h=600&q=80',
     true, now(), now());

COMMIT;

-- ---------------------------------------------------------
-- VERIFY CATALOG
-- ---------------------------------------------------------

SELECT
    category,
    COUNT(*) AS product_count
FROM products
WHERE active = true
GROUP BY category
ORDER BY category;

SELECT
    id,
    name,
    category,
    price,
    stock_quantity
FROM products
WHERE active = true
ORDER BY category, id;