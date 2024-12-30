<<<<<<< HEAD
SELECT * FROM doctors;
=======
-- SELECT * FROM doctors;
>>>>>>> 04b988b036998a14967f0513e87c9d44dc954997
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
<<<<<<< HEAD
SELECT * FROM doctors
 
-- SELECT * FROM doctors;
-- INSERT INTO doctors (name,specialization,appointment_cost,location,rating,phone_number,location_url,image_url) VALUES ('DR.Kushwanth','Infectious',100,'Charminar Hyderabad',4.5,'1234567890','https://example.com/john-doe','https://example.com/john-doe.jpg');

-- SELECT * FROM doctors
-- WHERE name = 'DR.Kushwanth';
-- UPDATE doctors SET image_url = 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062525/WhatsApp_Image_2024-10-04_at_22.31.23_bc75fe8f_kl1ztr.jpg' WHERE name = 'DR.Kushwanth';

-- Drop TABLE appointments;

=======

 
-- SELECT * FROM doctors;
<<<<<<< HEAD
-- INSERT INTO doctors (name,specialization,appointment_cost,location,rating,phone_number,location_url,image_url) VALUES ('DR.Kushwanth','Infectious',100,'Charminar Hyderabad',4.5,'1234567890','https://example.com/john-doe','https://example.com/john-doe.jpg');
=======
-- INSERT INTO doctors (name,specialization,appointment_cost,location,rating,phone_number,location_url,image_url) VALUES ('Velu','Orthopedist',100,'Cubbon Park, Bangalore',4.5,'1234567890','https://example.com/john-doe','https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062582/WhatsApp_Image_2024-10-04_at_22.31.24_7d025073_gjtx2c.jpg');
>>>>>>> 16e114e57a8f1cf485b6b66d8093a769d966cd90

-- SELECT * FROM doctors
-- WHERE name = 'DR.Kushwanth';
-- UPDATE doctors SET image_url = 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062525/WhatsApp_Image_2024-10-04_at_22.31.23_bc75fe8f_kl1ztr.jpg' WHERE name = 'DR.Kushwanth';

-- Drop TABLE appointments;

>>>>>>> 04b988b036998a14967f0513e87c9d44dc954997
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 04b988b036998a14967f0513e87c9d44dc954997
 SELECT * FROM appointments;

--DELETE FROM appointments;
-- ALTER TABLE appointments ADD COLUMN status TEXT DEFAULT 'Pending';

-- -- Modify the appointments table to include user_id

<<<<<<< HEAD
-- Delete FROM users;
=======
-- Delete FROM users;
=======
-- SELECT * FROM appointments;

-- ALTER TABLE appointments ADD COLUMN status TEXT DEFAULT 'Pending';

-- ALTER TABLE appointments ADD COLUMN user_id INTEGER;

 DELETE FROM appointments;

-- ALTER TABLE doctors
-- RENAME TO doctor;

-- select * from doctor;


-- CREATE TABLE doctors (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     name TEXT NOT NULL,
--     specialization TEXT NOT NULL,
--     appointment_cost INTEGER,
--     location TEXT NOT NULL,
--     rating FLOAT,
--     phone_number TEXT,
--     location_url TEXT,
--     image_url TEXT,
--     username TEXT UNIQUE,
--     password TEXT
-- );

select * from users;
select * from appointments;
SELECT * FROM doctors where location = 'MG Road, Bangalore';
select * from doctor;

DROP TABLE IF EXISTS appointments;

CREATE TABLE appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,  -- Added this field
    patient_name VARCHAR(50) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    age INTEGER NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    address VARCHAR(255) NOT NULL,
    specialist VARCHAR(50) NOT NULL,
    location VARCHAR(50) NOT NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (user_id) REFERENCES users(id)  -- Added this constraint
);
select * from doctors

select * from appointments;
ALTER TABLE appointments ADD COLUMN status TEXT DEFAULT 'Pending';
INSERT into doctors(name,specialization,appointment_cost,location,rating,phone_number,location_url,image_url , username, password , experience ,qualification ,profile_image ) VALUES ('DR.Kushwanth','Cardiologist',100,'Connaught Place, Delhi',4.5,'9182234363','https://example.com/john-doe','https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062525/WhatsApp_Image_2024-10-04_at_22.31.23_bc75fe8f_kl1ztr.jpg' , 'Kushwanth', 'Kushwanth',10,'MBBS','NULL'),
('DR.Giri','Cardiologist',200,'Connaught Place, Delhi',3.9,'8299524710','https://example.com/john-doe','https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062525/WhatsApp_Image_2024-10-04_at_22.31.23_bc75fe8f_kl1ztr.jpg' , 'Giri', 'Giri',10,'MBBS','NULL');
select * from doctors where location = 'Connaught Place, Delhi'
>>>>>>> 16e114e57a8f1cf485b6b66d8093a769d966cd90
>>>>>>> 04b988b036998a14967f0513e87c9d44dc954997
