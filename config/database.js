const crypto = require('crypto').randomBytes(256).toString('hex');

module.exports = {
    // uri: 'mongodb://localhost:27017/math-talk-db', // development
    uri: 'mongodb://mathtalk:mathtalkpassword@ds263317.mlab.com:63317/math-talk-db', // production
    secret: crypto,
    db: 'math-talk-db'
}