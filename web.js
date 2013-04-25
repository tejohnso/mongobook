var conLog = require('./conLog.js')(1); //1 to log to console

conLog('\nstarting web.js');
var express = require('express');
var port = process.env.PORT || 3000;
var app = express();

var startListening = function(err) {
   if(err) {conLog(err); process.exit();}
   app.listen(port, function() {
      console.log("Listening on port " + port);
   });
};

var dbURL = process.env.MONGOHQ_URL_MONGOBOOK;
var mongostash = require('./mongo-stash.js')(dbURL, startListening);

app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/html'));
app.use(express.static(__dirname + '/img'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/mu'));
app.use(express.bodyParser());

app.get('/img/*', function(request, response, next) {
   //bootstrap default builds include an img path for the glyphs. 
   response.redirect('/' + request.path.substr(5));
});

app.get('/', function(request, response, next) { 
   response.redirect('mongobook.html');
});

app.all('*', function(request, response, next) {
   conLog('\n' + request.method + ' processing path: ' + request.path);
   var cb = function(err, docs) {
      if (err) {conLog(err); response.end();}
      conLog('returning: ' + JSON.stringify(docs));
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify(docs));   
   };
   mongostash.documentAction(request.path.split('/'), request.body, request.method, cb);
});
