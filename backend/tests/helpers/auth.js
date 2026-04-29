const jwt = require('jsonwebtoken');

const createAuthToken = ({ userId = 1, username = 'test-user', tenant = 'market', expiresIn = '1h' } = {}) => {
    return jwt.sign(
        { sub: userId, username, tenant },
        process.env.JWT_SECRET,
        { expiresIn }
    );
};

module.exports = {
    createAuthToken
};
