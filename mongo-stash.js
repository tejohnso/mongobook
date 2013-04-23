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

mongostash.documentAction = function(query, clientDoc, action, cb) {
   //returned document collection will always be
   //{"collectionName": array of one or more docs} for GETs
   //controller maps view paths (template names) to the proper collection name
   var splitPath = query.split('/');
   if (splitPath.length < 3) { 
      conLog('bad path - ' + query);
      return;
   }
   mongostash.db.collection(splitPath[1], function(err, coll) {
      if (err) {cb(err);return;}
      var searchObject = {}, searchObjectText = {}, searchObjectNum = {};
      if (splitPath[2] === "_id" && splitPath[3] !== '$all' && splitPath[3] !== '$new') {
         searchObject._id = new mongo.ObjectID(splitPath[3]); //mongo.BSONPure.ObjectID.createFromHexString(splitPath[3]);
      } else if (splitPath[3] === '$all') {
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
         case 'POST':  //these will always return one doc
         case 'DELETE':
            if (splitPath[3] === '$all') {
               cb('Cannot POST or DELETE on ALL records!');
               return;
            }
            if (splitPath[3] === '$new') {
               searchObject = {"_id": {"$exists": false}};
            }
            var del = (action === 'DELETE' ? true : false);      
            delete clientDoc._id; //never need to overwrite or create an _id in a doc
            conLog('updating record' + JSON.stringify(searchObject) + ' with ' + 
            JSON.stringify(clientDoc));
            coll.findAndModify(searchObject, {}, clientDoc, 
            {"upsert": true, "new": true, "remove": del}, function(err, res) {
               var returnVal = {};
               if (err) {cb(err); return;}
               var allPath = '/' + splitPath[1] + '/' + splitPath[2] + '/$all';
               if (del === true) {
                  conLog('clearing cache for ' + allPath);
                  conLog('clearing cache for ' + query);
                  delete mongostash[allPath];
                  delete mongostash[query];
                  cb(null, res);
                  return;
               }
               var newID = res[splitPath[3]];
               var returnColl = {};
               returnColl[splitPath[1]] = [];
               returnColl[splitPath[1]].push(res);
               if (mongostash[allPath] === undefined) { 
                  mongostash[allPath] = {};
                  mongostash[allPath][splitPath[1]] = [];
               }
               conLog('adding record to cache for $all ' + JSON.stringify(res));
               mongostash[allPath][splitPath[1]].push(res);
               conLog('populating caches for single document to ' + JSON.stringify(returnColl));
               mongostash['/' + splitPath[1] + '/' + splitPath[2] + '/' + newID] = returnColl;
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

