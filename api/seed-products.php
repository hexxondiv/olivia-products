<?php
/**
 * Seed Products from allProductsData.tsx
 * This script reads the product data structure and imports it into the database
 * 
 * Usage: php seed-products.php
 * Or via web: /api/seed-products.php?run=1
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

// Only allow running from command line or with explicit parameter
$isWebRequest = isset($_SERVER['REQUEST_METHOD']);
$runFromWeb = isset($_GET['run']) && $_GET['run'] === '1';

if ($isWebRequest && !$runFromWeb) {
    http_response_code(403);
    die("Access denied. Add ?run=1 to execute.");
}

// Product data extracted from allProductsData.tsx
$productsData = [
    [
        'heading' => 'Hand Wash',
        'firstImg' => 'hand-wash1.png',
        'hoverImg' => 'hand-wash11.png',
        'id' => 9,
        'price' => 16000,
        'rating' => 4.2,
        'name' => 'TropiGlow',
        'sufix' => 'Hand Wash',
        'color' => '#511375',
        'detail' => 'Gentle on skin, ruthless on germs — protect your hands with every wash.',
        'moreDetail' => 'Infused with the playful sweetness of banana, the crisp zest of citrus, and the juicy notes of grape, Olivia TropiGlow Hand Wash brings tropical radiance to your daily routine. Its silky lather leaves hands feeling clean, soft, and delicately scented long after every wash. Each drop is a refreshing escape — bright, fruity, and irresistibly uplifting. With TropiGlow, every wash feels like a little holiday for your hands.',
        'additionalImgs' => ['hand-wash111.png'],
        'tagline' => 'A burst of sunshine in every wash.',
        'category' => ['hand-soap'],
        'flavours' => [
            ['id' => 1, 'name' => '🍌 Banana'],
            ['id' => 2, 'name' => '🍊 Citrus'],
            ['id' => 3, 'name' => '🍇 Grape']
        ],
        'bestSeller' => true
    ],
    [
        'heading' => 'Hand Wash',
        'firstImg' => 'hand-wash2.png',
        'hoverImg' => 'hand-wash2222.png',
        'id' => 10,
        'price' => 16000,
        'detail' => 'Gentle on skin, ruthless on germs — protect your hands with every wash.',
        'rating' => 4.2,
        'name' => 'FreshBurst',
        'sufix' => 'Hand Wash',
        'color' => '#b70207',
        'moreDetail' => 'Brimming with the crisp scent of apple, the sweetness of ripe strawberry, and the cooling touch of watermelon, Olivia FreshBurst Hand Wash turns an everyday wash into a moment of fruity delight. Its rich lather cleanses gently while leaving behind a soft, lingering fragrance that feels both playful and pure. Each wash awakens your senses with a rush of freshness and care. With FreshBurst, clean hands have never felt this invigorating.',
        'tagline' => 'Juicy freshness at your fingertips.',
        'additionalImgs' => ['hand-wash222.png', 'hand-wash22.png'],
        'category' => ['hand-soap'],
        'flavours' => [
            ['id' => 1, 'name' => '🍎 Apple'],
            ['id' => 2, 'name' => '🍓 Strawberry'],
            ['id' => 3, 'name' => '🍉 Watermelon']
        ]
    ],
    [
        'heading' => 'Hand Wash',
        'firstImg' => 'hand-wash3.png',
        'hoverImg' => 'hand-wash3333.png',
        'id' => 11,
        'price' => 16000,
        'rating' => 4.2,
        'name' => 'Island Dew',
        'sufix' => 'Hand Wash',
        'color' => '#f0be0cff',
        'moreDetail' => 'A radiant blend of papaya, pineapple, and citrus, Olivia Island Dew Hand Wash captures the essence of sunlit shores and pure tropical energy. Its creamy lather nourishes your hands while releasing a wave of juicy, refreshing fragrance with every wash. The exotic sweetness of papaya meets the zesty spark of pineapple and citrus to leave your skin feeling soft, smooth, and revived. With Island Dew, every wash feels like a gentle ocean breeze.',
        'tagline' => 'Daily tropical freshness that lingers.',
        'detail' => 'Gentle on skin, ruthless on germs — protect your hands with every wash.',
        'additionalImgs' => ['hand-wash33.png'],
        'category' => ['hand-soap'],
        'flavours' => [
            ['id' => 1, 'name' => '🥭 Papaya'],
            ['id' => 2, 'name' => '🍍Pineapple'],
            ['id' => 3, 'name' => '🍊 Citrus']
        ]
    ],
    [
        'heading' => 'Hand Wash',
        'firstImg' => 'hand-wash4.png',
        'hoverImg' => 'hand-wash44.png',
        'id' => 12,
        'price' => 16000,
        'rating' => 4.2,
        'name' => 'ZestMist',
        'sufix' => 'Hand Wash',
        'color' => '#0aa724ff',
        'moreDetail' => 'Infused with the tang of citrus, the lush sweetness of grapes, and the cooling touch of kiwi and cucumber, Olivia ZestMist Hand Wash delivers a rush of pure freshness with every cleanse. Its smooth, foamy texture purifies gently while leaving your skin hydrated and delicately perfumed. The scent unfolds like a morning breeze — crisp, fruity, and irresistibly clean. With ZestMist, freshness doesn\'t just wash — it awakens.',
        'tagline' => 'Cool. Clean. Completely refreshing.',
        'detail' => 'Gentle on skin, ruthless on germs — protect your hands with every wash.',
        'additionalImgs' => ['hand-wash444.png'],
        'category' => ['hand-soap'],
        'flavours' => [
            ['id' => 1, 'name' => '🍇 Grapes'],
            ['id' => 2, 'name' => '🍊 Citrus'],
            ['id' => 3, 'name' => '🥝 Kiwi'],
            ['id' => 4, 'name' => '🥒 Cucumber']
        ]
    ],
    [
        'heading' => 'Hand Wash',
        'firstImg' => 'hand-wash5.png',
        'hoverImg' => 'hand-wash55.png',
        'id' => 13,
        'price' => 16000,
        'detail' => 'Gentle on skin, ruthless on germs — protect your hands with every wash.',
        'rating' => 4.2,
        'name' => 'VelvetBloom',
        'sufix' => 'Hand Wash',
        'moreDetail' => 'Blending the cooling calm of cucumber, the tropical sweetness of mango, and the gentle allure of blueberries, Olivia VelvetBloom Hand Wash wraps your hands in a soft, luxurious cleanse. Its rich lather refreshes and hydrates, leaving skin velvety-smooth and delicately scented. Each wash feels like a touch of spa luxury — balanced, soothing, and irresistibly fresh. With VelvetBloom, everyday care becomes a little act of indulgence.',
        'tagline' => 'Where freshness meets indulgence.',
        'additionalImgs' => [],
        'category' => ['hand-soap'],
        'color' => '#0079ec',
        'flavours' => [
            ['id' => 1, 'name' => '🥒 Cucumber'],
            ['id' => 2, 'name' => '🥭 Mango'],
            ['id' => 3, 'name' => '🫐 Blue berries']
        ]
    ],
    [
        'heading' => 'Hand Wash',
        'firstImg' => 'hand-wash6.png',
        'hoverImg' => 'hand-wash66.png',
        'id' => 14,
        'price' => 16000,
        'rating' => 4.2,
        'name' => 'MilkyWay',
        'sufix' => 'Hand Wash',
        'color' => '#00722e',
        'moreDetail' => 'Indulge in the silky fusion of coconut and soursop with Olivia MilkyWay Hand Wash, a soothing formula that pampers your skin with creamy nourishment. The tropical coconut caresses your hands with natural moisture, while the gentle sweetness of soursop refreshes and uplifts your senses. Each wash leaves your skin soft, smooth, and delicately scented — a perfect balance of purity and indulgence. With MilkyWay, clean hands feel luxuriously cared for.',
        'tagline' => 'Pure softness in every touch.',
        'detail' => 'Gentle on skin, ruthless on germs — protect your hands with every wash.',
        'additionalImgs' => ['hand-wash666.png'],
        'category' => ['hand-soap'],
        'flavours' => [
            ['id' => 1, 'name' => '🥥 Coconut'],
            ['id' => 2, 'name' => '🌿 Sour Sop']
        ]
    ],
    [
        'firstImg' => 'dish1.png',
        'hoverImg' => 'dish11.png',
        'id' => 15,
        'heading' => 'Dish Wash',
        'price' => 5000,
        'rating' => 4.0,
        'name' => 'Fruity',
        'sufix' => 'Dish Wash',
        'color' => 'green',
        'detail' => 'Cuts through grease in seconds — for dishes that shine like new.',
        'additionalImgs' => ['dish111.png'],
        'category' => ['dish-wash'],
        'bestSeller' => true,
        'moreDetail' => 'Tough on grease but gentle on your hands, Olivia Dish Wash cuts through the most stubborn food residue, leaving your dishes sparkling clean. Powered by lemon extract and plant-based surfactants, it delivers a streak-free shine while being eco-friendly and safe on skin. One drop goes a long way — making dishwashing feel less like a chore and more like a breeze.'
    ],
    [
        'firstImg' => 'dish2.png',
        'hoverImg' => 'dish22.png',
        'id' => 16,
        'heading' => 'Dish Wash',
        'price' => 5000,
        'rating' => 4.0,
        'name' => 'Lemon',
        'sufix' => 'Dish Wash',
        'color' => '#c9ef8e',
        'detail' => 'Cuts through grease in seconds — for dishes that shine like new.',
        'additionalImgs' => ['dish222.png'],
        'category' => ['dish-wash'],
        'moreDetail' => 'Tough on grease but gentle on your hands, Olivia Dish Wash cuts through the most stubborn food residue, leaving your dishes sparkling clean. Powered by lemon extract and plant-based surfactants, it delivers a streak-free shine while being eco-friendly and safe on skin. One drop goes a long way — making dishwashing feel less like a chore and more like a breeze.'
    ],
    [
        'firstImg' => 'dish5.png',
        'hoverImg' => 'dish55.png',
        'id' => 17,
        'heading' => 'Dish Wash',
        'price' => 3000,
        'rating' => 4.0,
        'name' => 'Fruity',
        'sufix' => 'Dish Wash',
        'color' => 'green',
        'detail' => 'Cuts through grease in seconds — for dishes that shine like new.',
        'additionalImgs' => [],
        'category' => ['dish-wash'],
        'moreDetail' => 'Tough on grease but gentle on your hands, Olivia Dish Wash cuts through the most stubborn food residue, leaving your dishes sparkling clean. Powered by lemon extract and plant-based surfactants, it delivers a streak-free shine while being eco-friendly and safe on skin. One drop goes a long way — making dishwashing feel less like a chore and more like a breeze.'
    ],
    [
        'firstImg' => 'dish3.png',
        'hoverImg' => 'dish33.png',
        'id' => 18,
        'heading' => 'Dish Wash',
        'price' => 3000,
        'rating' => 4.0,
        'name' => 'Olivia Apple',
        'sufix' => 'Dish Wash',
        'color' => '#f6d25a',
        'detail' => 'Cuts through grease in seconds — for dishes that shine like new.',
        'additionalImgs' => ['dish333.png'],
        'category' => ['dish-wash'],
        'moreDetail' => 'Tough on grease but gentle on your hands, Olivia Dish Wash cuts through the most stubborn food residue, leaving your dishes sparkling clean. Powered by lemon extract and plant-based surfactants, it delivers a streak-free shine while being eco-friendly and safe on skin. One drop goes a long way — making dishwashing feel less like a chore and more like a breeze.'
    ],
    [
        'firstImg' => 'dish4.png',
        'hoverImg' => 'dish44.png',
        'id' => 19,
        'heading' => 'Dish Wash',
        'price' => 2000,
        'rating' => 4.0,
        'name' => 'Olivia Plain',
        'sufix' => 'Dish Wash',
        'color' => '#220cc5',
        'detail' => 'Cuts through grease in seconds — for dishes that shine like new.',
        'additionalImgs' => [],
        'category' => ['dish-wash'],
        'moreDetail' => 'Tough on grease but gentle on your hands, Olivia Dish Wash cuts through the most stubborn food residue, leaving your dishes sparkling clean. Powered by lemon extract and plant-based surfactants, it delivers a streak-free shine while being eco-friendly and safe on skin. One drop goes a long way — making dishwashing feel less like a chore and more like a breeze.'
    ],
    [
        'firstImg' => 'dish6.png',
        'hoverImg' => 'dish66.png',
        'id' => 20,
        'heading' => 'Dish Wash',
        'price' => 12000,
        'rating' => 4.0,
        'name' => 'Olivia Fruity',
        'sufix' => 'Dish Wash',
        'color' => 'green',
        'detail' => 'Cuts through grease in seconds — for dishes that shine like new.',
        'additionalImgs' => ['dish666.png', 'dish6666.png'],
        'category' => ['dish-wash'],
        'moreDetail' => 'Tough on grease but gentle on your hands, Olivia Dish Wash cuts through the most stubborn food residue, leaving your dishes sparkling clean. Powered by lemon extract and plant-based surfactants, it delivers a streak-free shine while being eco-friendly and safe on skin. One drop goes a long way — making dishwashing feel less like a chore and more like a breeze.'
    ],
    [
        'firstImg' => 'air-freshener1.png',
        'hoverImg' => 'airfreshener.gif',
        'id' => 21,
        'heading' => 'Air Freshener',
        'price' => 10000,
        'rating' => 4.8,
        'name' => 'Primrose',
        'detail' => 'Instantly refresh your space with long-lasting, mood-lifting fragrance.',
        'tagline' => 'Gentle. Graceful. Unforgettable.',
        'additionalImgs' => [],
        'sufix' => 'Air Freshener',
        'color' => '#920c0f',
        'category' => ['air-freshener'],
        'bestSeller' => true,
        'moreDetail' => 'Inspired by the delicate beauty of blooming petals, Olivia Primrose Air Freshener fills your space with a soft floral embrace that soothes and uplifts. Each mist releases notes of springtime freshness, carrying whispers of wild blossoms and morning dew. The scent lingers tenderly — elegant, calming, and effortlessly pure. With Primrose, every breath feels like stepping into a garden kissed by sunrise.'
    ],
    [
        'firstImg' => 'air-freshner3.png',
        'hoverImg' => 'air-life2.png',
        'id' => 22,
        'heading' => 'Air Freshener',
        'price' => 10000,
        'rating' => 4.8,
        'name' => 'Belle Rose',
        'color' => 'red',
        'tagline' => 'Where elegance blooms in every breath',
        'flavours' => [
            ['id' => 1, 'name' => '🌹 Rose Flower']
        ],
        'sufix' => 'Air Freshener',
        'detail' => 'Instantly refresh your space with long-lasting, mood-lifting fragrance.',
        'additionalImgs' => [],
        'category' => ['air-freshener'],
        'moreDetail' => 'Born from the delicate harmony of red and white roses, Olivia Belle Rose Air Freshener wraps every space in timeless elegance. Its fragrance balances soft romance with refreshing purity, creating an atmosphere that feels graceful, calm, and inviting. Each mist releases the gentle luxury of fresh-cut roses that linger beautifully through the day. With Belle Rose, every breath becomes a whisper of sophistication'
    ],
    [
        'firstImg' => 'air-freshner4.png',
        'hoverImg' => 'air-life3.png',
        'id' => 23,
        'heading' => 'Air Freshener',
        'price' => 9000,
        'rating' => 4.8,
        'name' => 'Lily',
        'detail' => 'Instantly refresh your space with long-lasting, mood-lifting fragrance.',
        'additionalImgs' => [],
        'category' => ['air-freshener'],
        'tagline' => 'Sweet fragrance that lingers.',
        'color' => 'red',
        'sufix' => 'Air Freshener',
        'moreDetail' => 'A captivating fusion of ripe raspberry and bold blackberry, Olivia Lily Air Freshener is crafted to uplift and inspire. The scent dances between juicy sweetness and deep allure, filling your space with a burst of fruity vibrance. Long-lasting yet delicately balanced, it transforms the atmosphere into one of freshness, joy, and subtle charm. With Lily, every breath feels like a soft whisper of sweetness.',
        'flavours' => [
            ['id' => 1, 'name' => '🌹 Raspberry'],
            ['id' => 2, 'name' => '🍇 Black Berry']
        ]
    ],
    [
        'firstImg' => 'air1.png',
        'hoverImg' => 'air11.png',
        'id' => 24,
        'heading' => 'Air Freshener',
        'price' => 9000,
        'rating' => 4.8,
        'name' => 'Murray Berry',
        'detail' => 'Instantly refresh your space with long-lasting, mood-lifting fragrance.',
        'additionalImgs' => [],
        'sufix' => 'Air Freshener',
        'tagline' => 'A burst of berry freshness',
        'category' => ['air-freshener'],
        'moreDetail' => 'A captivating fusion of strawberry, blueberry, and blackberry, Olivia Murray Berry Air Freshener envelopes your space in a harmony of juicy freshness and gentle calm. Each spray releases waves of ripe sweetness balanced with subtle floral undertones, creating an atmosphere that feels both vibrant and soothing. Its long-lasting fragrance lingers like a soft melody — refreshing, warm, and irresistibly inviting. With Murray Berry, every breath feels like a tender embrace of nature\'s sweetness.',
        'color' => '#0b830bff',
        'flavours' => [
            ['id' => 1, 'name' => '🌹🫐 Blueberry'],
            ['id' => 2, 'name' => '🍇 Black Berry'],
            ['id' => 3, 'name' => '🍓 Raspverry']
        ]
    ],
    [
        'firstImg' => 'shampoo1.png',
        'hoverImg' => 'shampoo111.png',
        'id' => 25,
        'price' => 12000,
        'rating' => 4.5,
        'heading' => 'Hair Care',
        'name' => 'Fresh Beauty',
        'sufix' => 'Shampoo',
        'detail' => 'Nourish your hair from root to tip — for softness you can feel and shine you can flaunt.',
        'additionalImgs' => ['shampoo11.png'],
        'category' => ['hair-care'],
        'color' => '#ac4c0c',
        'tagline' => 'Nourish deeply. Shine naturally.',
        'moreDetail' => 'Infused with the creamy essence of avocado pear, Olivia Beauty Shampoo restores strength and softness from root to tip. Its rich, vitamin-packed formula deeply hydrates and smooths each strand, leaving your hair silky, resilient, and radiant. The gentle lather cleans without stripping away natural oils, revealing hair that feels alive, light, and luxuriously soft. With our Beauty Shampoo, nature\'s nourishment meets everyday elegance.',
        'flavours' => [
            ['id' => 1, 'name' => '🥑 Avocado Pear']
        ],
        'bestSeller' => true
    ],
    [
        'firstImg' => 'shampoo2.png',
        'hoverImg' => 'shampoo22.png',
        'id' => 26,
        'price' => 12000,
        'rating' => 4.5,
        'heading' => 'Hair Care',
        'name' => 'Neutralizing',
        'sufix' => 'Shampoo',
        'tagline' => 'Nourish deeply. Shine naturally.',
        'color' => '#106d19',
        'detail' => 'Nourish your hair from root to tip — for softness you can feel and shine you can flaunt.',
        'additionalImgs' => ['shampoo222.png'],
        'category' => ['hair-care'],
        'moreDetail' => 'Infused with the creamy essence of avocado pear, Olivia Neutralizing Shampoo restores strength and softness from root to tip. Its rich, vitamin-packed formula deeply hydrates and smooths each strand, leaving your hair silky, resilient, and radiant. The gentle lather cleans without stripping away natural oils, revealing hair that feels alive, light, and luxuriously soft. With our Neutralizing Shampoo, nature\'s nourishment meets everyday elegance.',
        'flavours' => [
            ['id' => 1, 'name' => '🥑 Avocado Pear']
        ]
    ],
    [
        'firstImg' => 'hair11.png',
        'hoverImg' => 'hair1.png',
        'id' => 27,
        'price' => 12000,
        'rating' => 4.5,
        'heading' => 'Hair Care',
        'name' => 'Darkening',
        'sufix' => 'Hair Cream',
        'detail' => 'Nourish your hair from root to tip — for softness you can feel and shine you can flaunt.',
        'additionalImgs' => ['hair111.png'],
        'category' => ['hair-care'],
        'color' => '#ec751fff',
        'moreDetail' => 'Formulated to restore your hair\'s natural richness, Olivia EbonyCare Darkening Cream deeply nourishes from root to strand, helping reduce dandruff and revive your hair\'s deep, healthy tone. Its gentle conditioning blend enhances natural color while keeping your scalp fresh, balanced, and flake-free. With consistent use, your hair regains its softness, strength, and a radiant, darker sheen that glows with confidence. Olivia EbonyCare — where beauty begins at the roots.',
        'tagline' => 'Strength, shine, and a touch of natural depth.'
    ],
    [
        'firstImg' => 'hair3.png',
        'hoverImg' => 'hair33333.png',
        'id' => 28,
        'price' => 12000,
        'rating' => 4.5,
        'heading' => 'Hair Care',
        'name' => 'Shea Butter',
        'sufix' => 'Relaxer',
        'detail' => 'Nourish your hair from root to tip — for softness you can feel and shine you can flaunt.',
        'additionalImgs' => ['hair333.png', 'hair3333.png', 'hair33.png', 'hair333333.png', 'hair3333333.png'],
        'category' => ['hair-care'],
        'tagline' => 'Smooth strength, sealed in shea',
        'color' => '#3259cfff',
        'moreDetail' => 'Infused with pure shea butter, Olivia Relaxer transforms hair with a touch of natural luxury. Its rich, creamy formula softens and smooths each strand, leaving hair manageable, glossy, and deeply moisturized. Gentle yet effective, it relaxes without harshness — maintaining strength while enhancing natural shine. With Olivia Relaxer, every application is a silky step toward confidence and care.',
        'flavours' => [
            ['id' => 1, 'name' => '🧈 Shea Butter']
        ]
    ],
    [
        'firstImg' => 'hair4.png',
        'hoverImg' => 'hair444.png',
        'id' => 29,
        'price' => 12000,
        'rating' => 4.5,
        'heading' => 'Hair Care',
        'name' => 'FlexHold',
        'sufix' => 'Styling Gel',
        'detail' => 'Nourish your hair from root to tip — for softness you can feel and shine you can flaunt.',
        'additionalImgs' => ['hair44.png', 'hair4444.png'],
        'category' => ['hair-care'],
        'tagline' => 'Style with strength. Shine with confidence.',
        'moreDetail' => 'Designed for precision and perfection, Olivia FlexHold Styling Gel gives you lasting control without the crunch. Its lightweight, non-flaking formula defines every strand while keeping your hair soft, glossy, and touchable. Whether sleek, sculpted, or natural, your style stays effortlessly in place all day. With FlexHold, every look begins and ends with confidence and shine.',
        'color' => '#2850c7ff'
    ],
    [
        'firstImg' => 'hair7.png',
        'hoverImg' => 'hair77.png',
        'id' => 30,
        'price' => 12000,
        'rating' => 4.5,
        'heading' => 'Hair Care',
        'name' => 'MoistureGold',
        'sufix' => 'Hair Food',
        'detail' => 'Nourish your hair from root to tip — for softness you can feel and shine you can flaunt.',
        'additionalImgs' => [],
        'tagline' => 'Feed your hair. Feel the softness',
        'color' => '#caa303',
        'category' => ['hair-care'],
        'moreDetail' => 'Enriched with natural emollients and vitamins, Olivia MoistureGold Hair Food delivers deep hydration that revives even the driest strands. Its creamy texture melts into your scalp, nourishing from within to restore softness, strength, and natural shine. Perfect for daily use, it keeps your hair silky, manageable, and full of life. With MoistureGold, your hair stays moisturized, radiant, and effortlessly touchable every'
    ],
    [
        'firstImg' => 'hair8.png',
        'hoverImg' => 'hair888.png',
        'id' => 31,
        'price' => 12000,
        'rating' => 4.5,
        'heading' => 'Hair Care',
        'name' => 'Ella Bella',
        'sufix' => 'Shampoo',
        'detail' => 'Nourish your hair from root to tip — for softness you can feel and shine you can flaunt.',
        'additionalImgs' => ['hair88.png'],
        'tagline' => 'Pure nourishment in every wash.',
        'category' => ['hair-care'],
        'color' => '#752819ff',
        'moreDetail' => 'Infused with the golden richness of honey and the soothing purity of aloe vera, Ella Bella HoneyGlow Shampoo cleanses your hair with a touch of nature\'s tenderness. Its creamy lather hydrates deeply, leaving your strands soft, radiant, and beautifully manageable. Honey restores natural moisture while aloe vera cools and revitalizes the scalp for lasting freshness. With HoneyGlow, every wash feels like a gentle renewal for your hair.',
        'flavours' => [
            ['id' => 1, 'name' => '🍯 Honey'],
            ['id' => 2, 'name' => '🌿 Aloe Vera']
        ]
    ],
    [
        'firstImg' => 'hair9.png',
        'hoverImg' => 'hair999.png',
        'id' => 32,
        'price' => 12000,
        'rating' => 4.5,
        'heading' => 'Hair Care',
        'name' => 'HoneySilk',
        'sufix' => 'Conditioner',
        'detail' => 'Nourish your hair from root to tip — for softness you can feel and shine you can flaunt.',
        'additionalImgs' => ['hair99.png'],
        'color' => '#af7019',
        'category' => ['hair-care'],
        'tagline' => 'Softness that flows, naturally.',
        'moreDetail' => 'Enriched with the golden touch of honey and the soothing essence of aloe vera, Ella Bella HoneySilk Conditioner restores moisture and shine after every wash. Its creamy blend smooths away dryness, detangles with ease, and leaves your hair soft, glossy, and luxuriously light. Honey seals in hydration while aloe vera cools and nourishes the scalp, giving your hair lasting vitality. With HoneySilk, your hair doesn\'t just shine — it flourishes.',
        'flavours' => [
            ['id' => 1, 'name' => '🍯 Honey'],
            ['id' => 2, 'name' => '🌿 Aloe Vera']
        ]
    ],
    [
        'firstImg' => 'hair10.png',
        'hoverImg' => 'hair1010.png',
        'id' => 33,
        'price' => 12000,
        'rating' => 4.5,
        'heading' => 'Hair Care',
        'tagline' => 'Refresh. Revive. Rejuvenate.',
        'name' => 'Mentholated',
        'sufix' => 'Shampoo',
        'detail' => 'Nourish your hair from root to tip — for softness you can feel and shine you can flaunt.',
        'additionalImgs' => ['hair101010.png', 'hair10101010.png'],
        'category' => ['hair-care'],
        'color' => '#086e23ff',
        'moreDetail' => 'Infused with the nourishing blend of coconut oil and avocado pear, Olivia CoolThrive Mentholated Shampoo awakens your scalp with a cool burst of freshness. The menthol energizes and soothes, while the natural oils deeply moisturize and strengthen every strand. Its rich, creamy lather leaves your hair clean, soft, and vibrantly healthy. With CoolThrive, each wash is a refreshing retreat for your hair and senses.',
        'flavours' => [
            ['id' => 1, 'name' => '🥥 Coconut Oil'],
            ['id' => 2, 'name' => '🥑 Avocado Pear']
        ]
    ],
    [
        'firstImg' => 'hair5.png',
        'hoverImg' => 'hair55.png',
        'id' => 34,
        'price' => 12000,
        'rating' => 4.5,
        'heading' => 'Hair Care',
        'name' => 'CitrusLift',
        'tagline' => 'Instant freshness. Lasting radiance.',
        'sufix' => 'Conditioner',
        'color' => 'orange',
        'detail' => 'Nourish your hair from root to tip — for softness you can feel and shine you can flaunt.',
        'additionalImgs' => ['hair555.png', 'hair1bb.png'],
        'category' => ['hair-care'],
        'moreDetail' => 'Bursting with the energizing essence of citrus, Olivia CitrusLift Instant Conditioner revitalizes dull, tired hair in seconds. Its lightweight formula smooths, detangles, and restores shine without weighing your hair down. Each use releases a refreshing scent that awakens your senses while leaving your strands soft, bouncy, and naturally vibrant. With CitrusLift, freshness and beauty go hand in hand.',
        'flavours' => [
            ['id' => 1, 'name' => '🍊 Citrus Extract']
        ]
    ],
    [
        'firstImg' => 'car1.png',
        'hoverImg' => 'car11.png',
        'id' => 5,
        'heading' => 'Car Wash',
        'price' => 9000,
        'rating' => 4.3,
        'name' => 'MirrorGloss',
        'sufix' => 'Car Wash',
        'color' => '#dfc402',
        'additionalImgs' => ['car111.png'],
        'category' => ['car-wash'],
        'detail' => 'what we sell5',
        'tagline' => 'See the world in your shine.',
        'moreDetail' => 'Experience the brilliance of a perfect wash with Olivia MirrorGloss Car Wash, engineered to reveal the true beauty of your car. Its deep-cleansing formula removes dirt effortlessly while restoring a sleek, reflective glow that turns heads on every road. Enhanced with a radiant finish, it protects your paint and leaves a smooth, glass-like shine that lasts. With MirrorGloss, your car doesn\'t just shine — it reflects perfection.',
        'bestSeller' => true
    ],
    [
        'firstImg' => 'car2.png',
        'hoverImg' => 'car2222.png',
        'id' => 35,
        'heading' => 'Car Wash',
        'price' => 9000,
        'rating' => 4.3,
        'name' => 'RadiantShine',
        'sufix' => 'Car Wash',
        'additionalImgs' => ['car222.png'],
        'tagline' => 'Because every shine tells your story.',
        'detail' => 'Give your ride a showroom finish — powerful clean, streak-free shine.',
        'category' => ['car-wash'],
        'color' => '#dfc402',
        'bestSeller' => true,
        'moreDetail' => 'Formulated for a spotless, mirror-like finish, Olivia RadiantShine Car Wash brings brilliance and protection to every drive. Its advanced cleansing formula lifts away dirt and grime while revealing a smooth, radiant surface that gleams under any light. Infused with gloss-enhancing agents, it leaves behind a lasting shine that reflects excellence and care. With RadiantShine, your car doesn\'t just stay clean — it shines with pride.'
    ],
    [
        'firstImg' => 'toilet-cleaner.png',
        'hoverImg' => 'toilet-cleaner2.png',
        'id' => 36,
        'heading' => 'Toilet Wash',
        'price' => 9000,
        'rating' => 4.3,
        'name' => 'GermShield',
        'sufix' => 'Toilet Wash',
        'detail' => 'Knock out stains and odors — for a toilet that looks and smells freshly scrubbed.',
        'additionalImgs' => ['toilet-cleaner3.png'],
        'tagline' => 'Power that protects. Freshness that lasts.',
        'category' => ['toilet-wash'],
        'color' => '#03762d',
        'bestSeller' => true,
        'moreDetail' => 'Formulated with advanced antibacterial agents, Olivia GermShield Toilet Wash eliminates 99.9% of germs while leaving your toilet sparkling clean and refreshingly fragrant. Its thick, fast-acting formula clings to surfaces, cutting through stains and buildup with ease. Each wash ensures a deep hygienic clean and long-lasting freshness that redefines everyday care. With GermShield, your bathroom stays spotless, safe, and confidently clean'
    ],
    [
        'firstImg' => 'vaseline-open.png',
        'hoverImg' => 'vaseline-use.png',
        'id' => 38,
        'heading' => 'Personal Care',
        'price' => 9000,
        'rating' => 4.3,
        'sufix' => 'Petroluem Jelly',
        'name' => 'PureGuard',
        'tagline' => 'Seal in softness. Shine with care.',
        'additionalImgs' => ['vaseline-use2.png'],
        'detail' => 'Pamper yourself daily — premium care for skin that deserves the best.',
        'category' => ['personal-care'],
        'color' => 'gold',
        'moreDetail' => 'Enriched with pure petroleum jelly, Olivia PureGuard locks in moisture to keep your skin soft, smooth, and beautifully protected all day. Its rich, gentle formula shields against dryness, helping heal rough patches while restoring natural radiance. Ideal for all skin types, it soothes, hydrates, and nourishes from head to toe. With PureGuard, your skin stays cared for, confident, and comforted — naturally..'
    ],
    [
        'firstImg' => 'tile1.png',
        'hoverImg' => 'tile11.png',
        'id' => 39,
        'heading' => 'Personal Care',
        'price' => 9000,
        'rating' => 4.3,
        'sufix' => 'Tile Cleaner',
        'name' => 'GleamPro',
        'additionalImgs' => ['tile111.png', 'tile1111.png'],
        'detail' => 'Pamper yourself daily — premium care for skin that deserves the best.',
        'category' => ['tile-cleaner'],
        'color' => '#dcb305',
        'tagline' => 'Deep clean. Lasting shine',
        'moreDetail' => 'Formulated for brilliance and hygiene, Olivia GleamPro Tile & Floor Cleaner removes stubborn stains, grease, and grime to reveal spotless, radiant surfaces. Its fast-acting formula not only cleans deeply but also leaves a lasting freshness that brightens your entire space. Safe for all tile and floor types, it delivers a gleaming finish without residue. With GleamPro, every step reflects Olivia\'s promise of purity and perfection.'
    ],
    [
        'firstImg' => 'tile3.png',
        'hoverImg' => 'tile33.png',
        'id' => 42,
        'heading' => 'Personal Care',
        'price' => 9000,
        'rating' => 4.3,
        'sufix' => 'Tile Cleaner',
        'name' => 'ProClean',
        'tagline' => 'Professional strength. Impeccable results.',
        'additionalImgs' => ['tile333.png'],
        'detail' => 'Pamper yourself daily — premium care for skin that deserves the best.',
        'category' => ['tile-cleaner'],
        'color' => '#dcb305',
        'moreDetail' => 'Built for industrial and commercial standards, Olivia ProClean Tile & Floor Cleaner delivers exceptional cleaning power for high-traffic spaces. Its advanced formula breaks down tough stains, grease, and dirt with ease, leaving behind spotless surfaces and a fresh, hygienic scent. Effective on ceramic, marble, and vinyl floors, it ensures lasting shine and a germ-free finish. Trusted by professionals, Olivia ProClean is the ultimate partner for spotless, high-performance spaces.'
    ],
    [
        'firstImg' => 'fabric1.png',
        'hoverImg' => 'fabric11.png',
        'id' => 40,
        'heading' => 'Fabric Wash',
        'price' => 9000,
        'rating' => 4.3,
        'name' => 'FiberGuard',
        'sufix' => 'Fabric Wash',
        'color' => '#14368c',
        'additionalImgs' => ['fabric111.png'],
        'detail' => 'Pamper yourself daily — premium care for skin that deserves the best.',
        'category' => ['fabric-wash'],
        'tagline' => 'Gentle on fabric. Relentless on stains',
        'moreDetail' => 'Designed to preserve color, texture, and freshness, Olivia SoftWash Fabric Wash delivers a deep yet gentle clean that keeps clothes looking new for longer. Its advanced formula removes tough stains while maintaining fabric softness and brilliance. A touch of lasting fragrance leaves every wash smelling crisp and comforting. With SoftWash, your laundry isn\'t just clean — it\'s cared for with Olivia\'s signature touch of excellence.'
    ],
    [
        'firstImg' => 'fabric2.png',
        'hoverImg' => 'fabric22.png',
        'id' => 41,
        'heading' => 'Fabric Wash',
        'price' => 9000,
        'tagline' => 'Professional clean. Perfect care.',
        'rating' => 4.3,
        'name' => 'Fabricare Pro',
        'sufix' => 'Fabric Wash',
        'color' => '#14368c',
        'additionalImgs' => ['fabric222.png'],
        'detail' => 'Pamper yourself daily — premium care for skin that deserves the best.',
        'category' => ['fabric-wash'],
        'moreDetail' => 'Engineered for high-demand environments, Olivia Fabricare Pro delivers industrial-grade cleaning power with a gentle touch. Its advanced formula penetrates deep into fabrics to remove tough stains, odors, and residues while preserving texture and color integrity. Ideal for hotels, laundromats, hospitals, and corporate facilities, it ensures every wash comes out fresh, soft, and spotless. Trusted by professionals, Olivia Fabricare Pro keeps linens bright, garments flawless, and standards impeccably high.'
    ],
    [
        'firstImg' => 'window-cleaner.png',
        'hoverImg' => 'window-cleaner2.png',
        'heading' => 'Window Cleaner',
        'price' => 1000,
        'rating' => 3.9,
        'id' => 7,
        'name' => 'CrystalView',
        'sufix' => 'Window Cleaner',
        'additionalImgs' => ['window-cleaner3.png'],
        'category' => ['window-cleaner'],
        'detail' => 'what we sell7',
        'tagline' => 'Pure clarity. Perfect shine',
        'color' => '#007dcb',
        'bestSeller' => true,
        'moreDetail' => 'Achieve crystal-clear transparency with Olivia Window Cleaner — your go-to solution for streak-free glass and mirrors. Powered by vinegar extract and ammonia-free polish agents, it effortlessly removes smudges, fingerprints, and dust while being safe for indoor use. Watch your windows sparkle like never before.'
    ]
];

function convertImagePath($imagePath) {
    // Convert relative image paths to public assets paths
    if (empty($imagePath)) {
        return null;
    }
    
    // If it's already a full URL, return as is
    if (strpos($imagePath, 'http') === 0) {
        return $imagePath;
    }
    
    // Extract filename from path (handle both direct filenames and paths)
    $filename = basename($imagePath);
    
    // Convert to path relative to public directory for web access
    // Images should be in public/assets/images/
    return '/assets/images/' . $filename;
}

function seedProducts($productsData) {
    $pdo = getDBConnection();
    if (!$pdo) {
        return ['success' => false, 'message' => 'Database connection failed'];
    }
    
    $inserted = 0;
    $updated = 0;
    $errors = [];
    
    try {
        dbBeginTransaction();
        
        foreach ($productsData as $product) {
            // Convert image paths
            $firstImg = convertImagePath($product['firstImg'] ?? null);
            $hoverImg = convertImagePath($product['hoverImg'] ?? null);
            $additionalImgs = [];
            if (isset($product['additionalImgs']) && is_array($product['additionalImgs'])) {
                foreach ($product['additionalImgs'] as $img) {
                    $additionalImgs[] = convertImagePath($img);
                }
            }
            
            // Check if product with this ID already exists
            $existing = dbQueryOne(
                "SELECT id FROM products WHERE id = ?",
                [$product['id']]
            );
            
            $sql = $existing 
                ? "UPDATE products SET heading = ?, name = ?, sufix = ?, price = ?, rating = ?, color = ?, 
                   detail = ?, moreDetail = ?, tagline = ?, firstImg = ?, hoverImg = ?, additionalImgs = ?, 
                   category = ?, flavours = ?, bestSeller = ?, isActive = 1 WHERE id = ?"
                : "INSERT INTO products (id, heading, name, sufix, price, rating, color, detail, moreDetail, 
                   tagline, firstImg, hoverImg, additionalImgs, category, flavours, bestSeller, isActive) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)";
            
            $params = [
                $product['heading'] ?? '',
                $product['name'] ?? '',
                $product['sufix'] ?? null,
                $product['price'] ?? 0,
                $product['rating'] ?? 0.0,
                $product['color'] ?? null,
                $product['detail'] ?? null,
                $product['moreDetail'] ?? null,
                $product['tagline'] ?? null,
                $firstImg,
                $hoverImg,
                json_encode($additionalImgs),
                json_encode($product['category'] ?? []),
                json_encode($product['flavours'] ?? []),
                isset($product['bestSeller']) ? (int)$product['bestSeller'] : 0
            ];
            
            if ($existing) {
                $params[] = $product['id'];
                $result = dbExecute($sql, $params);
                if ($result !== false) {
                    $updated++;
                } else {
                    $errors[] = "Failed to update product ID {$product['id']}";
                }
            } else {
                array_unshift($params, $product['id']);
                $result = dbExecute($sql, $params);
                if ($result !== false) {
                    $inserted++;
                } else {
                    $errors[] = "Failed to insert product ID {$product['id']}";
                }
            }
        }
        
        dbCommit();
        
        return [
            'success' => true,
            'message' => "Seeding completed: $inserted inserted, $updated updated",
            'inserted' => $inserted,
            'updated' => $updated,
            'errors' => $errors
        ];
    } catch (Exception $e) {
        dbRollback();
        return [
            'success' => false,
            'message' => 'Seeding failed: ' . $e->getMessage(),
            'errors' => $errors
        ];
    }
}

// Run seeding
$result = seedProducts($productsData);

if ($isWebRequest) {
    header('Content-Type: application/json');
    echo json_encode($result);
} else {
    echo "Products Seeding Results:\n";
    echo json_encode($result, JSON_PRETTY_PRINT) . "\n";
}

