var conLog = require('./conLog.js')(0); //1 to log to console

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
var mongostash = require('./mongo-stash.js')(__dirname + '/mu', 
    dbURL, startListening);

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
   var templateVars = mongostash.templateCollections.mongobook;
   conLog(templateVars);
   //mu.compileAndRender('mu/mongobook.mu', templateVars).pipe(response);
   mu.compileAndRender('mu/mongobook.mu', templateVars).on('data', function(data) {
      response.write(data);      
   }).on('end', function() {
      response.end();
   });
});

app.get('/address/*', function(request, response, next) {
   //return json object containing data for selected address
   //or new address if request contains no target address to fetch

   conLog('get path is: ' + request.path);
   var docID = request.path.substr(9);
   conLog('fetching id: ' + docID);
   var templateVars = {"tabID": Math.random().toString().substr(2)};
   var returnDocument = function(err, templateVars) {
      //process the tab title template, then the address details template - return json
      if(err) {conLog(err); response.end();}
      response.write('{"title": "');
      mu.compileAndRender('mu/addressTabTitle.mu', templateVars).on('data', 
      function(data) {
         response.write(data.toString());
      }).on('end', function() {
         response.write('", "address": "');
         mu.compileAndRender('mu/address.mu', templateVars).on('data', function(data) {
            response.write(data.toString());
         }).on('end', function() {
            response.write('"}');
            response.end();
         });
      });
   };

   if(docID !=='') {
      mongostash.getDocument('_id', docID, 'addresses', templateVars, returnDocument);
   }else{
      templateVars.first = 'first';
      templateVars.last = 'last';
      returnDocument(null, templateVars);
   }
});

app.post('/address', function(request, response, next) {
   conLog('post path is: ' + request.path);
   var id = request.body.docID;
   delete request.body.docID; //we don't need to save a duplicate of the _id field
   conLog('body is: ' + JSON.stringify(request.body));
   conLog('updating ID (blank means new doc): ' + id);
   mongostash.setDocument(request.body, id, 'addresses', false, function(err, ret) {
      conLog('upsert return: ' + JSON.stringify(ret));
      if(err){conLog(err);}
      mongostash(__dirname + '/mu', dbURL, function () {
         response.end(JSON.stringify(ret));
      });
   });
});

app.delete('/address', function(request, response, next) {
   var id = request.body.docID;
   mongostash.setDocument(request.body, id, 'addresses', true, function(err, ret) {
      if(err){conLog(err);}
      mongostash(__dirname + '/mu', dbURL, function () {
         response.end('');
      });
   });
});
