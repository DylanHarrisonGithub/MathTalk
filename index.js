const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config/database');
const authentication = require('./routes/authentication')(router);
const bodyParser = require('body-parser');
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

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + 'client/dist/'));
app.use('/authentication', authentication);

app.get('*', (req, res) => {
    res.send('hello world');
});

app.listen(8080, () => {
    console.log('Listening on port 8080');
});