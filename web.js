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
   var splitPath = request.path.split('/');  //path is /[template]/[field]/[target]
   conLog('\n' + request.method + ' processing path: ' + request.path);
   conLog('processing collection: ' + splitPath[1]);
   conLog('searching field: ' + splitPath[2]);
   conLog('processing target: ' + splitPath[3]);
   if (splitPath[2] === '_id' && splitPath[3].length !== 24 && splitPath[3] !== '$all') {
      conLog('bad document id - redirecting');
      response.redirect('/');
      return;
   }
   var callBack = function(err, docs) {
      if (err) {conLog(err); response.end();}
      conLog('returning: ' + JSON.stringify(docs));
      response.end(JSON.stringify(docs));   
   };
   mongostash.documentAction(request.path, request.body, request.method, callBack);
});
