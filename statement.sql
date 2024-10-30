SELECT * FROM doctors;
DROP TABLE IF EXISTS users;


DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phoneNumber VARCHAR(15) NOT NULL,    -- Kept as camelCase to match JS
    dateOfBirth DATE NOT NULL,
    gender VARCHAR(10),          -- Kept as camelCase to match JS
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
DELETE FROM users WHERE id = 3 ;

INSERT INTO users (username, firstname, lastname, email, phoneNumber, dateOfBirth, gender, password) VALUES ('john_doe', 'John', 'Doe', 'john.doe@example.com', '1234567890', '1990-01-01', 'Male', 'password123');

SELECT * FROM users;

 
