const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: 'No token, authorization denied' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Auth Error' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_skillswap_local_key_123');
        req.user = decoded.user;
        next();
    } catch (e) {
        console.error(e);
        res.status(401).json({ message: 'Invalid Token' });
    }
};
