const express = require('express');
const router = express.Router();
const postalrouter = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const config = require('./config/database');
const authentication = require('./routes/authentication')(router);
const postalroutes = require('./routes/postalroutes')(postalrouter);
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 8080;

mongoose.Promise = global.Promise;
mongoose.connect(config.uri, (err) => {
    if (err) {
        console.log('Could not connect to database: ', err);
    } else {
        console.log('Connected to database: ' + config.db);
    }
});

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use('/authentication', authentication);
app.use('/postalroutes', postalroutes);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.listen(port, () => {
    console.log('Listening on port ' + port);
});