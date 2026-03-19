-- Seed Categories
INSERT INTO CATEGORIES (NAME) VALUES ('Electronics');
INSERT INTO CATEGORIES (NAME) VALUES ('Furniture');
INSERT INTO CATEGORIES (NAME) VALUES ('Books');
INSERT INTO CATEGORIES (NAME) VALUES ('Clothing');
INSERT INTO CATEGORIES (NAME) VALUES ('Sports');

-- Seed Additional Users (Passwords are 'password123' hashed)
-- Note: You might need to adjust these IDs if they exist
INSERT INTO USERS (USERNAME, EMAIL, PASSWORD) VALUES ('alice_w', 'alice@example.com', '$2b$10$wK1W9v9f6.q8q3Q6v.a.8.rR.I6vKq.q8q3Q6v.a.8.rR.I6vKq'); -- Placeholder hash
INSERT INTO USERS (USERNAME, EMAIL, PASSWORD) VALUES ('bob_m', 'bob@example.com', '$2b$10$wK1W9v9f6.q8q3Q6v.a.8.rR.I6vKq.q8q3Q6v.a.8.rR.I6vKq');
INSERT INTO USERS (USERNAME, EMAIL, PASSWORD) VALUES ('charlie_d', 'charlie@example.com', '$2b$10$wK1W9v9f6.q8q3Q6v.a.8.rR.I6vKq.q8q3Q6v.a.8.rR.I6vKq');
INSERT INTO USERS (USERNAME, EMAIL, PASSWORD) VALUES ('diana_p', 'diana@example.com', '$2b$10$wK1W9v9f6.q8q3Q6v.a.8.rR.I6vKq.q8q3Q6v.a.8.rR.I6vKq');

-- Seed Listings (Assuming category IDs 1-5 and user IDs exist)
-- Listing 1: Electronics
INSERT INTO LISTINGS (TITLE, DESCRIPTION, PRICE, LOCATION, CATEGORY_ID, SELLER_ID) 
VALUES ('iPhone 13 Pro', 'Good condition, 128GB, Sierra Blue.', 45000, 'Mumbai', 1, 1);
INSERT INTO IMAGES (LISTING_ID, IMAGE_URL) VALUES (LISTINGS_SEQ.CURRVAL, 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80');

-- Listing 2: Furniture
INSERT INTO LISTINGS (TITLE, DESCRIPTION, PRICE, LOCATION, CATEGORY_ID, SELLER_ID) 
VALUES ('Modern Sofa', 'Grey 3-seater sofa, very comfortable.', 15000, 'Pune', 2, 2);
INSERT INTO IMAGES (LISTING_ID, IMAGE_URL) VALUES (LISTINGS_SEQ.CURRVAL, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80');

-- Listing 3: Books
INSERT INTO LISTINGS (TITLE, DESCRIPTION, PRICE, LOCATION, CATEGORY_ID, SELLER_ID) 
VALUES ('Clean Code by Robert Martin', 'Essential book for any developer.', 800, 'Bangalore', 3, 3);
INSERT INTO IMAGES (LISTING_ID, IMAGE_URL) VALUES (LISTINGS_SEQ.CURRVAL, 'https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=800&q=80');

-- Listing 4: Clothing
INSERT INTO LISTINGS (TITLE, DESCRIPTION, PRICE, LOCATION, CATEGORY_ID, SELLER_ID) 
VALUES ('Vintage Leather Jacket', 'Black genuine leather, size L.', 3500, 'Delhi', 4, 1);
INSERT INTO IMAGES (LISTING_ID, IMAGE_URL) VALUES (LISTINGS_SEQ.CURRVAL, 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=800&q=80');

-- Listing 5: Sports
INSERT INTO LISTINGS (TITLE, DESCRIPTION, PRICE, LOCATION, CATEGORY_ID, SELLER_ID) 
VALUES ('Mountain Bike', '21-speed, front suspension.', 12000, 'Chennai', 5, 2);
INSERT INTO IMAGES (LISTING_ID, IMAGE_URL) VALUES (LISTINGS_SEQ.CURRVAL, 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80');

-- Add more listings (total 15) ...
-- (I'll add 10 more simplified ones)
INSERT INTO LISTINGS (TITLE, DESCRIPTION, PRICE, LOCATION, CATEGORY_ID, SELLER_ID) VALUES ('MacBook Air M1', '8GB RAM, 256GB SSD.', 55000, 'Mumbai', 1, 3);
INSERT INTO IMAGES (LISTING_ID, IMAGE_URL) VALUES (LISTINGS_SEQ.CURRVAL, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80');

INSERT INTO LISTINGS (TITLE, DESCRIPTION, PRICE, LOCATION, CATEGORY_ID, SELLER_ID) VALUES ('Gaming Monitor', '27 inch, 144Hz.', 18000, 'Bangalore', 1, 4);
INSERT INTO IMAGES (LISTING_ID, IMAGE_URL) VALUES (LISTINGS_SEQ.CURRVAL, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80');

INSERT INTO LISTINGS (TITLE, DESCRIPTION, PRICE, LOCATION, CATEGORY_ID, SELLER_ID) VALUES ('Study Table', 'Wooden table with 2 drawers.', 4000, 'Pune', 2, 5);
INSERT INTO IMAGES (LISTING_ID, IMAGE_URL) VALUES (LISTINGS_SEQ.CURRVAL, 'https://images.unsplash.com/photo-1518455027359-f3f8164ba621?auto=format&fit=crop&w=800&q=80');

INSERT INTO LISTINGS (TITLE, DESCRIPTION, PRICE, LOCATION, CATEGORY_ID, SELLER_ID) VALUES ('Office Chair', 'Ergonomic mesh chair.', 6500, 'Hyderabad', 2, 1);
INSERT INTO IMAGES (LISTING_ID, IMAGE_URL) VALUES (LISTINGS_SEQ.CURRVAL, 'https://images.unsplash.com/photo-1505797149-43b0ad05f97a?auto=format&fit=crop&w=800&q=80');

INSERT INTO LISTINGS (TITLE, DESCRIPTION, PRICE, LOCATION, CATEGORY_ID, SELLER_ID) VALUES ('The Alchemist', 'Hardcover, brand new.', 400, 'Kolkata', 3, 2);
INSERT INTO IMAGES (LISTING_ID, IMAGE_URL) VALUES (LISTINGS_SEQ.CURRVAL, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80');

INSERT INTO LISTINGS (TITLE, DESCRIPTION, PRICE, LOCATION, CATEGORY_ID, SELLER_ID) VALUES ('Yoga Mat', '6mm thick anti-skid.', 1200, 'Goa', 5, 3);
INSERT INTO IMAGES (LISTING_ID, IMAGE_URL) VALUES (LISTINGS_SEQ.CURRVAL, 'https://images.unsplash.com/photo-1518611012118-29a8d63ee0c2?auto=format&fit=crop&w=800&q=80');

INSERT INTO LISTINGS (TITLE, DESCRIPTION, PRICE, LOCATION, CATEGORY_ID, SELLER_ID) VALUES ('Levi''s 501 Jeans', 'Classic blue, size 32.', 2500, 'Delhi', 4, 4);
INSERT INTO IMAGES (LISTING_ID, IMAGE_URL) VALUES (LISTINGS_SEQ.CURRVAL, 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80');

INSERT INTO LISTINGS (TITLE, DESCRIPTION, PRICE, LOCATION, CATEGORY_ID, SELLER_ID) VALUES ('Mechanical Keyboard', 'RGB, Blue switches.', 3200, 'Chennai', 1, 5);
INSERT INTO IMAGES (LISTING_ID, IMAGE_URL) VALUES (LISTINGS_SEQ.CURRVAL, 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80');

INSERT INTO LISTINGS (TITLE, DESCRIPTION, PRICE, LOCATION, CATEGORY_ID, SELLER_ID) VALUES ('Camera Tripod', 'Aluminum lightweight.', 2200, 'Kochi', 1, 1);
INSERT INTO IMAGES (LISTING_ID, IMAGE_URL) VALUES (LISTINGS_SEQ.CURRVAL, 'https://images.unsplash.com/photo-1514934661131-9040bd836371?auto=format&fit=crop&w=800&q=80');

INSERT INTO LISTINGS (TITLE, DESCRIPTION, PRICE, LOCATION, CATEGORY_ID, SELLER_ID) VALUES ('Dumbbell Set 10kg', '2x 5kg hex dumbbells.', 1800, 'Ahmedabad', 5, 2);
INSERT INTO IMAGES (LISTING_ID, IMAGE_URL) VALUES (LISTINGS_SEQ.CURRVAL, 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80');

COMMIT;
