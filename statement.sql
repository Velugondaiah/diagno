SELECT * FROM doctors;
-- DROP TABLE IF EXISTS users;


-- DROP TABLE IF EXISTS users;

-- CREATE TABLE users (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     username VARCHAR(50) NOT NULL UNIQUE,
--     firstname VARCHAR(50) NOT NULL,
--     lastname VARCHAR(50) NOT NULL,
--     email VARCHAR(100) NOT NULL UNIQUE,
--     phoneNumber VARCHAR(15) NOT NULL,    -- Kept as camelCase to match JS
--     dateOfBirth DATE NOT NULL,
--     gender VARCHAR(10),          -- Kept as camelCase to match JS
--     password VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
-- DELETE FROM users WHERE id = 3 ;

-- INSERT INTO users (username, firstname, lastname, email, phoneNumber, dateOfBirth, gender, password) VALUES ('john_doe', 'John', 'Doe', 'john.doe@example.com', '1234567890', '1990-01-01', 'Male', 'password123');

SELECT * FROM users;
SELECT * FROM doctors
 
-- SELECT * FROM doctors;
-- INSERT INTO doctors (name,specialization,appointment_cost,location,rating,phone_number,location_url,image_url) VALUES ('DR.Kushwanth','Infectious',100,'Charminar Hyderabad',4.5,'1234567890','https://example.com/john-doe','https://example.com/john-doe.jpg');

-- SELECT * FROM doctors
-- WHERE name = 'DR.Kushwanth';
-- UPDATE doctors SET image_url = 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062525/WhatsApp_Image_2024-10-04_at_22.31.23_bc75fe8f_kl1ztr.jpg' WHERE name = 'DR.Kushwanth';

-- Drop TABLE appointments;

-- CREATE TABLE appointments(
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     doctor_id INTEGER NOT NULL,
--     patient_name VARCHAR(50) NOT NULL,
--     gender VARCHAR(10) NOT NULL,
--     age INTEGER NOT NULL,
--     date DATE NOT NULL,
--     time TIME NOT NULL,
--     phone_number VARCHAR(15) NOT NULL,
--     address VARCHAR(255) NOT NULL,
--     specialist VARCHAR(50) NOT NULL,
--     location VARCHAR(50) NOT NULL,
--     FOREIGN KEY (doctor_id) REFERENCES doctors(id)
-- );
 SELECT * FROM appointments;

--DELETE FROM appointments;
-- ALTER TABLE appointments ADD COLUMN status TEXT DEFAULT 'Pending';

-- -- Modify the appointments table to include user_id

-- Delete FROM users;