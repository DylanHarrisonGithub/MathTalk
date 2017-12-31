const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config/database');

const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(config.uri, (err) => {
    if (err) {
        console.log('Could not connect to database: ', err);
    } else {
        console.log('Connected to database: ' + config.db);
        // console.log(config.secret);
    }
});

app.get('*', (req, res) => {
    res.send('hello world');
});

app.listen(8080, () => {
    console.log('Listening on port 8080');
});