-- Glimmora sample data. Safe to run repeatedly: existing rows are kept, nothing is duplicated.
-- Money is in paise (₹649 = 64900).
-- Image URLs use the "art:" scheme: the frontend renders them as Glimmora's SVG jewellery art.
-- Replace them with real https:// photo URLs any time.

DROP TABLE IF EXISTS seed_products;
CREATE TEMP TABLE seed_products (
  slug TEXT, name TEXT, category TEXT, finish TEXT, occasion TEXT,
  price INTEGER, compare_at_price INTEGER, stock INTEGER, rating NUMERIC(2,1), review_count INTEGER,
  is_trending BOOLEAN, is_new BOOLEAN, age_days INTEGER, gem TEXT, image_count INTEGER, description TEXT
);

INSERT INTO seed_products VALUES
-- Earrings
('aurelia-jhumka-drops','Aurelia Jhumka Drops','Earrings','Kundan','Festive',64900,129900,3,4.8,412,true,false,90,'C0392B',3,'Bell-shaped jhumkas with hand-set ruby-tone stones and dainty bead fringes that sway as you move.'),
('luna-pearl-studs','Luna Pearl Studs','Earrings','Pearl','Office',29900,49900,24,4.7,863,false,false,160,'FFFDF8',2,'Lustrous shell pearls on hypoallergenic posts — the quiet hero of every outfit.'),
('celeste-hoop-huggies','Celeste Hoop Huggies','Earrings','Rose Gold','Everyday',44900,79900,9,4.6,291,false,true,2,'F4B4C6',3,'Pavé-studded huggies that hug the lobe and catch every flicker of light.'),
('noor-chandbali','Noor Chandbali','Earrings','Kundan','Wedding',89900,179900,2,4.9,538,true,false,120,'1E8449',3,'Crescent-moon chandbalis with emerald-tone kundan and pearl drops. Pure drama.'),
('ember-ear-cuffs','Ember Ear Cuffs','Earrings','Oxidised','Party',34900,59900,11,4.4,156,false,true,4,'7F858D',2,'No-piercing ear cuffs with engraved tribal detailing for an effortless edge.'),
('sitara-silver-drops','Sitara Silver Drops','Earrings','Silver','Party',39900,69900,14,4.5,203,false,false,75,'B9D3F0',3,'Starburst drops in high-polish silver tone with a single moonstone-effect bead.'),
-- Necklaces
('seraphine-layered-chain','Seraphine Layered Chain','Necklaces','Gold-plated','Party',79900,149900,7,4.7,344,true,false,60,'EBCB7E',3,'Three delicate layers — snake, paperclip and satellite — pre-styled to never tangle.'),
('maharani-kundan-choker','Maharani Kundan Choker','Necklaces','Kundan','Wedding',189900,399900,2,4.9,221,true,false,140,'C0392B',3,'A regal choker with ruby-tone kundan, pearl hangings and an adjustable dori.'),
('petal-pendant','Petal Pendant','Necklaces','Rose Gold','Office',49900,89900,18,4.6,508,false,false,200,'F4B4C6',2,'A five-petal bloom with a single crystal heart on a fine 18-inch chain.'),
('oceanic-pearl-strand','Oceanic Pearl Strand','Necklaces','Pearl','Wedding',109900,199900,4,4.8,189,false,true,3,'FFFDF8',3,'Hand-knotted glass pearls with a gold-tone lobster clasp. Timeless, always.'),
('tribal-coin-necklace','Tribal Coin Necklace','Necklaces','Oxidised','Festive',69900,119900,11,4.5,276,false,false,95,'7F858D',2,'Stacked antique coins with ghungroo beads — boho meets heritage.'),
('starlight-silver-lariat','Starlight Silver Lariat','Necklaces','Silver','Everyday',59900,99900,1,4.6,132,false,true,1,'E9F2FF',3,'A sleek Y-lariat with a tiny star drop that sits perfectly on a V-neck.'),
-- Rings
('solitaire-halo-ring','Solitaire Halo Ring','Rings','Silver','Party',39900,79900,6,4.7,642,true,false,110,'E9F2FF',3,'A brilliant-cut CZ ringed by a micro-pavé halo. Adjustable band.'),
('twisted-vine-stackers','Twisted Vine Stackers','Rings','Gold-plated','Everyday',34900,59900,15,4.5,233,false,true,5,'EBCB7E',2,'Set of three slim twisted bands — wear solo or stack them high.'),
('polki-cocktail-ring','Polki Cocktail Ring','Rings','Kundan','Festive',59900,119900,3,4.8,174,true,false,85,'1E8449',3,'An oversized polki-style statement ring with an emerald-tone centre.'),
('moonstone-oval-ring','Moonstone Oval Ring','Rings','Oxidised','Everyday',44900,74900,8,4.6,98,false,false,130,'B9D3F0',2,'Milky moonstone-effect cabochon in an antique filigree setting.'),
('blush-heart-ring','Blush Heart Ring','Rings','Rose Gold','Party',32900,54900,12,4.5,187,false,true,6,'F4B4C6',3,'A heart-cut pink crystal on a delicate rose gold-tone band.'),
('pearl-crown-ring','Pearl Crown Ring','Rings','Pearl','Wedding',42900,69900,10,4.4,76,false,false,70,'FFFDF8',2,'A single freshwater-style pearl held in a tiny crown of prongs.'),
-- Bangles
('rajwadi-kada-pair','Rajwadi Kada Pair','Bangles','Kundan','Wedding',129900,249900,4,4.8,301,true,false,150,'C0392B',3,'Screw-open kadas with carved motifs and ruby-tone stones. Sold as a pair.'),
('minimal-cuff-bangle','Minimal Cuff Bangle','Bangles','Rose Gold','Office',54900,99900,20,4.6,412,false,false,180,'F4B4C6',2,'A sleek open cuff with a brushed finish — work-ready, weekend-approved.'),
('pearl-bead-bracelet-set','Pearl Bead Bracelet Set','Bangles','Pearl','Everyday',59900,99900,10,4.5,145,false,true,2,'FFFDF8',3,'Stretch-fit pearl and gold-bead bracelets — a set of four to mix and match.'),
('oxidised-jaali-bangles','Oxidised Jaali Bangles','Bangles','Oxidised','Festive',49900,89900,1,4.4,187,false,false,100,'7F858D',2,'Intricate jaali-cut bangles with an antique silver look. Set of two.'),
('temple-gold-bangles','Temple Gold Bangles','Bangles','Gold-plated','Festive',89900,159900,6,4.7,256,true,false,55,'C0392B',3,'Temple-art bangles with Lakshmi motifs and tiny ruby-tone accents. Set of four.'),
('sleek-silver-bracelet','Sleek Silver Bracelet','Bangles','Silver','Office',39900,64900,16,4.5,118,false,false,90,'C5CAD4',2,'A slim box-chain bracelet with an adjustable slider clasp.'),
-- Anklets
('payal-ghungroo-anklet','Payal Ghungroo Anklet','Anklets','Silver','Festive',44900,79900,8,4.7,267,true,false,125,'C5CAD4',3,'Traditional payal with tiny ghungroos that chime softly with every step.'),
('starlit-chain-anklet','Starlit Chain Anklet','Anklets','Gold-plated','Party',29900,54900,14,4.5,319,false,true,3,'EBCB7E',2,'A whisper-thin chain dotted with star charms. Beach-to-brunch ready.'),
('evil-eye-anklet','Evil Eye Anklet','Anklets','Gold-plated','Everyday',34900,59900,5,4.6,205,false,false,65,'2E86DE',3,'Enamel evil-eye charms on a dainty chain — protection, but make it pretty.'),
('rose-charm-anklet','Rose Charm Anklet','Anklets','Rose Gold','Everyday',32900,54900,13,4.4,92,false,false,40,'F4B4C6',2,'Tiny rosebud charms on a satellite chain with a 2-inch extender.'),
('bridal-kundan-payal','Bridal Kundan Payal','Anklets','Kundan','Wedding',99900,179900,2,4.8,141,true,false,80,'C0392B',3,'A heavy bridal payal with kundan florets and pearl hangings. Sold as a pair.'),
('boho-oxidised-anklet','Boho Oxidised Anklet','Anklets','Oxidised','Party',27900,44900,18,4.3,64,false,true,5,'7F858D',2,'Layered oxidised chains with coin and bead danglers.'),
-- Sets
('shehnaai-bridal-set','Shehnaai Bridal Set','Sets','Kundan','Wedding',349900,699900,2,4.9,132,true,false,160,'C0392B',3,'Necklace, earrings and maang tikka with kundan, pearls and ruby-tone drops.'),
('blush-crystal-set','Blush Crystal Set','Sets','Rose Gold','Party',129900,229900,6,4.7,211,false,true,1,'F4B4C6',3,'Pink crystal pendant and matching drops — made for cocktail hour.'),
('everyday-pearl-duo','Everyday Pearl Duo','Sets','Pearl','Office',79900,139900,12,4.6,388,false,false,190,'FFFDF8',2,'A single-pearl pendant and studs. Gift-ready in our signature box.'),
('heritage-oxidised-set','Heritage Oxidised Set','Sets','Oxidised','Festive',99900,169900,7,4.5,154,false,false,115,'7F858D',2,'A statement oxidised necklace with matching jhumkas for festive evenings.'),
('golden-hour-set','Golden Hour Set','Sets','Gold-plated','Festive',149900,259900,5,4.8,263,true,false,45,'EBCB7E',3,'A sunburst necklace and drops in warm gold tone that glow in every photo.'),
('moonbeam-silver-set','Moonbeam Silver Set','Sets','Silver','Office',89900,149900,3,4.6,97,false,true,4,'E9F2FF',3,'A minimal crescent pendant and studs in bright silver tone.');

INSERT INTO products (slug, name, category, finish, occasion, price, compare_at_price, stock, rating, review_count,
                      description, care_tips, is_trending, is_new, created_at)
SELECT slug, name, category, finish, occasion, price, compare_at_price, stock, rating, review_count, description,
  CASE finish
    WHEN 'Pearl'    THEN 'Wipe pearls with a soft damp cloth after wearing. Keep away from perfume and hairspray. Store flat so the thread does not stretch.'
    WHEN 'Kundan'   THEN 'Store in the zip pouch provided, away from moisture. Do not wash — wipe gently with dry cotton. Keep stones away from perfume.'
    WHEN 'Oxidised' THEN 'Store in an airtight pouch to keep the antique finish. Avoid water and lotions. Polish lightly with a dry cloth.'
    WHEN 'Silver'   THEN 'Wipe with a soft dry cloth after each wear. Store in an anti-tarnish pouch. Avoid swimming or bathing while wearing.'
    ELSE               'Put jewellery on last, after perfume and lotion. Wipe with a soft dry cloth after each wear. Store separately to avoid scratches.'
  END,
  is_trending, is_new, now() - make_interval(days => age_days)
FROM seed_products
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_images (product_id, url, sort_order)
SELECT p.id, 'art:' || s.category || '/' || s.finish || '/' || v.n || '?gem=' || s.gem, v.n
FROM seed_products s
JOIN products p ON p.slug = s.slug
CROSS JOIN generate_series(0, 2) AS v(n)
WHERE v.n < s.image_count
ON CONFLICT (product_id, sort_order) DO NOTHING;

-- Coupons (WELCOME10 = 10% off, GLOW200 = ₹200 off above ₹999, FESTIVE25 = expired, for testing)
INSERT INTO coupons (code, discount_type, discount_value, min_order, is_active, expires_at) VALUES
  ('WELCOME10', 'percent', 10, 0, true, NULL),
  ('GLOW200', 'fixed', 20000, 99900, true, NULL),
  ('FESTIVE25', 'percent', 25, 0, true, now() - interval '10 days')
ON CONFLICT (code) DO UPDATE SET
  discount_type = EXCLUDED.discount_type, discount_value = EXCLUDED.discount_value,
  min_order = EXCLUDED.min_order, is_active = EXCLUDED.is_active, expires_at = EXCLUDED.expires_at;

-- Deal of the day: refreshed every time setup runs; ends at 23:59:59 tonight (session time zone).
DELETE FROM deals WHERE product_id = (SELECT id FROM products WHERE slug = 'maharani-kundan-choker');
INSERT INTO deals (product_id, deal_price, starts_at, ends_at)
SELECT id, 149900, date_trunc('day', now()), date_trunc('day', now()) + interval '1 day' - interval '1 second'
FROM products WHERE slug = 'maharani-kundan-choker';

-- Sample reviewers (cannot log in: the password hash is not a valid bcrypt hash)
INSERT INTO users (email, password_hash, full_name, phone, loyalty_points, tier, created_at) VALUES
  ('priya.s@reviewers.glimmora.local',  '!no-login', 'Priya S.',  NULL, 820,  'Silver',  now() - interval '300 days'),
  ('ananya.r@reviewers.glimmora.local', '!no-login', 'Ananya R.', NULL, 1650, 'Gold',    now() - interval '250 days'),
  ('meera.k@reviewers.glimmora.local',  '!no-login', 'Meera K.',  NULL, 410,  'Silver',  now() - interval '180 days'),
  ('zoya.h@reviewers.glimmora.local',   '!no-login', 'Zoya H.',   NULL, 3120, 'Diamond', now() - interval '400 days')
ON CONFLICT (email) DO NOTHING;

INSERT INTO reviews (product_id, user_id, rating, comment, created_at)
SELECT p.id, u.id, r.rating, r.comment, now() - make_interval(days => r.age)
FROM (VALUES
  ('aurelia-jhumka-drops',   'priya.s@reviewers.glimmora.local',  5, 'Looks exactly like real gold! Got so many compliments at my cousin’s sangeet.', 2),
  ('aurelia-jhumka-drops',   'zoya.h@reviewers.glimmora.local',   5, 'The finish hasn’t faded even after a month of wear. Love it!', 21),
  ('aurelia-jhumka-drops',   'meera.k@reviewers.glimmora.local',  4, 'Lightweight and comfortable for long hours. Slightly smaller than expected.', 14),
  ('maharani-kundan-choker', 'ananya.r@reviewers.glimmora.local', 5, 'Packaging was gorgeous and delivery was a day early. Will order again.', 7),
  ('maharani-kundan-choker', 'zoya.h@reviewers.glimmora.local',   5, 'Wore it for my reception — nobody believed it was artificial.', 30),
  ('luna-pearl-studs',       'meera.k@reviewers.glimmora.local',  5, 'My daily go-to. Pearls have a lovely glow.', 9),
  ('solitaire-halo-ring',    'priya.s@reviewers.glimmora.local',  4, 'Sparkles like crazy. The adjustable band is very handy.', 18),
  ('seraphine-layered-chain','ananya.r@reviewers.glimmora.local', 5, 'Finally layered chains that don’t tangle!', 5),
  ('shehnaai-bridal-set',    'zoya.h@reviewers.glimmora.local',   5, 'Absolutely bridal. The maang tikka is stunning.', 40),
  ('payal-ghungroo-anklet',  'priya.s@reviewers.glimmora.local',  5, 'The ghungroo sound is so soft and pretty.', 11)
) AS r(slug, email, rating, comment, age)
JOIN products p ON p.slug = r.slug
JOIN users u ON u.email = r.email
ON CONFLICT (product_id, user_id) DO NOTHING;

-- A few past delivered orders from the sample reviewers (so "orders delivered" is not zero on day one)
INSERT INTO orders (user_id, order_number, status, subtotal, discount, shipping_fee, total, payment_method,
                    shipping_name, shipping_phone, shipping_address, created_at, updated_at)
SELECT u.id, o.num, 'delivered', p.price, 0, CASE WHEN p.price >= 49900 THEN 0 ELSE 4900 END,
       p.price + CASE WHEN p.price >= 49900 THEN 0 ELSE 4900 END, 'cod', u.full_name, '9800000000',
       'Sample address', now() - make_interval(days => o.age), now() - make_interval(days => o.age - 4)
FROM (VALUES
  ('GLM-10001', 'priya.s@reviewers.glimmora.local',  'aurelia-jhumka-drops',   12),
  ('GLM-10002', 'ananya.r@reviewers.glimmora.local', 'maharani-kundan-choker', 15),
  ('GLM-10003', 'meera.k@reviewers.glimmora.local',  'luna-pearl-studs',       20),
  ('GLM-10004', 'zoya.h@reviewers.glimmora.local',   'shehnaai-bridal-set',    45)
) AS o(num, email, slug, age)
JOIN users u ON u.email = o.email
JOIN products p ON p.slug = o.slug
ON CONFLICT (order_number) DO NOTHING;

INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
SELECT o.id, p.id, p.name, p.price, 1
FROM (VALUES
  ('GLM-10001', 'aurelia-jhumka-drops'), ('GLM-10002', 'maharani-kundan-choker'),
  ('GLM-10003', 'luna-pearl-studs'),     ('GLM-10004', 'shehnaai-bridal-set')
) AS x(num, slug)
JOIN orders o ON o.order_number = x.num
JOIN products p ON p.slug = x.slug
WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id);

DROP TABLE IF EXISTS seed_products;
