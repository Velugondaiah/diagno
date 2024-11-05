const fs = require('fs');
const path = require('path');

// Create necessary directories
const dirs = [
    path.join(__dirname, '..', 'database'),
    path.join(__dirname, '..', 'uploads')
];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        try {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        } catch (err) {
            console.error(`Error creating directory ${dir}:`, err);
            process.exit(1);
        }
    }
});

console.log('Database initialization complete'); 