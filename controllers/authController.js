const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { initializeDb } = require('../models/db');

const signup = async (req, res) => {
    const { username, firstname, lastname, email, phoneNumber, dateOfBirth, gender, password } = req.body;

    if (!username || !firstname || !lastname || !email || !phoneNumber || !dateOfBirth || !gender || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const db = await initializeDb();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const selectUserQuery = `SELECT * FROM users WHERE username = ?`;
    const dbUser = await db.get(selectUserQuery, [username]);
    
    if (dbUser) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const createUserQuery = `
        INSERT INTO users (username, firstname, lastname, email, phoneNumber, dateOfBirth, gender, password) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const dbResponse = await db.run(createUserQuery, 
        [username, firstname, lastname, email, phoneNumber, dateOfBirth, gender, hashedPassword]
    );
    
    res.status(201).json({ 
        success: true, 
        message: 'User created successfully',
        userId: dbResponse.lastID 
    });
};

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const db = await initializeDb();
    const selectUserQuery = `
        SELECT id, username, email, password, firstname, lastname 
        FROM users 
        WHERE username = ?
    `;
    
    const dbUser = await db.get(selectUserQuery, [username]);
    
    if (!dbUser) {
        return res.status(400).json({ error: 'User not found' });
    }

    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    
    if (isPasswordMatched) {
        const jwtToken = jwt.sign(
            { 
                username: dbUser.username,
                id: dbUser.id 
            }, 
            'MY_SECRET_TOKEN',
            { expiresIn: '24h' }
        );

        const userData = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
            firstname: dbUser.firstname,
            lastname: dbUser.lastname
        };

        res.json({ 
            jwt_token: jwtToken,
            user: userData,
            message: 'Login Success' 
        });
    } else {
        res.status(400).json({ error: 'Invalid password' });
    }
};

module.exports = { signup, login };
