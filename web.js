console.log('\nstarting web.js');
var express = require('express');
var port = process.env.PORT || 3000;
var app = express();

var startListening = function(err) {
   if(err) {console.log(err); process.exit();}
   app.listen(port, function() {
      console.log("Listening on port " + port);
   });
};

var dbURL = process.env.MONGOHQ_URL_MONGOBOOK;
var mongostash = require('./mongo-stash.js')(dbURL, startListening);
app.set('dev', (app.get('env') === 'dev') ? true : false);
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/html'));
app.use(express.static(__dirname + '/img'));
app.use('/img', express.static(__dirname + '/img'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/mu'));
app.use(express.bodyParser());

app.get('/', function(request, response, next) { 
   response.redirect('mongobook.html');
});

app.all('*', function(request, response, next) {
   var cb = function(err, docs) {
      if (err) {return next(err);}
      if (app.enabled('dev')) {console.log('returning: ' + JSON.stringify(docs));}
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify(docs));   
   };

   if (app.enabled('dev')) {
      console.log('\n' + request.method + ' processing path: ' + request.path);
   }
   if (request.path.split('/').length < 3) {
      return next('error - invalid path');
   }
   mongostash.documentAction(request.path.split('/'), 
   request.body, request.method, app.enabled('dev'), cb);
});

if (app.enabled('dev')) {
   console.log('-- dev environment --');
   app.use(function(err, request, response, next) {
      console.error(JSON.stringify(err));
      response.send(404);
   });
} else {
   console.log('-- prod environment --');
   app.use(function(err, request, response, next) {
      //no console logging - perhaps log to a logfile instead
      response.send(404);
   });
}
