console.log('starting...');
var express = require('express');
var mongo = require('mongodb');
var port = process.env.PORT || 3000;
var app = express();

app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/html'));
app.use(express.static(__dirname + '/img'));
app.use(express.static(__dirname + '/js'));

app.get('/', function(request, response) {
   response.redirect('/bsbook.html');
});

// app.post('/login', auth.checkLogin);
app.listen(port, function() {
   console.log("Listening on port " + port);
});

