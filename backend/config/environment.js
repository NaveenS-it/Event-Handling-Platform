require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 5000,
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || 'naveen',
    DB_NAME: process.env.DB_NAME || 'eventsphere',
    JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_eventsphere',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h'
};
