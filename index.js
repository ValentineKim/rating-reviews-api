const express = require('express');
const morgan = require('morgan');
const bodyparser = require('body-parser');
const cors = require('cors');
const path = require('path');
const gzip = require('express-static-gzip')

const router = require('./router.js');

const port = 8008;

const server = express();

// Apply Middleware
server.use(morgan('dev'));
server.use(express.json());
server.use(cors());

server.use('/', router);
// server.use(express.static(path.join(__dirname, '../client/dist')));
// server.use(`/`, gzip(path.join(__dirname, '../client/dist')))

server.listen(port, () => console.log(`LISTENING ON PORT ${port}`));
