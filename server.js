var express = require('express');
var routes = require('./routes');
var path = require('path');
var app = require('./lib/app');

var e = express();

// all environments
e.set('port', process.env.PORT || 3000);
e.set('views', __dirname + '/views');
e.set('view engine', 'jade');
e.use(express.favicon());
e.use(express.logger('dev'));
e.use(express.bodyParser());
e.use(express.methodOverride());
e.use(e.router);
e.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == e.get('env')) {
  e.use(express.errorHandler());
}

e.get('/', routes.index);

app.create(e.listen(e.get('port')));
