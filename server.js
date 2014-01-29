var express = require('express');
var path = require('path');
var config = require('config');


var app = express();

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');

app.use(express.favicon(path.join(__dirname, '/public/images/favicon.ico')));
app.use(express.static(path.join(__dirname, '/public')));

require('routes')(app);


var server = require('http').createServer(app);
server.listen(config.get('port'));

var io = require('lib/app');
io.create(server);
