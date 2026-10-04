-- Non-destructive image refresh for an already-seeded Cravings database.
-- Updates demo restaurants, categories, and menu items without resetting user data.

UPDATE restaurants SET image = CASE name
  WHEN 'Sultan''s Dine' THEN '/food/menu/biryani.jpg'
  WHEN 'Chillox' THEN '/food/menu/burger.jpg'
  WHEN 'Kacchi Bhai' THEN '/food/menu/biryani.jpg'
  WHEN 'Ambala Sweets & Foods' THEN '/food/menu/indian-sweets.jpg'
  WHEN 'Dhaka Bean' THEN '/food/menu/coffee.jpg'
  WHEN 'Pizza Point' THEN '/food/menu/pizza.jpg'
  ELSE image
END
WHERE name IN ('Sultan''s Dine', 'Chillox', 'Kacchi Bhai', 'Ambala Sweets & Foods', 'Dhaka Bean', 'Pizza Point');

UPDATE categories SET category_img = CASE name
  WHEN 'Kacchi & Biryani' THEN '/food/menu/biryani.jpg'
  WHEN 'Drinks & Desserts' THEN '/food/menu/lassi.jpg'
  WHEN 'Burgers' THEN '/food/menu/burger.jpg'
  WHEN 'Sides & Chicken' THEN '/food/menu/fried-chicken.jpg'
  WHEN 'Rice Platters' THEN '/food/menu/biryani.jpg'
  WHEN 'Traditional Sides' THEN '/food/menu/rice-pudding.jpg'
  WHEN 'Breakfast' THEN '/food/menu/paratha.jpg'
  WHEN 'Sweets' THEN '/food/menu/indian-sweets.jpg'
  WHEN 'Coffee' THEN '/food/menu/coffee.jpg'
  WHEN 'Bakery' THEN '/food/menu/croissant.jpg'
  WHEN 'Pizza' THEN '/food/menu/pizza.jpg'
  WHEN 'Sides & Drinks' THEN '/food/menu/cola.jpg'
  ELSE category_img
END
WHERE name IN ('Kacchi & Biryani','Drinks & Desserts','Burgers','Sides & Chicken','Rice Platters','Traditional Sides','Breakfast','Sweets','Coffee','Bakery','Pizza','Sides & Drinks');

UPDATE menu_items SET item_img = CASE item_name
  WHEN 'Mutton Kacchi Half' THEN '/food/menu/biryani.jpg'
  WHEN 'Mutton Kacchi Full' THEN '/food/menu/biryani.jpg'
  WHEN 'Chicken Biryani' THEN '/food/menu/biryani.jpg'
  WHEN 'Shahi Borhani' THEN '/food/menu/lassi.jpg'
  WHEN 'Firni' THEN '/food/menu/rice-pudding.jpg'
  WHEN 'Beef Juicy Lucy' THEN '/food/menu/burger.jpg'
  WHEN 'Chicken Cheese Blast' THEN '/food/menu/burger-fries.jpg'
  WHEN 'Smoky BBQ Beef' THEN '/food/menu/burger.jpg'
  WHEN 'Loaded Fries' THEN '/food/menu/loaded-fries.jpg'
  WHEN 'Naga Drumsticks' THEN '/food/menu/fried-chicken.jpg'
  WHEN 'Special Kacchi Platter' THEN '/food/menu/biryani.jpg'
  WHEN 'Morog Polao' THEN '/food/menu/biryani.jpg'
  WHEN 'Beef Tehari' THEN '/food/menu/biryani.jpg'
  WHEN 'Borhani' THEN '/food/menu/lassi.jpg'
  WHEN 'Shahi Jorda' THEN '/food/menu/rice-pudding.jpg'
  WHEN 'Bhuna Khichuri' THEN '/food/menu/biryani.jpg'
  WHEN 'Paratha' THEN '/food/menu/paratha.jpg'
  WHEN 'Sooji Halwa' THEN '/food/menu/rice-pudding.jpg'
  WHEN 'Roshogolla Box' THEN '/food/menu/indian-sweets.jpg'
  WHEN 'Mishti Doi' THEN '/food/menu/lassi.jpg'
  WHEN 'Cafe Latte' THEN '/food/menu/coffee.jpg'
  WHEN 'Americano' THEN '/food/menu/coffee.jpg'
  WHEN 'Cold Coffee' THEN '/food/menu/coffee.jpg'
  WHEN 'Butter Croissant' THEN '/food/menu/croissant.jpg'
  WHEN 'Chocolate Brownie' THEN '/food/menu/brownie.jpg'
  WHEN 'Margherita Pizza' THEN '/food/menu/pizza.jpg'
  WHEN 'Pepperoni Pizza' THEN '/food/menu/pizza.jpg'
  WHEN 'BBQ Chicken Pizza' THEN '/food/menu/pizza.jpg'
  WHEN 'Garlic Bread' THEN '/food/menu/pizza.jpg'
  WHEN 'Cola' THEN '/food/menu/cola.jpg'
  ELSE item_img
END
WHERE item_name IN ('Mutton Kacchi Half','Mutton Kacchi Full','Chicken Biryani','Shahi Borhani','Firni','Beef Juicy Lucy','Chicken Cheese Blast','Smoky BBQ Beef','Loaded Fries','Naga Drumsticks','Special Kacchi Platter','Morog Polao','Beef Tehari','Borhani','Shahi Jorda','Bhuna Khichuri','Paratha','Sooji Halwa','Roshogolla Box','Mishti Doi','Cafe Latte','Americano','Cold Coffee','Butter Croissant','Chocolate Brownie','Margherita Pizza','Pepperoni Pizza','BBQ Chicken Pizza','Garlic Bread','Cola');

-- Give every current demo restaurant its own local food photograph. The IDs are
-- stable in the demo dataset, including the extra non-destructive demo rows.
UPDATE restaurants
SET image = CASE id
  WHEN 1 THEN '/food/sultans-dine.png'
  WHEN 2 THEN '/food/chillox.png'
  WHEN 3 THEN '/food/kacchi-bhai.png'
  WHEN 4 THEN '/food/ambala.png'
  WHEN 5 THEN '/food/menu/coffee.jpg'
  WHEN 6 THEN '/food/menu/pizza.jpg'
  WHEN 7 THEN '/food/menu/biryani.jpg'
  WHEN 8 THEN '/food/menu/burger.jpg'
  WHEN 9 THEN '/food/menu/paratha.jpg'
  WHEN 10 THEN '/food/restaurants/bbq-grill.png'
  WHEN 11 THEN '/food/restaurants/beef-tehari.png'
  WHEN 12 THEN '/food/hero-spread.png'
  WHEN 13 THEN '/food/restaurants/wok-noodles.png'
  WHEN 14 THEN '/food/restaurants/bakarkhani.png'
  WHEN 15 THEN '/food/restaurants/dessert-spread.png'
  WHEN 16 THEN '/food/menu/rice-pudding.jpg'
  WHEN 17 THEN '/food/menu/fried-chicken.jpg'
  WHEN 18 THEN '/food/restaurants/bangla-lunchbox.png'
  WHEN 19 THEN '/food/restaurants/kacchi-platter.png'
  WHEN 20 THEN '/food/restaurants/pizza-roma.png'
  WHEN 21 THEN '/food/restaurants/star-kebab.png'
  WHEN 22 THEN '/food/restaurants/fuchka.png'
  WHEN 23 THEN '/food/restaurants/dragon-dimsum.png'
  WHEN 24 THEN '/food/restaurants/mocha-brunch.png'
  WHEN 25 THEN '/food/restaurants/tongi-tehari.png'
  WHEN 26 THEN '/food/menu/burger-fries.jpg'
  WHEN 27 THEN '/food/restaurants/bhuna-khichuri.png'
  WHEN 28 THEN '/food/restaurants/sushi-ramen.png'
  WHEN 29 THEN '/food/restaurants/green-bowl.png'
  WHEN 30 THEN '/food/restaurants/celebration-cake.png'
  ELSE image
END;

UPDATE categories AS category
SET category_img = CASE
  WHEN category.name ILIKE ANY (ARRAY['%pizza%']) THEN '/food/menu/pizza.jpg'
  WHEN category.name ILIKE ANY (ARRAY['%burger%']) THEN '/food/menu/burger.jpg'
  WHEN category.name ILIKE ANY (ARRAY['%chicken%']) THEN '/food/menu/fried-chicken.jpg'
  WHEN category.name ILIKE ANY (ARRAY['%coffee%']) THEN '/food/menu/coffee.jpg'
  WHEN category.name ILIKE ANY (ARRAY['%bakery%','%bread%']) THEN '/food/menu/croissant.jpg'
  WHEN category.name ILIKE ANY (ARRAY['%sweet%','%dessert%']) THEN '/food/menu/indian-sweets.jpg'
  WHEN category.name ILIKE ANY (ARRAY['%drink%']) THEN '/food/menu/cola.jpg'
  WHEN category.name ILIKE ANY (ARRAY['%breakfast%']) THEN '/food/menu/paratha.jpg'
  ELSE restaurant.image
END
FROM restaurants AS restaurant
WHERE restaurant.id = category.restaurant_id;

UPDATE menu_items AS item
SET item_img = CASE
  WHEN item.item_name ILIKE ANY (ARRAY['%pizza%']) THEN '/food/menu/pizza.jpg'
  WHEN item.item_name ILIKE ANY (ARRAY['%burger%','%juicy lucy%']) THEN '/food/menu/burger.jpg'
  WHEN item.item_name ILIKE ANY (ARRAY['%chicken%','%drumstick%']) THEN '/food/menu/fried-chicken.jpg'
  WHEN item.item_name ILIKE ANY (ARRAY['%fries%']) THEN '/food/menu/loaded-fries.jpg'
  WHEN item.item_name ILIKE ANY (ARRAY['%kacchi%','%biryani%','%polao%','%tehari%','%khichuri%']) THEN '/food/menu/biryani.jpg'
  WHEN item.item_name ILIKE ANY (ARRAY['%borhani%','%lassi%','%doi%','%yogurt%']) THEN '/food/menu/lassi.jpg'
  WHEN item.item_name ILIKE ANY (ARRAY['%firni%','%jorda%','%halwa%','%pudding%']) THEN '/food/menu/rice-pudding.jpg'
  WHEN item.item_name ILIKE ANY (ARRAY['%paratha%','%naan%','%roti%']) THEN '/food/menu/paratha.jpg'
  WHEN item.item_name ILIKE ANY (ARRAY['%roshogolla%','%sweet%','%mithai%']) THEN '/food/menu/indian-sweets.jpg'
  WHEN item.item_name ILIKE ANY (ARRAY['%coffee%','%latte%','%americano%','%espresso%']) THEN '/food/menu/coffee.jpg'
  WHEN item.item_name ILIKE ANY (ARRAY['%croissant%']) THEN '/food/menu/croissant.jpg'
  WHEN item.item_name ILIKE ANY (ARRAY['%brownie%','%chocolate%']) THEN '/food/menu/brownie.jpg'
  WHEN item.item_name ILIKE ANY (ARRAY['%cola%','%soda%','%drink%']) THEN '/food/menu/cola.jpg'
  ELSE restaurant.image
END
FROM restaurants AS restaurant
WHERE restaurant.id = item.restaurant_id;
