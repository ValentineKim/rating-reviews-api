DROP DATABASE IF EXISTS reviewsdb;
CREATE DATABASE reviewsdb;


-- DROP TABLE IF EXISTS product CASCADE;
-- CREATE TABLE product (
  -- product_id SERIAL PRIMARY KEY,
  -- product_name VARCHAR(200),
  -- slogan VARCHAR(1000),
  -- description VARCHAR(1000),
  -- category VARCHAR(100),
  -- default_price VARCHAR(50)
-- );

DROP TABLE IF EXISTS reviews CASCADE;
CREATE TABLE  reviews (
  reviews_id SERIAL PRIMARY KEY,
  product_id INTEGER,
  rating SMALLINT,
  review_date date,
  summary VARCHAR(1000),
  body VARCHAR(1000),
  recommend BOOLEAN,
  reported BOOLEAN,
  reviewer_name VARCHAR(100),
  reviewer_email VARCHAR(100),
  response VARCHAR(1000),
  helpfulness SMALLINT
);

DROP TABLE IF EXISTS characteristics CASCADE;
CREATE TABLE characteristics (
  char_id SERIAL PRIMARY KEY,
  product_id INTEGER,
  char_name VARCHAR(50)
);

DROP TABLE IF EXISTS reviewschar CASCADE;
CREATE TABLE reviewsChar (
  reviews_char_id SERIAL PRIMARY KEY,
  characteristic_id INTEGER REFERENCES characteristics (char_id),
  review_id INTEGER REFERENCES reviews (reviews_id),
  reviews_char_value SMALLINT
);

DROP TABLE IF EXISTS reviewsphotos CASCADE;
CREATE TABLE reviewsPhotos (
  photos_id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES reviews (reviews_id),
  url VARCHAR(1000)
);

--SET SEQUENCE COUNT
-- SELECT setval(pg_get_serial_sequence('characteristics', 'char_id'), (SELECT MAX(char_id) FROM characteristics))

-- Transfer over data from csv
COPY reviews FROM '/tmp/reviews.csv'  DELIMITER ',' CSV HEADER;
COPY characteristics FROM '/tmp/characteristics.csv'  DELIMITER ',' CSV HEADER;
COPY reviewsChar FROM '/tmp/characteristic_reviews.csv'  DELIMITER ',' CSV HEADER;
COPY reviewsPhotos FROM '/tmp/reviews_photos.csv'  DELIMITER ',' CSV HEADER;

--CREATE INDEX
CREATE INDEX ON reviews(product_id)
CREATE INDEX ON reviewschar(characteristic_id)
CREATE INDEX ON reviewschar(review_id)
CREATE INDEX ON characteristics(product_id)
CREATE INDEX ON reviewsPhotos(review_id)

-- Can only alter the reviews table after the copy because to copy the cols have to be exactly the same
ALTER TABLE reviews
ADD COLUMN photos json