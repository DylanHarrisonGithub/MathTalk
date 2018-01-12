const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

//validators
const usernameValidators = [];
const timeStampValidators = [];
const titleValidators = [];
const bodyValidators = [];
const metaValidators = [];

// Post Model Definition
const postSchema = new Schema({
    username: { type: String, required: true, unique: false, lowercase: true, validate: usernameValidators },
    timeStamp: { type: String, required: true, unique: false, lowercase: false, validate: timeStampValidators },
    title: { type: String, required: true, unique: false, lowercase: false, validate: titleValidators },
    body: { type: String, required: true, unique: false, lowercase: false, validate: bodyValidators },
    meta: [{ type: String, required: false, unique: false, lowercase: false, validate: metaValidators }],
    likes: { type: Number, required: true },
    parentID: { type: String, required: false },
    replies: { type: [String], required: false }
});

// Export Module/Schema
module.exports = mongoose.model('Post', postSchema);