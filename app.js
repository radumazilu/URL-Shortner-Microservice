var express = require('express')
var mongo = require('mongodb')
var path = require('path')
var api = require('./back-end/api/api.js')
var routes = require('./back-end/routes/routes.js')
require('dotenv').config({
silent: true
})

var app = express();

mongo.connect('mongodb://localhost:27017/url-shortener' || process.env.MONGOLAB_URI, (err, db) => {
  if(err) console.error('Failed to connect');
  else console.log('Connected to MongoDB on port 27017');

  db.createCollection('sites', {
    capped: true,
    max: 1000
  });

  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'jade')

  routes(app, db);
  api(app, db);

  var port = process.env.PORT || 3000;
  app.listen(port, function() {
    console.log('Node.js listening on port ' + port);
  });
})
