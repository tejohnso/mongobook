var mongo = require('mongodb');
var Db = mongo.Db;
var conLog = require('./conLog.js')(1);

var mongostash = function(dbOrURL, cb) {
   if (typeof dbOrURL === 'string') {
      conLog('creating connection for template load');
      Db.connect(dbOrURL, function(err, db) {
         //if (err) {if (cb) {cb(err);} else {throw err;}}
         if (err) {conLog(err); return setTimeout(function() {
            mongostash(dbOrURL, cb);
         }, 4000);}
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

mongostash.documentAction = function(splitPath, clientDoc, action, cb) {
   //returned document collection will always be
   //{"collectionName": array of one or more docs} for GETs
   //client side controller maps view paths (template names) to the proper collection name
   var query = splitPath.join('/');
   mongostash.db.collection(splitPath[1], function(err, coll) {
      if (err) {cb(err);return;}
      var searchObject = {}, searchObjectText = {}, searchObjectNum = {};

      if (splitPath[2] === "_id" && splitPath[3]) {
         if (splitPath[3].length !== 24) {conLog('invalid id'); return {};}
         searchObject._id = new mongo.ObjectID(splitPath[3]); //mongo.BSONPure.ObjectID.createFromHexString(splitPath[3]);
      } else if (splitPath[2] === '_id') {
         searchObject[splitPath[2]] = {$exists: true};
      } else {
         searchObjectText[splitPath[2]] = splitPath[3].toString();
         searchObjectNum[splitPath[2]] = parseInt(splitPath[3], 10);
         searchObject = {"$or": [searchObjectText, searchObjectNum]};
      }
      switch (action) {
         case 'GET': //always return an object with a document array

            conLog('GETting ' + query);
            if (mongostash.hasOwnProperty(query)) {
               conLog('CACHE fetch for ' + query);
               cb(null, mongostash[query]);
            } else {
               conLog('querying database for ' + JSON.stringify(searchObject));
               coll.find(searchObject, function(err, curs) {
                  if (err) {if (cb) {cb(err);} else {throw err;}}
                  curs.toArray(function(err, docs) {
                     var ret = {};
                     ret[splitPath[1]] = [];
                     if (err) {if (cb) {cb(err);} else {throw err;}}
                     if (docs === null) {cb(null, ret); return;} 
                     if (docs[0] === undefined) {docs[0] = {};} //no results found
                     ret[splitPath[1]] = docs; 
                     conLog('resetting cache for ' + query + ' to ' + JSON.stringify(ret));
                     mongostash[query] = ret;
                     cb(null, mongostash[query]);
                  });
               });
            }
         break;
         case 'DELETE':  //these will always return one doc
            if (splitPath[3] === '' || splitPath[3] === undefined) {
               cb('Cannot DELETE on ALL records!');
               return {};
            }
            conLog('deleting record' + JSON.stringify(searchObject)); 
            coll.remove(searchObject, function(err, res) {
               if (err) {cb(err); return;}
               conLog('clearing cache for ' + '/' + splitPath[1] + '/' + splitPath[2]);
               conLog('clearing cache for ' + query);
               delete mongostash['/' + splitPath[1] + '/' + splitPath[2]];
               delete mongostash[query];
               cb(null, res);
               return clientDoc;
            });
         break;
         case 'PUT':
            if (splitPath[3] === '' || splitPath[3] === undefined) {
               searchObject = {"_id": {"$exists": false}};
            }
            
            delete clientDoc._id; //never need to overwrite or create an _id in a doc
            conLog('updating record' + JSON.stringify(searchObject) + ' with ' + 
            JSON.stringify(clientDoc));
            coll.findAndModify(searchObject, {}, clientDoc, 
            {"upsert": true, "new": true}, function(err, res) {
               var returnColl = {};
               if (err) {cb(err); return;}
               returnColl[splitPath[1]] = [];
               returnColl[splitPath[1]].push(res);
               
               //cache for a search on all documents is now stale but can't be easily
               //refreshed because subsequent adds would create duplicates.
               //a duplicate check on cache insertion would be required
               delete mongostash['/' + splitPath[1] + '/' + splitPath[2]];
               conLog('populating cache for single document to ' + JSON.stringify(returnColl));
               mongostash['/' + splitPath[1] + '/' + splitPath[2] + '/' + res[splitPath[2]]] = returnColl;
               cb(null, returnColl);
            });
         break;
      }
   }); 
};

/*THIS IS NOT UPDATED FOR MONGOSTASH AND MAY NEVER BE USED 
 
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
};*/

module.exports = mongostash;

