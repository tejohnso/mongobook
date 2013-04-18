var consoleOutput = 1;

var conLog = require('./conLog.js')(consoleOutput);

conLog('\nstarting web.js');

var express = require('express');
var mu = require('mu2');
var port = process.env.PORT || 3000;
var app = express();

var startListening = function(err) {
   if(err) {throw err;}
   app.listen(port, function() {
      console.log("Listening on port " + port);
   });
};

var dbURL = process.env.MONGOHQ_URL_MONGOBOOK;
var mongostash = require('./mongo-stash.js')(__dirname + '/mu', dbURL, startListening);

app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/html'));
app.use(express.static(__dirname + '/img'));
app.use(express.static(__dirname + '/js'));
app.use(express.bodyParser());

app.get('/img/*', function(request, response, next) {
   //bootstrap default builds include an img path for the glyphs. 
   response.redirect('/' + request.path.substr(5));
});

app.get('/', function(request, response, next) { 
   conLog('Serving path: ' + request.path);
   var templateVars = mongostash.templateCollections['mongobook'];
   mu.compileAndRender('mu/mongobook.mu', templateVars).pipe(response);
});

app.post('/address', function(request, response, next) {
   //return json object containing data for selected address
   //or new address if request contains no target address to fetch
   request.body.tabID = Math.random().toString().substr(2); 
   conLog(request.body);
   response.write('{"title": "');
   mu.compileAndRender('mu/addressTabTitle.mu', request.body).on('data', function(data) {
      response.write(data.toString());
   }).on('end', function() {
      response.write('", "address": "');
      mu.compileAndRender('mu/address.mu', request.body).on('data', function(data) {
         response.write(data.toString());
      }).on('end', function() {
         response.write('"}');
         response.end();});
      });
});
