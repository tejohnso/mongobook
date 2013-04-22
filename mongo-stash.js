var mongo = require('mongodb');
var Db = mongo.Db;
var conLog = require('./conLog.js')(1);

var mongostash = function(dbOrURL, cb) {
   if (typeof dbOrURL === 'string') {
      conLog('creating connection for template load');
      Db.connect(dbOrURL, function(err, db) {
         if (err) {if (cb) {cb(err);} else {throw err;}}
         mongostash.db = db;
         if (cb) {cb();}
      });
   } else {
      if (!(dbOrURL instanceof Db)) {
         cb("mongo-stash: Expecting a mongo database or a url to a mongo database.");
         return;
      }
      mongostash.db = dbOrURL;
      if (cb) {cb();}
   }

   return mongostash;
};

mongostash.documentAction = function(query, clientDoc, action, cb) {
   var splitPath = query.split('/');
   mongostash.db.collection(splitPath[1], function(err, coll) {
      if (err) {cb(err);return;}
      var searchObject = {}, searchObjectText = {}, searchObjectNum = {};
      if (splitPath[2] === "_id" && splitPath[3] !== '$all') {
         searchObject._id = mongo.BSONPure.ObjectID.createFromHexString(splitPath[3]);
      } else if (splitPath[3] === '$all') {
         searchObject[splitPath[2]] = {$exists: true};
      } else {
         searchObjectText[splitPath[2]] = splitPath[3].toString();
         searchObjectNum[splitPath[2]] = parseInt(splitPath[3], 10);
         searchObject = {"$or": [searchObjectText, searchObjectNum]};
      }
      switch (action) {
         case 'GET':
            conLog('GETting ' + query);
            if (mongostash.hasOwnProperty(query)) {
               conLog('CACHE fetch for ' + query);
               cb(null, mongostash[query]);
            } else {
               coll.find(searchObject, function(err, curs) {
                  if (err) {if (cb) {cb(err);} else {throw err;}}
                  curs.toArray(function(err, docs) {
                     if (err) {if (cb) {cb(err);} else {throw err;}}
                     if (docs === null) {cb(null, returnDocs || {}); return;} 
                     if (docs.length > 1) {
                        var ret = {};
                        ret[splitPath[1]] = docs;
                        mongostash[query] = ret;
                     } else {
                        mongostash[query] = docs[0];
                     }
                     cb(null, mongostash[query]);
                  });
               });
            }
         break;
         case 'POST':  //these will need to update mongostash[query]
         case 'DELETE':
            conLog('updating record' + JSON.stringify(searchObject) + ' with ' + 
               JSON.stringify(clientDoc));
            var del = (action === 'DELETE' ? true : false);
            coll.findAndModify(searchObject, {}, clientDoc, 
            {"upsert": true, "new": true, "remove": del}, function(err, res) {
               if (err) {cb(err); return;}
               mongostash['/' + splitPath[1] + '/' + splitPath[2] + '/$all'][splitPath[1]].push(res);
               mongostash['/' + splitPath[1] + '/' + splitPath[2] + '/' + res[splitPath[3]]] = res;
               cb(null, res);
            });
         break;
      }
   }); 
};

mongostash.getCollectionFields = function(searchField, collection, cb) {
   //For a particular collection, look in every document and return the value of a particular field. 
   //For example return all ocurring customerNums in a Customers collection
   mongostash.db.collection(collection, function(err, coll) {
      if (err) {throw err;}
      var fld = {}; fld[searchField] = 1;
      coll.find({}, fld).toArray(function(err, docs) {
         if (err) {cb(err);}
         var returnArray = [];
         var j = 0; k = docs.length;
         for (j = 0; j < k; j += 1) { //don't return an array of objects. we just need the values.
            returnArray.push(docs[j][searchField]);  
         }
         cb(null, returnArray);
      });
   });
};

module.exports = mongostash;

