const crypto = require('crypto').randomBytes(256).toString('hex');

module.exports = {
    uri: 'mongodb://localhost:27017/math-talk-db',
    secret: crypto,
    db: 'math-talk-db'
}