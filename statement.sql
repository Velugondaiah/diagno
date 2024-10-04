CREATE TABLE users (
    id INT ,
    username TEXT ,
    firstname TEXT ,
    lastname TEXT ,
    email TEXT  ,
    phone_number TEXT ,
    date_of_birth DATE
);
ALTER TABLE users ADD COLUMN password TEXT;


INSERT INTO users ( id ,username, firstname, lastname, email, phone_number, date_of_birth , password)
VALUES ( 3, 'bhanu', 'bhanu', 'garlapati', 'bhanu@gmail.com', '9012345678', '2007-011-14' ,'567');

SELECT * FROM doctors;

CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    appointment_cost INTEGER NOT NULL,
    location TEXT NOT NULL,
    rating REAL NOT NULL,
    phone_number TEXT NOT NULL,
    location_url TEXT NOT NULL,
    image_url TEXT NOT NULL
);

INSERT INTO doctors (name, specialization, appointment_cost, location, rating, phone_number, location_url, image_url)
VALUES 

('Dr. Rajiv Gupta', 'Orthopedic', 200, 'Marine Drive, Mumbai', 4.2, '9876543211', 'https://goo.gl/maps/abc456', 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062450/WhatsApp_Image_2024-10-04_at_22.28.53_45275520_zovnbz.jpg'),
('Dr. Anil Mehra', 'Neurologist', 250, 'Victoria Memorial, Kolkata', 4.8, '9876543213', 'https://goo.gl/maps/pqr987', 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062525/WhatsApp_Image_2024-10-04_at_22.31.23_bc75fe8f_kl1ztr.jpg'),
('Dr. Mahesh Rao', 'Dentist', 100, 'Charminar, Hyderabad', 4.3, '9876543215', 'https://goo.gl/maps/vwx321', 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062554/WhatsApp_Image_2024-10-04_at_22.31.23_e773acc2_ppoqbd.jpg'),
('Dr. Arjun Singh', 'Cardiologist', 300, 'Red Fort, Delhi', 4.9, '9876543217', 'https://goo.gl/maps/xyz321', 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062582/WhatsApp_Image_2024-10-04_at_22.31.24_7d025073_gjtx2c.jpg'),
('Dr. Ramesh Bhat', 'Orthopedic', 170, 'Cubbon Park, Bangalore', 4.0, '9876543219', 'https://goo.gl/maps/ghi789', 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062525/WhatsApp_Image_2024-10-04_at_22.31.23_bc75fe8f_kl1ztr.jpg'),
('Dr. Sameer Desai', 'Gastroenterologist', 300, 'Sabarmati Ashram, Ahmedabad', 4.9, '9876543221', 'https://goo.gl/maps/xyz543', 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062582/WhatsApp_Image_2024-10-04_at_22.31.24_7d025073_gjtx2c.jpg'),
('Dr. Karan Chopra', 'ENT Specialist', 180, 'Hussain Sagar, Hyderabad', 4.6, '9876543223', 'https://goo.gl/maps/abc123', 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062450/WhatsApp_Image_2024-10-04_at_22.28.53_45275520_zovnbz.jpg'),
('Dr. Vivek Nair', 'Dermatologist', 210, 'Ramoji Film City, Hyderabad', 4.5, '9876543225', 'https://goo.gl/maps/stp765', 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062554/WhatsApp_Image_2024-10-04_at_22.31.23_e773acc2_ppoqbd.jpg'),
('Dr. Deepak Kaur', 'Oncologist', 280, 'Meenakshi Temple, Madurai', 4.8, '9876543227', 'https://goo.gl/maps/def789', 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062582/WhatsApp_Image_2024-10-04_at_22.31.24_7d025073_gjtx2c.jpg'),
('Dr. Vikas Singh', 'Pediatrician', 220, 'Mahabodhi Temple, Bihar', 4.7, '9876543229', 'https://goo.gl/maps/uvw654', 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062450/WhatsApp_Image_2024-10-04_at_22.28.53_45275520_zovnbz.jpg'),
('Dr. Aarti Malhotra', 'Psychiatrist', 190, 'Jantar Mantar, Jaipur', 4.3, '9876543230', 'https://goo.gl/maps/rqr456', 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062269/WhatsApp_Image_2024-10-04_at_22.31.24_e57d54f8_izntwv.jpg'),
('Dr. Sanjay Rao', 'Urologist', 230, 'Palace Grounds, Bangalore', 4.4, '9876543231', 'https://goo.gl/maps/pqr123', 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062525/WhatsApp_Image_2024-10-04_at_22.31.23_bc75fe8f_kl1ztr.jpg'),
('Dr. Anita Kapoor', 'Dermatologist', 150, 'Victoria Terminus, Mumbai', 4.0, '9876543232', 'https://goo.gl/maps/stu123', 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062095/WhatsApp_Image_2024-10-04_at_22.31.23_77c3167c_fuwuvj.jpg'),
('Dr. Aditya Iyer', 'Orthopedic', 240, 'Golden Temple, Amritsar', 4.8, '9876543233', 'https://goo.gl/maps/vwx123', 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062554/WhatsApp_Image_2024-10-04_at_22.31.23_e773acc2_ppoqbd.jpg'),
('Dr. Meera Prasad', 'Endocrinologist', 140, 'Mysore Palace, Mysore', 4.2, '9876543234', 'https://goo.gl/maps/mnp567', 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062269/WhatsApp_Image_2024-10-04_at_22.31.24_e57d54f8_izntwv.jpg'),
('Dr. Raghav Verma', 'Cardiologist', 270, 'Qutub Minar, Delhi', 4.7, '9876543235', 'https://goo.gl/maps/zxy789', 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062450/WhatsApp_Image_2024-10-04_at_22.28.53_45275520_zovnbz.jpg'),
('Dr. Tanya Malik', 'Neurologist', 170, 'Elephanta Caves, Mumbai', 4.5, '9876543236', 'https://goo.gl/maps/def876', 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062095/WhatsApp_Image_2024-10-04_at_22.31.23_77c3167c_fuwuvj.jpg'),
('Dr. Suresh Nair', 'Ophthalmologist', 220, 'Rashtrapati Bhavan, Delhi', 4.8, '9876543237', 'https://goo.gl/maps/rqr789', 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062582/WhatsApp_Image_2024-10-04_at_22.31.24_7d025073_gjtx2c.jpg'),
('Dr. Seema Goel', 'Gynecologist', 200, 'Raj Ghat, Delhi', 4.6, '9876543238', 'https://goo.gl/maps/zxy987', 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062269/WhatsApp_Image_2024-10-04_at_22.31.24_e57d54f8_izntwv.jpg'),
('Dr. Amit Shukla', 'Pediatrician', 180, 'Lotus Temple, Delhi', 4.5, '9876543239', 'https://goo.gl/maps/abc654', 'https://res.cloudinary.com/dcgmeefn2/image/upload/v1728062554/WhatsApp_Image_2024-10-04_at_22.31.23_e773acc2_ppoqbd.jpg');